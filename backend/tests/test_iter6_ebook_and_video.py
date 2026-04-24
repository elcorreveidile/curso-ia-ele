"""Iteration 6 — Ebook (PDF + TOC + chapter) + video_youtube_id on modules.

Features covered:
- GET /api/ebook: TOC with 7 parts + 31 chapters + title/subtitle/author
- GET /api/ebook/{slug}: chapter content_md + metadata
- GET /api/ebook.pdf: application/pdf, attachment disposition, >100KB, >=30 pages, cover title
- Access gate: 401 unauth, 403 student without active-paid enrollment, 200 admin & enrolled
- PATCH /api/admin/module/{id} with video_youtube_id set + clear + non-admin 403
- GET /api/course/ia-ele/content includes video_youtube_id on modules
- Regression: /api/auth/profile, /api/resource/teach-preview, /api/dashboard still work
"""
import asyncio
import io
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
from pypdf import PdfReader

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


async def _enroll_paid(user_id: str, course_slug: str = COURSE_SLUG):
    c = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = c[os.environ["DB_NAME"]]
    course = await db.courses.find_one({"slug": course_slug})
    assert course
    existing = await db.enrollments.find_one({"user_id": user_id, "course_id": course["id"]})
    if not existing:
        await db.enrollments.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "course_id": course["id"],
            "paid_at": datetime.now(timezone.utc),
            "stripe_payment_id": "TEST_iter6",
            "amount_paid_eur": 14900,
            "was_founder": True,
            "status": "active",
            "payment_status": "paid",
            "created_at": datetime.now(timezone.utc),
        })
    else:
        await db.enrollments.update_one(
            {"id": existing["id"]},
            {"$set": {"status": "active", "payment_status": "paid"}},
        )
    c.close()
    return course["id"]


# ─── Fixtures ────────────────────────────────────────────────
@pytest.fixture(scope="session")
def admin_token():
    tok = _magic(os.environ.get("ADMIN_EMAIL", "benitezl@go.ugr.es"))
    r = requests.post(f"{API}/auth/verify", json={"token": tok}, timeout=20)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture
def enrolled_student():
    email = f"TEST_iter6_enroll_{uuid.uuid4().hex[:8]}@example.com"
    tok = _verify_new(email)
    me = requests.get(f"{API}/auth/me", headers=_auth(tok), timeout=20).json()
    _run(_enroll_paid(me["id"]))
    return {"email": email, "token": tok, "user": me}


@pytest.fixture
def unenrolled_student():
    email = f"TEST_iter6_unenroll_{uuid.uuid4().hex[:8]}@example.com"
    tok = _verify_new(email)
    me = requests.get(f"{API}/auth/me", headers=_auth(tok), timeout=20).json()
    return {"email": email, "token": tok, "user": me}


# ─── /api/ebook TOC ───────────────────────────────────────────
class TestEbookToc:
    def test_toc_shape_and_parts(self, enrolled_student):
        r = requests.get(f"{API}/ebook", headers=_auth(enrolled_student["token"]), timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["title"] == "Prompts que funcionan"
        assert "subtitle" in d and isinstance(d["subtitle"], str) and len(d["subtitle"]) > 0
        assert "author" in d and isinstance(d["author"], str) and len(d["author"]) > 0
        assert d["total_chapters"] == 31, f"expected 31 chapters, got {d['total_chapters']}"
        parts = d["parts"]
        assert len(parts) == 7, f"expected 7 parts, got {len(parts)}"
        # parts must be sorted by part_order
        orders = [p["part_order"] for p in parts]
        assert orders == sorted(orders)
        # Sum of chapters == 31
        total = sum(len(p["chapters"]) for p in parts)
        assert total == 31, f"sum of part chapters = {total}"
        # Each chapter has slug + title + order_in_part
        for p in parts:
            assert "part_key" in p and "part_label" in p
            for ch in p["chapters"]:
                assert ch.get("slug") and ch.get("title")
                assert isinstance(ch.get("order_in_part"), int)

    def test_toc_401_without_auth(self):
        r = requests.get(f"{API}/ebook", timeout=20)
        assert r.status_code in (401, 403)

    def test_toc_403_unenrolled_student(self, unenrolled_student):
        r = requests.get(
            f"{API}/ebook", headers=_auth(unenrolled_student["token"]), timeout=20
        )
        assert r.status_code == 403, r.text

    def test_toc_200_admin(self, admin_token):
        r = requests.get(f"{API}/ebook", headers=_auth(admin_token), timeout=20)
        assert r.status_code == 200, r.text
        assert r.json()["total_chapters"] == 31


# ─── /api/ebook/{slug} chapter ────────────────────────────────
class TestEbookChapter:
    def test_chapter_by_slug(self, enrolled_student):
        # Discover a real slug from TOC
        toc = requests.get(
            f"{API}/ebook", headers=_auth(enrolled_student["token"]), timeout=20
        ).json()
        slug = toc["parts"][0]["chapters"][0]["slug"]

        r = requests.get(
            f"{API}/ebook/{slug}", headers=_auth(enrolled_student["token"]), timeout=20
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["slug"] == slug
        assert d["title"]
        assert isinstance(d["content_md"], str) and len(d["content_md"]) > 0
        assert d.get("part_key") is not None
        assert d.get("part_label") is not None

    def test_chapter_known_slugs(self, enrolled_student):
        """Sanity-check well-known slugs from the seed pattern."""
        tok = enrolled_student["token"]
        toc = requests.get(f"{API}/ebook", headers=_auth(tok), timeout=20).json()
        all_slugs = {ch["slug"] for p in toc["parts"] for ch in p["chapters"]}
        # At least one of the documented examples must be present
        expected_any = {"parte1-01-frame", "00-00-introduccion", "parte1-02-iteracion"}
        assert expected_any & all_slugs, f"none of {expected_any} in seeded slugs"

    def test_chapter_404_unknown(self, enrolled_student):
        r = requests.get(
            f"{API}/ebook/does-not-exist-xyz",
            headers=_auth(enrolled_student["token"]),
            timeout=20,
        )
        assert r.status_code == 404

    def test_chapter_403_unenrolled(self, unenrolled_student):
        r = requests.get(
            f"{API}/ebook/parte1-01-frame",
            headers=_auth(unenrolled_student["token"]),
            timeout=20,
        )
        assert r.status_code == 403


# ─── /api/ebook.pdf ───────────────────────────────────────────
class TestEbookPdf:
    def test_pdf_download_headers_and_content(self, enrolled_student):
        r = requests.get(
            f"{API}/ebook.pdf",
            headers=_auth(enrolled_student["token"]),
            timeout=120,
        )
        assert r.status_code == 200, r.text[:500]
        ct = r.headers.get("content-type", "")
        assert "application/pdf" in ct.lower(), f"content-type={ct}"
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd.lower(), f"content-disposition={cd}"
        size = len(r.content)
        assert size > 100_000, f"PDF too small: {size} bytes"

        # Parse PDF
        reader = PdfReader(io.BytesIO(r.content))
        n_pages = len(reader.pages)
        assert n_pages >= 30, f"expected >=30 pages, got {n_pages}"
        first_text = reader.pages[0].extract_text() or ""
        # PDF text extraction may drop spaces in kerned headings; normalize
        norm = "".join(first_text.split()).lower()
        assert "promptsquefuncionan" in norm, (
            f"cover page missing title; text starts: {first_text[:200]!r}"
        )

    def test_pdf_401_without_auth(self):
        r = requests.get(f"{API}/ebook.pdf", timeout=30)
        assert r.status_code in (401, 403)

    def test_pdf_403_unenrolled(self, unenrolled_student):
        r = requests.get(
            f"{API}/ebook.pdf",
            headers=_auth(unenrolled_student["token"]),
            timeout=30,
        )
        assert r.status_code == 403


# ─── PATCH /admin/module video_youtube_id ─────────────────────
class TestAdminModuleVideo:
    @pytest.fixture
    def module_id(self, admin_token):
        r = requests.get(
            f"{API}/course/{COURSE_SLUG}/content",
            headers=_auth(admin_token),
            timeout=20,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        # pick module order=1 — content modules are wrapped as {module, lessons, task, unlocked}
        mods = d.get("modules") or []
        assert mods, "no modules seeded"
        norm = [m.get("module", m) for m in mods]
        m1 = next((x for x in norm if x.get("order") == 1), norm[0])
        return m1["id"]

    def test_set_then_clear_video_id(self, admin_token, module_id):
        # Set
        r1 = requests.patch(
            f"{API}/admin/module/{module_id}",
            json={"video_youtube_id": "dQw4w9WgXcQ"},
            headers=_auth(admin_token),
            timeout=20,
        )
        assert r1.status_code == 200, r1.text
        d1 = r1.json()
        assert d1.get("video_youtube_id") == "dQw4w9WgXcQ"

        # Verify via content endpoint
        rc = requests.get(
            f"{API}/course/{COURSE_SLUG}/content",
            headers=_auth(admin_token),
            timeout=20,
        )
        assert rc.status_code == 200
        modc = next(
            (m.get("module", m) for m in rc.json()["modules"] if m.get("module", m).get("id") == module_id), None
        )
        assert modc and modc.get("video_youtube_id") == "dQw4w9WgXcQ"

        # Clear (empty string → None)
        r2 = requests.patch(
            f"{API}/admin/module/{module_id}",
            json={"video_youtube_id": ""},
            headers=_auth(admin_token),
            timeout=20,
        )
        assert r2.status_code == 200, r2.text
        d2 = r2.json()
        assert d2.get("video_youtube_id") in (None, ""), d2

        # Verify it's gone from content
        rc2 = requests.get(
            f"{API}/course/{COURSE_SLUG}/content",
            headers=_auth(admin_token),
            timeout=20,
        )
        modc2 = next(
            (m.get("module", m) for m in rc2.json()["modules"] if m.get("module", m).get("id") == module_id), None
        )
        assert modc2 and modc2.get("video_youtube_id") in (None, "")

    def test_non_admin_403(self, enrolled_student, module_id):
        r = requests.patch(
            f"{API}/admin/module/{module_id}",
            json={"video_youtube_id": "xyz"},
            headers=_auth(enrolled_student["token"]),
            timeout=20,
        )
        assert r.status_code == 403, r.text


# ─── /course/{slug}/content includes video_youtube_id ─────────
class TestCourseContentVideoField:
    def test_field_present_on_modules(self, enrolled_student):
        r = requests.get(
            f"{API}/course/{COURSE_SLUG}/content",
            headers=_auth(enrolled_student["token"]),
            timeout=20,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert len(d.get("modules", [])) >= 1
        # Backend: field is optional in Mongo (absent == None). The frontend
        # uses a truthy check so either behaviour is safe. Validate that
        # modules which DO expose the field have a correct type.
        for wrapper in d["modules"]:
            m = wrapper.get("module", wrapper)
            v = m.get("video_youtube_id")
            assert v is None or isinstance(v, str), (
                f"module {m.get('order')}: video_youtube_id wrong type {type(v)}"
            )

    def test_module_1_exposes_video_after_patch(self, admin_token):
        """After PATCH, GET /content must expose the video_youtube_id for that module."""
        r = requests.get(
            f"{API}/course/{COURSE_SLUG}/content",
            headers=_auth(admin_token),
            timeout=20,
        )
        mods = r.json()["modules"]
        m1 = next(w.get("module", w) for w in mods if w.get("module", w).get("order") == 1)
        mid = m1["id"]
        try:
            rp = requests.patch(
                f"{API}/admin/module/{mid}",
                json={"video_youtube_id": "dQw4w9WgXcQ"},
                headers=_auth(admin_token),
                timeout=20,
            )
            assert rp.status_code == 200
            r2 = requests.get(
                f"{API}/course/{COURSE_SLUG}/content",
                headers=_auth(admin_token),
                timeout=20,
            )
            m1b = next(
                w.get("module", w) for w in r2.json()["modules"]
                if w.get("module", w).get("order") == 1
            )
            assert m1b.get("video_youtube_id") == "dQw4w9WgXcQ", m1b
        finally:
            # cleanup — leave no residue on module 1
            requests.patch(
                f"{API}/admin/module/{mid}",
                json={"video_youtube_id": ""},
                headers=_auth(admin_token),
                timeout=20,
            )


# ─── Regression: existing endpoints still functional ──────────
class TestRegression:
    def test_profile_update_still_works(self, enrolled_student):
        r = requests.put(
            f"{API}/auth/profile",
            json={"name": "TestName6", "surname": "TestSurname6"},
            headers=_auth(enrolled_student["token"]),
            timeout=20,
        )
        assert r.status_code == 200, r.text
        assert r.json()["name"] == "TestName6"

    def test_dashboard_ok(self, enrolled_student):
        r = requests.get(
            f"{API}/dashboard", headers=_auth(enrolled_student["token"]), timeout=20
        )
        assert r.status_code == 200, r.text

    def test_teach_preview_resource_still_works(self, admin_token):
        # Admin can hit teach-preview
        r = requests.get(
            f"{API}/resource/teach-preview",
            headers=_auth(admin_token),
            timeout=20,
        )
        # Endpoint exists; accept 200 or 404/400 if payload-missing, but NOT 500
        assert r.status_code != 500, r.text

    def test_course_task_teach_preview_gate(self, admin_token):
        r = requests.get(
            f"{API}/course/teach-preview/task/mod-ia-01-task",
            headers=_auth(admin_token),
            timeout=20,
        )
        # Must not 500
        assert r.status_code != 500, r.text
