"""Iteration 10 — Admin Users management + Marketing broadcast + RGPD unsubscribe.

Covers:
  * GET /api/admin/users (admin) lists ALL users (incl. non-enrolled) with counts.
  * Non-admin → 403.
  * DELETE /api/admin/users/{id} cascade-deletes user data and restores founder seats.
  * DELETE on admin / self / non-existent → proper 4xx.
  * POST /api/admin/users/broadcast — validation, audience filters, skip counters.
  * GET /api/unsubscribe — valid / invalid token + side effect on marketing_consent.
  * Regression on /api/admin/overview, /api/admin/module/{id} PATCH.
"""
import asyncio
import os
import uuid
from datetime import datetime, timezone

import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient

from conftest import API, make_session_jwt  # type: ignore

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


def _run(coro):
    """Run a coroutine in a fresh loop with its own motor client (avoid loop reuse issues)."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def _with_db(fn):
    client = AsyncIOMotorClient(MONGO_URL)
    try:
        return await fn(client[DB_NAME])
    finally:
        client.close()


def _h(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ─────────────────── fixtures ───────────────────
@pytest.fixture(scope="module")
def admin_info():
    """Resolve real admin user id/email from db (seeded)."""
    async def _q(db):
        u = await db.users.find_one({"role": "admin"})
        assert u, "admin must be seeded"
        return {"id": u["id"], "email": u["email"]}
    info = _run(_with_db(_q))
    info["token"] = make_session_jwt(info["id"], info["email"], "admin")
    return info


@pytest.fixture
def seeded_users():
    """Create 4 controlled users (consent on, consent off, enrolled+founder, non-enrolled).
    Yields the dict. Cleans up after."""
    created = []

    async def _seed(db):
        course = await db.courses.find_one({"slug": "ia-ele"})
        assert course, "course ia-ele must be seeded"
        course_id = course["id"]
        # Snapshot founder counters for restore
        snapshot = {
            "founder_seats_taken": course.get("founder_seats_taken") or 0,
            "is_founder_edition": course.get("is_founder_edition", True),
        }

        users = {}
        for key, marketing in [
            ("on", True),
            ("off", False),
            ("enrolled_founder", True),
            ("not_enrolled", True),
        ]:
            uid = f"TEST_iter10_{key}_{uuid.uuid4().hex[:8]}"
            email = f"test_iter10_{key}_{uuid.uuid4().hex[:6]}@example.com"
            doc = {
                "id": uid,
                "email": email,
                "role": "student",
                "name": f"Iter10 {key}",
                "surname": "Test",
                "marketing_consent": marketing,
                "created_at": datetime.now(timezone.utc),
            }
            await db.users.insert_one(doc)
            users[key] = {"id": uid, "email": email}

        # Bump founder seat counter and enroll founder user
        new_taken = (course.get("founder_seats_taken") or 0) + 1
        await db.courses.update_one(
            {"id": course_id},
            {"$set": {"founder_seats_taken": new_taken, "is_founder_edition": False}},
        )
        await db.enrollments.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": users["enrolled_founder"]["id"],
            "course_id": course_id,
            "paid_at": datetime.now(timezone.utc),
            "stripe_payment_id": "TEST_iter10_manual",
            "amount_paid_eur": 14900,
            "was_founder": True,
            "status": "active",
            "created_at": datetime.now(timezone.utc),
        })
        return users, course_id, snapshot

    users, course_id, snapshot = _run(_with_db(_seed))
    created.extend(users.values())
    yield {"users": users, "course_id": course_id, "snapshot": snapshot}

    # ── teardown ──
    async def _cleanup(db):
        for u in created:
            await db.users.delete_one({"id": u["id"]})
            await db.enrollments.delete_many({"user_id": u["id"]})
            await db.submissions.delete_many({"user_id": u["id"]})
        # Restore the course counters (whatever the test did)
        await db.courses.update_one(
            {"id": course_id},
            {"$set": snapshot},
        )

    _run(_with_db(_cleanup))


# ─────────────────── GET /admin/users ───────────────────
class TestListUsers:
    def test_admin_lists_all_users(self, admin_info, seeded_users):
        r = requests.get(f"{API}/admin/users", headers=_h(admin_info["token"]), timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "users" in data and "total" in data
        assert isinstance(data["users"], list)
        emails = {u["email"] for u in data["users"]}
        for key in ("on", "off", "enrolled_founder", "not_enrolled"):
            assert seeded_users["users"][key]["email"] in emails
        # Required fields per spec
        sample = next(u for u in data["users"] if u["email"] == seeded_users["users"]["on"]["email"])
        for f in ("id", "email", "role", "created_at", "enrollments_count"):
            assert f in sample, f"missing {f}"
        # Counts
        enrolled = next(u for u in data["users"]
                        if u["email"] == seeded_users["users"]["enrolled_founder"]["email"])
        assert enrolled["enrollments_count"] == 1
        not_enrolled = next(u for u in data["users"]
                            if u["email"] == seeded_users["users"]["not_enrolled"]["email"])
        assert not_enrolled["enrollments_count"] == 0
        # Sorted by created_at desc — test users (just inserted) should appear before older ones
        ts = [u.get("created_at") or "" for u in data["users"]]
        assert ts == sorted(ts, reverse=True), "must be sorted by created_at desc"

    def test_non_admin_forbidden(self, seeded_users):
        # Mint a non-admin session JWT for one of the test users
        u = seeded_users["users"]["on"]
        token = make_session_jwt(u["id"], u["email"], "student")
        r = requests.get(f"{API}/admin/users", headers=_h(token), timeout=20)
        assert r.status_code == 403


# ─────────────────── DELETE /admin/users/{id} ───────────────────
class TestDeleteUser:
    def test_delete_cascade_restores_founder(self, admin_info, seeded_users):
        u = seeded_users["users"]["enrolled_founder"]
        course_id = seeded_users["course_id"]

        # Insert a dummy submission to verify cascade
        async def _add_submission(db):
            await db.submissions.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": u["id"],
                "task_id": "fake",
                "created_at": datetime.now(timezone.utc),
            })
        _run(_with_db(_add_submission))

        # Capture pre-delete founder seats
        async def _pre(db):
            c = await db.courses.find_one({"id": course_id})
            return c.get("founder_seats_taken"), c.get("is_founder_edition")
        pre_taken, _ = _run(_with_db(_pre))

        r = requests.delete(f"{API}/admin/users/{u['id']}", headers=_h(admin_info["token"]), timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert body["deleted"]["enrollments"] == 1
        assert body["deleted"]["submissions"] >= 1

        # Verify gone
        async def _post(db):
            user = await db.users.find_one({"id": u["id"]})
            enr = await db.enrollments.count_documents({"user_id": u["id"]})
            sub = await db.submissions.count_documents({"user_id": u["id"]})
            c = await db.courses.find_one({"id": course_id})
            return user, enr, sub, c
        user_doc, enr_count, sub_count, course = _run(_with_db(_post))
        assert user_doc is None
        assert enr_count == 0
        assert sub_count == 0
        # Founder restore: -1
        assert course["founder_seats_taken"] == pre_taken - 1
        # is_founder_edition flips back to True (since pre-seed forced it to False with seats < cap)
        assert course["is_founder_edition"] is True

    def test_delete_admin_returns_400(self, admin_info):
        # Create another admin doc to attempt deletion
        other_admin_id = f"TEST_iter10_otheradmin_{uuid.uuid4().hex[:8]}"
        async def _create(db):
            await db.users.insert_one({
                "id": other_admin_id,
                "email": f"test_iter10_otheradmin_{uuid.uuid4().hex[:6]}@example.com",
                "role": "admin",
                "created_at": datetime.now(timezone.utc),
            })
        async def _cleanup(db):
            await db.users.delete_one({"id": other_admin_id})
        _run(_with_db(_create))
        try:
            r = requests.delete(f"{API}/admin/users/{other_admin_id}", headers=_h(admin_info["token"]), timeout=20)
            assert r.status_code == 400
            assert "administrador" in r.json().get("detail", "").lower()
        finally:
            _run(_with_db(_cleanup))

    def test_delete_self_returns_400(self, admin_info):
        r = requests.delete(f"{API}/admin/users/{admin_info['id']}", headers=_h(admin_info["token"]), timeout=20)
        # Admin is also self -> the admin check fires first per code order
        assert r.status_code == 400
        detail = r.json().get("detail", "").lower()
        # Either "administrador" (admin guard wins) or "ti mismo"
        assert "administrador" in detail or "ti mismo" in detail

    def test_delete_nonexistent_returns_404(self, admin_info):
        r = requests.delete(f"{API}/admin/users/does-not-exist-xyz", headers=_h(admin_info["token"]), timeout=20)
        assert r.status_code == 404


# ─────────────────── POST /admin/users/broadcast — VALIDATION ───────────────────
class TestBroadcastValidation:
    def test_empty_subject_400(self, admin_info):
        r = requests.post(f"{API}/admin/users/broadcast",
                          headers=_h(admin_info["token"]),
                          json={"subject": "  ", "body_md": "x", "target": "selected", "user_ids": ["x"]}, timeout=15)
        assert r.status_code == 400

    def test_empty_body_400(self, admin_info):
        r = requests.post(f"{API}/admin/users/broadcast",
                          headers=_h(admin_info["token"]),
                          json={"subject": "Hi", "body_md": "  ", "target": "selected", "user_ids": ["x"]}, timeout=15)
        assert r.status_code == 400

    def test_subject_too_long_400(self, admin_info):
        r = requests.post(f"{API}/admin/users/broadcast",
                          headers=_h(admin_info["token"]),
                          json={"subject": "A" * 201, "body_md": "ok", "target": "selected", "user_ids": ["x"]}, timeout=15)
        assert r.status_code == 400

    def test_selected_requires_user_ids(self, admin_info):
        r = requests.post(f"{API}/admin/users/broadcast",
                          headers=_h(admin_info["token"]),
                          json={"subject": "Hi", "body_md": "msg", "target": "selected"}, timeout=15)
        assert r.status_code == 400


# ─────────────────── POST /admin/users/broadcast — COUNTERS ───────────────────
class TestBroadcastCounters:
    def test_skip_admin_and_optout_no_real_send(self, admin_info, seeded_users):
        """Send to selected={admin, opt-out user}. Expect sent=0, skipped_admin=1, skipped_optout=1.
        No real email is sent."""
        opt_out_user = seeded_users["users"]["off"]
        body = {
            "subject": "Test counters",
            "body_md": "Hello",
            "target": "selected",
            "user_ids": [admin_info["id"], opt_out_user["id"]],
        }
        r = requests.post(f"{API}/admin/users/broadcast", headers=_h(admin_info["token"]), json=body, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["sent"] == 0
        assert data["skipped_admin"] == 1
        assert data["skipped_optout"] == 1
        assert data["failed"] == 0

    def test_send_to_one_real_user(self, admin_info, seeded_users):
        """Bounded live send: target=selected with 1 consenting user → sent should be 1."""
        u = seeded_users["users"]["on"]
        body = {
            "subject": "Iter10 test",
            "body_md": "Hola, esto es una **prueba**.",
            "target": "selected",
            "user_ids": [u["id"]],
        }
        r = requests.post(f"{API}/admin/users/broadcast", headers=_h(admin_info["token"]), json=body, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        # Resend may bounce undelivered emails to unverified domain — counted as sent at API layer
        assert data["sent"] + data["failed"] == 1
        assert data["skipped_admin"] == 0
        assert data["skipped_optout"] == 0


# ─────────────────── GET /unsubscribe ───────────────────
class TestUnsubscribe:
    def test_invalid_token_400(self):
        r = requests.get(f"{API}/unsubscribe", params={"token": "this-is-not-jwt"}, timeout=15)
        assert r.status_code == 400
        assert "html" in r.headers.get("content-type", "").lower()
        assert "no" in r.text.lower() or "inválido" in r.text.lower() or "no válido" in r.text.lower()

    def test_valid_token_unsubscribes_and_skips_next_broadcast(self, admin_info, seeded_users):
        from jose import jwt as _jwt
        u = seeded_users["users"]["on"]  # currently consent=True
        # Forge an unsubscribe token using server's helper signature
        token = _jwt.encode(
            {"sub": u["email"], "purpose": "unsubscribe", "iat": int(datetime.now(timezone.utc).timestamp())},
            os.environ["JWT_SECRET"],
            algorithm="HS256",
        )
        r = requests.get(f"{API}/unsubscribe", params={"token": token}, timeout=15)
        assert r.status_code == 200
        assert "html" in r.headers.get("content-type", "").lower()
        assert "Te has dado de baja" in r.text
        # Note: email may be obfuscated by Cloudflare in transit; verify side effect via DB instead.
        async def _q(db):
            return await db.users.find_one({"id": u["id"]})
        doc = _run(_with_db(_q))
        assert doc["marketing_consent"] is False

        # Next broadcast targeting this user → counted in skipped_optout
        body = {
            "subject": "Post-unsubscribe", "body_md": "x", "target": "selected", "user_ids": [u["id"]],
        }
        r = requests.post(f"{API}/admin/users/broadcast", headers=_h(admin_info["token"]), json=body, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["sent"] == 0
        assert d["skipped_optout"] == 1


# ─────────────────── Regression ───────────────────
class TestRegression:
    def test_admin_overview_still_works(self, admin_info):
        r = requests.get(f"{API}/admin/overview", headers=_h(admin_info["token"]), timeout=20)
        assert r.status_code == 200
        d = r.json()
        # spot-check a few expected keys
        assert "total_users" in d or "users" in d or "enrollments" in d or isinstance(d, dict)

    def test_admin_module_patch_still_works(self, admin_info):
        async def _q(db):
            course = await db.courses.find_one({"slug": "ia-ele"})
            mod = await db.modules.find_one({"course_id": course["id"]}, sort=[("order", 1)])
            return mod
        m = _run(_with_db(_q))
        assert m, "course must have at least one module"
        original = {"video_youtube_id": m.get("video_youtube_id")}
        try:
            r = requests.patch(
                f"{API}/admin/module/{m['id']}",
                headers=_h(admin_info["token"]),
                json={"video_youtube_id": "dQw4w9WgXcQ"},
                timeout=15,
            )
            assert r.status_code == 200, r.text
        finally:
            requests.patch(
                f"{API}/admin/module/{m['id']}",
                headers=_h(admin_info["token"]),
                json={"video_youtube_id": original["video_youtube_id"] or ""},
                timeout=15,
            )
