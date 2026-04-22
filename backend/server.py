"""La Clase Digital - Backend FastAPI."""
from __future__ import annotations

import asyncio
import hashlib
import logging
import os
import re
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal, Optional

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

from emergentintegrations.payments.stripe.checkout import (
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    StripeCheckout,
)
import stripe as stripe_sdk

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, File

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

# Configure official Stripe SDK (used for status checks / idempotent confirmation)
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
    """Remove Mongo _id and convert datetimes to iso strings."""
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


# ─────────────────────────── Models ────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr


class VerifyTokenRequest(BaseModel):
    token: str


class UserOut(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    surname: Optional[str] = None
    role: Literal["student", "admin"] = "student"
    created_at: str


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    surname: str = Field(min_length=1, max_length=120)


class CourseOut(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    price_eur: int
    price_founder_eur: int
    is_founder_edition: bool
    founder_seats: int
    founder_seats_taken: int
    active: bool
    hours: int = 20
    start_date: Optional[str] = None


class CheckoutRequest(BaseModel):
    course_slug: str
    origin_url: str


class SubmissionIn(BaseModel):
    content_md: str = ""
    file_url: Optional[str] = None


class FeedbackIn(BaseModel):
    feedback_md: str
    grade: Optional[int] = Field(None, ge=0, le=10)


class ThreadPostIn(BaseModel):
    body_md: str
    parent_id: Optional[str] = None


class ContactIn(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    asunto: str = Field("Otro", max_length=120)
    mensaje: str = Field(..., min_length=5, max_length=5000)


class LessonViewIn(BaseModel):
    lesson_id: str


class QuizSubmitIn(BaseModel):
    nombre: str = ""
    email: str = ""
    answers: dict[str, Any] = {}
    profile_key: str = ""
    total_score: int = 0


class AdminCourseUpdate(BaseModel):
    is_founder_edition: Optional[bool] = None
    founder_seats: Optional[int] = None
    founder_seats_taken: Optional[int] = None
    active: Optional[bool] = None


class AdminModuleUpdate(BaseModel):
    order: Optional[int] = None
    unlocked: Optional[bool] = None  # sets/clears unlocked_at


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


# ─────────────────────────── App + router ──────────────────────
app = FastAPI(title="La Clase Digital API")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────── Seed ──────────────────────────────
COURSE_IA_ELE = {
    "id": "course-ia-ele",
    "slug": "ia-ele",
    "title": "IA para la enseñanza de ELE",
    "description": (
        "Curso de formación docente · Mayo 2026 · 20 horas · 4 módulos · "
        "3 videotutorías en directo. Aprende a integrar herramientas de IA "
        "en tu práctica docente de ELE con criterio ético y pedagógico."
    ),
    "price_eur": 25000,  # 250 €
    "price_founder_eur": 14900,  # 149 €
    "is_founder_edition": True,
    "founder_seats": 20,
    "founder_seats_taken": 0,
    "active": True,
    "hours": 20,
    "start_date": "2026-05-04",
    "created_at": now_utc(),
}

MODULES_SEED = [
    {
        "order": 1,
        "title": "Ética y prompts eficaces",
        "description": (
            "Reflexión crítica sobre el uso ético y responsable de la IA. "
            "Principios básicos de ingeniería de prompts aplicados a ELE."
        ),
        "lessons": [
            {"title": "Ética de la IA en educación", "content_md": "# Ética de la IA\n\nReflexión crítica sobre el uso responsable de la IA en el aula de ELE.\n\n- Sesgos algorítmicos\n- Equidad y accesibilidad\n- Protección de datos del alumnado"},
            {"title": "Principios de ingeniería de prompts", "content_md": "# Ingeniería de prompts\n\nEstructura, contexto y claridad para obtener respuestas útiles de la IA.\n\n- Rol + tarea + contexto + formato\n- Ejemplos few-shot\n- Iteración crítica"},
        ],
        "task": {
            "title": "Mi declaración de uso ético de la IA",
            "instructions_md": "Redacta en 300-500 palabras tu declaración personal de principios para el uso de IA en el aula de ELE. Incluye al menos tres compromisos concretos.",
            "due_days": 7,
        },
    },
    {
        "order": 2,
        "title": "Tu asistente de ELE: chatbots a tu medida",
        "description": (
            "Exploración de chatbots y sus posibilidades para ELE. "
            "Creación de asistentes educativos propios."
        ),
        "lessons": [
            {"title": "Panorama de chatbots para docentes", "content_md": "# Chatbots para docentes de ELE\n\n- ChatGPT, Claude, Gemini: diferencias\n- Casos de uso reales\n- Limitaciones"},
            {"title": "Cómo crear un mini asistente", "content_md": "# Tu primer asistente\n\nDiseño del system prompt y ejemplos."},
        ],
        "task": {
            "title": "Crea tu primer mini asistente ELE",
            "instructions_md": "Diseña el system prompt de un asistente para una necesidad concreta de tu aula. Prueba con 3 interacciones simuladas y valora críticamente las respuestas.",
            "due_days": 7,
        },
    },
    {
        "order": 3,
        "title": "Planifica con IA: clases alineadas con el MCER",
        "description": (
            "Prompts plantilla para el MCER. Diseño de secuencias didácticas "
            "y mini apps para generar planes de clase."
        ),
        "lessons": [
            {"title": "Descriptores MCER y prompts", "content_md": "# Prompts plantilla MCER\n\nAlineación con los descriptores del Marco Común Europeo."},
            {"title": "Diseño de secuencias didácticas con IA", "content_md": "# Secuencias didácticas\n\nDel objetivo de aprendizaje al plan de clase."},
        ],
        "task": {
            "title": "Genera y evalúa un plan de clase con IA",
            "instructions_md": "Genera con IA un plan de clase de 50 minutos para un nivel MCER concreto. Revísalo con criterios pedagógicos y adjunta la reflexión sobre la co-creación.",
            "due_days": 7,
        },
    },
    {
        "order": 4,
        "title": "Crea sin límites: recursos multimodales con IA gratuita",
        "description": (
            "Imágenes, audios y mapas mentales con herramientas de IA "
            "gratuitas para enriquecer tus clases."
        ),
        "lessons": [
            {"title": "Imagen y audio con IA", "content_md": "# Recursos multimodales\n\nHerramientas gratuitas para crear imágenes y audios educativos."},
            {"title": "Mapas mentales con IA", "content_md": "# Mapas mentales\n\nVisualiza vocabulario y estructuras."},
        ],
        "task": {
            "title": "Kit de recursos multimodales",
            "instructions_md": "Crea un kit completo (imagen + audio + mapa mental) para una unidad real que impartas. Añade una reflexión final en el foro.",
            "due_days": 7,
        },
    },
]


async def seed_database() -> None:
    # Admin user
    if not await db.users.find_one({"email": ADMIN_EMAIL.lower()}):
        await db.users.insert_one({
            "id": "admin-" + hashlib.md5(ADMIN_EMAIL.encode()).hexdigest()[:8],
            "email": ADMIN_EMAIL.lower(),
            "name": "Javier Benítez Láinez",
            "role": "admin",
            "created_at": now_utc(),
        })
        log.info("Seeded admin user: %s", ADMIN_EMAIL)

    # Course
    course = await db.courses.find_one({"slug": "ia-ele"})
    if not course:
        await db.courses.insert_one(dict(COURSE_IA_ELE))
        log.info("Seeded course ia-ele")

    # Modules + lessons + tasks
    existing = await db.modules.count_documents({"course_id": "course-ia-ele"})
    if existing == 0:
        for mdata in MODULES_SEED:
            mid = f"mod-ia-{mdata['order']:02d}"
            await db.modules.insert_one({
                "id": mid,
                "course_id": "course-ia-ele",
                "order": mdata["order"],
                "title": mdata["title"],
                "description": mdata["description"],
                "unlocked_at": now_utc() if mdata["order"] == 1 else None,
                "created_at": now_utc(),
            })
            for lidx, lesson in enumerate(mdata["lessons"], start=1):
                await db.lessons.insert_one({
                    "id": f"{mid}-l{lidx}",
                    "module_id": mid,
                    "order": lidx,
                    "title": lesson["title"],
                    "content_md": lesson["content_md"],
                    "video_url": None,
                    "visible": True,
                    "created_at": now_utc(),
                })
            await db.tasks.insert_one({
                "id": f"{mid}-task",
                "module_id": mid,
                "order": 1,
                "title": mdata["task"]["title"],
                "instructions_md": mdata["task"]["instructions_md"],
                "due_days": mdata["task"]["due_days"],
                "created_at": now_utc(),
            })
        log.info("Seeded modules/lessons/tasks for ia-ele")


@app.on_event("startup")
async def on_startup() -> None:
    await seed_database()
    await seed_resources()


# ─────────────────────────── Resources (course materials) ─────
RESOURCE_TYPES = {  # folder hints → type label
    "lecturas": "lectura",
    "casos-reales": "lectura",
    "guias-comparativas": "lectura",
    "guias-herramientas": "lectura",
    "criterios-calidad": "lectura",
    "banco-mcer": "lectura",
    "tutoriales": "lectura",
    "plantillas": "plantilla",
    "rubricas": "rubrica",
    "glosarios": "glosario",
    "evaluacion": "encuesta",
}

RESOURCE_LABELS = {
    "lectura": "Lectura",
    "plantilla": "Plantilla",
    "rubrica": "Rúbrica",
    "glosario": "Glosario",
    "encuesta": "Encuesta",
}

MODULE_BY_FOLDER = {
    "modulo-01-etica": "mod-ia-01",
    "modulo-02-asistentes": "mod-ia-02",
    "modulo-03-planificacion": "mod-ia-03",
    "modulo-04-recursos": "mod-ia-04",
    "transversales": None,
}

SKIP_FOLDERS = {"videos", "propuesta"}
SKIP_FILES = {"GUIA_IMPLEMENTACION_MOODLE_COMPLETA.md", "GUIA_INICIO_MOODLE.md"}


def _slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:80] or "recurso"


async def seed_resources() -> None:
    base = Path("/app/legacy/materiales")
    if not base.exists():
        log.warning("No materials folder at %s, skipping resources seed", base)
        return
    count_new = 0
    count_updated = 0
    for md_file in base.rglob("*.md"):
        rel = md_file.relative_to(base)
        parts = rel.parts
        if any(p in SKIP_FOLDERS for p in parts):
            continue
        if md_file.name in SKIP_FILES:
            continue

        top_folder = parts[0]
        if top_folder not in MODULE_BY_FOLDER:
            continue
        module_id = MODULE_BY_FOLDER[top_folder]

        # Detect type from the parent folder (second segment)
        kind_folder = parts[1] if len(parts) > 2 else ""
        rtype = RESOURCE_TYPES.get(kind_folder, "lectura")

        content = md_file.read_text(encoding="utf-8", errors="ignore")
        # Try several heading candidates; skip generic ones like "ÍNDICE", "TABLA", "TOC"
        title = None
        for m in re.finditer(r"^#\s+(.+)$", content, re.MULTILINE):
            candidate = m.group(1).strip()
            upper = candidate.upper().strip("·: .")
            if upper in {"ÍNDICE", "INDICE", "TABLA DE CONTENIDOS", "CONTENIDO", "TOC", "TABLE OF CONTENTS"}:
                continue
            title = candidate
            break
        if not title:
            title = md_file.stem.replace("_", " ").replace("-", " ").title()
        # Normalize: if the title is all uppercase (shouty), apply smart title case
        def _smart_case(s: str) -> str:
            letters = [c for c in s if c.isalpha()]
            if not letters:
                return s
            if all(c.isupper() for c in letters):
                # Convert to Title Case but keep small connectors lowercase
                small = {"de", "del", "la", "el", "los", "las", "y", "o", "u", "con",
                         "para", "por", "en", "a", "al", "ele", "ia", "mcer"}
                words = s.lower().split()
                out = []
                for i, w in enumerate(words):
                    core = w.strip(":·.,;!?")
                    if i > 0 and core in small:
                        out.append(w)
                    else:
                        out.append(w[:1].upper() + w[1:])
                res = " ".join(out)
                # Re-uppercase acronyms
                for ac in ("ELE", "IA", "MCER", "ChatGPT", "PDF", "A1", "A2", "B1", "B2", "C1", "C2"):
                    res = re.sub(rf"\b{ac}\b", ac, res, flags=re.IGNORECASE)
                return res
            return s
        title = _smart_case(title)

        slug = _slugify(md_file.stem)
        existing = await db.resources.find_one({"slug": slug})
        doc = {
            "slug": slug,
            "title": title,
            "type": rtype,
            "module_id": module_id,  # None → transversal
            "course_id": "course-ia-ele",
            "content_md": content,
            "source_path": str(rel),
            "updated_at": now_utc(),
        }
        if existing:
            await db.resources.update_one({"slug": slug}, {"$set": doc})
            count_updated += 1
        else:
            doc.update({"id": new_id(), "created_at": now_utc()})
            await db.resources.insert_one(doc)
            count_new += 1
    log.info("Resources seeded: %d new, %d updated", count_new, count_updated)


# ─────────────────────────── Public routes ─────────────────────
@api.get("/")
async def root():
    return {"ok": True, "app": "La Clase Digital"}


@api.get("/courses/{slug}", response_model=CourseOut)
async def get_course(slug: str):
    course = await db.courses.find_one({"slug": slug})
    if not course:
        raise HTTPException(404, "Curso no encontrado")
    return CourseOut(**clean_doc(course))


# ─────────────────────────── Auth routes ───────────────────────
@api.post("/auth/request-link")
async def request_magic_link(payload: LoginRequest, request: Request):
    email = payload.email.lower()
    token = create_magic_token(email)
    # Always use the configured public FRONTEND_ORIGIN. The Origin header can
    # contain an internal cluster URL in preview environments (e.g.
    # …emergentcf.cloud) which is not publicly reachable and returns 403.
    origin = FRONTEND_ORIGIN or request.headers.get("origin") or ""
    origin = origin.rstrip("/")
    link = f"{origin}/auth/verify?token={token}"
    html = wrap_email(
        f"""
        <p style="font-size:16px">Hola,</p>
        <p style="font-size:16px;line-height:1.6">
          Has solicitado acceder a <strong>La Clase Digital</strong>.
          Haz clic en el siguiente botón para entrar (válido 30 minutos):
        </p>
        <p style="text-align:center;margin:32px 0">
          <a href="{link}" style="background:#F5A623;color:#1A2535;text-decoration:none;
            padding:14px 28px;border-radius:6px;font-weight:700;display:inline-block">
            Entrar a mi cuenta
          </a>
        </p>
        <p style="font-size:13px;color:#6B82A0">
          Si no fuiste tú, ignora este mensaje. El enlace caducará solo.
        </p>
        """
    )
    await send_email(email, "Tu acceso a La Clase Digital", html)
    return {"ok": True, "message": "Te hemos enviado un enlace de acceso a tu email."}


@api.post("/auth/verify")
async def verify_magic_link(payload: VerifyTokenRequest):
    email = verify_magic_token(payload.token)
    user = await db.users.find_one({"email": email})
    if not user:
        uid = new_id()
        await db.users.insert_one({
            "id": uid,
            "email": email,
            "name": None,
            "role": "admin" if email == ADMIN_EMAIL.lower() else "student",
            "created_at": now_utc(),
        })
        user = await db.users.find_one({"id": uid})
    user_c = clean_doc(user)
    jwt_token = create_session_jwt(user_c["id"], user_c["email"], user_c["role"])
    return {"token": jwt_token, "user": user_c}


@api.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(current_user)):
    return UserOut(**user)


@api.put("/auth/profile", response_model=UserOut)
async def update_profile(payload: ProfileUpdate, user: dict = Depends(current_user)):
    name = payload.name.strip()
    surname = payload.surname.strip()
    if not name or not surname:
        raise HTTPException(400, "Nombre y apellido son obligatorios")
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"name": name, "surname": surname, "updated_at": now_utc()}},
    )
    updated = await db.users.find_one({"id": user["id"]})
    return UserOut(**clean_doc(updated))


# ─────────────────────────── Enrollment / Stripe ───────────────
def _stripe_for(request: Request) -> StripeCheckout:
    # Host URL for the webhook
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    return StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)


@api.post("/checkout/create")
async def create_checkout_session(
    payload: CheckoutRequest,
    request: Request,
    user: Optional[dict] = Depends(current_user_optional),
):
    course = await db.courses.find_one({"slug": payload.course_slug, "active": True})
    if not course:
        raise HTTPException(404, "Curso no disponible")

    # Server-side price decision
    is_founder = bool(course.get("is_founder_edition")) and (
        course.get("founder_seats_taken", 0) < course.get("founder_seats", 0)
    )
    amount_cents = course["price_founder_eur"] if is_founder else course["price_eur"]
    amount_float = round(amount_cents / 100, 2)

    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/inscripcion/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/inscripcion/{payload.course_slug}"

    metadata = {
        "course_id": course["id"],
        "course_slug": course["slug"],
        "was_founder": "true" if is_founder else "false",
        "user_email": (user or {}).get("email", ""),
        "user_id": (user or {}).get("id", ""),
    }

    stripe = _stripe_for(request)
    req = CheckoutSessionRequest(
        amount=amount_float,
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe.create_checkout_session(req)

    await db.payment_transactions.insert_one({
        "id": new_id(),
        "session_id": session.session_id,
        "amount_cents": amount_cents,
        "currency": "eur",
        "metadata": metadata,
        "payment_status": "initiated",
        "status": "open",
        "course_id": course["id"],
        "user_email": metadata["user_email"],
        "user_id": metadata["user_id"],
        "was_founder": is_founder,
        "enrollment_id": None,
        "created_at": now_utc(),
    })

    return {"url": session.url, "session_id": session.session_id}


async def _ensure_enrollment_from_session(session_id: str) -> Optional[dict]:
    """Idempotent enrollment creation after payment success."""
    tx = await db.payment_transactions.find_one({"session_id": session_id})
    if not tx:
        return None
    if tx.get("payment_status") == "paid" and tx.get("enrollment_id"):
        return await db.enrollments.find_one({"id": tx["enrollment_id"]})

    # Resolve / create user
    email = (tx.get("user_email") or "").lower()
    if not email:
        return None
    user = await db.users.find_one({"email": email})
    if not user:
        uid = new_id()
        await db.users.insert_one({
            "id": uid,
            "email": email,
            "name": None,
            "role": "admin" if email == ADMIN_EMAIL.lower() else "student",
            "created_at": now_utc(),
        })
        user = await db.users.find_one({"id": uid})

    course = await db.courses.find_one({"id": tx["course_id"]})
    if not course:
        return None

    # Create enrollment (unique per user+course)
    existing = await db.enrollments.find_one({
        "user_id": user["id"],
        "course_id": course["id"],
    })
    if existing:
        enrollment_id = existing["id"]
    else:
        enrollment_id = new_id()
        await db.enrollments.insert_one({
            "id": enrollment_id,
            "user_id": user["id"],
            "course_id": course["id"],
            "paid_at": now_utc(),
            "stripe_payment_id": session_id,
            "amount_paid_eur": tx["amount_cents"],
            "was_founder": tx.get("was_founder", False),
            "status": "active",
            "created_at": now_utc(),
        })
        # Update founder seats
        if tx.get("was_founder"):
            new_taken = (course.get("founder_seats_taken") or 0) + 1
            update: dict[str, Any] = {"founder_seats_taken": new_taken}
            if new_taken >= (course.get("founder_seats") or 0):
                update["is_founder_edition"] = False
            await db.courses.update_one({"id": course["id"]}, {"$set": update})

        # Welcome email to student
        amount_eur = tx["amount_cents"] / 100
        price_line = (
            f"<strong>{amount_eur:.2f} €</strong>"
            + (" (precio fundador)" if tx.get("was_founder") else "")
        )
        html = wrap_email(
            f"""
            <h2 style="font-family:Georgia,serif;color:#0F4C81">¡Bienvenido/a, {user['email']}!</h2>
            <p>Te has inscrito correctamente en <strong>{course['title']}</strong>.</p>
            <p>Importe pagado: {price_line}</p>
            <p>Ya puedes acceder a tu área privada con tu email. Te esperamos el
               <strong>4 de mayo de 2026</strong> en la primera videotutoría.</p>
            <p style="text-align:center;margin:28px 0">
              <a href="{FRONTEND_ORIGIN}/login" style="background:#0F4C81;color:#fff;
                 text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600">
                Acceder a mi área privada
              </a>
            </p>
            """
        )
        await send_email(user["email"], "Inscripción confirmada · La Clase Digital", html)

        # Notify admin of new enrollment
        admin_html = wrap_email(
            f"""
            <h3>Nueva inscripción</h3>
            <p><strong>{user['email']}</strong> se ha inscrito en <strong>{course['title']}</strong>.</p>
            <ul>
              <li>Importe: {amount_eur:.2f} €</li>
              <li>Tipo: {'Fundador' if tx.get('was_founder') else 'Estándar'}</li>
              <li>Plazas fundador: {(course.get('founder_seats_taken') or 0) + (1 if tx.get('was_founder') else 0)}/{course.get('founder_seats')}</li>
              <li>Session Stripe: <code>{session_id}</code></li>
            </ul>
            <p style="text-align:center;margin:20px 0">
              <a href="{FRONTEND_ORIGIN}/admin" style="background:#0F4C81;color:#fff;
                 text-decoration:none;padding:10px 20px;border-radius:6px">Ver en panel</a>
            </p>
            """
        )
        await send_email(ADMIN_EMAIL, f"Nueva inscripción: {user['email']}", admin_html)

    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {
            "payment_status": "paid",
            "status": "complete",
            "enrollment_id": enrollment_id,
            "updated_at": now_utc(),
        }},
    )
    return await db.enrollments.find_one({"id": enrollment_id})


@api.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request):
    tx = await db.payment_transactions.find_one({"session_id": session_id})
    user_email = (tx or {}).get("user_email") if tx else None

    try:
        session = await asyncio.to_thread(
            stripe_sdk.checkout.Session.retrieve, session_id
        )
    except Exception as exc:
        log.warning("Stripe session retrieve failed for %s: %s", session_id, exc)
        return {
            "status": (tx or {}).get("status", "unknown"),
            "payment_status": (tx or {}).get("payment_status", "unknown"),
            "amount_total": (tx or {}).get("amount_cents"),
            "currency": (tx or {}).get("currency", "eur"),
            "enrollment": None,
            "user_email": user_email,
            "error": "stripe_unavailable",
        }

    status_str = getattr(session, "status", None) or "open"
    payment_status = getattr(session, "payment_status", None) or "unpaid"
    amount_total = getattr(session, "amount_total", None)
    currency = getattr(session, "currency", None) or "eur"

    if tx:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": status_str,
                "payment_status": payment_status,
                "updated_at": now_utc(),
            }},
        )

    enrollment = None
    if payment_status == "paid":
        enrollment = await _ensure_enrollment_from_session(session_id)

    return {
        "status": status_str,
        "payment_status": payment_status,
        "amount_total": amount_total,
        "currency": currency,
        "enrollment": clean_doc(enrollment) if enrollment else None,
        "user_email": user_email,
    }


@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Stripe webhook handler using official SDK directly.

    Bypasses emergentintegrations wrapper (had Pydantic validation issues
    with StripeObject → dict on metadata). We only care about
    `checkout.session.completed` events to confirm enrollments.
    """
    body = await request.body()
    sig_header = request.headers.get("Stripe-Signature", "")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

    event_data: dict[str, Any]
    if webhook_secret:
        try:
            event = stripe_sdk.Webhook.construct_event(body, sig_header, webhook_secret)
            event_data = event["data"]["object"]
            event_type = event["type"]
        except Exception as exc:
            log.exception("Webhook signature verification failed: %s", exc)
            raise HTTPException(status_code=400, detail="Invalid webhook signature") from exc
    else:
        # Dev/test: accept unsigned events — DO NOT use in production without STRIPE_WEBHOOK_SECRET
        import json as _json
        try:
            event_json = _json.loads(body.decode("utf-8"))
            event_data = event_json["data"]["object"]
            event_type = event_json.get("type", "")
        except Exception as exc:
            log.exception("Webhook parse error: %s", exc)
            raise HTTPException(status_code=400, detail="Invalid webhook payload") from exc

    if event_type == "checkout.session.completed":
        session_id = event_data.get("id")
        payment_status = event_data.get("payment_status")
        if session_id and payment_status == "paid":
            await _ensure_enrollment_from_session(session_id)

    return {"received": True}


# ─────────────────────────── Dashboard / courses ───────────────
async def _user_enrollments(user_id: str) -> list[dict]:
    rows = []
    async for e in db.enrollments.find({"user_id": user_id, "status": {"$ne": "cancelled"}}):
        course = await db.courses.find_one({"id": e["course_id"]})
        rows.append({
            "enrollment": clean_doc(e),
            "course": clean_doc(course) if course else None,
        })
    return rows


@api.get("/dashboard")
async def dashboard(user: dict = Depends(current_user)):
    enrollments = await _user_enrollments(user["id"])
    # Attach progress for each enrolled course
    for row in enrollments:
        if row["course"]:
            row["progress"] = await _progress_for(user, row["course"])
    return {"user": user, "enrollments": enrollments}


async def _ensure_enrollment_for(user: dict, slug: str) -> dict:
    course = await db.courses.find_one({"slug": slug})
    if not course:
        raise HTTPException(404, "Curso no encontrado")
    enrollment = await db.enrollments.find_one({
        "user_id": user["id"],
        "course_id": course["id"],
        "status": {"$ne": "cancelled"},
    })
    if not enrollment and user.get("role") != "admin":
        raise HTTPException(403, "No estás inscrito/a en este curso")
    return {"course": course, "enrollment": enrollment}


@api.get("/course/{slug}/content")
async def course_content(slug: str, user: dict = Depends(current_user)):
    ctx = await _ensure_enrollment_for(user, slug)
    course = ctx["course"]
    modules = []
    async for m in db.modules.find({"course_id": course["id"]}).sort("order", 1):
        lessons = []
        async for le in db.lessons.find({"module_id": m["id"], "visible": True}).sort("order", 1):
            lessons.append(clean_doc(le))
        task = await db.tasks.find_one({"module_id": m["id"]})
        modules.append({
            "module": clean_doc(m),
            "unlocked": bool(m.get("unlocked_at")) or user.get("role") == "admin",
            "lessons": lessons,
            "task": clean_doc(task),
        })
    return {
        "course": clean_doc(course),
        "enrollment": clean_doc(ctx["enrollment"]) if ctx["enrollment"] else None,
        "modules": modules,
    }


@api.get("/course/{slug}/task/{task_id}")
async def task_detail(slug: str, task_id: str, user: dict = Depends(current_user)):
    await _ensure_enrollment_for(user, slug)
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(404, "Tarea no encontrada")
    mod = await db.modules.find_one({"id": task["module_id"]})
    submissions = []
    async for s in db.submissions.find({"task_id": task_id, "user_id": user["id"]}).sort("submitted_at", -1):
        submissions.append(clean_doc(s))

    # Module resources gate: list unread resources from this module so the
    # student must read the materials before submitting the task.
    module_resources = []
    pending_resources = []
    if mod:
        viewed_slugs = set()
        async for row in db.user_progress.find(
            {"user_id": user["id"], "resource_slug": {"$exists": True}},
            {"resource_slug": 1},
        ):
            if row.get("resource_slug"):
                viewed_slugs.add(row["resource_slug"])
        async for r in db.resources.find(
            {"module_id": mod["id"]}
        ).sort([("type", 1), ("title", 1)]):
            item = {
                "slug": r["slug"], "title": r["title"],
                "type": r["type"], "type_label": RESOURCE_LABELS.get(r["type"], r["type"]),
                "viewed": r["slug"] in viewed_slugs,
            }
            module_resources.append(item)
            if not item["viewed"]:
                pending_resources.append(item)
    # Admins are never gated
    can_submit = (user.get("role") == "admin") or (len(pending_resources) == 0)

    return {
        "task": clean_doc(task),
        "module": clean_doc(mod),
        "submissions": submissions,
        "module_resources": module_resources,
        "pending_resources": pending_resources,
        "can_submit": can_submit,
    }


@api.post("/course/{slug}/task/{task_id}/submit")
async def submit_task(
    slug: str, task_id: str, payload: SubmissionIn, user: dict = Depends(current_user),
):
    await _ensure_enrollment_for(user, slug)
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(404, "Tarea no encontrada")
    # Gate: require all module resources to be viewed (admins bypass)
    if user.get("role") != "admin" and task.get("module_id"):
        viewed_slugs = set()
        async for row in db.user_progress.find(
            {"user_id": user["id"], "resource_slug": {"$exists": True}},
            {"resource_slug": 1},
        ):
            if row.get("resource_slug"):
                viewed_slugs.add(row["resource_slug"])
        pending = []
        async for r in db.resources.find({"module_id": task["module_id"]}, {"slug": 1, "title": 1}):
            if r["slug"] not in viewed_slugs:
                pending.append(r["title"])
        if pending:
            raise HTTPException(
                400,
                f"Antes de entregar debes leer los materiales del módulo: {', '.join(pending[:5])}"
                + (" …" if len(pending) > 5 else ""),
            )
    sid = new_id()
    doc = {
        "id": sid,
        "task_id": task_id,
        "user_id": user["id"],
        "user_email": user["email"],
        "content_md": payload.content_md,
        "file_url": payload.file_url,
        "submitted_at": now_utc(),
        "status": "pending",
        "grade": None,
        "feedback_md": None,
        "created_at": now_utc(),
    }
    await db.submissions.insert_one(doc)
    # Notify admin
    html = wrap_email(
        f"""
        <h3>Nueva entrega recibida</h3>
        <p><strong>{user['email']}</strong> ha entregado la tarea
           <em>{task['title']}</em>.</p>
        <p style="text-align:center;margin:20px 0">
          <a href="{FRONTEND_ORIGIN}/admin" style="background:#0F4C81;color:#fff;
             text-decoration:none;padding:10px 20px;border-radius:6px">Revisar en el panel</a>
        </p>
        """
    )
    await send_email(ADMIN_EMAIL, f"Nueva entrega: {task['title']}", html)
    return clean_doc(doc)


# ─────────────────────────── Forum threads ────────────────────
@api.get("/course/{slug}/task/{task_id}/threads")
async def list_threads(slug: str, task_id: str, user: dict = Depends(current_user)):
    await _ensure_enrollment_for(user, slug)
    posts = []
    async for t in db.threads.find({"task_id": task_id}).sort("created_at", 1):
        posts.append(clean_doc(t))
    return {"posts": posts}


@api.post("/course/{slug}/task/{task_id}/threads")
async def create_thread(
    slug: str, task_id: str, payload: ThreadPostIn, user: dict = Depends(current_user),
):
    await _ensure_enrollment_for(user, slug)
    tid = new_id()
    await db.threads.insert_one({
        "id": tid,
        "task_id": task_id,
        "user_id": user["id"],
        "user_email": user["email"],
        "parent_id": payload.parent_id,
        "body_md": payload.body_md,
        "created_at": now_utc(),
    })
    # Notify admin if student posted
    if user.get("role") != "admin":
        task = await db.tasks.find_one({"id": task_id})
        title = task["title"] if task else "Foro"
        html = wrap_email(
            f"<h3>Nuevo mensaje en foro</h3>"
            f"<p><strong>{user['email']}</strong> escribió en «{title}».</p>"
            f'<pre style="background:#F4F7FA;padding:10px;border-radius:6px">{payload.body_md[:500]}</pre>'
        )
        await send_email(ADMIN_EMAIL, f"Nuevo mensaje en foro: {title}", html)
    return {"id": tid}


# ─────────────────────────── Admin endpoints ───────────────────
@api.get("/admin/overview")
async def admin_overview(user: dict = Depends(current_admin)):
    courses = []
    async for c in db.courses.find({}):
        enrollments_count = await db.enrollments.count_documents({"course_id": c["id"]})
        courses.append({**clean_doc(c), "enrollments_count": enrollments_count})

    enrollments = []
    async for e in db.enrollments.find({}).sort("created_at", -1):
        u = await db.users.find_one({"id": e["user_id"]})
        c = await db.courses.find_one({"id": e["course_id"]})
        enrollments.append({
            "enrollment": clean_doc(e),
            "user": clean_doc(u) if u else None,
            "course": clean_doc(c) if c else None,
        })

    pending = []
    async for s in db.submissions.find({"status": "pending"}).sort("submitted_at", -1):
        u = await db.users.find_one({"id": s["user_id"]})
        t = await db.tasks.find_one({"id": s["task_id"]})
        pending.append({
            "submission": clean_doc(s),
            "user": clean_doc(u) if u else None,
            "task": clean_doc(t) if t else None,
        })

    return {
        "courses": courses,
        "enrollments": enrollments,
        "pending_submissions": pending,
    }


@api.patch("/admin/course/{course_id}")
async def admin_update_course(
    course_id: str, payload: AdminCourseUpdate, user: dict = Depends(current_admin),
):
    update = {k: v for k, v in payload.dict().items() if v is not None}
    if not update:
        raise HTTPException(400, "Nada que actualizar")
    await db.courses.update_one({"id": course_id}, {"$set": update})
    return clean_doc(await db.courses.find_one({"id": course_id}))


@api.patch("/admin/module/{module_id}")
async def admin_update_module(
    module_id: str, payload: AdminModuleUpdate, user: dict = Depends(current_admin),
):
    update: dict[str, Any] = {}
    if payload.order is not None:
        update["order"] = payload.order
    if payload.unlocked is not None:
        update["unlocked_at"] = now_utc() if payload.unlocked else None
    if not update:
        raise HTTPException(400, "Nada que actualizar")
    await db.modules.update_one({"id": module_id}, {"$set": update})
    return clean_doc(await db.modules.find_one({"id": module_id}))


@api.get("/admin/submission/{submission_id}")
async def admin_submission(submission_id: str, user: dict = Depends(current_admin)):
    s = await db.submissions.find_one({"id": submission_id})
    if not s:
        raise HTTPException(404, "Entrega no encontrada")
    u = await db.users.find_one({"id": s["user_id"]})
    t = await db.tasks.find_one({"id": s["task_id"]})
    return {
        "submission": clean_doc(s),
        "user": clean_doc(u) if u else None,
        "task": clean_doc(t) if t else None,
    }


@api.post("/admin/submission/{submission_id}/feedback")
async def admin_feedback(
    submission_id: str, payload: FeedbackIn, user: dict = Depends(current_admin),
):
    s = await db.submissions.find_one({"id": submission_id})
    if not s:
        raise HTTPException(404, "Entrega no encontrada")
    await db.submissions.update_one(
        {"id": submission_id},
        {"$set": {
            "feedback_md": payload.feedback_md,
            "grade": payload.grade,
            "status": "reviewed",
            "reviewed_at": now_utc(),
        }},
    )
    # Email student
    student = await db.users.find_one({"id": s["user_id"]})
    task = await db.tasks.find_one({"id": s["task_id"]})
    if student and task:
        html = wrap_email(
            f"""
            <h3>Tienes feedback disponible</h3>
            <p>Hay comentarios del formador sobre tu entrega de
               <strong>{task['title']}</strong>.</p>
            <p style="text-align:center;margin:20px 0">
              <a href="{FRONTEND_ORIGIN}/dashboard" style="background:#F5A623;color:#1A2535;
                 text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:700">
                Ver feedback
              </a>
            </p>
            """
        )
        await send_email(student["email"], "Feedback disponible · La Clase Digital", html)
    return clean_doc(await db.submissions.find_one({"id": submission_id}))


# ─────────────────────────── Resources endpoints ──────────────
@api.get("/course/{slug}/resources")
async def list_course_resources(slug: str, user: dict = Depends(current_user)):
    await _ensure_enrollment_for(user, slug)
    course = await db.courses.find_one({"slug": slug})
    if not course:
        raise HTTPException(404, "Curso no encontrado")

    # Which resources has this user already viewed?
    viewed_slugs = set()
    async for row in db.user_progress.find(
        {"user_id": user["id"], "course_id": course["id"], "resource_slug": {"$exists": True}},
        {"resource_slug": 1},
    ):
        if row.get("resource_slug"):
            viewed_slugs.add(row["resource_slug"])

    # Group by module
    modules = []
    async for m in db.modules.find({"course_id": course["id"]}).sort("order", 1):
        items = []
        async for r in db.resources.find({"course_id": course["id"], "module_id": m["id"]}).sort([("type", 1), ("title", 1)]):
            items.append({
                "slug": r["slug"], "title": r["title"],
                "type": r["type"], "type_label": RESOURCE_LABELS.get(r["type"], r["type"]),
                "module_id": m["id"],
                "viewed": r["slug"] in viewed_slugs,
            })
        modules.append({
            "module_id": m["id"], "order": m["order"], "title": m["title"],
            "unlocked": bool(m.get("unlocked_at")) or user.get("role") == "admin",
            "resources": items,
        })

    # Transversal resources (module_id null)
    transversal = []
    async for r in db.resources.find({"course_id": course["id"], "module_id": None}).sort("title", 1):
        transversal.append({
            "slug": r["slug"], "title": r["title"],
            "type": r["type"], "type_label": RESOURCE_LABELS.get(r["type"], r["type"]),
            "module_id": None,
            "viewed": r["slug"] in viewed_slugs,
        })

    total_res = sum(len(m["resources"]) for m in modules) + len(transversal)
    return {
        "modules": modules,
        "transversal": transversal,
        "viewed_count": len(viewed_slugs & {r["slug"] for m in modules for r in m["resources"]} | viewed_slugs & {r["slug"] for r in transversal}),
        "total_count": total_res,
    }


@api.get("/resource/{slug}")
async def get_resource(slug: str, user: dict = Depends(current_user)):
    r = await db.resources.find_one({"slug": slug})
    if not r:
        raise HTTPException(404, "Recurso no encontrado")
    # Validate enrollment (transversal resources still require enrollment)
    course = await db.courses.find_one({"id": r["course_id"]})
    if course:
        await _ensure_enrollment_for(user, course["slug"])
    module = await db.modules.find_one({"id": r["module_id"]}) if r.get("module_id") else None
    # Mark as viewed (idempotent) — only for real students, not admins
    if course and user.get("role") != "admin":
        await db.user_progress.update_one(
            {"user_id": user["id"], "resource_slug": r["slug"]},
            {"$set": {
                "user_id": user["id"],
                "resource_slug": r["slug"],
                "course_id": course["id"],
                "viewed_at": now_utc(),
            }},
            upsert=True,
        )
    return {
        "slug": r["slug"],
        "title": r["title"],
        "type": r["type"],
        "type_label": RESOURCE_LABELS.get(r["type"], r["type"]),
        "content_md": r["content_md"],
        "module_id": r.get("module_id"),
        "module_order": module.get("order") if module else None,
        "module_title": module.get("title") if module else None,
        "course_slug": course.get("slug") if course else None,
        "course_title": course.get("title") if course else None,
        "updated_at": iso(r.get("updated_at")),
    }


@api.post("/admin/resources/reseed")
async def admin_reseed_resources(user: dict = Depends(current_admin)):
    await seed_resources()
    total = await db.resources.count_documents({})
    return {"ok": True, "total": total}


@api.delete("/admin/enrollment/{enrollment_id}")
async def admin_delete_enrollment(enrollment_id: str, user: dict = Depends(current_admin)):
    """Delete an enrollment and its related data (submissions, threads, progress, certificates).

    If the enrollment used a founder seat, decrement founder_seats_taken and
    re-activate is_founder_edition if it was flipped off because of this one.
    The user document itself is preserved (they may re-enroll or be admin).
    """
    enrollment = await db.enrollments.find_one({"id": enrollment_id})
    if not enrollment:
        raise HTTPException(404, "Inscripción no encontrada")

    user_id = enrollment["user_id"]
    course_id = enrollment["course_id"]

    # Clean related artefacts scoped to this user+course
    module_ids = [m["id"] async for m in db.modules.find({"course_id": course_id}, {"id": 1})]
    task_ids = [t["id"] async for t in db.tasks.find({"module_id": {"$in": module_ids}}, {"id": 1})]
    lesson_ids = [le["id"] async for le in db.lessons.find({"module_id": {"$in": module_ids}}, {"id": 1})]

    deleted = {
        "submissions": (await db.submissions.delete_many({"user_id": user_id, "task_id": {"$in": task_ids}})).deleted_count if task_ids else 0,
        "threads": (await db.threads.delete_many({"user_id": user_id, "task_id": {"$in": task_ids}})).deleted_count if task_ids else 0,
        "user_progress": (await db.user_progress.delete_many({
            "user_id": user_id,
            "$or": [
                {"lesson_id": {"$in": lesson_ids}} if lesson_ids else {"lesson_id": "__none__"},
                {"course_id": course_id, "resource_slug": {"$exists": True}},
            ],
        })).deleted_count,
        "certificates": (await db.certificates.delete_many({"enrollment_id": enrollment_id})).deleted_count,
        "payment_transactions": (await db.payment_transactions.delete_many({"enrollment_id": enrollment_id})).deleted_count,
    }

    # Restore founder seat if applicable
    if enrollment.get("was_founder"):
        course = await db.courses.find_one({"id": course_id})
        if course:
            new_taken = max(0, (course.get("founder_seats_taken") or 0) - 1)
            update: dict[str, Any] = {"founder_seats_taken": new_taken}
            # Re-open founder edition if we freed a seat and we were sold out
            if new_taken < (course.get("founder_seats") or 0) and not course.get("is_founder_edition"):
                update["is_founder_edition"] = True
            await db.courses.update_one({"id": course_id}, {"$set": update})

    # Finally delete the enrollment
    await db.enrollments.delete_one({"id": enrollment_id})

    return {"ok": True, "deleted": deleted}


# ─────────────────────────── Upload (Cloudinary) ───────────────
@api.post("/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(current_user)):
    if not CLOUDINARY_CLOUD_NAME:
        raise HTTPException(500, "Cloudinary no configurado")
    max_bytes = 20 * 1024 * 1024  # 20 MB
    data = await file.read()
    if len(data) > max_bytes:
        raise HTTPException(400, "Archivo demasiado grande (máx 20 MB)")
    try:
        result = cloudinary.uploader.upload(
            data,
            folder=f"laclasedigital/{user['id']}",
            resource_type="auto",
            use_filename=True,
            unique_filename=True,
        )
    except Exception as exc:
        log.exception("Cloudinary upload failed")
        raise HTTPException(500, f"Error subiendo archivo: {exc}") from exc
    return {
        "url": result.get("secure_url"),
        "public_id": result.get("public_id"),
        "bytes": result.get("bytes"),
        "format": result.get("format"),
        "original_filename": result.get("original_filename"),
    }


# ─────────────────────────── Certificates ──────────────────────
class CertificateIssueIn(BaseModel):
    enrollment_id: str
    hours: int = 20


@api.post("/admin/certificate/issue")
async def issue_certificate(payload: CertificateIssueIn, user: dict = Depends(current_admin)):
    enrollment = await db.enrollments.find_one({"id": payload.enrollment_id})
    if not enrollment:
        raise HTTPException(404, "Inscripción no encontrada")
    existing = await db.certificates.find_one({"enrollment_id": payload.enrollment_id})
    if existing:
        return clean_doc(existing)
    cert_id = new_id()
    cert = {
        "id": cert_id,
        "enrollment_id": payload.enrollment_id,
        "user_id": enrollment["user_id"],
        "course_id": enrollment["course_id"],
        "hours": payload.hours,
        "issued_at": now_utc(),
        "pdf_url": None,  # Rendered client-side; PDF can be regenerated from data
    }
    await db.certificates.insert_one(cert)
    # Mark enrollment as completed
    await db.enrollments.update_one(
        {"id": payload.enrollment_id},
        {"$set": {"status": "completed", "completed_at": now_utc()}},
    )
    # Email student
    student = await db.users.find_one({"id": enrollment["user_id"]})
    course = await db.courses.find_one({"id": enrollment["course_id"]})
    if student and course:
        html = wrap_email(
            f"""
            <h2 style="font-family:Georgia,serif;color:#0F4C81">¡Tu certificado está listo! 🏅</h2>
            <p>Has completado <strong>{course['title']}</strong>. Puedes ver y descargar tu
               certificado en el siguiente enlace:</p>
            <p style="text-align:center;margin:28px 0">
              <a href="{FRONTEND_ORIGIN}/certificado/{cert_id}" style="background:#F5A623;color:#1A2535;
                 text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:700">
                Ver mi certificado
              </a>
            </p>
            <p style="font-size:13px;color:#6B82A0">
              El certificado es verificable por esta URL pública.
            </p>
            """
        )
        await send_email(student["email"], "Certificado emitido · La Clase Digital", html)
    return clean_doc(cert)


@api.get("/certificate/{cert_id}")
async def get_certificate(cert_id: str):
    cert = await db.certificates.find_one({"id": cert_id})
    if not cert:
        raise HTTPException(404, "Certificado no encontrado")
    user = await db.users.find_one({"id": cert["user_id"]})
    course = await db.courses.find_one({"id": cert["course_id"]})
    return {
        "certificate": clean_doc(cert),
        "user": {"email": user.get("email"), "name": user.get("name")} if user else None,
        "course": {"title": course.get("title"), "slug": course.get("slug"), "hours": course.get("hours", cert.get("hours", 20))} if course else None,
    }


# ─────────────────────────── Module reorder ────────────────────
class ReorderRequest(BaseModel):
    module_id: str
    direction: Literal["up", "down"]


@api.post("/admin/modules/reorder")
async def admin_reorder_module(
    payload: ReorderRequest, course_id: str = "course-ia-ele", user: dict = Depends(current_admin),
):
    mods = []
    async for m in db.modules.find({"course_id": course_id}).sort("order", 1):
        mods.append(m)
    idx = next((i for i, m in enumerate(mods) if m["id"] == payload.module_id), None)
    if idx is None:
        raise HTTPException(404, "Módulo no encontrado")
    swap = idx - 1 if payload.direction == "up" else idx + 1
    if swap < 0 or swap >= len(mods):
        return {"ok": True, "noop": True}
    a, b = mods[idx], mods[swap]
    await db.modules.update_one({"id": a["id"]}, {"$set": {"order": b["order"]}})
    await db.modules.update_one({"id": b["id"]}, {"$set": {"order": a["order"]}})
    return {"ok": True}


# ─────────────────────────── Contact form ─────────────────────
@api.post("/contact")
async def contact(payload: ContactIn):
    # Store for redundancy
    await db.contact_messages.insert_one({
        "id": new_id(),
        "nombre": payload.nombre,
        "email": payload.email,
        "asunto": payload.asunto,
        "mensaje": payload.mensaje,
        "created_at": now_utc(),
    })
    # Forward to admin inbox — respects RESEND_REPLY_TO so the admin can
    # reply directly to the visitor. We override reply_to here to the
    # visitor's email so "Reply" in the admin mailbox goes straight to them.
    html = wrap_email(
        f"""
        <h3 style="font-family:Georgia,serif;color:#0F4C81">Nuevo mensaje de contacto</h3>
        <p><strong>De:</strong> {payload.nombre} &lt;{payload.email}&gt;</p>
        <p><strong>Asunto:</strong> {payload.asunto}</p>
        <div style="background:#F4F7FA;padding:16px;border-radius:6px;border-left:3px solid #F5A623;white-space:pre-wrap;font-size:14px;line-height:1.6;color:#1A2535">
          {payload.mensaje}
        </div>
        <p style="font-size:12px;color:#6B82A0;margin-top:16px">
          Responde a este correo y la respuesta llegará directamente a {payload.email}.
        </p>
        """
    )
    # Send with visitor as reply_to
    await _send_email_with_reply(ADMIN_EMAIL, f"[Contacto] {payload.asunto} · {payload.nombre}", html, reply_to=payload.email)
    return {"ok": True, "message": "Mensaje enviado. Te responderemos en menos de 48 horas."}


async def _send_email_with_reply(to_email: str, subject: str, html: str, reply_to: Optional[str] = None) -> None:
    if not RESEND_API_KEY:
        log.warning("RESEND_API_KEY missing, skipping email to %s", to_email)
        return
    payload: dict[str, Any] = {
        "from": f"{RESEND_FROM_NAME} <{RESEND_FROM}>",
        "to": [to_email],
        "subject": subject,
        "html": html,
    }
    if reply_to:
        payload["reply_to"] = reply_to
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
    except Exception as exc:
        log.exception("Email failure: %s", exc)


# ─────────────────────────── Quiz (diagnóstico) ────────────────
@api.post("/quiz/submit")
async def quiz_submit(payload: QuizSubmitIn):
    doc = {
        "id": new_id(),
        "nombre": payload.nombre,
        "email": payload.email,
        "answers": payload.answers,
        "profile_key": payload.profile_key,
        "total_score": payload.total_score,
        "created_at": now_utc(),
    }
    await db.quiz_results.insert_one(doc)
    if ADMIN_EMAIL and payload.email:
        summary_rows = "".join(
            f"<tr><td style='padding:4px 8px;border-bottom:1px solid #E8EEF5;font-size:12px;color:#6B82A0'>{k}</td>"
            f"<td style='padding:4px 8px;border-bottom:1px solid #E8EEF5;font-size:12px;color:#1A2535'>{v if not isinstance(v, list) else ', '.join(v)}</td></tr>"
            for k, v in payload.answers.items()
        )
        html = wrap_email(
            f"""
            <h3>Nuevo cuestionario de diagnóstico</h3>
            <p><strong>{payload.nombre}</strong> &lt;{payload.email}&gt;</p>
            <p>Perfil: <strong>{payload.profile_key}</strong> · Puntuación: {payload.total_score}/100</p>
            <table style='width:100%;border-collapse:collapse;margin-top:12px'>{summary_rows}</table>
            """
        )
        await _send_email_with_reply(ADMIN_EMAIL, f"[Cuestionario] {payload.nombre}", html, reply_to=payload.email)
    return {"ok": True, "id": doc["id"]}


# ─────────────────────────── Student progress ─────────────────
@api.post("/course/{slug}/lesson/view")
async def mark_lesson_view(slug: str, payload: LessonViewIn, user: dict = Depends(current_user)):
    ctx = await _ensure_enrollment_for(user, slug)
    # Upsert a user_progress row per user+lesson
    await db.user_progress.update_one(
        {"user_id": user["id"], "lesson_id": payload.lesson_id},
        {"$set": {
            "user_id": user["id"],
            "lesson_id": payload.lesson_id,
            "course_id": ctx["course"]["id"],
            "viewed_at": now_utc(),
        }},
        upsert=True,
    )
    return {"ok": True}


async def _progress_for(user: dict, course: dict) -> dict:
    """Compute a progress summary for a user+course."""
    module_ids = [m["id"] async for m in db.modules.find({"course_id": course["id"]}, {"id": 1})]
    lesson_ids = [le["id"] async for le in db.lessons.find({"module_id": {"$in": module_ids}}, {"id": 1})]
    task_ids = [t["id"] async for t in db.tasks.find({"module_id": {"$in": module_ids}}, {"id": 1})]

    viewed = await db.user_progress.count_documents({
        "user_id": user["id"], "lesson_id": {"$in": lesson_ids},
    }) if lesson_ids else 0
    submitted = len(set([
        s["task_id"] async for s in db.submissions.find({
            "user_id": user["id"], "task_id": {"$in": task_ids},
        }, {"task_id": 1})
    ])) if task_ids else 0
    reviewed = await db.submissions.count_documents({
        "user_id": user["id"], "task_id": {"$in": task_ids}, "status": "reviewed",
    }) if task_ids else 0

    total_items = len(lesson_ids) + len(task_ids)
    done_items = viewed + submitted
    percent = round((done_items / total_items) * 100) if total_items else 0
    return {
        "lessons_total": len(lesson_ids),
        "lessons_viewed": viewed,
        "tasks_total": len(task_ids),
        "tasks_submitted": submitted,
        "tasks_reviewed": reviewed,
        "percent": percent,
    }


# ─────────────────────────── Admin: CSV export ─────────────────
@api.get("/admin/export/enrollments.csv")
async def admin_export_enrollments(user: dict = Depends(current_admin)):
    from fastapi.responses import Response
    import csv
    import io

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "enrollment_id", "email", "nombre", "curso", "importe_eur",
        "was_founder", "status", "paid_at", "stripe_payment_id",
    ])
    async for e in db.enrollments.find({}).sort("paid_at", -1):
        u = await db.users.find_one({"id": e["user_id"]}) or {}
        c = await db.courses.find_one({"id": e["course_id"]}) or {}
        writer.writerow([
            e.get("id", ""),
            u.get("email", ""),
            u.get("name", "") or "",
            c.get("title", ""),
            f"{(e.get('amount_paid_eur', 0) / 100):.2f}",
            "Yes" if e.get("was_founder") else "No",
            e.get("status", ""),
            iso(e.get("paid_at")) or "",
            e.get("stripe_payment_id", ""),
        ])
    csv_content = buf.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="inscripciones-{now_utc().strftime("%Y%m%d")}.csv"'
        },
    )


# ─────────────────────────── Register router ───────────────────
app.include_router(api)
