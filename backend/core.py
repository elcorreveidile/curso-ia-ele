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
RESEND_DISABLE = os.environ.get("RESEND_DISABLE", "0") == "1"
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

# ─────────────────────────── Editions / cohorts ────────────────
# Each enrollment carries an ``edition`` integer that identifies the cohort.
# When a new edition starts we bump this so the welcome flow, polls and
# broadcasts naturally scope to the current cohort and don't spam
# alumni of previous editions. The 1st edition (May 2026) ended in May 2026;
# this constant captures the active edition right now.
CURRENT_EDITION = 2

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("laclasedigital")

# Log the email config seen at boot. Lets us detect "info@" or other malformed
# values without having to inspect Resend's request log.
log.info(
    "Email config at boot: RESEND_DISABLE=%r · RESEND_FROM=%r · RESEND_FROM_NAME=%r · "
    "RESEND_API_KEY=%s",
    RESEND_DISABLE,
    RESEND_FROM,
    RESEND_FROM_NAME,
    f"{RESEND_API_KEY[:6]}…{RESEND_API_KEY[-4:]}" if RESEND_API_KEY else "<missing>",
)

# ─────────────────────────── DB ────────────────────────────────
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]


# ─────────────────────────── Helpers ───────────────────────────
def new_id() -> str:
    return str(uuid.uuid4())


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: Optional[datetime]) -> Optional[str]:
    """Serialise a datetime to ISO-8601 with timezone info.

    Datetimes we write via ``now_utc()`` are tz-aware, but Motor/MongoDB
    returns them as naive UTC. We normalise naive values as UTC so the
    browser converts them to the viewer's local time correctly.
    """
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def clean_doc(doc: Optional[dict]) -> Optional[dict]:
    """Remove Mongo _id and convert datetimes to ISO strings (UTC-aware)."""
    if not doc:
        return doc
    out = {k: v for k, v in doc.items() if k != "_id"}
    for k, v in list(out.items()):
        if isinstance(v, datetime):
            if v.tzinfo is None:
                v = v.replace(tzinfo=timezone.utc)
            out[k] = v.isoformat()
    return out


# ─────────────────────────── Email (Resend) ───────────────────
async def send_email(
    to_email: str,
    subject: str,
    html: str,
    attachments: Optional[list[dict]] = None,
) -> None:
    """Send a transactional email via Resend.

    ``attachments`` is an optional list of dicts ``{filename, content_b64, content_type?}``
    where ``content_b64`` is the file contents encoded as base64. Resend's API
    expects ``content`` already base64-encoded for binary files.
    """
    if RESEND_DISABLE:
        log.info("RESEND_DISABLE=1 → skipping real email to %s (subject: %s)", to_email, subject)
        return
    if not RESEND_API_KEY:
        log.warning("RESEND_API_KEY missing, skipping email to %s", to_email)
        return
    # Guard against a malformed RESEND_FROM (e.g. "info@" without a domain).
    # Resend silently substitutes a default verified domain, which can leak
    # traffic to the wrong account and trigger "Domain not verified" errors.
    if "@" not in RESEND_FROM or RESEND_FROM.strip().endswith("@"):
        log.error(
            "RESEND_FROM is malformed (%r) — must be a full email address like "
            "'curso@laclasedigital.com'. Skipping send to %s.",
            RESEND_FROM, to_email,
        )
        raise RuntimeError(
            f"RESEND_FROM está mal configurado: '{RESEND_FROM}'. Debe ser una "
            "dirección completa, p. ej. curso@laclasedigital.com"
        )
    payload: dict[str, Any] = {
        "from": f"{RESEND_FROM_NAME} <{RESEND_FROM}>",
        "to": [to_email],
        "subject": subject,
        "html": html,
    }
    if RESEND_REPLY_TO:
        payload["reply_to"] = RESEND_REPLY_TO
    if attachments:
        payload["attachments"] = [
            {
                "filename": a["filename"],
                "content": a["content_b64"],
                **({"content_type": a["content_type"]} if a.get("content_type") else {}),
            }
            for a in attachments
        ]
    try:
        async with httpx.AsyncClient(timeout=20) as client:
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
    """Wrap an inner HTML fragment in a mobile-friendly email shell.

    The ``<meta viewport>`` + explicit base ``font-size`` are critical so
    iOS Mail and Gmail mobile do NOT zoom the message out to fit the 560px
    container — which is what was making poll emails "look very small" on
    phones. The media query bumps body text to 16px on narrow screens and
    forces the CTA button to span full width for a comfortable tap target.
    """
    return (
        '<!DOCTYPE html><html lang="es"><head>'
        '<meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<meta name="x-apple-disable-message-reformatting">'
        '<style>'
        'body{margin:0;padding:0;background:#F4F7FA;'
        '-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}'
        '@media only screen and (max-width:600px){'
        '.elc-wrap{padding:18px 16px !important;max-width:100% !important}'
        '.elc-wrap p,.elc-wrap li,.elc-wrap td{font-size:16px !important;line-height:1.6 !important}'
        '.elc-wrap h1{font-size:24px !important;line-height:1.25 !important}'
        '.elc-wrap h2{font-size:22px !important;line-height:1.3 !important}'
        '.elc-wrap h3{font-size:18px !important;line-height:1.3 !important}'
        '.elc-wrap a.elc-btn{display:block !important;padding:16px 22px !important;'
        'font-size:17px !important;text-align:center !important}'
        '}'
        '</style>'
        '</head><body>'
        '<div class="elc-wrap" style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'
        '\'Segoe UI\',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1A2535;'
        'font-size:16px;line-height:1.6;background:#FFFFFF">'
        + inner
        + EMAIL_FOOTER
        + "</div></body></html>"
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


def create_magic_token(
    email: str,
    marketing_consent: Optional[bool] = None,
    expires_in: timedelta = timedelta(minutes=30),
) -> str:
    payload = {
        "email": email.lower(),
        "purpose": "magic_link",
        "iat": int(now_utc().timestamp()),
        "exp": int((now_utc() + expires_in).timestamp()),
        "nonce": secrets.token_urlsafe(16),
    }
    if marketing_consent is not None:
        payload["mc"] = bool(marketing_consent)
    return jwt.encode(payload, MAGIC_LINK_SECRET, algorithm="HS256")


def create_welcome_magic_token(email: str) -> str:
    """Long-lived (30 days) magic token used in welcome / re-engagement emails.

    The student often opens the welcome email hours or days after enrollment
    (or after the manual invite is sent), so the standard 30-minute token
    expires before they click. 30 days gives them a comfortable window to
    land directly in their dashboard with one click.
    """
    return create_magic_token(email, expires_in=timedelta(days=30))


def verify_magic_token(token: str) -> tuple[str, Optional[bool]]:
    """Returns (email, marketing_consent). marketing_consent is None when the
    token didn't include a consent decision (back-compat)."""
    try:
        data = jwt.decode(token, MAGIC_LINK_SECRET, algorithms=["HS256"])
    except JWTError as exc:
        raise HTTPException(400, "Enlace inválido o caducado") from exc
    if data.get("purpose") != "magic_link":
        raise HTTPException(400, "Token inválido")
    return data["email"], data.get("mc")


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
    if user:
        # Touch last_seen_at on every authenticated hit, throttled to one
        # write every 5 minutes. This single field powers the "Última
        # conexión" column in the admin analytics — it captures *every*
        # navigation to any authenticated page (login, dashboard, course
        # home, foros, documents…) regardless of whether the user opened
        # a lesson or resource.
        #
        # Wrapped in try/except so this best-effort housekeeping can NEVER
        # break the auth flow: motor returns naive datetimes by default,
        # and a tz-aware vs tz-naive comparison would otherwise raise.
        try:
            prev = user.get("last_seen_at")
            now = now_utc()
            should_write = True
            if isinstance(prev, datetime):
                if prev.tzinfo is None:
                    prev = prev.replace(tzinfo=timezone.utc)
                should_write = (now - prev).total_seconds() > 300
            if should_write:
                await db.users.update_one(
                    {"id": user["id"]},
                    {"$set": {"last_seen_at": now}},
                )
                user["last_seen_at"] = now
        except Exception as exc:  # pragma: no cover
            log.warning("last_seen_at touch skipped: %s", exc)
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
