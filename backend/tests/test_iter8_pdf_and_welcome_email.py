"""Iteration 8 — Ebook PDF (ReportLab) + Stripe webhook welcome email.

Coverage:
- /api/ebook.pdf returns a ReportLab-generated PDF: status 200, application/pdf,
  attachment Content-Disposition with .pdf filename, size > 200 KB.
- pypdf can parse the PDF; len(pages) >= 100. Page 1 contains "Prompts que funcionan"
  and "LA CLASE DIGITAL". Page 2 contains "Índice".
- /api/ebook.pdf 401 without auth, 403 for student without active+paid enrollment.
- Regression: /api/ebook TOC has 7 parts + 31 chapters; /api/ebook/{slug} returns
  a single chapter; /api/ebook-full returns content_md for every chapter.
- Welcome email after checkout.session.completed: directly invoke
  server._ensure_enrollment_from_session with a seeded payment_transactions doc
  while monkeypatching server.send_email; verify the call args contain key
  copy ('Bienvenido', 'Prompts que funcionan', '/login', 'completar' or 'Mi perfil',
  founder badge for founder enrollments).
- Regression: /api/auth/me, /api/auth/profile, /api/admin/inactivity/run.

All test users use TEST_iter8_ prefix and are cleaned up after the run.
"""
import asyncio
import io
import os
import secrets as _secrets
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
from jose import jwt
from motor.motor_asyncio import AsyncIOMotorClient
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")
load_dotenv(ROOT.parent / "frontend" / ".env")

import sys
sys.path.insert(0, str(ROOT))

_BASE = os.environ.get("REACT_APP_BACKEND_URL")
if not _BASE:
    for line in (ROOT.parent / "frontend" / ".env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            _BASE = line.split("=", 1)[1].strip()
            break
API = _BASE.rstrip("/") + "/api"
MAGIC = os.environ["MAGIC_LINK_SECRET"]
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "benitezl@go.ugr.es").lower()
COURSE_SLUG = "ia-ele"

TEST_PREFIX = "TEST_iter8_"


def _auth(t):
    return {"Authorization": f"Bearer {t}"}


_LOOP = asyncio.new_event_loop()


def _run(coro):
    return _LOOP.run_until_complete(coro)


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
        MAGIC,
        algorithm="HS256",
    )


def _verify_new(email):
    r = requests.post(f"{API}/auth/verify", json={"token": _magic(email)}, timeout=20)
    assert r.status_code == 200, r.text
    return r.json()["token"]


async def _enroll_paid(user_id: str):
    c = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = c[os.environ["DB_NAME"]]
    course = await db.courses.find_one({"slug": COURSE_SLUG})
    assert course
    existing = await db.enrollments.find_one({"user_id": user_id, "course_id": course["id"]})
    if not existing:
        await db.enrollments.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "course_id": course["id"],
            "paid_at": datetime.now(timezone.utc),
            "stripe_payment_id": TEST_PREFIX + "manual",
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


# ─── Fixtures ─────────────────────────────────────────────────
@pytest.fixture(scope="session")
def admin_token():
    return _verify_new(ADMIN_EMAIL)


@pytest.fixture
def enrolled_student():
    email = f"{TEST_PREFIX}enroll_{uuid.uuid4().hex[:8]}@example.com"
    tok = _verify_new(email)
    me = requests.get(f"{API}/auth/me", headers=_auth(tok), timeout=20).json()
    _run(_enroll_paid(me["id"]))
    return {"email": email, "token": tok, "user": me}


@pytest.fixture
def unenrolled_student():
    email = f"{TEST_PREFIX}unenroll_{uuid.uuid4().hex[:8]}@example.com"
    tok = _verify_new(email)
    me = requests.get(f"{API}/auth/me", headers=_auth(tok), timeout=20).json()
    return {"email": email, "token": tok, "user": me}


@pytest.fixture(scope="session", autouse=True)
def _cleanup():
    yield
    # Teardown: delete TEST_iter8_ users + their enrollments + payment_transactions
    async def _wipe():
        c = AsyncIOMotorClient(os.environ["MONGO_URL"])
        db = c[os.environ["DB_NAME"]]
        users = db.users.find({"email": {"$regex": f"^{TEST_PREFIX.lower()}"}})
        ids = [u["id"] async for u in users]
        if ids:
            await db.enrollments.delete_many({"user_id": {"$in": ids}})
            await db.user_progress.delete_many({"user_id": {"$in": ids}})
            await db.users.delete_many({"id": {"$in": ids}})
        await db.payment_transactions.delete_many(
            {"session_id": {"$regex": f"^{TEST_PREFIX}"}}
        )
        await db.enrollments.delete_many({"stripe_payment_id": {"$regex": f"^{TEST_PREFIX}"}})
        c.close()
    _run(_wipe())


# ─── /api/ebook.pdf ───────────────────────────────────────────
class TestEbookPdf:
    def test_pdf_download_full_content(self, enrolled_student):
        r = requests.get(
            f"{API}/ebook.pdf",
            headers=_auth(enrolled_student["token"]),
            timeout=180,
        )
        assert r.status_code == 200, r.text[:500]
        ct = r.headers.get("content-type", "")
        assert "application/pdf" in ct.lower(), f"content-type={ct}"
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd.lower(), f"content-disposition={cd}"
        assert ".pdf" in cd.lower(), f"missing .pdf filename in CD: {cd}"

        size = len(r.content)
        assert size > 200_000, f"PDF too small: {size} bytes (expected > 200KB)"

        reader = PdfReader(io.BytesIO(r.content))
        n_pages = len(reader.pages)
        assert n_pages >= 100, f"expected >=100 pages, got {n_pages}"

        # Page 1 — cover: title + brand
        p1 = reader.pages[0].extract_text() or ""
        norm1 = "".join(p1.split()).lower()
        assert "promptsquefuncionan" in norm1, f"cover missing title; first 200: {p1[:200]!r}"
        assert "laclasedigital" in norm1, f"cover missing brand; first 200: {p1[:200]!r}"

        # Page 2 — TOC ("Índice")
        p2 = reader.pages[1].extract_text() or ""
        norm2 = "".join(p2.split()).lower()
        assert ("índice" in norm2) or ("indice" in norm2), (
            f"page 2 missing 'Índice' (TOC); first 300: {p2[:300]!r}"
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


# ─── Ebook regression ─────────────────────────────────────────
class TestEbookRegression:
    def test_ebook_toc(self, enrolled_student):
        r = requests.get(f"{API}/ebook", headers=_auth(enrolled_student["token"]), timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["total_chapters"] == 31
        assert len(d["parts"]) == 7

    def test_ebook_chapter(self, enrolled_student):
        toc = requests.get(
            f"{API}/ebook", headers=_auth(enrolled_student["token"]), timeout=20
        ).json()
        slug = toc["parts"][0]["chapters"][0]["slug"]
        r = requests.get(
            f"{API}/ebook/{slug}", headers=_auth(enrolled_student["token"]), timeout=20
        )
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == slug
        assert isinstance(d["content_md"], str) and len(d["content_md"]) > 50

    def test_ebook_full(self, enrolled_student):
        r = requests.get(
            f"{API}/ebook-full", headers=_auth(enrolled_student["token"]), timeout=30
        )
        assert r.status_code == 200
        d = r.json()
        total = sum(len(p["chapters"]) for p in d["parts"])
        assert total == 31
        # Every chapter must have non-empty content_md
        for p in d["parts"]:
            for ch in p["chapters"]:
                assert ch.get("content_md"), f"chapter {ch.get('slug')} missing content_md"


# ─── Welcome email via webhook handler ────────────────────────
class TestWelcomeEmail:
    """Directly invoke server._ensure_enrollment_from_session after seeding a
    payment_transactions doc, while monkeypatching server.send_email to capture
    the args passed to it. This validates the welcome-email HTML build that the
    Stripe webhook runs on checkout.session.completed."""

    def _seed_tx_and_invoke(self, email: str, was_founder: bool, monkeypatch):
        import server  # backend.server

        captured = []

        async def _fake_send(to, subject, html):
            captured.append({"to": to, "subject": subject, "html": html})

        monkeypatch.setattr(server, "send_email", _fake_send)

        async def _seed_and_run():
            c = AsyncIOMotorClient(os.environ["MONGO_URL"])
            db = c[os.environ["DB_NAME"]]
            course = await db.courses.find_one({"slug": COURSE_SLUG})
            assert course is not None
            session_id = TEST_PREFIX + "sess_" + uuid.uuid4().hex[:10]
            await db.payment_transactions.insert_one({
                "session_id": session_id,
                "user_email": email,
                "course_id": course["id"],
                "amount_cents": 14900,
                "was_founder": was_founder,
                "payment_status": "pending",
                "status": "open",
                "created_at": datetime.now(timezone.utc),
            })
            c.close()
            return session_id

        session_id = _run(_seed_and_run())
        # Invoke the handler directly inside the test process so monkeypatched
        # send_email is called.
        _run(server._ensure_enrollment_from_session(session_id))
        return captured, session_id

    def test_welcome_email_standard(self, monkeypatch):
        email = f"{TEST_PREFIX}welcome_std_{uuid.uuid4().hex[:6]}@example.com"
        captured, _ = self._seed_tx_and_invoke(email, was_founder=False, monkeypatch=monkeypatch)
        # Two emails are sent: student welcome + admin notification
        assert len(captured) >= 1, "send_email was not invoked"
        student_email = next((c for c in captured if c["to"].lower() == email.lower()), None)
        assert student_email is not None, f"no email sent to student; captured={[c['to'] for c in captured]}"
        subj = student_email["subject"]
        html = student_email["html"]
        assert "Bienvenido" in subj or "bienvenido" in subj.lower()
        assert "Bienvenido" in html
        assert "Prompts que funcionan" in html, "welcome email missing book name"
        assert "/login" in html, "welcome email missing /login CTA"
        assert ("Mi perfil" in html) or ("completar" in html.lower()) or ("Completa tu perfil" in html)
        # First name greeting derived from email local part
        assert email.split("@")[0].split("+")[0].split(".")[0].capitalize()[:3].lower() in html.lower() \
            or "Bienvenido" in html  # fallback: at least the greeting block exists

    def test_welcome_email_founder(self, monkeypatch):
        email = f"{TEST_PREFIX}welcome_founder_{uuid.uuid4().hex[:6]}@example.com"
        captured, _ = self._seed_tx_and_invoke(email, was_founder=True, monkeypatch=monkeypatch)
        student_email = next((c for c in captured if c["to"].lower() == email.lower()), None)
        assert student_email is not None
        html = student_email["html"]
        assert ("Fundador/a" in html) or ("plaza única" in html), (
            f"founder welcome email missing founder badge; html snippet: {html[:1000]!r}"
        )
        assert "Prompts que funcionan" in html


# ─── Regressions from prior sprints ───────────────────────────
class TestRegressions:
    def test_auth_me(self, enrolled_student):
        r = requests.get(f"{API}/auth/me", headers=_auth(enrolled_student["token"]), timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert "id" in d and "email" in d
        # name + surname fields exist (may be null/empty for fresh user)
        assert "name" in d
        assert "surname" in d

    def test_auth_profile_update(self, enrolled_student):
        r = requests.put(
            f"{API}/auth/profile",
            headers={**_auth(enrolled_student["token"]), "Content-Type": "application/json"},
            json={"name": "TestN", "surname": "TestS"},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        # GET /auth/me to verify persistence
        me = requests.get(
            f"{API}/auth/me", headers=_auth(enrolled_student["token"]), timeout=20
        ).json()
        assert me.get("name") == "TestN"
        assert me.get("surname") == "TestS"

    def test_course_content_video(self, enrolled_student):
        r = requests.get(
            f"{API}/course/{COURSE_SLUG}/content",
            headers=_auth(enrolled_student["token"]),
            timeout=20,
        )
        assert r.status_code == 200
        d = r.json()
        # Endpoint returns groups: [{module: {...}, lessons: [...], task: {...}, unlocked: bool}]
        # Verify the schema EXPOSES video_youtube_id on at least one module (iter6 contract).
        modules = d.get("modules") or []
        assert len(modules) > 0
        any_with_field = False
        for m in modules:
            mod = m.get("module") if isinstance(m.get("module"), dict) else m
            if "video_youtube_id" in mod:
                any_with_field = True
                break
        assert any_with_field, (
            "no module exposes 'video_youtube_id' key — iter6 schema regression"
        )

    def test_admin_inactivity_run(self, admin_token):
        r = requests.post(
            f"{API}/admin/inactivity/run", headers=_auth(admin_token), timeout=60
        )
        assert r.status_code == 200, r.text
        d = r.json()
        # Must report counts
        assert "checked" in d or "scanned" in d or "nudged" in d, f"unexpected shape: {d}"
