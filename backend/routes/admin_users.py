"""Admin user management + marketing broadcast + RGPD unsubscribe.

Mounted under the main `api` router via `register(api)`.
"""
import asyncio
import re
from html import escape as _escape
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from jose import jwt

from core import (
    FRONTEND_ORIGIN,
    JWT_SECRET,
    clean_doc,
    current_admin,
    db,
    log,
    now_utc,
    send_email,
)
from models import UserBroadcastIn, UserBulkDeleteIn


def _md_to_simple_html(text: str) -> str:
    """Tiny markdown → safe HTML: paragraphs, **bold**, *italic*, [text](url)."""
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


async def _delete_user_cascade(user_id: str) -> dict[str, Any]:
    """Delete a user and all their data, restoring founder seats.
    Caller must guard against admin/self-deletion."""
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


def register(api: APIRouter) -> None:
    """Attach admin user/broadcast/unsubscribe routes to the given router."""

    @api.get("/admin/users")
    async def admin_list_users(user: dict = Depends(current_admin)):
        """List ALL registered users with enrollment counts (incl. unenrolled)."""
        items = []
        async for u in db.users.find({}).sort("created_at", -1):
            count = await db.enrollments.count_documents({"user_id": u["id"]})
            items.append({**clean_doc(u), "enrollments_count": count})
        return {"users": items, "total": len(items)}

    @api.delete("/admin/users/{user_id}")
    async def admin_delete_user(user_id: str, user: dict = Depends(current_admin)):
        """Delete a user and all their data. Admins and the requester cannot
        be deleted. Founder seats are restored if applicable."""
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
            await asyncio.sleep(0.22)  # under Resend's 5 req/s

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
