"""Iter 7 — Inactivity nudge + SEO static files + regression.

Scope:
- POST /api/admin/inactivity/run (admin-only)
- run_inactivity_nudge logic: positive send, idempotency, grace window, last_nudge_at
- Static SEO assets under /app/frontend/public/ (sitemap.xml + robots.txt file checks,
  og-image.png bytes check and HTTP fetch via the preview URL)
- Regression on existing endpoints
"""
import asyncio
import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(_ROOT / ".env")
load_dotenv(_ROOT.parent / "frontend" / ".env")

API = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") + "/api"
BASE = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
FE_PUBLIC = Path("/app/frontend/public")


# ─────────── Helpers ───────────
def _run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def _mongo():
    client = AsyncIOMotorClient(MONGO_URL)
    return client, client[DB_NAME]


async def _cleanup_stale():
    client, db = _mongo()
    try:
        stale_users = await db.users.find({"email": {"$regex": "nudge.*@example.com"}}).to_list(100)
        for u in stale_users:
            await db.enrollments.delete_many({"user_id": u["id"]})
            await db.user_progress.delete_many({"user_id": u["id"]})
        await db.users.delete_many({"email": {"$regex": "nudge.*@example.com"}})
    finally:
        client.close()


async def _seed_stale_student(email: str, paid_days_ago: int = 30,
                              has_recent_progress: bool = False,
                              last_nudge_days_ago: int | None = None) -> str:
    client, db = _mongo()
    try:
        course = await db.courses.find_one({"slug": "ia-ele"})
        assert course is not None
        uid = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        doc = {
            "id": uid,
            "email": email.lower(),
            "name": "Nudge Tester",
            "role": "student",
            "created_at": now - timedelta(days=paid_days_ago),
        }
        if last_nudge_days_ago is not None:
            doc["last_nudge_at"] = now - timedelta(days=last_nudge_days_ago)
        await db.users.insert_one(doc)
        await db.enrollments.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": uid,
            "course_id": course["id"],
            "paid_at": now - timedelta(days=paid_days_ago),
            "stripe_payment_id": "TEST_NUDGE_" + uid[:8],
            "amount_paid_eur": 14900,
            "was_founder": True,
            "status": "active",
            "payment_status": "paid",
            "created_at": now - timedelta(days=paid_days_ago),
        })
        if has_recent_progress:
            await db.user_progress.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": uid,
                "resource_slug": "teach-preview",
                "viewed_at": now - timedelta(days=1),
            })
        return uid
    finally:
        client.close()


@pytest.fixture(scope="module", autouse=True)
def _cleanup_before_after():
    _run(_cleanup_stale())
    yield
    _run(_cleanup_stale())


# Note: we cannot monkey-patch send_email in the live backend process.
# Tests use @example.com (IANA reserved, no real inbox) to avoid spamming.
# Resend may or may not accept them but the nudge function wraps send_email
# in try/except so it still validates other logic paths.


# ─────────── Admin endpoint: /api/admin/inactivity/run ───────────
class TestInactivityAdminEndpoint:
    def test_requires_admin(self, api_client, student_token):
        r = api_client.post(
            f"{API}/admin/inactivity/run",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert r.status_code == 403, r.text

    def test_requires_auth(self, api_client):
        r = api_client.post(f"{API}/admin/inactivity/run")
        assert r.status_code == 401

    def test_admin_ok_basic_shape(self, api_client, admin_token):
        r = api_client.post(
            f"{API}/admin/inactivity/run",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert set(d.keys()) >= {"checked", "sent", "skipped"}
        assert isinstance(d["checked"], int)
        assert isinstance(d["sent"], int)
        assert isinstance(d["skipped"], int)


# ─────────── Nudge business logic ───────────
class TestNudgeLogic:
    def test_positive_send_then_idempotent(self, api_client, admin_token):
        """Enrolled 30 days ago, no progress, never nudged → sent increments and last_nudge_at set.
        Re-running: that user is skipped."""
        email = "nudge.stale@example.com"
        uid = _run(_seed_stale_student(email, paid_days_ago=30))

        r1 = api_client.post(
            f"{API}/admin/inactivity/run",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r1.status_code == 200, r1.text
        d1 = r1.json()
        assert d1["sent"] >= 1, f"Expected at least 1 send: {d1}"

        # last_nudge_at persisted on our seeded user
        async def _check(uid):
            client, db = _mongo()
            try:
                return await db.users.find_one({"id": uid})
            finally:
                client.close()
        u = _run(_check(uid))
        assert u.get("last_nudge_at") is not None, "last_nudge_at not set"

        # Re-run: user should be SKIPPED (skipped >= 1)
        r2 = api_client.post(
            f"{API}/admin/inactivity/run",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["skipped"] >= 1
        # And our user's sent counter should not grow (sent lower or equal)
        assert d2["sent"] <= d1["sent"]

    def test_grace_window_fresh_enrollment(self, api_client, admin_token):
        """Enrollment paid_at < 7 days → no nudge (grace). Verify last_nudge_at NOT set."""
        email = "nudge.fresh@example.com"
        uid = _run(_seed_stale_student(email, paid_days_ago=3))
        r = api_client.post(
            f"{API}/admin/inactivity/run",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        async def _check(uid):
            client, db = _mongo()
            try:
                return await db.users.find_one({"id": uid})
            finally:
                client.close()
        u = _run(_check(uid))
        assert u.get("last_nudge_at") is None, "fresh user should not have been nudged"

    def test_recent_progress_skips(self, api_client, admin_token):
        """user_progress.viewed_at < 7 days → no nudge."""
        email = "nudge.active@example.com"
        uid = _run(_seed_stale_student(email, paid_days_ago=30, has_recent_progress=True))
        r = api_client.post(
            f"{API}/admin/inactivity/run",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        async def _check(uid):
            client, db = _mongo()
            try:
                return await db.users.find_one({"id": uid})
            finally:
                client.close()
        u = _run(_check(uid))
        assert u.get("last_nudge_at") is None, "active user should not have been nudged"

    def test_recent_nudge_counts_as_skipped(self, api_client, admin_token):
        """last_nudge_at < 7 days → counted as skipped."""
        email = "nudge.recentlynudged@example.com"
        uid = _run(_seed_stale_student(email, paid_days_ago=30, last_nudge_days_ago=2))
        async def _get_ts(uid):
            client, db = _mongo()
            try:
                u = await db.users.find_one({"id": uid})
                return u.get("last_nudge_at")
            finally:
                client.close()
        before = _run(_get_ts(uid))
        r = api_client.post(
            f"{API}/admin/inactivity/run",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        d = r.json()
        assert d["skipped"] >= 1
        after = _run(_get_ts(uid))
        # Timestamp unchanged (not re-nudged)
        assert before == after, "last_nudge_at should not be updated when skipped"


# ─────────── SEO Static assets ───────────
class TestSEOStaticFiles:
    def test_robots_txt_file_exists(self):
        p = FE_PUBLIC / "robots.txt"
        assert p.exists(), f"{p} missing"
        content = p.read_text()
        assert "Sitemap:" in content

    def test_sitemap_xml_file_exists(self):
        p = FE_PUBLIC / "sitemap.xml"
        assert p.exists()
        content = p.read_text()
        assert "laclasedigital.com" in content

    def test_og_image_bytes(self):
        p = FE_PUBLIC / "og-image.png"
        assert p.exists()
        data = p.read_bytes()
        assert len(data) > 50 * 1024, f"og-image too small: {len(data)}"
        # PNG magic bytes: 89 50 4E 47
        assert data[:4] == b"\x89PNG", "og-image.png missing PNG magic bytes"

    def test_og_image_served(self):
        r = requests.get(f"{BASE}/og-image.png", timeout=15, allow_redirects=True)
        assert r.status_code == 200, f"status={r.status_code}"
        assert r.content[:4] == b"\x89PNG"
        assert len(r.content) > 50 * 1024

    def test_sitemap_xml_served(self):
        r = requests.get(f"{BASE}/sitemap.xml", timeout=15, allow_redirects=True)
        assert r.status_code == 200
        assert "laclasedigital.com" in r.text


# ─────────── Regression on existing endpoints ───────────
class TestRegression:
    def test_ebook_index(self, api_client, admin_token):
        r = api_client.get(
            f"{API}/ebook",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        d = r.json()
        assert len(d.get("parts", [])) >= 1

    def test_ebook_chapter(self, api_client, admin_token):
        r = api_client.get(
            f"{API}/ebook/parte1-01-frame",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        d = r.json()
        assert "content_md" in d

    def test_ebook_pdf(self, api_client, admin_token):
        r = api_client.get(
            f"{API}/ebook.pdf",
            headers={"Authorization": f"Bearer {admin_token}"},
            stream=True,
            timeout=60,
        )
        assert r.status_code == 200
        assert "application/pdf" in r.headers.get("content-type", "")

    def test_course_content(self, api_client, admin_token):
        r = api_client.get(
            f"{API}/course/ia-ele/content",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        d = r.json()
        assert d["course"]["slug"] == "ia-ele"

    def test_auth_me(self, api_client, admin_token, admin_email):
        r = api_client.get(
            f"{API}/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200
        assert r.json()["email"] == admin_email

    def test_auth_profile_update(self, api_client, student_token):
        r = api_client.put(
            f"{API}/auth/profile",
            json={"name": "Iter7", "surname": "Tester"},
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert r.status_code == 200
        assert r.json().get("name") == "Iter7"

    def test_course_task(self, api_client, admin_token, student_token, enrolled_student):
        r = api_client.get(
            f"{API}/course/ia-ele/task/mod-ia-01-task",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert r.status_code == 200
        assert r.json()["task"]["id"] == "mod-ia-01-task"
