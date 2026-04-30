"""Shared pytest fixtures for La Clase Digital backend tests."""
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
from jose import jwt
import secrets as _secrets

# Load backend env to access secrets and admin email
ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

# Make backend importable for direct DB seeding (mongo helper)
sys.path.insert(0, str(ROOT))

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # Fallback: read from frontend .env
    fe_env = ROOT.parent / "frontend" / ".env"
    for line in fe_env.read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
            break

API = f"{BASE_URL}/api"

JWT_SECRET = os.environ["JWT_SECRET"]
MAGIC_LINK_SECRET = os.environ["MAGIC_LINK_SECRET"]
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "benitezl@go.ugr.es").lower()

# ─── Hard safety: never hit Resend from the test suite ───
# The test suite spawns dozens of auth/broadcast/unlock emails that would
# burn through Resend's daily quota and leave the real admin unable to
# send magic links. Force-disable Resend during pytest runs.
os.environ["RESEND_DISABLE"] = "1"



def make_magic_token(email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "email": email.lower(),
        "purpose": "magic_link",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=30)).timestamp()),
        "nonce": _secrets.token_urlsafe(16),
    }
    return jwt.encode(payload, MAGIC_LINK_SECRET, algorithm="HS256")


def make_session_jwt(user_id: str, email: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email.lower(),
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=30)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api_url():
    return API


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_email():
    return ADMIN_EMAIL


@pytest.fixture(scope="session")
def admin_token():
    """Get JWT for admin via verify-magic flow."""
    token = make_magic_token(ADMIN_EMAIL)
    r = requests.post(f"{API}/auth/verify", json={"token": token}, timeout=20)
    assert r.status_code == 200, f"admin verify failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def student_email():
    # Unique per session to avoid collisions
    return f"test.student+{int(datetime.now().timestamp())}@example.com"


@pytest.fixture(scope="session")
def student_token(student_email):
    token = make_magic_token(student_email)
    r = requests.post(f"{API}/auth/verify", json={"token": token}, timeout=20)
    assert r.status_code == 200, f"student verify failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_user(admin_token):
    r = requests.get(
        f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"}, timeout=20
    )
    assert r.status_code == 200
    return r.json()


@pytest.fixture(scope="session")
def student_user(student_token):
    r = requests.get(
        f"{API}/auth/me", headers={"Authorization": f"Bearer {student_token}"}, timeout=20
    )
    assert r.status_code == 200
    return r.json()


@pytest.fixture(scope="session")
def enrolled_student(student_user):
    """Insert an enrollment directly into Mongo so the student can access content."""
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient

    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ["DB_NAME"]

    async def _create():
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        course = await db.courses.find_one({"slug": "ia-ele"})
        assert course is not None, "course ia-ele must be seeded"
        existing = await db.enrollments.find_one(
            {"user_id": student_user["id"], "course_id": course["id"]}
        )
        if not existing:
            import uuid as _uuid
            await db.enrollments.insert_one({
                "id": str(_uuid.uuid4()),
                "user_id": student_user["id"],
                "course_id": course["id"],
                "paid_at": datetime.now(timezone.utc),
                "stripe_payment_id": "TEST_manual",
                "amount_paid_eur": 14900,
                "was_founder": True,
                "status": "active",
                "created_at": datetime.now(timezone.utc),
            })
        client.close()
        return course["id"]

    course_id = asyncio.get_event_loop().run_until_complete(_create()) if False else asyncio.new_event_loop().run_until_complete(_create())
    return {"user": student_user, "course_id": course_id}
