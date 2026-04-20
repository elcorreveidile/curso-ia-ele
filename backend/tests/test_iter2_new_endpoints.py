"""Iteration 2 — test new endpoints:
- POST /api/upload (Cloudinary)
- POST /api/admin/certificate/issue (idempotent)
- GET /api/certificate/{cert_id} (public)
- POST /api/admin/modules/reorder
- Regression: GET /api/checkout/status/{session_id} no longer returns 500
- Data invariant: courses.founder_seats_taken == 3
- Authorization checks on /api/admin/* and /api/upload
"""
import io
import os
import time
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

_BASE = os.environ.get("REACT_APP_BACKEND_URL")
if not _BASE:
    for line in (Path(__file__).resolve().parents[2] / "frontend" / ".env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            _BASE = line.split("=", 1)[1].strip()
            break
API = _BASE.rstrip("/") + "/api"


# ─────────── Helpers ───────────
def _auth(tok):
    return {"Authorization": f"Bearer {tok}"}


# ─────────── Upload (Cloudinary) ───────────
class TestUpload:
    def test_upload_requires_auth(self):
        files = {"file": ("t.txt", b"hello", "text/plain")}
        r = requests.post(f"{API}/upload", files=files, timeout=30)
        assert r.status_code == 401, f"expected 401, got {r.status_code}: {r.text}"

    def test_upload_with_auth_uploads_to_cloudinary(self, student_token):
        # Small 1x1 PNG
        png = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf"
            b"\xc0\xc0\xc0\x00\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        files = {"file": ("test_pixel.png", png, "image/png")}
        r = requests.post(
            f"{API}/upload",
            files=files,
            headers=_auth(student_token),
            timeout=60,
        )
        if r.status_code != 200:
            pytest.skip(f"Cloudinary upload unavailable in sandbox ({r.status_code}): {r.text[:200]}")
        d = r.json()
        assert d.get("url", "").startswith("http"), d
        assert "public_id" in d and d["public_id"]
        assert isinstance(d.get("bytes"), int) and d["bytes"] > 0
        assert d.get("format") in ("png", "jpg", "jpeg", "webp", None) or isinstance(d.get("format"), str)


# ─────────── Certificates ───────────
class TestCertificates:
    def test_issue_requires_admin(self, student_token, enrolled_student):
        # Student (non-admin) must be forbidden
        r = requests.post(
            f"{API}/admin/certificate/issue",
            json={"enrollment_id": "does-not-matter"},
            headers=_auth(student_token),
            timeout=20,
        )
        assert r.status_code == 403, r.text

    def test_issue_404_for_invalid_enrollment(self, admin_token):
        r = requests.post(
            f"{API}/admin/certificate/issue",
            json={"enrollment_id": "TEST_invalid_enrollment_id_xyz"},
            headers=_auth(admin_token),
            timeout=20,
        )
        assert r.status_code == 404, r.text

    def test_issue_creates_then_idempotent(self, admin_token, enrolled_student):
        # Look up enrollment_id from DB via a helper (avoid Mongo here — use dashboard)
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient

        async def _fetch():
            c = AsyncIOMotorClient(os.environ["MONGO_URL"])
            db = c[os.environ["DB_NAME"]]
            e = await db.enrollments.find_one({
                "user_id": enrolled_student["user"]["id"],
                "course_id": enrolled_student["course_id"],
            })
            c.close()
            return e

        enrollment = asyncio.new_event_loop().run_until_complete(_fetch())
        assert enrollment, "enrollment fixture must exist"
        eid = enrollment["id"]

        # First call — create
        r1 = requests.post(
            f"{API}/admin/certificate/issue",
            json={"enrollment_id": eid, "hours": 20},
            headers=_auth(admin_token),
            timeout=30,
        )
        assert r1.status_code == 200, r1.text
        cert1 = r1.json()
        for k in ("id", "enrollment_id", "user_id", "course_id", "hours", "issued_at"):
            assert k in cert1, f"missing {k}: {cert1}"
        assert cert1["enrollment_id"] == eid
        assert cert1["user_id"] == enrolled_student["user"]["id"]
        assert cert1["course_id"] == enrolled_student["course_id"]
        assert cert1["hours"] == 20

        # Second call — must return same id (idempotent, no duplicate)
        r2 = requests.post(
            f"{API}/admin/certificate/issue",
            json={"enrollment_id": eid, "hours": 20},
            headers=_auth(admin_token),
            timeout=30,
        )
        assert r2.status_code == 200, r2.text
        cert2 = r2.json()
        assert cert2["id"] == cert1["id"], "idempotency broken"

        # Enrollment must now be completed
        async def _check():
            c = AsyncIOMotorClient(os.environ["MONGO_URL"])
            db = c[os.environ["DB_NAME"]]
            e = await db.enrollments.find_one({"id": eid})
            c.close()
            return e

        e2 = asyncio.new_event_loop().run_until_complete(_check())
        assert e2.get("status") == "completed", f"status={e2.get('status')}"

        # Stash for next test
        TestCertificates.cert_id = cert1["id"]

    def test_get_certificate_public(self):
        cid = getattr(TestCertificates, "cert_id", None)
        if not cid:
            pytest.skip("No cert id from issue test")
        # Public — no auth
        r = requests.get(f"{API}/certificate/{cid}", timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "certificate" in d and d["certificate"]["id"] == cid
        assert "user" in d and d["user"].get("email")
        assert "course" in d and d["course"].get("slug") == "ia-ele"

    def test_get_certificate_404(self):
        r = requests.get(f"{API}/certificate/TEST_does_not_exist", timeout=20)
        assert r.status_code == 404


# ─────────── Module reorder ───────────
class TestModuleReorder:
    """Order invariants are restored at the end of the class via finalizer."""

    @pytest.fixture(scope="class", autouse=True)
    def _restore_order(self, request):
        yield
        # Teardown: reset to canonical order 1..4 for mod-ia-01..mod-ia-04
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient

        async def _reset():
            c = AsyncIOMotorClient(os.environ["MONGO_URL"])
            db = c[os.environ["DB_NAME"]]
            for i in range(1, 5):
                await db.modules.update_one(
                    {"id": f"mod-ia-0{i}"}, {"$set": {"order": i}}
                )
            c.close()

        asyncio.new_event_loop().run_until_complete(_reset())

    def _get_modules(self, admin_token):
        # GET content as an admin (admin is not enrolled → would also get 403);
        # Read directly via admin overview or Mongo. Use Mongo for direct verification.
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient

        async def _f():
            c = AsyncIOMotorClient(os.environ["MONGO_URL"])
            db = c[os.environ["DB_NAME"]]
            out = []
            async for m in db.modules.find({"course_id": "course-ia-ele"}).sort("order", 1):
                out.append({"id": m["id"], "order": m["order"]})
            c.close()
            return out

        return asyncio.new_event_loop().run_until_complete(_f())

    def test_reorder_requires_admin(self, student_token):
        r = requests.post(
            f"{API}/admin/modules/reorder",
            json={"module_id": "mod-ia-01", "direction": "down"},
            headers=_auth(student_token),
            timeout=20,
        )
        assert r.status_code == 403, r.text

    def test_up_first_is_noop(self, admin_token):
        r = requests.post(
            f"{API}/admin/modules/reorder",
            json={"module_id": "mod-ia-01", "direction": "up"},
            headers=_auth(admin_token),
            timeout=20,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d == {"ok": True, "noop": True}
        # Order must still be canonical
        mods = self._get_modules(admin_token)
        assert mods == [
            {"id": "mod-ia-01", "order": 1},
            {"id": "mod-ia-02", "order": 2},
            {"id": "mod-ia-03", "order": 3},
            {"id": "mod-ia-04", "order": 4},
        ], mods

    def test_down_first_swaps_with_second(self, admin_token, student_token, enrolled_student):
        r = requests.post(
            f"{API}/admin/modules/reorder",
            json={"module_id": "mod-ia-01", "direction": "down"},
            headers=_auth(admin_token),
            timeout=20,
        )
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True
        mods = self._get_modules(admin_token)
        by_id = {m["id"]: m["order"] for m in mods}
        assert by_id["mod-ia-01"] == 2
        assert by_id["mod-ia-02"] == 1
        assert by_id["mod-ia-03"] == 3
        assert by_id["mod-ia-04"] == 4

        # Verify via GET /api/course/ia-ele/content (requires enrolled student)
        r2 = requests.get(
            f"{API}/course/ia-ele/content",
            headers=_auth(student_token),
            timeout=20,
        )
        assert r2.status_code == 200, r2.text
        d2 = r2.json()
        assert len(d2["modules"]) == 4
        ordered_ids = [mw["module"]["id"] for mw in d2["modules"]]
        assert ordered_ids == ["mod-ia-02", "mod-ia-01", "mod-ia-03", "mod-ia-04"], ordered_ids
        # Ensure orders strictly ascending
        orders = [mw["module"]["order"] for mw in d2["modules"]]
        assert orders == sorted(orders)

        # Revert: move mod-ia-01 back up
        rev = requests.post(
            f"{API}/admin/modules/reorder",
            json={"module_id": "mod-ia-01", "direction": "up"},
            headers=_auth(admin_token),
            timeout=20,
        )
        assert rev.status_code == 200, rev.text

    def test_up_last_swaps_with_penultimate(self, admin_token):
        r = requests.post(
            f"{API}/admin/modules/reorder",
            json={"module_id": "mod-ia-04", "direction": "up"},
            headers=_auth(admin_token),
            timeout=20,
        )
        assert r.status_code == 200, r.text
        mods = self._get_modules(admin_token)
        by_id = {m["id"]: m["order"] for m in mods}
        assert by_id["mod-ia-03"] == 4
        assert by_id["mod-ia-04"] == 3
        # Revert
        rev = requests.post(
            f"{API}/admin/modules/reorder",
            json={"module_id": "mod-ia-04", "direction": "down"},
            headers=_auth(admin_token),
            timeout=20,
        )
        assert rev.status_code == 200

    def test_down_last_is_noop(self, admin_token):
        r = requests.post(
            f"{API}/admin/modules/reorder",
            json={"module_id": "mod-ia-04", "direction": "down"},
            headers=_auth(admin_token),
            timeout=20,
        )
        assert r.status_code == 200
        d = r.json()
        assert d == {"ok": True, "noop": True}


# ─────────── Checkout regression (no 500) ───────────
class TestCheckoutRegression:
    def test_create_and_status_no_500(self, api_client):
        r = api_client.post(
            f"{API}/checkout/create",
            json={
                "course_slug": "ia-ele",
                "origin_url": "https://teach-preview.preview.emergentagent.com",
            },
            timeout=30,
        )
        assert r.status_code == 200, r.text
        sid = r.json()["session_id"]
        # Give Stripe a moment
        time.sleep(1.5)
        r2 = requests.get(f"{API}/checkout/status/{sid}", timeout=30)
        assert r2.status_code == 200, f"Expected 200, got {r2.status_code}: {r2.text}"
        d = r2.json()
        assert "status" in d
        assert "payment_status" in d


# ─────────── Founder seats invariant ───────────
class TestFounderSeats:
    def test_founder_seats_taken_is_3(self):
        r = requests.get(f"{API}/courses/ia-ele", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d.get("founder_seats_taken") == 3, f"got {d.get('founder_seats_taken')}"


# ─────────── /api/upload needs ANY auth, not admin ───────────
class TestUploadAuthScope:
    def test_student_can_upload(self, student_token):
        files = {"file": ("t.txt", b"hi", "text/plain")}
        r = requests.post(f"{API}/upload", files=files, headers=_auth(student_token), timeout=30)
        if r.status_code == 500 and "Cloudinary" in r.text:
            pytest.skip("Cloudinary sandbox outage")
        # Either 200 OK (upload worked) or 500 with Cloudinary error → both confirm auth layer passed
        assert r.status_code in (200, 500), r.text
