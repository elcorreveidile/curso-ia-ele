"""Iteration 3 — test new endpoints:
- POST /api/quiz/submit (no auth, persists to db.quiz_results)
- POST /api/course/ia-ele/lesson/view (auth + enrollment, idempotent upsert)
- GET  /api/dashboard (now contains progress per enrollment)
- GET  /api/admin/export/enrollments.csv (admin-only, CSV)
- Regression (brief): POST /api/contact, POST /api/checkout/create, GET /api/courses/ia-ele
"""
import asyncio
import os
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
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


def _auth(tok):
    return {"Authorization": f"Bearer {tok}"}


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


# ─────────── Quiz submit (public) ───────────
class TestQuizSubmit:
    def test_quiz_submit_no_auth_persists(self):
        payload = {
            "nombre": "TEST_Quiz_User",
            "email": f"TEST_quiz_{uuid.uuid4().hex[:8]}@example.com",
            "answers": {"q1": "a", "q2": ["b", "c"], "q3": "d"},
            "profile_key": "explorador",
            "total_score": 72,
        }
        r = requests.post(f"{API}/quiz/submit", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("ok") is True
        assert isinstance(d.get("id"), str) and len(d["id"]) > 0

        # Verify it was actually persisted
        async def _check():
            c = AsyncIOMotorClient(os.environ["MONGO_URL"])
            db = c[os.environ["DB_NAME"]]
            row = await db.quiz_results.find_one({"id": d["id"]})
            c.close()
            return row

        row = _run(_check())
        assert row is not None, "quiz_results row not persisted"
        assert row["nombre"] == payload["nombre"]
        assert row["email"] == payload["email"]
        assert row["profile_key"] == payload["profile_key"]
        assert row["total_score"] == payload["total_score"]
        assert row["answers"] == payload["answers"]

    def test_quiz_submit_minimal_payload(self):
        # All fields default — should still work and return ok
        r = requests.post(f"{API}/quiz/submit", json={}, timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("ok") is True
        assert "id" in d


# ─────────── Lesson view + dashboard progress ───────────
class TestLessonViewAndDashboardProgress:
    LESSON_ID_1 = "mod-ia-01-l1"
    LESSON_ID_2 = "mod-ia-01-l2"

    def _purge_progress(self, user_id):
        async def _f():
            c = AsyncIOMotorClient(os.environ["MONGO_URL"])
            db = c[os.environ["DB_NAME"]]
            await db.user_progress.delete_many({"user_id": user_id})
            c.close()
        _run(_f())

    def test_view_requires_auth(self):
        r = requests.post(
            f"{API}/course/ia-ele/lesson/view",
            json={"lesson_id": self.LESSON_ID_1},
            timeout=20,
        )
        # unauth → 401 (HTTPBearer enforces it)
        assert r.status_code in (401, 403), r.text

    def test_view_requires_enrollment(self, admin_token):
        # admin is not enrolled — _ensure_enrollment_for allows admin role through.
        # Use a fresh, non-enrolled student to verify the 403 branch.
        from datetime import datetime, timedelta, timezone
        import secrets as _secrets
        from jose import jwt
        ne_email = f"TEST_noenroll_{uuid.uuid4().hex[:8]}@example.com"
        now = datetime.now(timezone.utc)
        tok = jwt.encode(
            {
                "email": ne_email.lower(),
                "purpose": "magic_link",
                "iat": int(now.timestamp()),
                "exp": int((now + timedelta(minutes=30)).timestamp()),
                "nonce": _secrets.token_urlsafe(16),
            },
            os.environ["MAGIC_LINK_SECRET"],
            algorithm="HS256",
        )
        r = requests.post(f"{API}/auth/verify", json={"token": tok}, timeout=20)
        assert r.status_code == 200, r.text
        new_jwt = r.json()["token"]
        r2 = requests.post(
            f"{API}/course/ia-ele/lesson/view",
            json={"lesson_id": self.LESSON_ID_1},
            headers=_auth(new_jwt),
            timeout=20,
        )
        assert r2.status_code == 403, r2.text

    def test_view_marks_progress_and_is_idempotent(self, student_token, enrolled_student):
        user_id = enrolled_student["user"]["id"]
        # Clean slate
        self._purge_progress(user_id)

        # Baseline progress via dashboard
        r0 = requests.get(f"{API}/dashboard", headers=_auth(student_token), timeout=20)
        assert r0.status_code == 200, r0.text
        d0 = r0.json()
        assert "enrollments" in d0
        ia = next((e for e in d0["enrollments"] if e["course"] and e["course"].get("slug") == "ia-ele"), None)
        assert ia is not None, "expected ia-ele enrollment in dashboard"
        assert "progress" in ia, f"dashboard enrollment missing progress: {ia}"
        prog0 = ia["progress"]
        for k in ("lessons_total", "lessons_viewed", "tasks_total", "tasks_submitted", "tasks_reviewed", "percent"):
            assert k in prog0, f"missing {k}: {prog0}"
        assert prog0["lessons_viewed"] == 0
        assert prog0["lessons_total"] >= 2  # mod-01 alone has 2 lessons

        # Mark lesson 1 viewed
        r1 = requests.post(
            f"{API}/course/ia-ele/lesson/view",
            json={"lesson_id": self.LESSON_ID_1},
            headers=_auth(student_token),
            timeout=20,
        )
        assert r1.status_code == 200, r1.text
        assert r1.json() == {"ok": True}

        # Idempotent: same lesson again
        r2 = requests.post(
            f"{API}/course/ia-ele/lesson/view",
            json={"lesson_id": self.LESSON_ID_1},
            headers=_auth(student_token),
            timeout=20,
        )
        assert r2.status_code == 200, r2.text

        # Verify only ONE row exists for that lesson
        async def _count():
            c = AsyncIOMotorClient(os.environ["MONGO_URL"])
            db = c[os.environ["DB_NAME"]]
            n = await db.user_progress.count_documents(
                {"user_id": user_id, "lesson_id": self.LESSON_ID_1}
            )
            c.close()
            return n

        assert _run(_count()) == 1, "upsert should not create duplicates"

        # Dashboard now reports lessons_viewed == 1
        r3 = requests.get(f"{API}/dashboard", headers=_auth(student_token), timeout=20)
        assert r3.status_code == 200, r3.text
        ia3 = next(e for e in r3.json()["enrollments"] if e["course"] and e["course"].get("slug") == "ia-ele")
        assert ia3["progress"]["lessons_viewed"] == 1, ia3["progress"]
        assert ia3["progress"]["percent"] >= 0

        # Mark lesson 2 viewed → counter goes to 2
        r4 = requests.post(
            f"{API}/course/ia-ele/lesson/view",
            json={"lesson_id": self.LESSON_ID_2},
            headers=_auth(student_token),
            timeout=20,
        )
        assert r4.status_code == 200, r4.text
        r5 = requests.get(f"{API}/dashboard", headers=_auth(student_token), timeout=20)
        ia5 = next(e for e in r5.json()["enrollments"] if e["course"] and e["course"].get("slug") == "ia-ele")
        assert ia5["progress"]["lessons_viewed"] == 2, ia5["progress"]

        # Cleanup
        self._purge_progress(user_id)


# ─────────── Admin CSV export ───────────
class TestAdminExportCSV:
    HEADER = "enrollment_id,email,nombre,curso,importe_eur,was_founder,status,paid_at,stripe_payment_id"

    def test_export_requires_admin(self, student_token):
        r = requests.get(
            f"{API}/admin/export/enrollments.csv",
            headers=_auth(student_token),
            timeout=20,
        )
        assert r.status_code == 403, r.text

    def test_export_unauth_returns_401_or_403(self):
        r = requests.get(f"{API}/admin/export/enrollments.csv", timeout=20)
        assert r.status_code in (401, 403), r.text

    def test_export_admin_returns_csv(self, admin_token, enrolled_student):
        # Ensure at least one enrollment row exists (fixture creates one)
        r = requests.get(
            f"{API}/admin/export/enrollments.csv",
            headers=_auth(admin_token),
            timeout=30,
        )
        assert r.status_code == 200, r.text
        ctype = r.headers.get("content-type", "")
        assert ctype.startswith("text/csv"), f"content-type={ctype}"
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd and ".csv" in cd, cd

        body = r.text
        lines = body.strip().splitlines()
        assert len(lines) >= 1, "no CSV body"
        # Header must match exactly
        assert lines[0] == self.HEADER, f"header mismatch: {lines[0]}"
        # At least one data row (the enrolled_student fixture)
        assert len(lines) >= 2, f"only header returned: {body[:300]}"
        # Data rows must have 9 columns
        import csv as _csv
        import io as _io
        rows = list(_csv.reader(_io.StringIO(body)))
        for row in rows[1:]:
            assert len(row) == 9, f"bad row width {len(row)}: {row}"


# ─────────── Brief regression ───────────
class TestRegression:
    def test_contact_still_works(self):
        r = requests.post(
            f"{API}/contact",
            json={
                "nombre": "TEST_Reg",
                "email": "test_reg@example.com",
                "asunto": "Otro",
                "mensaje": "Mensaje de regresión iteración 3.",
            },
            timeout=20,
        )
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

    def test_checkout_create_returns_stripe_url(self):
        r = requests.post(
            f"{API}/checkout/create",
            json={
                "course_slug": "ia-ele",
                "origin_url": "https://teach-preview.preview.emergentagent.com",
            },
            timeout=30,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert "url" in d and d["url"].startswith("http"), d
        assert "session_id" in d and d["session_id"]
        # Stripe checkout URL
        assert "stripe.com" in d["url"] or "checkout" in d["url"], d["url"]

    def test_courses_ia_ele_founder_seats_taken_3(self):
        r = requests.get(f"{API}/courses/ia-ele", timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("founder_seats_taken") == 3, d.get("founder_seats_taken")
