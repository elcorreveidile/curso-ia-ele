"""APScheduler jobs: inactivity nudge + scheduled module auto-unlock.

Both jobs are idempotent and safe to run repeatedly. Email templates for
job-emitted notifications live here next to the jobs that send them.
"""
import asyncio
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from core import EMAIL_FOOTER, FRONTEND_ORIGIN, db, iso, log, now_utc, send_email

_INACTIVITY_DAYS = int(os.environ.get("INACTIVITY_NUDGE_DAYS", "7"))
_scheduler_started = False


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    """MongoDB motor returns naive datetimes — coerce to UTC-aware."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


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


async def run_inactivity_nudge() -> dict[str, Any]:
    """Find enrolled students with no activity in the last N days and email them.
    Idempotent per-day via `last_nudge_at` on the user."""
    now = now_utc()
    cutoff = now - timedelta(days=_INACTIVITY_DAYS)
    recent_nudge_cutoff = now - timedelta(days=_INACTIVITY_DAYS)

    sent = 0
    skipped = 0
    checked = 0

    async for en in db.enrollments.find({"status": "active", "payment_status": "paid"}):
        checked += 1
        user = await db.users.find_one({"id": en["user_id"]})
        if not user or user.get("role") == "admin":
            continue
        last_nudge = _aware(user.get("last_nudge_at"))
        if last_nudge and last_nudge > recent_nudge_cutoff:
            skipped += 1
            continue
        recent = await db.user_progress.find_one(
            {"user_id": user["id"], "viewed_at": {"$gte": cutoff}},
            {"_id": 1},
        )
        if recent:
            continue
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


def _module_unlocked_email_html(name: str | None, course_title: str, module_title: str, module_order: int) -> str:
    greeting = name or "docente"
    inner_url = FRONTEND_ORIGIN or "https://laclasedigital.com"
    return f"""
<div style="max-width:560px;margin:0 auto;padding:24px;font-family:-apple-system,Segoe UI,Helvetica,sans-serif;color:#1A2535;background:#FFFCF4;">
  <p style="font-size:13px;color:#0F4C81;letter-spacing:.08em;text-transform:uppercase;margin:0 0 8px;font-weight:700">La Clase Digital</p>
  <h1 style="font-size:22px;margin:0 0 16px;color:#1A2535;font-weight:800">¡Módulo {module_order} desbloqueado!</h1>
  <p>Hola {greeting} 👋</p>
  <p>Acabamos de abrir el <strong>Módulo {module_order} · {module_title}</strong>
  de <strong>{course_title}</strong>. Ya puedes entrar y empezar.</p>
  <p style="margin:22px 0;text-align:center;">
    <a href="{inner_url}/dashboard" style="background:#F5A623;color:#1A2535;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;display:inline-block">
      Entrar al módulo
    </a>
  </p>
  <p style="font-size:14px;color:#3A4D66">Recuerda que cada módulo combina materiales escritos,
  vídeo-tutoriales y una entrega que te servirá para seguir tu progreso.</p>
  {EMAIL_FOOTER}
</div>
"""


async def run_module_auto_unlock() -> dict[str, Any]:
    """Unlock modules whose scheduled `unlock_at` has already passed.
    Notifies enrolled students by email."""
    now = now_utc()
    cursor = db.modules.find({"unlock_at": {"$lte": now}, "unlocked_at": None})
    unlocked = 0
    notified = 0
    async for m in cursor:
        # Clear unlock_at on success so a later manual re-lock doesn't
        # silently re-trigger the scheduler on its next hourly run.
        await db.modules.update_one(
            {"id": m["id"]},
            {"$set": {"unlocked_at": now, "unlock_at": None}},
        )
        log.info("Auto-unlocked module %s (order %s)", m.get("title"), m.get("order"))
        unlocked += 1

        course = await db.courses.find_one({"id": m["course_id"]})
        if not course:
            continue
        course_title = course.get("title", "tu curso")
        async for en in db.enrollments.find(
            {"course_id": m["course_id"], "status": "active", "payment_status": "paid"}
        ):
            u = await db.users.find_one({"id": en["user_id"]})
            if not u or not u.get("email") or u.get("role") == "admin":
                continue
            subject = f"¡Módulo {m.get('order')} desbloqueado! · {course_title}"
            html = _module_unlocked_email_html(u.get("name"), course_title, m.get("title", ""), m.get("order", 0))
            try:
                await send_email(u["email"], subject, html)
                notified += 1
            except Exception as exc:  # pragma: no cover
                log.exception("Module unlock email failed for %s: %s", u.get("email"), exc)
            await asyncio.sleep(0.22)  # under Resend's 5 req/s
    return {"unlocked": unlocked, "notified": notified, "ran_at": iso(now)}


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
    sch.add_job(run_module_auto_unlock, CronTrigger(minute=5))
    sch.start()
    _scheduler_started = True
    log.info("Scheduler started (nudge 09:00 Europe/Madrid + module auto-unlock hourly)")
