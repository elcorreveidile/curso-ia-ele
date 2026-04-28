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
    intro_video_youtube_id: Optional[str] = None


class AdminModuleUpdate(BaseModel):
    order: Optional[int] = None
    unlocked: Optional[bool] = None  # sets/clears unlocked_at
    video_youtube_id: Optional[str] = None
    # ISO-8601 date or datetime string (or empty string to clear). When set,
    # the module will auto-unlock at that moment (scheduler runs hourly).
    unlock_at: Optional[str] = None


class AdminManualEnrollment(BaseModel):
    email: EmailStr
    course_slug: str = "ia-ele"
    as_founder: bool = False
    amount_eur: float = 0.0  # 0 = free/sponsored; otherwise arbitrary amount paid outside Stripe
    note: str = ""
    send_welcome_email: bool = True


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
    await seed_ebook()
    start_inactivity_scheduler()
    # Run once on boot so that any overdue unlock gets applied immediately
    try:
        await run_module_auto_unlock()
    except Exception as e:  # pragma: no cover
        log.warning("Boot-time module auto-unlock failed: %s", e)


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


# ─────────────────────────── Ebook seeding ─────────────────────
# Book: "Prompts que funcionan" — legacy/ebook/ has 31 MD chapters.
EBOOK_PART_META = {
    "00": {"order": 0, "label": "Introducción"},
    "parte1": {"order": 1, "label": "Parte 1 · Fundamentos"},
    "parte2": {"order": 2, "label": "Parte 2 · Por niveles"},
    "parte3": {"order": 3, "label": "Parte 3 · Por destrezas"},
    "parte4": {"order": 4, "label": "Parte 4 · Por géneros textuales"},
    "parte5": {"order": 5, "label": "Parte 5 · Aplicaciones docentes"},
    "apendices": {"order": 6, "label": "Apéndices"},
}


def _ebook_title_from_md(md: str, fallback: str) -> str:
    for ln in md.splitlines():
        ln = ln.strip()
        if ln.startswith("# "):
            return ln[2:].strip()
        if ln.startswith("## "):
            return ln[3:].strip()
    return fallback


async def seed_ebook() -> None:
    base = Path("/app/legacy/ebook")
    if not base.exists():
        log.warning("No ebook folder at %s, skipping ebook seed", base)
        return
    new_count = 0
    upd_count = 0
    for md_path in sorted(base.rglob("*.md")):
        rel = md_path.relative_to(base)
        parts = rel.parts
        if parts[0] in ("00_INTRODUCCION.md",):
            part_key = "00"
            order_in_part = 0
        elif len(parts) == 2:
            part_key = parts[0]
            # order: first numeric chars of filename
            name = parts[1]
            order_in_part = int(name.split("_")[0]) if name[0].isdigit() else 0
        else:
            continue
        meta = EBOOK_PART_META.get(part_key)
        if not meta:
            continue
        content = md_path.read_text(encoding="utf-8")
        # Strip LaTeX-style `\newpage` markers (Pandoc artifacts in the
        # legacy markdown). They are meaningless for the web viewer and
        # our PDF generator uses page-break logic instead.
        import re as _re
        content = _re.sub(r"^\s*\\newpage\s*$", "", content, flags=_re.MULTILINE)
        content = content.replace("\\newpage", "")
        default_title = md_path.stem.replace("_", " ").title()
        title = _ebook_title_from_md(content, default_title)
        slug = _slugify(f"{part_key}-{md_path.stem}")
        doc = {
            "slug": slug,
            "part_key": part_key,
            "part_order": meta["order"],
            "part_label": meta["label"],
            "order_in_part": order_in_part,
            "title": title,
            "content_md": content,
            "source_path": str(rel),
            "updated_at": now_utc(),
        }
        existing = await db.ebook_chapters.find_one({"slug": slug})
        if existing:
            await db.ebook_chapters.update_one({"slug": slug}, {"$set": doc})
            upd_count += 1
        else:
            doc.update({"id": new_id(), "created_at": now_utc()})
            await db.ebook_chapters.insert_one(doc)
            new_count += 1
    log.info("Ebook seeded: %d new, %d updated", new_count, upd_count)


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
            "payment_status": "paid",
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
            + (" · precio fundador 🎉" if tx.get("was_founder") else "")
        )
        # Prefer the stored user.name; fall back to a clean local-part if
        # it looks like a real name (letters only), else a generic greeting.
        raw_name = (user.get("name") or "").strip()
        if raw_name:
            first_name = raw_name.split()[0].capitalize()
        else:
            local = user["email"].split("@")[0]
            if local.replace("-", "").replace(".", "").isalpha():
                first_name = local.split(".")[0].split("-")[0].capitalize()
            else:
                first_name = "docente"
        founder_badge = (
            '<div style="display:inline-block;background:#F5A623;color:#0A1628;padding:6px 14px;'
            'border-radius:100px;font-weight:700;font-size:13px;letter-spacing:1px;'
            'text-transform:uppercase;margin-top:6px">⭐ Fundador/a · plaza única</div>'
            if tx.get("was_founder") else ""
        )
        html = wrap_email(
            f"""
            <div style="text-align:center;margin-bottom:24px">
              <div style="font-family:Georgia,serif;font-size:42px;color:#F5A623;letter-spacing:-3px;line-height:1">[ | ]</div>
              <div style="color:#F5A623;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-top:6px">LA CLASE DIGITAL</div>
            </div>

            <h2 style="font-family:Georgia,serif;color:#0F4C81;font-size:26px;line-height:1.2;margin:0 0 8px">
              ¡Bienvenido/a, {first_name}! 👋
            </h2>
            <p style="color:#46476A;font-size:16px;margin:0 0 4px">
              Gracias por confiar en mí para esta primera edición de
              <strong style="color:#1A2535">{course['title']}</strong>.
            </p>
            {founder_badge}

            <div style="background:#FEF6DC;border-left:4px solid #F5A623;padding:16px 20px;margin:28px 0;border-radius:4px">
              <p style="margin:0;font-weight:700;color:#1A2535">📘 ¡Regalo incluido!</p>
              <p style="margin:6px 0 0;font-size:14px;color:#46476A">
                El libro <em>«Prompts que funcionan»</em> — 31 capítulos de ingeniería de prompts
                para docentes de ELE — ya está disponible en tu área privada.
              </p>
            </div>

                <h3 style="font-family:Georgia,serif;color:#0F4C81;font-size:18px;margin:24px 0 10px">🎯 Cómo empezar</h3>
                <ol style="color:#46476A;font-size:15px;line-height:1.7;padding-left:22px;margin:0 0 20px">
                  <li><a href="{FRONTEND_ORIGIN}/mi-area/perfil?onboarding=1" style="color:#0F4C81;font-weight:600">Completa tu perfil</a>
                      (nombre y apellidos) en <em>Mi área → Mi perfil</em>. Lo usaré también en tu certificado.</li>
                  <li>Echa un vistazo al <a href="{FRONTEND_ORIGIN}/libro" style="color:#0F4C81;font-weight:600">libro «Prompts que funcionan»</a>
                      y al <a href="{FRONTEND_ORIGIN}/curso/ia-ele" style="color:#0F4C81;font-weight:600">Módulo 1 del curso</a>
                      para ir preparando tu cabeza.</li>
                  <li><strong>Apunta la primera videotutoría</strong>: <strong>4 de mayo de 2026</strong>
                      (te enviaré el enlace unos días antes).</li>
                  <li><strong>Hazme caso si te pido que entregues tareas</strong>: el feedback personalizado
                      es el corazón del curso.</li>
                </ol>

            <div style="background:#F4F7FA;padding:16px 20px;border-radius:6px;margin:24px 0">
              <p style="margin:0;font-size:14px;color:#46476A"><strong>Pago confirmado:</strong> {price_line}</p>
              <p style="margin:6px 0 0;font-size:13px;color:#6B82A0">
                Guarda este correo como justificante de inscripción.
              </p>
            </div>

            <p style="text-align:center;margin:32px 0 16px">
              <a href="{FRONTEND_ORIGIN}/login" style="background:#F5A623;color:#0A1628;
                 text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:800;
                 display:inline-block;font-size:15px">
                Acceder a mi área privada →
              </a>
            </p>
            <p style="font-size:13px;color:#6B82A0;text-align:center;margin:0">
              Entras con tu email ({user['email']}) — te enviaremos un enlace mágico cada vez.
            </p>

            <hr style="border:none;border-top:1px solid #E0E2EA;margin:28px 0">
            <p style="font-size:14px;color:#46476A;margin:0">
              Si tienes cualquier duda, responde directamente a este correo y te leo sin falta.<br>
              Un abrazo,<br>
              <strong style="color:#1A2535">Javier</strong><br>
              <span style="color:#6B82A0;font-size:13px">laclasedigital.com</span>
            </p>
            """
        )
        await send_email(user["email"], f"¡Bienvenido/a al curso, {first_name}! 🚀", html)

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
        m_clean = clean_doc(m)
        # Normalize video_youtube_id so the key always exists on every module
        m_clean.setdefault("video_youtube_id", None)
        modules.append({
            "module": m_clean,
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
    update: dict[str, Any] = {}
    import re as _re
    url_re = _re.compile(r"(?:v=|youtu\.be/|/embed/|/shorts/)([A-Za-z0-9_-]{11})")
    for k, v in payload.dict().items():
        if v is None:
            continue
        if k == "intro_video_youtube_id":
            vid = v.strip()
            if vid:
                m = url_re.search(vid)
                if m:
                    vid = m.group(1)
                if not _re.match(r"^[A-Za-z0-9_-]{11}$", vid):
                    raise HTTPException(400, "ID o URL de YouTube no válido")
            update[k] = vid or None
        else:
            update[k] = v
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
    if payload.video_youtube_id is not None:
        vid = payload.video_youtube_id.strip()
        if vid:
            import re as _re
            m = _re.search(r"(?:v=|youtu\.be/|/embed/|/shorts/)([A-Za-z0-9_-]{11})", vid)
            if m:
                vid = m.group(1)
            if not _re.match(r"^[A-Za-z0-9_-]{11}$", vid):
                raise HTTPException(400, "ID o URL de YouTube no válido")
        update["video_youtube_id"] = vid or None
    if payload.unlock_at is not None:
        raw = payload.unlock_at.strip()
        if not raw:
            update["unlock_at"] = None
        else:
            # Accept YYYY-MM-DD or ISO-8601. Store as aware UTC datetime.
            try:
                if len(raw) == 10:
                    dt = datetime.strptime(raw, "%Y-%m-%d").replace(
                        hour=9, minute=0, tzinfo=timezone.utc
                    )
                else:
                    dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
            except ValueError:
                raise HTTPException(400, "Formato de fecha no válido (usa YYYY-MM-DD o ISO-8601)")
            update["unlock_at"] = dt
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

    # Group by module (hide locked modules' resources from non-admin students)
    is_admin = user.get("role") == "admin"
    modules = []
    async for m in db.modules.find({"course_id": course["id"]}).sort("order", 1):
        unlocked = bool(m.get("unlocked_at")) or is_admin
        items = []
        if unlocked:
            async for r in db.resources.find({"course_id": course["id"], "module_id": m["id"]}).sort([("type", 1), ("title", 1)]):
                items.append({
                    "slug": r["slug"], "title": r["title"],
                    "type": r["type"], "type_label": RESOURCE_LABELS.get(r["type"], r["type"]),
                    "module_id": m["id"],
                    "viewed": r["slug"] in viewed_slugs,
                })
        modules.append({
            "module_id": m["id"], "order": m["order"], "title": m["title"],
            "unlocked": unlocked,
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
    # Gate: students can only access resources from unlocked modules
    if module and user.get("role") != "admin" and not module.get("unlocked_at"):
        raise HTTPException(403, "Este material pertenece a un módulo aún bloqueado")
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


@api.post("/admin/ebook/reseed")
async def admin_reseed_ebook(user: dict = Depends(current_admin)):
    await seed_ebook()
    total = await db.ebook_chapters.count_documents({})
    return {"ok": True, "total": total}


# ─────────────────────────── Ebook (students) ──────────────────
async def _ensure_any_enrollment(user: dict) -> None:
    """Ebook is a student perk — require at least one active enrollment.
    Admins bypass."""
    if user.get("role") == "admin":
        return
    exists = await db.enrollments.find_one(
        {"user_id": user["id"], "status": "active", "payment_status": "paid"}
    )
    if not exists:
        raise HTTPException(403, "El libro está disponible solo para estudiantes inscritos")


@api.get("/ebook")
async def get_ebook_toc(user: dict = Depends(current_user)):
    await _ensure_any_enrollment(user)
    parts_map: dict[int, dict] = {}
    total = 0
    async for c in db.ebook_chapters.find({}, {
        "slug": 1, "title": 1, "part_key": 1, "part_order": 1, "part_label": 1, "order_in_part": 1,
    }).sort([("part_order", 1), ("order_in_part", 1)]):
        p = parts_map.setdefault(c["part_order"], {
            "part_order": c["part_order"],
            "part_key": c["part_key"],
            "part_label": c["part_label"],
            "chapters": [],
        })
        p["chapters"].append({
            "slug": c["slug"], "title": c["title"],
            "order_in_part": c.get("order_in_part", 0),
        })
        total += 1
    return {
        "title": "Prompts que funcionan",
        "subtitle": "Guía de ingeniería de prompts para docentes de ELE",
        "author": "Javier Benítez Láinez",
        "parts": [parts_map[k] for k in sorted(parts_map.keys())],
        "total_chapters": total,
    }


@api.get("/ebook/{slug}")
async def get_ebook_chapter(slug: str, user: dict = Depends(current_user)):
    await _ensure_any_enrollment(user)
    c = await db.ebook_chapters.find_one({"slug": slug})
    if not c:
        raise HTTPException(404, "Capítulo no encontrado")
    return {
        "slug": c["slug"],
        "title": c["title"],
        "content_md": c["content_md"],
        "part_key": c.get("part_key"),
        "part_label": c.get("part_label"),
        "part_order": c.get("part_order"),
        "order_in_part": c.get("order_in_part"),
        "updated_at": iso(c.get("updated_at")),
    }


@api.get("/ebook-full")
async def get_ebook_full(user: dict = Depends(current_user)):
    """Return all chapters with content_md for client-side PDF generation."""
    await _ensure_any_enrollment(user)
    parts_map: dict[int, dict] = {}
    async for c in db.ebook_chapters.find({}).sort([("part_order", 1), ("order_in_part", 1)]):
        p = parts_map.setdefault(c["part_order"], {
            "part_order": c["part_order"],
            "part_key": c.get("part_key"),
            "part_label": c.get("part_label"),
            "chapters": [],
        })
        p["chapters"].append({
            "slug": c["slug"],
            "title": c["title"],
            "content_md": c["content_md"],
            "order_in_part": c.get("order_in_part", 0),
        })
    return {
        "title": "Prompts que funcionan",
        "subtitle": "Guía de ingeniería de prompts para docentes de ELE",
        "author": "Javier Benítez Láinez",
        "parts": [parts_map[k] for k in sorted(parts_map.keys())],
    }


@api.get("/ebook.pdf")
async def download_ebook_pdf(user: dict = Depends(current_user)):
    """Generate the full book as a single PDF using ReportLab (pure Python,
    no system dependencies). Styled with La Clase Digital brand palette."""
    await _ensure_any_enrollment(user)
    from fastapi.responses import Response
    from io import BytesIO

    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import cm, mm
    from reportlab.platypus import (
        BaseDocTemplate, Frame, NextPageTemplate, PageBreak, PageTemplate,
        Paragraph, Preformatted, Spacer, Table, TableStyle,
    )
    from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER

    chapters = []
    async for c in db.ebook_chapters.find({}).sort([("part_order", 1), ("order_in_part", 1)]):
        chapters.append(c)

    parts: dict[int, dict] = {}
    for c in chapters:
        p = parts.setdefault(c["part_order"], {
            "order": c["part_order"], "label": c["part_label"], "chapters": [],
        })
        p["chapters"].append(c)
    part_list = [parts[k] for k in sorted(parts.keys())]

    # ── Palette ──
    NAVY = colors.HexColor("#0A1628")
    BLUE = colors.HexColor("#0F4C81")
    AMBER = colors.HexColor("#F5A623")
    INK = colors.HexColor("#1A2535")
    INK_SOFT = colors.HexColor("#46476A")
    LIGHT_BG = colors.HexColor("#F4F7FA")
    CODE_BG = colors.HexColor("#0F2744")
    CODE_FG = colors.HexColor("#E8EEF5")
    QUOTE_BG = colors.HexColor("#FEF6DC")
    LINE = colors.HexColor("#E0E2EA")

    # ── Styles ──
    def st(**k):
        base = {"fontName": "Helvetica", "fontSize": 10.5, "leading": 15, "textColor": INK, "spaceAfter": 5, "alignment": TA_JUSTIFY}
        base.update(k)
        return ParagraphStyle(k.pop("name", "s") if "name" in k else "s", **{kk: vv for kk, vv in base.items() if kk != "name"})

    p_body = ParagraphStyle("body", fontName="Helvetica", fontSize=10.5, leading=15, textColor=INK, spaceAfter=5, alignment=TA_JUSTIFY)
    p_h1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=BLUE, spaceBefore=12, spaceAfter=6)
    p_h2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=BLUE, spaceBefore=10, spaceAfter=5)
    p_h3 = ParagraphStyle("h3", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=INK, spaceBefore=8, spaceAfter=4)
    p_chapter = ParagraphStyle("chapter", fontName="Helvetica-Bold", fontSize=18, leading=22, textColor=BLUE, spaceAfter=14, borderPadding=(0, 0, 0, 10), leftIndent=10)
    p_part_kicker = ParagraphStyle("pk", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=AMBER)
    p_part_title = ParagraphStyle("pt", fontName="Helvetica-Bold", fontSize=28, leading=32, textColor=BLUE, spaceBefore=8)
    p_toc_title = ParagraphStyle("toct", fontName="Helvetica-Bold", fontSize=18, leading=22, textColor=BLUE, spaceAfter=14)
    p_toc_part = ParagraphStyle("tocp", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=AMBER, spaceBefore=10, spaceAfter=4)
    p_toc_item = ParagraphStyle("toci", fontName="Helvetica", fontSize=10, leading=14, textColor=INK, leftIndent=10, spaceAfter=2)
    p_cover_kicker = ParagraphStyle("ck", fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=AMBER)
    p_cover_title = ParagraphStyle("ct", fontName="Helvetica-Bold", fontSize=38, leading=42, textColor=colors.white, spaceBefore=16)
    p_cover_sub = ParagraphStyle("cs", fontName="Helvetica", fontSize=14, leading=19, textColor=colors.HexColor("#E8EEF5"), spaceBefore=16)
    p_cover_author = ParagraphStyle("ca", fontName="Helvetica", fontSize=11, leading=14, textColor=colors.HexColor("#E8EEF5"))
    p_cover_domain = ParagraphStyle("cd", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=AMBER)
    p_quote_text = ParagraphStyle("qt", fontName="Helvetica-Oblique", fontSize=10, leading=14, textColor=INK_SOFT)
    p_list = ParagraphStyle("li", fontName="Helvetica", fontSize=10.5, leading=14, textColor=INK, leftIndent=18, bulletIndent=6, spaceAfter=2)

    # ── Markdown → flowables (simple parser) ──
    import re as _re

    def render_inline(text: str) -> str:
        """Convert simple markdown inline (**bold**, *italic*, `code`) to ReportLab RML."""
        # Escape HTML-sensitive chars first
        text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        text = _re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
        text = _re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", text)
        text = _re.sub(r"_([^_]+)_", r"<i>\1</i>", text)
        text = _re.sub(r"`([^`]+)`", r'<font face="Courier" color="#0F4C81"> \1 </font>', text)
        return text

    def md_to_flowables(md: str) -> list:
        flows = []
        lines = md.split("\n")
        code_buf: list[str] = []
        in_code = False
        list_buf: list[str] = []
        tbl_buf: list[str] = []
        in_tbl = False

        def flush_list() -> None:
            nonlocal list_buf
            if list_buf:
                for item in list_buf:
                    flows.append(Paragraph("• " + render_inline(item), p_list))
                flows.append(Spacer(1, 3))
                list_buf = []

        def flush_code() -> None:
            nonlocal code_buf
            if code_buf:
                # Dark text on light background — always readable regardless
                # of how reportlab renders the Table BACKGROUND.
                code_style = ParagraphStyle(
                    "code", fontName="Courier", fontSize=8.8, leading=12,
                    textColor=INK, leftIndent=0, rightIndent=0,
                )
                txt = "\n".join(code_buf).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                inner = Preformatted(txt, code_style)
                tbl = Table(
                    [[inner]],
                    colWidths=[18 * cm],
                    hAlign="LEFT",
                )
                tbl.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("LINEBEFORE", (0, 0), (0, -1), 3, AMBER),
                    ("BOX", (0, 0), (-1, -1), 0.3, LINE),
                ]))
                flows.append(Spacer(1, 4))
                flows.append(tbl)
                flows.append(Spacer(1, 6))
                code_buf = []

        def flush_table() -> None:
            nonlocal tbl_buf, in_tbl
            if len(tbl_buf) >= 2:
                rows_raw = [r for r in tbl_buf if not _re.match(r"^\s*\|?\s*[-:| ]+\|?\s*$", r)]
                rows = []
                for row in rows_raw:
                    cells = [c.strip() for c in row.split("|")]
                    cells = [c for i, c in enumerate(cells) if not (i == 0 and c == "") and not (i == len(cells) - 1 and c == "")]
                    rows.append([Paragraph(render_inline(c), p_body) for c in cells])
                if rows:
                    max_cols = max(len(r) for r in rows)
                    rows = [r + [Paragraph("", p_body)] * (max_cols - len(r)) for r in rows]
                    col_w = (18 * cm) / max_cols
                    t = Table(rows, colWidths=[col_w] * max_cols, hAlign="LEFT")
                    t.setStyle(TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("TEXTCOLOR", (0, 0), (-1, 0), BLUE),
                        ("GRID", (0, 0), (-1, -1), 0.25, LINE),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("LEFTPADDING", (0, 0), (-1, -1), 5),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ]))
                    flows.append(t)
                    flows.append(Spacer(1, 6))
            tbl_buf = []
            in_tbl = False

        for raw in lines:
            ln = raw.rstrip()
            if ln.startswith("```"):
                if in_code:
                    flush_code(); in_code = False
                else:
                    flush_list(); flush_table(); in_code = True
                continue
            if in_code:
                code_buf.append(ln); continue
            if ln.strip().startswith("|") and "|" in ln.strip()[1:]:
                if not in_tbl:
                    flush_list(); in_tbl = True
                tbl_buf.append(ln); continue
            if in_tbl:
                flush_table()
            if not ln.strip():
                flush_list(); continue
            if ln.startswith("# "):
                flush_list(); flows.append(Paragraph(render_inline(ln[2:]), p_h1)); continue
            if ln.startswith("## "):
                flush_list(); flows.append(Paragraph(render_inline(ln[3:]), p_h2)); continue
            if ln.startswith("### "):
                flush_list(); flows.append(Paragraph(render_inline(ln[4:]), p_h3)); continue
            if ln.startswith("> "):
                flush_list()
                quote_inner = Paragraph(render_inline(ln[2:]), p_quote_text)
                qtbl = Table([[quote_inner]], colWidths=[18 * cm], hAlign="LEFT")
                qtbl.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), QUOTE_BG),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LINEBEFORE", (0, 0), (0, -1), 3, AMBER),
                ]))
                flows.append(Spacer(1, 3))
                flows.append(qtbl)
                flows.append(Spacer(1, 6))
                continue
            if ln.strip() in ("---", "***"):
                flush_list()
                hr_style = ParagraphStyle("hr", fontSize=1, leading=1, backColor=LINE, spaceBefore=6, spaceAfter=6)
                flows.append(Paragraph(" ", hr_style)); continue
            bm = _re.match(r"^[-*]\s+(.*)", ln)
            nm = _re.match(r"^\d+\.\s+(.*)", ln)
            if bm:
                list_buf.append(bm.group(1)); continue
            if nm:
                list_buf.append(nm.group(1)); continue
            flush_list()
            flows.append(Paragraph(render_inline(ln), p_body))
        flush_list(); flush_code(); flush_table()
        return flows

    # ── Page templates ──
    buf = BytesIO()
    doc = BaseDocTemplate(
        buf, pagesize=A4,
        leftMargin=2.2 * cm, rightMargin=2.2 * cm,
        topMargin=2.6 * cm, bottomMargin=2.4 * cm,
        title="Prompts que funcionan", author="Javier Benítez Láinez",
    )
    content_frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="content")
    cover_frame = Frame(0, 0, A4[0], A4[1], id="cover", leftPadding=2.8 * cm, bottomPadding=3 * cm, topPadding=3.5 * cm, rightPadding=2.8 * cm)
    part_frame = Frame(0, 0, A4[0], A4[1], id="part", leftPadding=3 * cm, bottomPadding=A4[1] / 3, topPadding=A4[1] / 3, rightPadding=3 * cm)

    def draw_header_footer(canvas, doc_):  # noqa: ARG001
        canvas.saveState()
        canvas.setFont("Helvetica-Bold", 8.5)
        canvas.setFillColor(INK_SOFT)
        canvas.drawString(doc_.leftMargin, A4[1] - 1.2 * cm, "[ | ]  La Clase Digital")
        canvas.setFont("Helvetica", 8.5)
        canvas.drawRightString(A4[0] - doc_.rightMargin, A4[1] - 1.2 * cm, "Prompts que funcionan")
        canvas.setStrokeColor(LINE); canvas.setLineWidth(0.3)
        canvas.line(doc_.leftMargin, A4[1] - 1.5 * cm, A4[0] - doc_.rightMargin, A4[1] - 1.5 * cm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#6B82A0"))
        canvas.drawCentredString(A4[0] / 2, 1.1 * cm, str(canvas.getPageNumber()))
        canvas.restoreState()

    def draw_cover_bg(canvas, doc_):  # noqa: ARG001
        canvas.saveState()
        canvas.setFillColor(NAVY)
        canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
        canvas.restoreState()

    def draw_part_bg(canvas, doc_):  # noqa: ARG001
        canvas.saveState()
        canvas.setStrokeColor(AMBER); canvas.setLineWidth(3)
        canvas.line(0, A4[1] - 1, A4[0], A4[1] - 1)
        canvas.restoreState()

    doc.addPageTemplates([
        PageTemplate(id="Cover", frames=[cover_frame], onPage=draw_cover_bg),
        PageTemplate(id="Content", frames=[content_frame], onPage=draw_header_footer),
        PageTemplate(id="Part", frames=[part_frame], onPage=draw_part_bg),
    ])

    story = []
    # Cover
    story.append(NextPageTemplate("Cover"))
    story.append(Paragraph('<font color="#F5A623" size="48"><b>[ | ]</b></font>', ParagraphStyle("cm", fontName="Helvetica-Bold", fontSize=48, leading=52)))
    story.append(Spacer(1, 12))
    story.append(Paragraph("LA CLASE DIGITAL", p_cover_kicker))
    story.append(Paragraph("Prompts que funcionan", p_cover_title))
    story.append(Paragraph("Guía de ingeniería de prompts para docentes de ELE", p_cover_sub))
    story.append(Spacer(1, 220))
    story.append(Paragraph('Por <font color="#F5A623"><b>Javier Benítez Láinez</b></font>', p_cover_author))
    story.append(Spacer(1, 6))
    story.append(Paragraph("LACLASEDIGITAL.COM", p_cover_domain))
    story.append(NextPageTemplate("Content")); story.append(PageBreak())

    # TOC
    story.append(Paragraph("Índice", p_toc_title))
    for part in part_list:
        story.append(Paragraph(part["label"].upper(), p_toc_part))
        for ch in part["chapters"]:
            story.append(Paragraph("• " + ch["title"], p_toc_item))
    story.append(PageBreak())

    # Parts and chapters
    for part in part_list:
        # Part separator
        story.append(NextPageTemplate("Part"))
        story.append(PageBreak())
        kicker = "PRÓLOGO" if part["order"] == 0 else f"PARTE {part['order']}"
        story.append(Paragraph(kicker, p_part_kicker))
        label = part["label"].split(" · ", 1)[-1]
        story.append(Paragraph(label, p_part_title))
        story.append(NextPageTemplate("Content"))

        for ch in part["chapters"]:
            story.append(PageBreak())
            story.append(Paragraph(ch["title"], p_chapter))
            story.extend(md_to_flowables(ch["content_md"]))

    doc.build(story)
    pdf_bytes = buf.getvalue()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="prompts-que-funcionan.pdf"'},
    )


@api.post("/admin/enrollment/manual")
async def admin_create_manual_enrollment(
    payload: AdminManualEnrollment, user: dict = Depends(current_admin),
):
    """Manually enroll a student without going through Stripe.

    Use cases:
    - Payment received outside Stripe (bank transfer, cash, voucher).
    - Comped / free seat (amount_eur=0).
    - Friends & family or press review copies.

    Idempotent: if an active enrollment already exists for (user, course),
    returns it without duplicating.
    """
    email = payload.email.lower().strip()
    course = await db.courses.find_one({"slug": payload.course_slug})
    if not course:
        raise HTTPException(404, "Curso no encontrado")

    # Resolve or create the user
    u = await db.users.find_one({"email": email})
    if not u:
        uid = new_id()
        await db.users.insert_one({
            "id": uid, "email": email, "role": "student",
            "created_at": now_utc(),
        })
        u = await db.users.find_one({"id": uid})

    # Reuse existing active enrollment if present
    existing = await db.enrollments.find_one(
        {"user_id": u["id"], "course_id": course["id"], "status": "active"}
    )
    if existing and existing.get("payment_status") == "paid":
        return {
            "enrollment": clean_doc(existing),
            "created": False,
            "user_id": u["id"],
        }

    # Honor founder seat if requested and still available
    was_founder = bool(payload.as_founder) and (
        course.get("founder_seats_taken", 0) < course.get("founder_seats", 0)
    )
    amount_cents = int(round(payload.amount_eur * 100))
    payment_ref = f"MANUAL-{new_id()[:8].upper()}"

    enrollment_doc = existing or {
        "id": new_id(),
        "user_id": u["id"],
        "course_id": course["id"],
        "created_at": now_utc(),
    }
    enrollment_doc.update({
        "status": "active",
        "payment_status": "paid",
        "paid_at": now_utc(),
        "stripe_payment_id": payment_ref,
        "amount_paid_eur": amount_cents,
        "was_founder": was_founder,
        "manual": True,
        "manual_note": payload.note or None,
        "manual_by": user["email"],
    })
    if existing:
        await db.enrollments.update_one({"id": existing["id"]}, {"$set": enrollment_doc})
    else:
        await db.enrollments.insert_one(enrollment_doc)
    if was_founder:
        await db.courses.update_one(
            {"id": course["id"]}, {"$inc": {"founder_seats_taken": 1}}
        )

    # Send welcome email (reuse the same template as paid enrollments)
    if payload.send_welcome_email:
        try:
            amount_eur = amount_cents / 100
            price_line = (
                "<strong>Gratis</strong>" if amount_cents == 0
                else f"<strong>{amount_eur:.2f} €</strong>"
                + (" · precio fundador 🎉" if was_founder else "")
            )
            raw_name = (u.get("name") or "").strip()
            if raw_name:
                first_name = raw_name.split()[0].capitalize()
            else:
                local = email.split("@")[0]
                first_name = local.split(".")[0].split("-")[0].capitalize() if local.replace("-", "").replace(".", "").isalpha() else "docente"
            founder_badge = (
                '<div style="display:inline-block;background:#F5A623;color:#0A1628;padding:6px 14px;'
                'border-radius:100px;font-weight:700;font-size:13px;letter-spacing:1px;'
                'text-transform:uppercase;margin-top:6px">⭐ Fundador/a · plaza única</div>'
                if was_founder else ""
            )
            html = wrap_email(
                f"""
                <div style="text-align:center;margin-bottom:24px">
                  <div style="font-family:Georgia,serif;font-size:42px;color:#F5A623;letter-spacing:-3px;line-height:1">[ | ]</div>
                  <div style="color:#F5A623;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-top:6px">LA CLASE DIGITAL</div>
                </div>

                <h2 style="font-family:Georgia,serif;color:#0F4C81;font-size:26px;line-height:1.2;margin:0 0 8px">
                  ¡Bienvenido/a, {first_name}! 👋
                </h2>
                <p style="color:#46476A;font-size:16px;margin:0 0 4px">
                  Te he inscrito manualmente en
                  <strong style="color:#1A2535">{course['title']}</strong>.
                </p>
                {founder_badge}

                <div style="background:#FEF6DC;border-left:4px solid #F5A623;padding:16px 20px;margin:28px 0;border-radius:4px">
                  <p style="margin:0;font-weight:700;color:#1A2535">📘 ¡Regalo incluido!</p>
                  <p style="margin:6px 0 0;font-size:14px;color:#46476A">
                    El libro <em>«Prompts que funcionan»</em> — 31 capítulos de ingeniería de prompts
                    para docentes de ELE — ya está disponible en tu área privada.
                  </p>
                </div>

                <h3 style="font-family:Georgia,serif;color:#0F4C81;font-size:18px;margin:24px 0 10px">🎯 Cómo empezar</h3>
                <ol style="color:#46476A;font-size:15px;line-height:1.7;padding-left:22px;margin:0 0 20px">
                  <li><a href="{FRONTEND_ORIGIN}/mi-area/perfil?onboarding=1" style="color:#0F4C81;font-weight:600">Completa tu perfil</a> (nombre y apellidos) en <em>Mi área → Mi perfil</em>.</li>
                  <li>Echa un vistazo al <a href="{FRONTEND_ORIGIN}/libro" style="color:#0F4C81;font-weight:600">libro</a> y al <a href="{FRONTEND_ORIGIN}/curso/ia-ele" style="color:#0F4C81;font-weight:600">Módulo 1 del curso</a>.</li>
                  <li><strong>Apunta la primera videotutoría</strong>: <strong>4 de mayo de 2026</strong>.</li>
                </ol>

                <div style="background:#F4F7FA;padding:16px 20px;border-radius:6px;margin:24px 0">
                  <p style="margin:0;font-size:14px;color:#46476A"><strong>Inscripción:</strong> {price_line}</p>
                  <p style="margin:6px 0 0;font-size:13px;color:#6B82A0">Referencia: {payment_ref}</p>
                </div>

                <p style="text-align:center;margin:32px 0 16px">
                  <a href="{FRONTEND_ORIGIN}/login" style="background:#F5A623;color:#0A1628;
                     text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:800;
                     display:inline-block;font-size:15px">
                    Acceder a mi área privada →
                  </a>
                </p>
                <p style="font-size:13px;color:#6B82A0;text-align:center;margin:0">
                  Entras con tu email ({email}) — te enviaremos un enlace mágico cada vez.
                </p>

                <hr style="border:none;border-top:1px solid #E0E2EA;margin:28px 0">
                <p style="font-size:14px;color:#46476A;margin:0">
                  Si tienes cualquier duda, responde directamente a este correo y te leo sin falta.<br>
                  Un abrazo,<br>
                  <strong style="color:#1A2535">Javier</strong>
                </p>
                """
            )
            await send_email(email, f"¡Bienvenido/a al curso, {first_name}! 🚀", html)
        except Exception as e:
            log.error("Welcome email failed for manual enrollment of %s: %s", email, e)

    return {
        "enrollment": clean_doc(enrollment_doc),
        "created": existing is None,
        "user_id": u["id"],
        "payment_reference": payment_ref,
    }


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


# ─────────────────────── Admin: Users & Marketing ──────────────
class UserBroadcastIn(BaseModel):
    subject: str
    body_md: str
    target: Literal["all", "enrolled", "not_enrolled", "selected"] = "all"
    user_ids: Optional[list[str]] = None


class UserBulkDeleteIn(BaseModel):
    user_ids: list[str]


def _md_to_simple_html(text: str) -> str:
    """Tiny markdown → safe HTML: paragraphs, **bold**, *italic*, [text](url)."""
    from html import escape as _escape
    safe = _escape(text.strip())
    safe = re.sub(
        r"\[([^\]]+)\]\((https?://[^)\s]+)\)",
        r'<a href="\2" style="color:#0F4C81">\1</a>',
        safe,
    )
    safe = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", safe)
    safe = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", safe)
    parts = [p.strip() for p in safe.split("\n\n") if p.strip()]
    return "".join(
        f'<p style="margin:0 0 12px;line-height:1.55">{p.replace(chr(10), "<br>")}</p>'
        for p in parts
    )


def _broadcast_email_html(subject: str, body_md: str, unsubscribe_url: str) -> str:
    from html import escape as _escape
    body_html = _md_to_simple_html(body_md)
    return f"""
<div style="max-width:560px;margin:0 auto;padding:24px;font-family:-apple-system,Segoe UI,Helvetica,sans-serif;color:#1A2535;background:#FFFCF4;">
  <p style="font-size:13px;color:#0F4C81;letter-spacing:.08em;text-transform:uppercase;margin:0 0 8px;font-weight:700">La Clase Digital</p>
  <h1 style="font-size:22px;margin:0 0 16px;color:#1A2535;font-weight:800">{_escape(subject)}</h1>
  {body_html}
  <hr style="border:none;border-top:1px solid #E8EEF5;margin:24px 0">
  <p style="font-size:12px;color:#6B82A0;font-family:Georgia,serif;margin:0">
    Recibes este email porque te registraste en
    <a href="https://laclasedigital.com" style="color:#0F4C81">laclasedigital.com</a>.<br>
    <a href="{unsubscribe_url}" style="color:#6B82A0;text-decoration:underline">Darse de baja</a>
  </p>
</div>
"""


def _make_unsubscribe_token(email: str) -> str:
    payload = {
        "sub": email,
        "purpose": "unsubscribe",
        "iat": int(now_utc().timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


@api.get("/admin/users")
async def admin_list_users(user: dict = Depends(current_admin)):
    """List ALL registered users with enrollment counts (incl. unenrolled)."""
    items = []
    async for u in db.users.find({}).sort("created_at", -1):
        count = await db.enrollments.count_documents({"user_id": u["id"]})
        items.append({**clean_doc(u), "enrollments_count": count})
    return {"users": items, "total": len(items)}


async def _delete_user_cascade(user_id: str) -> dict[str, Any]:
    """Cascade-delete a user and their data, restoring founder seats.

    Caller is responsible for guarding against admin/self-deletion.
    Returns counts of deleted artefacts plus the deleted user's email.
    """
    target = await db.users.find_one({"id": user_id})
    if not target:
        return {"ok": False, "reason": "not_found"}

    async for e in db.enrollments.find({"user_id": user_id}):
        if e.get("was_founder"):
            course = await db.courses.find_one({"id": e["course_id"]})
            if course:
                new_taken = max(0, (course.get("founder_seats_taken") or 0) - 1)
                up: dict[str, Any] = {"founder_seats_taken": new_taken}
                if new_taken < (course.get("founder_seats") or 0) and not course.get("is_founder_edition"):
                    up["is_founder_edition"] = True
                await db.courses.update_one({"id": e["course_id"]}, {"$set": up})

    deleted = {
        "enrollments": (await db.enrollments.delete_many({"user_id": user_id})).deleted_count,
        "submissions": (await db.submissions.delete_many({"user_id": user_id})).deleted_count,
        "threads": (await db.threads.delete_many({"user_id": user_id})).deleted_count,
        "user_progress": (await db.user_progress.delete_many({"user_id": user_id})).deleted_count,
        "certificates": (await db.certificates.delete_many({"user_id": user_id})).deleted_count,
        "payment_transactions": (await db.payment_transactions.delete_many({"user_id": user_id})).deleted_count,
        "magic_links": (await db.magic_links.delete_many({"email": target["email"]})).deleted_count,
    }
    await db.users.delete_one({"id": user_id})
    return {"ok": True, "deleted": deleted, "email": target["email"]}


@api.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, user: dict = Depends(current_admin)):
    """Delete a user and all their data. Admins and the requester cannot be
    deleted. Founder seats are restored if applicable."""
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(404, "Usuario no encontrado")
    if target["id"] == user["id"]:
        raise HTTPException(400, "No puedes eliminarte a ti mismo")
    if target.get("role") == "admin":
        raise HTTPException(400, "No se puede eliminar a un administrador")
    result = await _delete_user_cascade(user_id)
    return {"ok": True, "deleted": result["deleted"], "email": result["email"]}


@api.post("/admin/users/bulk-delete")
async def admin_bulk_delete_users(payload: UserBulkDeleteIn, user: dict = Depends(current_admin)):
    """Delete multiple users in one call. Skips admins and the requester."""
    if not payload.user_ids:
        raise HTTPException(400, "Debes seleccionar al menos un usuario")
    deleted = 0
    skipped_admin = 0
    skipped_self = 0
    not_found = 0
    for uid in payload.user_ids:
        target = await db.users.find_one({"id": uid})
        if not target:
            not_found += 1
            continue
        if target["id"] == user["id"]:
            skipped_self += 1
            continue
        if target.get("role") == "admin":
            skipped_admin += 1
            continue
        result = await _delete_user_cascade(uid)
        if result.get("ok"):
            deleted += 1
    return {
        "deleted": deleted,
        "skipped_admin": skipped_admin,
        "skipped_self": skipped_self,
        "not_found": not_found,
    }


@api.post("/admin/users/broadcast")
async def admin_broadcast_email(payload: UserBroadcastIn, user: dict = Depends(current_admin)):
    """Send a marketing email to a user audience.

    target=all|enrolled|not_enrolled|selected. Skips admins and users with
    marketing_consent=False (RGPD-friendly). Each email carries a unique
    unsubscribe link signed with JWT_SECRET.
    """
    subject = payload.subject.strip()
    body = payload.body_md.strip()
    if not subject or not body:
        raise HTTPException(400, "Asunto y mensaje son obligatorios")
    if len(subject) > 200:
        raise HTTPException(400, "Asunto demasiado largo (máx 200 caracteres)")

    if payload.target == "selected":
        if not payload.user_ids:
            raise HTTPException(400, "Debes seleccionar al menos un usuario")
        cursor = db.users.find({"id": {"$in": payload.user_ids}})
    else:
        cursor = db.users.find({})

    base_url = FRONTEND_ORIGIN or "https://laclasedigital.com"
    sent = 0
    skipped_optout = 0
    skipped_audience = 0
    skipped_admin = 0
    failed = 0

    async for u in cursor:
        email = u.get("email")
        if not email:
            continue
        if u.get("role") == "admin":
            skipped_admin += 1
            continue
        if u.get("marketing_consent") is False:
            skipped_optout += 1
            continue
        if payload.target in ("enrolled", "not_enrolled"):
            count = await db.enrollments.count_documents({"user_id": u["id"]})
            if payload.target == "enrolled" and count == 0:
                skipped_audience += 1
                continue
            if payload.target == "not_enrolled" and count > 0:
                skipped_audience += 1
                continue
        unsub_url = f"{base_url}/api/unsubscribe?token={_make_unsubscribe_token(email)}"
        html_body = _broadcast_email_html(subject, body, unsub_url)
        try:
            await send_email(email, subject, html_body)
            sent += 1
        except Exception as exc:
            log.exception("Broadcast failed to %s: %s", email, exc)
            failed += 1
        # Stay safely under Resend's 5 req/s rate limit
        await asyncio.sleep(0.22)

    return {
        "sent": sent,
        "skipped_optout": skipped_optout,
        "skipped_audience": skipped_audience,
        "skipped_admin": skipped_admin,
        "failed": failed,
    }


@api.get("/unsubscribe")
async def public_unsubscribe(token: str):
    """Public RGPD unsubscribe endpoint linked from marketing emails."""
    from fastapi.responses import HTMLResponse
    from html import escape as _escape
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if data.get("purpose") != "unsubscribe":
            raise ValueError("bad purpose")
        email = data["sub"]
    except Exception:
        return HTMLResponse(
            "<html><body style='font-family:sans-serif;padding:48px;text-align:center'>"
            "<h1>Enlace no válido</h1>"
            "<p>Este enlace de baja no es correcto o ha caducado.</p></body></html>",
            status_code=400,
        )
    await db.users.update_one(
        {"email": email},
        {"$set": {"marketing_consent": False, "marketing_optout_at": now_utc()}},
    )
    return HTMLResponse(
        f"""<html><body style="font-family:Georgia,serif;padding:48px;max-width:560px;margin:0 auto;text-align:center;color:#1A2535;background:#FFFCF4">
<h1 style="color:#0F4C81;font-family:'Syne',sans-serif">Te has dado de baja</h1>
<p>No volverás a recibir emails de marketing de <strong>La Clase Digital</strong>
en <strong>{_escape(email)}</strong>.</p>
<p style="font-size:14px;color:#6B82A0">Esto no afecta a los emails relacionados
con tu curso (acceso, certificados, etc.) si estás matriculado/a.</p>
<p style="font-size:13px;color:#6B82A0;margin-top:24px">
¿Te has dado de baja por error? Escríbenos a
<a href="mailto:curso@laclasedigital.com" style="color:#0F4C81">curso@laclasedigital.com</a>.
</p></body></html>""",
        status_code=200,
    )


# ─────────────────────── Inactivity nudge scheduler ────────────
# Sends a friendly nudge email to enrolled students who haven't
# opened any course material for >= 7 days. Runs daily and is
# idempotent per-day via `last_nudge_at` on the user.
_INACTIVITY_DAYS = int(os.environ.get("INACTIVITY_NUDGE_DAYS", "7"))
_scheduler_started = False


def _nudge_email_html(name: str | None, course_title: str, first_name: str | None) -> str:
    greeting = first_name or (name or "docente")
    inner_url = FRONTEND_ORIGIN or "https://laclasedigital.com"
    return f"""
<div style="max-width:560px;margin:0 auto;padding:24px;font-family:-apple-system,Segoe UI,Helvetica,sans-serif;color:#1A2535;background:#FFFCF4;">
  <p style="font-size:20px;margin:0 0 12px;color:#F5A623;font-weight:800;">Hola, {greeting} 👋</p>
  <p>He notado que llevas unos días sin entrar en <strong>{course_title}</strong>.
  Sé que combinar la formación con tu día a día no es fácil, así que te dejo un empujón para retomar con energía.</p>
  <p style="margin:18px 0;">👉 <a href="{inner_url}/dashboard" style="color:#0F4C81;text-decoration:underline;font-weight:600;">Entrar a mi área y continuar</a></p>
  <p>Recuerda que tienes a tu disposición:</p>
  <ul style="padding-left:20px;">
    <li>📘 El libro <em>«Prompts que funcionan»</em> (31 capítulos)</li>
    <li>📚 Todos los materiales del curso ordenados por módulo</li>
    <li>🎥 Las videotutorías grabadas</li>
  </ul>
  <p style="margin-top:20px;font-size:13px;color:#6B82A0;">— Javier Benítez Láinez · <a href="{inner_url}" style="color:#0F4C81;">laclasedigital.com</a></p>
</div>
"""


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    """MongoDB motor returns naive datetimes — coerce to UTC-aware for safe compares."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


async def run_inactivity_nudge() -> dict[str, Any]:
    """Find enrolled students with no resource/lesson activity in the last N days
    and email them a gentle reminder. Returns a summary dict."""
    now = now_utc()
    cutoff = now - timedelta(days=_INACTIVITY_DAYS)
    # Skip users already nudged in the last 7 days (idempotency)
    recent_nudge_cutoff = now - timedelta(days=_INACTIVITY_DAYS)

    sent = 0
    skipped = 0
    checked = 0

    # Iterate active-paid enrollments only
    async for en in db.enrollments.find({"status": "active", "payment_status": "paid"}):
        checked += 1
        user = await db.users.find_one({"id": en["user_id"]})
        if not user or user.get("role") == "admin":
            continue
        # Respect idempotency: if already nudged recently, skip
        last_nudge = _aware(user.get("last_nudge_at"))
        if last_nudge and last_nudge > recent_nudge_cutoff:
            skipped += 1
            continue
        # Any activity in the last N days?
        recent = await db.user_progress.find_one(
            {"user_id": user["id"], "viewed_at": {"$gte": cutoff}},
            {"_id": 1},
        )
        if recent:
            continue
        # Enrollment too fresh? Give them a week of grace.
        paid_at = _aware(en.get("paid_at"))
        if paid_at and paid_at > cutoff:
            continue

        course = await db.courses.find_one({"id": en["course_id"]})
        if not course:
            continue
        subject = f"¿Retomamos {course['title']}? Tu curso te espera"
        html = _nudge_email_html(user.get("name"), course["title"], user.get("name"))
        try:
            await send_email(user["email"], subject, html)
            await db.users.update_one(
                {"id": user["id"]}, {"$set": {"last_nudge_at": now}}
            )
            sent += 1
        except Exception as e:  # pragma: no cover
            log.error("Failed to send nudge to %s: %s", user.get("email"), e)
    log.info("Inactivity nudge run: checked=%d sent=%d skipped=%d", checked, sent, skipped)
    return {"checked": checked, "sent": sent, "skipped": skipped}


async def run_module_auto_unlock() -> dict[str, Any]:
    """Unlock modules whose scheduled `unlock_at` has already passed.
    Runs hourly."""
    now = now_utc()
    cursor = db.modules.find({"unlock_at": {"$lte": now}, "unlocked_at": None})
    unlocked = 0
    async for m in cursor:
        # Clear unlock_at on success so a later manual re-lock doesn't silently
        # re-trigger the scheduler on its next hourly run.
        await db.modules.update_one(
            {"id": m["id"]},
            {"$set": {"unlocked_at": now, "unlock_at": None}},
        )
        log.info("Auto-unlocked module %s (order %s)", m.get("title"), m.get("order"))
        unlocked += 1
    return {"unlocked": unlocked, "ran_at": iso(now)}


def start_inactivity_scheduler() -> None:
    global _scheduler_started
    if _scheduler_started:
        return
    if os.environ.get("INACTIVITY_NUDGE_ENABLED", "1") != "1":
        log.info("Inactivity nudge scheduler disabled via env")
        return
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        from apscheduler.triggers.cron import CronTrigger
    except Exception as e:  # pragma: no cover
        log.warning("APScheduler not available: %s", e)
        return
    sch = AsyncIOScheduler(timezone="Europe/Madrid")
    sch.add_job(run_inactivity_nudge, CronTrigger(hour=9, minute=0))
    # Module auto-unlock: check every hour (covers midnight rollovers,
    # day-of scheduling without polling too aggressively).
    sch.add_job(run_module_auto_unlock, CronTrigger(minute=5))
    sch.start()
    _scheduler_started = True
    log.info("Scheduler started (nudge 09:00 Europe/Madrid + module auto-unlock hourly)")


@api.post("/admin/inactivity/run")
async def admin_run_inactivity_nudge(user: dict = Depends(current_admin)):
    """Manual trigger for the nudge job (used in testing and admin-forced runs)."""
    return await run_inactivity_nudge()


@api.post("/admin/modules/auto-unlock/run")
async def admin_run_module_auto_unlock(user: dict = Depends(current_admin)):
    """Manual trigger for the scheduled module unlock job."""
    return await run_module_auto_unlock()


# ─────────────────────────── Register router ───────────────────
app.include_router(api)
