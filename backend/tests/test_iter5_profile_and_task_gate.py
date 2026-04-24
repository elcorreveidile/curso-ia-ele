"""Iteration 5 — profile update + task resource-gate.

Features covered:
- PUT /api/auth/profile (name/surname) → returns UserOut, updates db
- GET /api/auth/me reflects update
- GET /api/course/ia-ele/task/{task_id} returns module_resources / pending_resources / can_submit
- POST /api/course/ia-ele/task/{task_id}/submit is 400 when pending>0, 200 after reading
- Admin bypass on /submit
- Regression: /api/course/ia-ele/resources still returns viewed flags + counts; /api/resource/{slug}
  still auto-marks viewed for students (and NOT for admins).
"""
import asyncio
import os
import uuid
import secrets as _secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
from jose import jwt
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

_BASE = os.environ.get("REACT_APP_BACKEND_URL")
if not _BASE:
    for line in (Path(__file__).resolve().parents[2] / "frontend" / ".env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            _BASE = line.split("=", 1)[1].strip()
            break
API = _BASE.rstrip("/") + "/api"

MAGIC_LINK_SECRET = os.environ["MAGIC_LINK_SECRET"]
COURSE_SLUG = "ia-ele"
TASK_ID_M1 = "mod-ia-01-task"  # seeded module 1 task


def _auth(tok):
    return {"Authorization": f"Bearer {tok}"}


def _run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def _magic(email):
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {
            "email": email.lower(),
            "purpose": "magic_link",
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=30)).timestamp()),
            "nonce": _secrets.token_urlsafe(16),
        },
        MAGIC_LINK_SECRET,
        algorithm="HS256",
    )


def _verify_new(email):
    tok = _magic(email)
    r = requests.post(f"{API}/auth/verify", json={"token": tok}, timeout=20)
    assert r.status_code == 200, r.text
    return r.json()["token"]


async def _enroll(user_id: str, course_slug: str = COURSE_SLUG, purge_progress=True):
    c = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = c[os.environ["DB_NAME"]]
    course = await db.courses.find_one({"slug": course_slug})
    assert course, "course must be seeded"
    if purge_progress:
        await db.user_progress.delete_many({"user_id": user_id})
        await db.submissions.delete_many({"user_id": user_id})
    existing = await db.enrollments.find_one({"user_id": user_id, "course_id": course["id"]})
    if not existing:
        await db.enrollments.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "course_id": course["id"],
            "paid_at": datetime.now(timezone.utc),
            "stripe_payment_id": "TEST_iter5",
            "amount_paid_eur": 14900,
            "was_founder": True,
            "status": "active",
            "created_at": datetime.now(timezone.utc),
        })
    c.close()
    return course["id"]


@pytest.fixture
def fresh_student():
    """Create a NEW student, enroll them, and purge any progress/submissions."""
    email = f"TEST_iter5_{uuid.uuid4().hex[:8]}@example.com"
    tok = _verify_new(email)
    me = requests.get(f"{API}/auth/me", headers=_auth(tok), timeout=20).json()
    _run(_enroll(me["id"]))
    return {"email": email, "token": tok, "user": me}


# ────────── PUT /auth/profile ──────────
class TestProfileUpdate:
    def test_update_profile_happy(self, fresh_student):
        tok = fresh_student["token"]
        # Baseline: name/surname should be empty/None
        me0 = requests.get(f"{API}/auth/me", headers=_auth(tok), timeout=20).json()
        assert me0.get("name") in (None, ""), me0
        assert me0.get("surname") in (None, ""), me0

        r = requests.put(
            f"{API}/auth/profile",
            json={"name": "Lucía", "surname": "Pérez García"},
            headers=_auth(tok),
            timeout=20,
        )
        assert r.status_code == 200, r.text
        out = r.json()
        assert out["name"] == "Lucía"
        assert out["surname"] == "Pérez García"
        assert out["email"] == fresh_student["email"].lower()
        assert out["role"] == "student"
        assert "id" in out and isinstance(out["id"], str)

        # GET /me now reflects change
        me = requests.get(f"{API}/auth/me", headers=_auth(tok), timeout=20).json()
        assert me["name"] == "Lucía"
        assert me["surname"] == "Pérez García"

    def test_update_profile_validates_empty(self, fresh_student):
        tok = fresh_student["token"]
        # Pydantic min_length=1 → 422
        r = requests.put(
            f"{API}/auth/profile",
            json={"name": "", "surname": ""},
            headers=_auth(tok),
            timeout=20,
        )
        assert r.status_code in (400, 422), r.text

    def test_update_profile_validates_missing(self, fresh_student):
        tok = fresh_student["token"]
        r = requests.put(
            f"{API}/auth/profile",
            json={},
            headers=_auth(tok),
            timeout=20,
        )
        assert r.status_code == 422, r.text

    def test_update_profile_requires_auth(self):
        r = requests.put(
            f"{API}/auth/profile",
            json={"name": "X", "surname": "Y"},
            timeout=20,
        )
        assert r.status_code in (401, 403), r.text

    def test_whitespace_only_rejected(self, fresh_student):
        """The server strips and rejects whitespace-only values with 400."""
        tok = fresh_student["token"]
        r = requests.put(
            f"{API}/auth/profile",
            json={"name": "   ", "surname": "   "},
            headers=_auth(tok),
            timeout=20,
        )
        # min_length=1 passes at Pydantic; .strip() then empties → 400
        assert r.status_code == 400, r.text


# ────────── Task gate (GET + POST) ──────────
class TestTaskResourceGate:
    def _get_module_resources(self, tok):
        """Fetch full resources tree to discover module-1 resource slugs."""
        r = requests.get(f"{API}/course/{COURSE_SLUG}/resources", headers=_auth(tok), timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        mod1 = next((m for m in d["modules"] if m["order"] == 1), None)
        assert mod1 is not None, "mod-01 not found in resources tree"
        return mod1["resources"]

    def test_task_detail_gates_student_without_reads(self, fresh_student):
        tok = fresh_student["token"]
        r = requests.get(
            f"{API}/course/{COURSE_SLUG}/task/{TASK_ID_M1}",
            headers=_auth(tok),
            timeout=20,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert "module_resources" in d and "pending_resources" in d and "can_submit" in d
        assert isinstance(d["module_resources"], list)
        assert len(d["module_resources"]) > 0, "module 1 must have resources seeded"
        assert len(d["pending_resources"]) == len(d["module_resources"]), (
            f"fresh student should have all pending, got {len(d['pending_resources'])}/{len(d['module_resources'])}"
        )
        assert d["can_submit"] is False
        # Each entry has expected shape
        for item in d["module_resources"]:
            assert {"slug", "title", "type", "type_label", "viewed"} <= set(item.keys())
            assert item["viewed"] is False

    def test_submit_blocked_400_when_pending(self, fresh_student):
        tok = fresh_student["token"]
        r = requests.post(
            f"{API}/course/{COURSE_SLUG}/task/{TASK_ID_M1}/submit",
            json={"content_md": "TEST submission while pending"},
            headers=_auth(tok),
            timeout=20,
        )
        assert r.status_code == 400, r.text
        detail = r.json().get("detail", "")
        assert "materiales" in detail.lower() or "material" in detail.lower(), detail

    def test_submit_unblocks_after_reading_all(self, fresh_student):
        tok = fresh_student["token"]
        resources = self._get_module_resources(tok)
        # Visit every resource → auto-marks as viewed
        for res in resources:
            rr = requests.get(f"{API}/resource/{res['slug']}", headers=_auth(tok), timeout=20)
            assert rr.status_code == 200, f"resource {res['slug']}: {rr.text}"

        # Re-fetch task; now can_submit==True and pending==[]
        r = requests.get(
            f"{API}/course/{COURSE_SLUG}/task/{TASK_ID_M1}",
            headers=_auth(tok),
            timeout=20,
        )
        d = r.json()
        assert d["can_submit"] is True, d
        assert d["pending_resources"] == [], d["pending_resources"]
        assert all(x["viewed"] for x in d["module_resources"])

        # Now submit succeeds
        r2 = requests.post(
            f"{API}/course/{COURSE_SLUG}/task/{TASK_ID_M1}/submit",
            json={"content_md": "TEST iter5 happy path"},
            headers=_auth(tok),
            timeout=20,
        )
        assert r2.status_code == 200, r2.text
        s = r2.json()
        assert s["task_id"] == TASK_ID_M1
        assert s["status"] == "pending"
        assert s["content_md"] == "TEST iter5 happy path"

    def test_admin_bypasses_gate(self, admin_token):
        """Admin should see can_submit=true and POST/submit should NOT 400 on the gate."""
        r = requests.get(
            f"{API}/course/{COURSE_SLUG}/task/{TASK_ID_M1}",
            headers=_auth(admin_token),
            timeout=20,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["can_submit"] is True, "admin must always can_submit"
        # pending_resources may be non-empty (admin hasn't read), but can_submit==true
        # Submit as admin — gate must not block. (We allow either 200 success or a
        # non-gate error — but specifically NOT 400 with a 'materiales' message.)
        r2 = requests.post(
            f"{API}/course/{COURSE_SLUG}/task/{TASK_ID_M1}/submit",
            json={"content_md": "TEST admin bypass iter5"},
            headers=_auth(admin_token),
            timeout=20,
        )
        assert r2.status_code == 200, f"admin submit failed: {r2.status_code} {r2.text}"
        assert r2.json()["status"] == "pending"


# ────────── Regression: resources listing & auto-view ──────────
class TestResourcesRegression:
    def test_list_resources_has_view_counts(self, fresh_student):
        tok = fresh_student["token"]
        r = requests.get(f"{API}/course/{COURSE_SLUG}/resources", headers=_auth(tok), timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("modules", "transversal", "viewed_count", "total_count"):
            assert k in d, f"missing {k}"
        assert isinstance(d["viewed_count"], int)
        assert isinstance(d["total_count"], int)
        assert d["total_count"] > 0
        # Fresh student: 0 viewed
        assert d["viewed_count"] == 0
        # viewed flag present on each item
        for m in d["modules"]:
            for item in m["resources"]:
                assert "viewed" in item and item["viewed"] is False

    def test_student_auto_view_marks(self, fresh_student):
        """GET /resource/{slug} as student → persists a user_progress row."""
        tok = fresh_student["token"]
        user_id = fresh_student["user"]["id"]
        # Pick first module-1 resource
        rlist = requests.get(f"{API}/course/{COURSE_SLUG}/resources", headers=_auth(tok), timeout=20).json()
        slug = rlist["modules"][0]["resources"][0]["slug"]

        r = requests.get(f"{API}/resource/{slug}", headers=_auth(tok), timeout=20)
        assert r.status_code == 200

        async def _count():
            c = AsyncIOMotorClient(os.environ["MONGO_URL"])
            db = c[os.environ["DB_NAME"]]
            n = await db.user_progress.count_documents(
                {"user_id": user_id, "resource_slug": slug}
            )
            c.close()
            return n

        assert _run(_count()) == 1

        # Re-listing shows viewed_count==1 and viewed=True on that slug
        d2 = requests.get(f"{API}/course/{COURSE_SLUG}/resources", headers=_auth(tok), timeout=20).json()
        assert d2["viewed_count"] == 1
        hit = next(
            (it for m in d2["modules"] for it in m["resources"] if it["slug"] == slug),
            None,
        )
        assert hit and hit["viewed"] is True

    def test_admin_get_resource_does_not_auto_mark(self, admin_token):
        """Admins must NOT create user_progress rows when visiting resources."""
        # Pick any resource
        r = requests.get(f"{API}/course/{COURSE_SLUG}/resources", headers=_auth(admin_token), timeout=20)
        assert r.status_code == 200
        d = r.json()
        slug = d["modules"][0]["resources"][0]["slug"]

        # Count admin user_progress BEFORE
        async def _admin_user_id():
            c = AsyncIOMotorClient(os.environ["MONGO_URL"])
            db = c[os.environ["DB_NAME"]]
            u = await db.users.find_one({"email": os.environ.get("ADMIN_EMAIL", "benitezl@go.ugr.es").lower()})
            c.close()
            return u["id"]

        admin_id = _run(_admin_user_id())

        async def _count(uid, sl):
            c = AsyncIOMotorClient(os.environ["MONGO_URL"])
            db = c[os.environ["DB_NAME"]]
            n = await db.user_progress.count_documents({"user_id": uid, "resource_slug": sl})
            c.close()
            return n

        before = _run(_count(admin_id, slug))
        rr = requests.get(f"{API}/resource/{slug}", headers=_auth(admin_token), timeout=20)
        assert rr.status_code == 200
        after = _run(_count(admin_id, slug))
        assert after == before, "admin fetches must NOT auto-mark"
