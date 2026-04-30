"""
Iter 9 — Tests for scheduled automatic module unlocking.

Covers:
  • PATCH /api/admin/module/{id} with unlock_at (date/ISO/empty/invalid)
  • POST /api/admin/modules/auto-unlock/run (manual trigger)
  • End-to-end: past unlock_at → job unlocks; future unlock_at → stays locked
  • Access control (non-admin 403)
  • Regression: unlocked toggle + video_youtube_id still work
State is restored after each test to keep admin panel clean.
"""
import asyncio
import os
from datetime import datetime, timedelta, timezone

import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient

from conftest import API, make_magic_token  # type: ignore

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

_LOOP = asyncio.new_event_loop()


def _run(coro):
    return _LOOP.run_until_complete(coro)


def _db():
    client = AsyncIOMotorClient(MONGO_URL)
    return client, client[DB_NAME]


# ───── Module helpers ─────────────────────────────────────────────────────
async def _get_course_id(slug: str = "ia-ele") -> str:
    client, db = _db()
    try:
        c = await db.courses.find_one({"slug": slug})
        assert c is not None, "course ia-ele must exist"
        return c["id"]
    finally:
        client.close()


async def _find_locked_module(course_id: str):
    """Return any currently locked module (unlocked_at is None)."""
    client, db = _db()
    try:
        async for m in db.modules.find({"course_id": course_id, "unlocked_at": None}).sort("order", -1):
            return m
        return None
    finally:
        client.close()


async def _find_unlocked_module(course_id: str):
    client, db = _db()
    try:
        return await db.modules.find_one({"course_id": course_id, "unlocked_at": {"$ne": None}})
    finally:
        client.close()


async def _get_module(module_id: str):
    client, db = _db()
    try:
        return await db.modules.find_one({"id": module_id})
    finally:
        client.close()


async def _restore_module(module_id: str, original: dict):
    """Reset unlock_at, unlocked_at, video_youtube_id to their original values."""
    client, db = _db()
    try:
        await db.modules.update_one(
            {"id": module_id},
            {"$set": {
                "unlock_at": original.get("unlock_at"),
                "unlocked_at": original.get("unlocked_at"),
                "video_youtube_id": original.get("video_youtube_id"),
            }},
        )
    finally:
        client.close()


# ───── Fixtures ───────────────────────────────────────────────────────────
@pytest.fixture(scope="module")
def course_id():
    return _run(_get_course_id())


@pytest.fixture
def locked_module(course_id):
    """Yields a currently locked module and restores its state afterwards."""
    m = _run(_find_locked_module(course_id))
    if not m:
        pytest.skip("no locked module available in ia-ele")
    original = {
        "unlock_at": m.get("unlock_at"),
        "unlocked_at": m.get("unlocked_at"),
        "video_youtube_id": m.get("video_youtube_id"),
    }
    yield m
    _run(_restore_module(m["id"], original))


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture
def student_headers(student_token):
    return {"Authorization": f"Bearer {student_token}", "Content-Type": "application/json"}


# ───── Tests ──────────────────────────────────────────────────────────────
class TestUnlockAtPersistence:
    """PATCH /api/admin/module/{id} — unlock_at field persistence."""

    def test_set_unlock_at_valid_date(self, admin_headers, locked_module):
        mid = locked_module["id"]
        future = (datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%d")
        r = requests.patch(f"{API}/admin/module/{mid}", json={"unlock_at": future}, headers=admin_headers, timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("unlock_at") is not None
        assert body["unlock_at"].startswith(future), f"expected starts with {future}, got {body['unlock_at']}"

        # Verify persisted in DB
        m = _run(_get_module(mid))
        assert m["unlock_at"] is not None
        assert m["unlock_at"].strftime("%Y-%m-%d") == future
        assert m["unlock_at"].hour == 9  # date-only → UTC 09:00

    def test_clear_unlock_at_with_empty_string(self, admin_headers, locked_module):
        mid = locked_module["id"]
        # First set it
        requests.patch(f"{API}/admin/module/{mid}", json={"unlock_at": "2030-01-01"}, headers=admin_headers, timeout=20)
        # Then clear
        r = requests.patch(f"{API}/admin/module/{mid}", json={"unlock_at": ""}, headers=admin_headers, timeout=20)
        assert r.status_code == 200, r.text
        assert r.json().get("unlock_at") is None
        m = _run(_get_module(mid))
        assert m.get("unlock_at") is None

    def test_set_unlock_at_iso_datetime(self, admin_headers, locked_module):
        mid = locked_module["id"]
        iso_dt = "2030-06-15T14:30:00+00:00"
        r = requests.patch(f"{API}/admin/module/{mid}", json={"unlock_at": iso_dt}, headers=admin_headers, timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("unlock_at") is not None
        assert "2030-06-15" in body["unlock_at"]

    def test_invalid_date_format_returns_400(self, admin_headers, locked_module):
        mid = locked_module["id"]
        r = requests.patch(f"{API}/admin/module/{mid}", json={"unlock_at": "not-a-date"}, headers=admin_headers, timeout=20)
        assert r.status_code == 400
        detail = (r.json().get("detail") or "").lower()
        assert ("yyyy-mm-dd" in detail) or ("iso" in detail), f"unexpected detail: {detail}"


class TestManualAutoUnlockTrigger:
    """POST /api/admin/modules/auto-unlock/run."""

    def test_manual_trigger_returns_shape(self, admin_headers):
        r = requests.post(f"{API}/admin/modules/auto-unlock/run", headers=admin_headers, timeout=30)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "unlocked" in body and isinstance(body["unlocked"], int)
        assert "ran_at" in body and isinstance(body["ran_at"], str)

    def test_past_unlock_at_gets_unlocked(self, admin_headers, locked_module):
        mid = locked_module["id"]
        past = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
        # Set past unlock_at
        r = requests.patch(f"{API}/admin/module/{mid}", json={"unlock_at": past}, headers=admin_headers, timeout=20)
        assert r.status_code == 200

        # Before the job: unlocked_at should still be None
        m_before = _run(_get_module(mid))
        assert m_before.get("unlocked_at") is None

        # Trigger the job
        r = requests.post(f"{API}/admin/modules/auto-unlock/run", headers=admin_headers, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["unlocked"] >= 1

        # After: unlocked_at populated
        m_after = _run(_get_module(mid))
        assert m_after.get("unlocked_at") is not None

    def test_future_unlock_at_stays_locked(self, admin_headers, locked_module):
        mid = locked_module["id"]
        future = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        requests.patch(f"{API}/admin/module/{mid}", json={"unlock_at": future}, headers=admin_headers, timeout=20)

        r = requests.post(f"{API}/admin/modules/auto-unlock/run", headers=admin_headers, timeout=30)
        assert r.status_code == 200

        m_after = _run(_get_module(mid))
        assert m_after.get("unlocked_at") is None, "future unlock_at must not unlock the module"
        assert m_after.get("unlock_at") is not None

    def test_already_unlocked_not_re_touched(self, admin_headers, course_id):
        """If a module already has unlocked_at set, the job must leave it alone
        even if unlock_at is in the past."""
        m = _run(_find_unlocked_module(course_id))
        if not m:
            pytest.skip("no unlocked module available")

        mid = m["id"]
        original_unlocked_at = m["unlocked_at"]
        original_unlock_at = m.get("unlock_at")

        # Set a past unlock_at on the already-unlocked module (direct DB write
        # so we don't depend on admin endpoint parsing; keeps assertion focused
        # on the job's "unlocked_at is null" filter).
        past_dt = datetime.now(timezone.utc) - timedelta(days=5)

        async def _set_unlock_at(value):
            client, db = _db()
            try:
                await db.modules.update_one({"id": mid}, {"$set": {"unlock_at": value}})
            finally:
                client.close()

        _run(_set_unlock_at(past_dt))

        try:
            r = requests.post(f"{API}/admin/modules/auto-unlock/run", headers=admin_headers, timeout=30)
            assert r.status_code == 200
            m_after = _run(_get_module(mid))
            assert m_after["unlocked_at"] == original_unlocked_at, \
                "already-unlocked module's unlocked_at was overwritten by the job"
        finally:
            _run(_set_unlock_at(original_unlock_at))


class TestAccessControl:
    """Non-admin must get 403 on admin endpoints."""

    def test_non_admin_patch_module_forbidden(self, student_headers, locked_module):
        mid = locked_module["id"]
        r = requests.patch(
            f"{API}/admin/module/{mid}",
            json={"unlock_at": "2030-01-01"},
            headers=student_headers,
            timeout=20,
        )
        assert r.status_code == 403, f"expected 403, got {r.status_code}: {r.text}"

    def test_non_admin_auto_unlock_run_forbidden(self, student_headers):
        r = requests.post(
            f"{API}/admin/modules/auto-unlock/run", headers=student_headers, timeout=20
        )
        assert r.status_code == 403, f"expected 403, got {r.status_code}: {r.text}"


class TestRegression:
    """Ensure other AdminModuleUpdate fields still work."""

    def test_manual_unlock_toggle_still_works(self, admin_headers, locked_module):
        mid = locked_module["id"]
        r = requests.patch(
            f"{API}/admin/module/{mid}", json={"unlocked": True}, headers=admin_headers, timeout=20
        )
        assert r.status_code == 200, r.text
        assert r.json().get("unlocked_at") is not None

        # Re-lock
        r2 = requests.patch(
            f"{API}/admin/module/{mid}", json={"unlocked": False}, headers=admin_headers, timeout=20
        )
        assert r2.status_code == 200
        assert r2.json().get("unlocked_at") is None

    def test_video_youtube_id_still_works(self, admin_headers, locked_module):
        mid = locked_module["id"]
        r = requests.patch(
            f"{API}/admin/module/{mid}",
            json={"video_youtube_id": "dQw4w9WgXcQ"},
            headers=admin_headers,
            timeout=20,
        )
        assert r.status_code == 200, r.text
        assert r.json().get("video_youtube_id") == "dQw4w9WgXcQ"

        # Invalid id → 400
        r_bad = requests.patch(
            f"{API}/admin/module/{mid}",
            json={"video_youtube_id": "not_an_id_at_all"},
            headers=admin_headers,
            timeout=20,
        )
        assert r_bad.status_code == 400
