"""Shared core: config, DB, helpers, email, JWT, FastAPI deps.

This module owns the side-effecting bootstrapping (env loading, DB client,
Cloudinary config, Stripe SDK). Other modules import names from here rather
than re-running setup.
"""
from __future__ import annotations

import logging
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

import httpx
from dotenv import load_dotenv
from fastapi import Depends, Header, HTTPException
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorClient

import cloudinary
import stripe as stripe_sdk

# ─────────────────────────── Config ────────────────────────────
ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
MAGIC_LINK_SECRET = os.environ["MAGIC_LINK_SECRET"]
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM = os.environ.get("RESEND_FROM", "curso@laclasedigital.com")
RESEND_FROM_NAME = os.environ.get("RESEND_FROM_NAME", "La Clase Digital")
RESEND_REPLY_TO = os.environ.get("RESEND_REPLY_TO", "")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "benitezl@go.ugr.es")
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "").rstrip("/")

CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET", "")
if CLOUDINARY_CLOUD_NAME:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,
    )

stripe_sdk.api_key = STRIPE_API_KEY

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("laclasedigital")

# ─────────────────────────── DB ────────────────────────────────
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]


# ─────────────────────────── Helpers ───────────────────────────
def new_id() -> str:
    return str(uuid.uuid4())


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: Optional[datetime]) -> Optional[str]:
    return dt.isoformat() if dt else None


def clean_doc(doc: Optional[dict]) -> Optional[dict]:
    """Remove Mongo _id and convert datetimes to ISO strings."""
    if not doc:
        return doc
    out = {k: v for k, v in doc.items() if k != "_id"}
    for k, v in list(out.items()):
        if isinstance(v, datetime):
            out[k] = v.isoformat()
    return out


# ─────────────────────────── Email (Resend) ───────────────────
async def send_email(to_email: str, subject: str, html: str) -> None:
    if not RESEND_API_KEY:
        log.warning("RESEND_API_KEY missing, skipping email to %s", to_email)
        return
    payload: dict[str, Any] = {
        "from": f"{RESEND_FROM_NAME} <{RESEND_FROM}>",
        "to": [to_email],
        "subject": subject,
        "html": html,
    }
    if RESEND_REPLY_TO:
        payload["reply_to"] = RESEND_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            if r.status_code >= 300:
                log.error("Resend error %s: %s", r.status_code, r.text)
            else:
                log.info("Email sent to %s", to_email)
    except Exception as exc:  # pragma: no cover
        log.exception("Email failure: %s", exc)


EMAIL_FOOTER = (
    '<hr style="border:none;border-top:1px solid #E8EEF5;margin:24px 0">'
    '<p style="font-size:12px;color:#6B82A0;font-family:Georgia,serif">'
    '<span style="opacity:.9">[|]</span> La Clase Digital · '
    'Formación docente ELE · '
    '<a href="https://laclasedigital.com" style="color:#0F4C81">laclasedigital.com</a></p>'
)


def wrap_email(inner: str) -> str:
    return (
        '<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;'
        'margin:0 auto;padding:24px;color:#1A2535">'
        + inner
        + EMAIL_FOOTER
        + "</div>"
    )


# ─────────────────────────── Auth ──────────────────────────────
def create_session_jwt(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "iat": int(now_utc().timestamp()),
        "exp": int((now_utc() + timedelta(days=30)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def create_magic_token(email: str) -> str:
    payload = {
        "email": email.lower(),
        "purpose": "magic_link",
        "iat": int(now_utc().timestamp()),
        "exp": int((now_utc() + timedelta(minutes=30)).timestamp()),
        "nonce": secrets.token_urlsafe(16),
    }
    return jwt.encode(payload, MAGIC_LINK_SECRET, algorithm="HS256")


def verify_magic_token(token: str) -> str:
    try:
        data = jwt.decode(token, MAGIC_LINK_SECRET, algorithms=["HS256"])
    except JWTError as exc:
        raise HTTPException(400, "Enlace inválido o caducado") from exc
    if data.get("purpose") != "magic_link":
        raise HTTPException(400, "Token inválido")
    return data["email"]


async def current_user_optional(
    authorization: Optional[str] = Header(None),
) -> Optional[dict]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        return None
    user = await db.users.find_one({"id": data["sub"]})
    return clean_doc(user)


async def current_user(
    authorization: Optional[str] = Header(None),
) -> dict:
    user = await current_user_optional(authorization)
    if not user:
        raise HTTPException(401, "No autenticado")
    return user


async def current_admin(user: dict = Depends(current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(403, "Acceso restringido")
    return user
