"""La Clase Digital - Backend FastAPI.

Slim entry point. Shared bootstrapping (config/db/auth/email helpers) lives
in `core.py`; pydantic schemas in `models.py`. Routes still live in this
file pending further extraction into `routes/`.
"""
import asyncio
import hashlib
import logging
import os
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal, Optional

import httpx
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from pydantic import BaseModel, EmailStr, Field

from emergentintegrations.payments.stripe.checkout import (
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    StripeCheckout,
)
import stripe as stripe_sdk

import cloudinary.uploader
from fastapi import UploadFile, File

from core import (
    ADMIN_EMAIL,
    CLOUDINARY_CLOUD_NAME,
    EMAIL_FOOTER,
    FRONTEND_ORIGIN,
    JWT_SECRET,
    MAGIC_LINK_SECRET,
    RESEND_API_KEY,
    RESEND_FROM,
    RESEND_FROM_NAME,
    STRIPE_API_KEY,
    clean_doc,
    create_magic_token,
    create_session_jwt,
    current_admin,
    current_user,
    current_user_optional,
    db,
    iso,
    log,
    mongo_client,
    new_id,
    now_utc,
    send_email,
    verify_magic_token,
    wrap_email,
)
from models import (
    AdminCourseUpdate,
    AdminManualEnrollment,
    AdminModuleUpdate,
    CheckoutRequest,
    ContactIn,
    CourseOut,
    FeedbackIn,
    LessonViewIn,
    LoginRequest,
    ProfileUpdate,
    QuizSubmitIn,
    SubmissionIn,
    ThreadPostIn,
    UserBroadcastIn,
    UserBulkDeleteIn,
    UserOut,
    VerifyTokenRequest,
)
from seed_data import (
    MODULE_BY_FOLDER,
    RESOURCE_LABELS,
    seed_database,
    seed_ebook,
    seed_resources,
)


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


# Seed data + resources + ebook are seeded from seed_data.py on startup.

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
    token = create_magic_token(email, marketing_consent=payload.marketing_consent)
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
    email, marketing_consent = verify_magic_token(payload.token)
    user = await db.users.find_one({"email": email})
    if not user:
        uid = new_id()
        new_user: dict[str, Any] = {
            "id": uid,
            "email": email,
            "name": None,
            "role": "admin" if email == ADMIN_EMAIL.lower() else "student",
            "created_at": now_utc(),
        }
        # Only persist consent decision when the account is first created
        # (the magic-link request that bootstrapped the account is the user's
        # explicit choice). Defaults to False if not provided.
        if marketing_consent is not None:
            new_user["marketing_consent"] = bool(marketing_consent)
            new_user["marketing_consent_at"] = now_utc()
        await db.users.insert_one(new_user)
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
    """Generate the full book as a single PDF (ReportLab, brand-styled)."""
    from fastapi.responses import Response
    from pdf_builder import build_ebook_pdf

    await _ensure_any_enrollment(user)
    chapters = []
    async for c in db.ebook_chapters.find({}).sort([("part_order", 1), ("order_in_part", 1)]):
        chapters.append(c)
    pdf_bytes = build_ebook_pdf(chapters)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="prompts-que-funcionan.pdf"'},
    )


def _build_welcome_email_html(
    email: str,
    first_name: str,
    course_title: str,
    amount_cents: int,
    was_founder: bool,
    payment_ref: str,
) -> str:
    """Build the welcome email HTML used by manual enrollment and resend."""
    amount_eur = amount_cents / 100
    price_line = (
        "<strong>Gratis</strong>" if amount_cents == 0
        else f"<strong>{amount_eur:.2f} €</strong>"
        + (" · precio fundador 🎉" if was_founder else "")
    )
    founder_badge = (
        '<div style="display:inline-block;background:#F5A623;color:#0A1628;padding:6px 14px;'
        'border-radius:100px;font-weight:700;font-size:13px;letter-spacing:1px;'
        'text-transform:uppercase;margin-top:6px">⭐ Fundador/a · plaza única</div>'
        if was_founder else ""
    )
    return wrap_email(
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
          <strong style="color:#1A2535">{course_title}</strong>.
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


def _first_name_for(user_doc: dict, email: str) -> str:
    raw_name = (user_doc.get("name") or "").strip()
    if raw_name:
        return raw_name.split()[0].capitalize()
    local = email.split("@")[0]
    fallback = local.split(".")[0].split("-")[0]
    return fallback.capitalize() if fallback.replace("-", "").replace(".", "").isalpha() else "docente"


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
            first_name = _first_name_for(u, email)
            html = _build_welcome_email_html(
                email=email,
                first_name=first_name,
                course_title=course["title"],
                amount_cents=amount_cents,
                was_founder=was_founder,
                payment_ref=payment_ref,
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


@api.post("/admin/enrollment/{enrollment_id}/resend-welcome")
async def admin_resend_welcome(enrollment_id: str, user: dict = Depends(current_admin)):
    """Resend the welcome email for an existing enrollment. Useful when the
    initial send failed (e.g., Resend quota exhausted) or the student says
    they never received it."""
    enrollment = await db.enrollments.find_one({"id": enrollment_id})
    if not enrollment:
        raise HTTPException(404, "Inscripción no encontrada")
    student = await db.users.find_one({"id": enrollment["user_id"]})
    if not student:
        raise HTTPException(404, "Estudiante no encontrado")
    course = await db.courses.find_one({"id": enrollment["course_id"]})
    if not course:
        raise HTTPException(404, "Curso no encontrado")
    email = student["email"]
    first_name = _first_name_for(student, email)
    amount_cents = int(enrollment.get("amount_paid_eur") or 0)
    was_founder = bool(enrollment.get("was_founder"))
    payment_ref = enrollment.get("stripe_payment_id") or f"MANUAL-{enrollment['id'][:8].upper()}"
    html = _build_welcome_email_html(
        email=email,
        first_name=first_name,
        course_title=course["title"],
        amount_cents=amount_cents,
        was_founder=was_founder,
        payment_ref=payment_ref,
    )
    try:
        await send_email(email, f"¡Bienvenido/a al curso, {first_name}! 🚀", html)
        return {"ok": True, "sent_to": email}
    except Exception as exc:
        log.exception("Resend welcome failed for %s: %s", email, exc)
        raise HTTPException(502, f"No se pudo enviar el email: {exc}")


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


# ─────────────────────── Admin users (extracted) ──────────────
from routes.admin_users import register as _register_admin_users  # noqa: E402

_register_admin_users(api)
# ─────────────────────── Scheduler endpoints ────────────
from scheduler import run_inactivity_nudge, run_module_auto_unlock, start_inactivity_scheduler  # noqa: E402


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
