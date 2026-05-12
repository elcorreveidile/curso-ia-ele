"""Routes for polls (encuestas) and session recordings.

These are admin-driven features used to coordinate the live cohort:
  • Polls let the formador propose alternative dates / options and collect
    votes from enrolled students with a single click from email.
  • Session recordings let the formador share the YouTube link of each
    videotutoría inside the course area.

The router is registered from server.py via `register_poll_routes(api)`.
"""
from __future__ import annotations

import re
import secrets
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from core import (
    FRONTEND_ORIGIN,
    create_welcome_magic_token,
    current_admin,
    current_user,
    current_user_optional,
    db,
    log,
    new_id,
    now_utc,
    send_email,
    wrap_email,
)
from models import (
    PollCreate,
    PollEmailIn,
    PollVoteIn,
    SessionRecordingIn,
    SessionRecordingUpdate,
)


# ─────────────────────────── helpers ──────────────────────────────


def _iso(value) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()
    return str(value)


async def _ensure_can_view_poll(poll: dict, user: Optional[dict]) -> None:
    """Polls can be open to a specific course (enrolled students only) or
    public (anyone with the link can vote)."""
    if poll.get("course_slug"):
        if not user:
            raise HTTPException(401, "Necesitas iniciar sesión para votar")
        if user.get("role") == "admin":
            return
        course = await db.courses.find_one({"slug": poll["course_slug"]})
        if not course:
            raise HTTPException(404, "Curso no encontrado")
        enr = await db.enrollments.find_one({
            "user_id": user["id"],
            "course_id": course["id"],
            "status": {"$in": ["active", "completed"]},
        })
        if not enr:
            raise HTTPException(403, "Esta encuesta es solo para alumnos inscritos")


def _public_poll(poll: dict) -> dict:
    return {
        "id": poll["id"],
        "question": poll["question"],
        "options": poll.get("options", []),
        "multi_choice": bool(poll.get("multi_choice")),
        "course_slug": poll.get("course_slug"),
        "intro_md": poll.get("intro_md"),
        "closes_at": _iso(poll.get("closes_at")),
        "is_open": bool(poll.get("is_open", True)),
        "created_at": _iso(poll.get("created_at")),
    }


YOUTUBE_RE = re.compile(
    r"(?:youtu\.be/|youtube\.com/(?:watch\?v=|embed/|shorts/))([\w-]{6,})"
)


def _normalize_youtube_id(raw: str) -> str:
    raw = (raw or "").strip()
    if not raw:
        raise HTTPException(400, "ID de YouTube vacío")
    m = YOUTUBE_RE.search(raw)
    if m:
        return m.group(1)
    if re.fullmatch(r"[\w-]{6,40}", raw):
        return raw
    raise HTTPException(400, "ID o URL de YouTube no válido")


# ─────────────────────────── router ──────────────────────────────


def register_poll_routes(api: APIRouter) -> None:

    # ─────────── Polls — public / student ───────────

    @api.get("/poll/{poll_id}")
    async def get_poll(poll_id: str, user: Optional[dict] = Depends(current_user_optional)):
        poll = await db.polls.find_one({"id": poll_id})
        if not poll:
            raise HTTPException(404, "Encuesta no encontrada")
        await _ensure_can_view_poll(poll, user)
        out = _public_poll(poll)
        if user:
            vote = await db.poll_votes.find_one({"poll_id": poll_id, "user_id": user["id"]})
            out["my_vote"] = vote.get("option_ids") if vote else None
            out["voted_at"] = _iso(vote.get("voted_at")) if vote else None
        return out

    @api.post("/poll/{poll_id}/vote")
    async def vote_poll(
        poll_id: str,
        payload: PollVoteIn,
        user: dict = Depends(current_user),
    ):
        poll = await db.polls.find_one({"id": poll_id})
        if not poll:
            raise HTTPException(404, "Encuesta no encontrada")
        await _ensure_can_view_poll(poll, user)
        if not poll.get("is_open", True):
            raise HTTPException(403, "Esta encuesta ya está cerrada")
        # Enforce single-choice if not multi
        valid_ids = {o["id"] for o in poll.get("options", [])}
        chosen = [oid for oid in payload.option_ids if oid in valid_ids]
        if not chosen:
            raise HTTPException(400, "Selecciona al menos una opción válida")
        if not poll.get("multi_choice") and len(chosen) > 1:
            raise HTTPException(400, "Esta encuesta admite solo una opción")
        await db.poll_votes.update_one(
            {"poll_id": poll_id, "user_id": user["id"]},
            {"$set": {
                "poll_id": poll_id,
                "user_id": user["id"],
                "user_email": user["email"],
                "option_ids": chosen,
                "voted_at": now_utc(),
            }},
            upsert=True,
        )
        return {"ok": True, "option_ids": chosen}

    # ─────────── Polls — admin ───────────

    @api.get("/admin/polls")
    async def admin_list_polls(_admin: dict = Depends(current_admin)):
        polls: list[dict] = []
        async for p in db.polls.find({}).sort("created_at", -1):
            count = await db.poll_votes.count_documents({"poll_id": p["id"]})
            polls.append({**_public_poll(p), "vote_count": count})
        return {"polls": polls}

    @api.post("/admin/polls")
    async def admin_create_poll(payload: PollCreate, admin: dict = Depends(current_admin)):
        poll_id = new_id()
        options = [
            {"id": secrets.token_urlsafe(6), "label": opt.label.strip()}
            for opt in payload.options
        ]
        doc = {
            "id": poll_id,
            "question": payload.question.strip(),
            "intro_md": payload.intro_md,
            "options": options,
            "multi_choice": payload.multi_choice,
            "course_slug": payload.course_slug,
            "is_open": True,
            "closes_at": payload.closes_at,
            "created_at": now_utc(),
            "created_by": admin["email"],
        }
        await db.polls.insert_one(doc)
        return _public_poll(doc)

    @api.post("/admin/polls/{poll_id}/close")
    async def admin_close_poll(poll_id: str, _admin: dict = Depends(current_admin)):
        res = await db.polls.update_one({"id": poll_id}, {"$set": {"is_open": False}})
        if not res.matched_count:
            raise HTTPException(404, "Encuesta no encontrada")
        return {"ok": True}

    @api.post("/admin/polls/{poll_id}/reopen")
    async def admin_reopen_poll(poll_id: str, _admin: dict = Depends(current_admin)):
        res = await db.polls.update_one({"id": poll_id}, {"$set": {"is_open": True}})
        if not res.matched_count:
            raise HTTPException(404, "Encuesta no encontrada")
        return {"ok": True}

    @api.delete("/admin/polls/{poll_id}")
    async def admin_delete_poll(poll_id: str, _admin: dict = Depends(current_admin)):
        await db.poll_votes.delete_many({"poll_id": poll_id})
        res = await db.polls.delete_one({"id": poll_id})
        if not res.deleted_count:
            raise HTTPException(404, "Encuesta no encontrada")
        return {"ok": True}

    @api.get("/admin/polls/{poll_id}/results")
    async def admin_poll_results(poll_id: str, _admin: dict = Depends(current_admin)):
        poll = await db.polls.find_one({"id": poll_id})
        if not poll:
            raise HTTPException(404, "Encuesta no encontrada")
        option_counts = {o["id"]: 0 for o in poll.get("options", [])}
        voters: list[dict] = []
        async for v in db.poll_votes.find({"poll_id": poll_id}):
            for oid in v.get("option_ids", []):
                if oid in option_counts:
                    option_counts[oid] += 1
            voters.append({
                "user_id": v.get("user_id"),
                "user_email": v.get("user_email"),
                "option_ids": v.get("option_ids", []),
                "voted_at": _iso(v.get("voted_at")),
            })

        # Build "missing" list if the poll is restricted to a course
        missing: list[dict] = []
        if poll.get("course_slug"):
            course = await db.courses.find_one({"slug": poll["course_slug"]})
            if course:
                voted_ids = {v["user_id"] for v in voters}
                async for en in db.enrollments.find({
                    "course_id": course["id"],
                    "status": {"$in": ["active", "completed"]},
                }):
                    uid = en["user_id"]
                    if uid in voted_ids:
                        continue
                    u = await db.users.find_one({"id": uid}, {"_id": 0, "id": 1, "email": 1, "name": 1, "surname": 1})
                    if u and u.get("role") != "admin":
                        missing.append(u)

        # Resolve last-sent recipients into emails so the admin can verify
        # exactly who received the last email blast.
        last_sent_emails: list[str] = []
        last_sent_to = poll.get("last_sent_to") or []
        if last_sent_to:
            async for u in db.users.find(
                {"id": {"$in": last_sent_to}},
                {"_id": 0, "email": 1},
            ):
                if u.get("email"):
                    last_sent_emails.append(u["email"])
            last_sent_emails.sort()

        return {
            "poll": _public_poll(poll),
            "option_counts": option_counts,
            "voters": voters,
            "missing_voters": missing,
            "total_voters": len(voters),
            "last_sent_at": _iso(poll.get("last_sent_at")),
            "last_sent_count": poll.get("last_sent_count", 0),
            "last_sent_emails": last_sent_emails,
        }

    @api.get("/admin/polls/{poll_id}/recipients")
    async def admin_poll_recipients(poll_id: str, _admin: dict = Depends(current_admin)):
        """Return the list of students that would receive the poll email
        if it were sent right now. Sorted by email so the picker UI is stable."""
        poll = await db.polls.find_one({"id": poll_id})
        if not poll:
            raise HTTPException(404, "Encuesta no encontrada")
        if not poll.get("course_slug"):
            raise HTTPException(400, "Solo encuestas asociadas a un curso tienen destinatarios")
        course = await db.courses.find_one({"slug": poll["course_slug"]})
        if not course:
            raise HTTPException(404, "Curso no encontrado")
        out: list[dict] = []
        async for en in db.enrollments.find({
            "course_id": course["id"],
            "status": {"$in": ["active", "completed"]},
        }):
            u = await db.users.find_one({"id": en["user_id"]})
            if not u or u.get("role") == "admin":
                continue
            out.append({
                "id": u["id"],
                "email": u["email"],
                "name": u.get("name"),
                "surname": u.get("surname"),
            })
        out.sort(key=lambda x: (x.get("email") or "").lower())
        return {"recipients": out}

    @api.post("/admin/polls/{poll_id}/send-email")
    async def admin_send_poll_email(
        poll_id: str,
        payload: PollEmailIn,
        admin: dict = Depends(current_admin),
    ):
        poll = await db.polls.find_one({"id": poll_id})
        if not poll:
            raise HTTPException(404, "Encuesta no encontrada")
        if not poll.get("course_slug"):
            raise HTTPException(400, "Solo se pueden enviar emails de encuestas asociadas a un curso")
        course = await db.courses.find_one({"slug": poll["course_slug"]})
        if not course:
            raise HTTPException(404, "Curso no encontrado")

        intro = (payload.intro_md or poll.get("intro_md") or "").strip()
        subject = payload.subject or f"Encuesta: {poll['question']}"

        # Build the list of recipients (enrolled students, not admins). If the
        # admin passed an explicit ``user_ids`` whitelist we honour it.
        enrolled: list[dict] = []
        async for en in db.enrollments.find({
            "course_id": course["id"],
            "status": {"$in": ["active", "completed"]},
        }):
            u = await db.users.find_one({"id": en["user_id"]})
            if not u or u.get("role") == "admin":
                continue
            enrolled.append(u)
        if payload.user_ids is not None:
            allow = set(payload.user_ids)
            recipients = [u for u in enrolled if u["id"] in allow]
        else:
            recipients = enrolled

        sent, failed = 0, 0
        # Render the option list once (same HTML for everyone).
        options_html = "".join(
            f'<li style="margin:10px 0;color:#1A2535;font-size:16px;line-height:1.5"><strong>{i+1}.</strong> {opt["label"]}</li>'
            for i, opt in enumerate(poll.get("options", []))
        )
        intro_html = "".join(
            f"<p style=\"margin:0 0 14px;color:#46476A;font-size:16px;line-height:1.6\">{line}</p>"
            for line in intro.split("\n\n") if line.strip()
        ) or ""

        for u in recipients:
            try:
                token = create_welcome_magic_token(u["email"])
                poll_url = f"{FRONTEND_ORIGIN}/encuesta/{poll_id}?t={token}"
                first = (u.get("name") or u["email"].split("@")[0]).split()[0].capitalize()
                html = wrap_email(
                    f"""
                    <div style="text-align:center;margin-bottom:18px">
                      <div style="font-family:Georgia,serif;font-size:38px;color:#F5A623;letter-spacing:-3px">[ | ]</div>
                      <div style="color:#F5A623;font-size:11px;font-weight:700;letter-spacing:3px">LA CLASE DIGITAL</div>
                    </div>
                    <h2 style="font-family:Georgia,serif;color:#0F4C81;font-size:24px;line-height:1.25;margin:0 0 16px">
                      Hola, {first} 👋
                    </h2>
                    {intro_html}
                    <p style="font-weight:700;color:#1A2535;font-size:17px;line-height:1.4;margin:20px 0 8px">
                      {poll['question']}
                    </p>
                    <ul style="padding-left:22px;margin:0 0 20px">{options_html}</ul>
                    <p style="text-align:center;margin:26px 0">
                      <a href="{poll_url}" class="elc-btn" style="background:#0F4C81;color:#fff;text-decoration:none;
                         padding:14px 28px;border-radius:6px;font-weight:700;display:inline-block;font-size:16px">
                        Responder la encuesta →
                      </a>
                    </p>
                    <p style="font-size:14px;color:#6B82A0;text-align:center;line-height:1.6;margin:0 0 8px">
                      Puedes elegir {"varias opciones" if poll.get("multi_choice") else "una sola opción"}.
                      Tu voto entra automáticamente y puedes cambiarlo siempre que quieras antes de que cierre la encuesta.
                    </p>
                    <hr style="border:none;border-top:1px solid #E0E2EA;margin:26px 0">
                    <p style="font-size:15px;color:#46476A;line-height:1.6;margin:0">
                      Un abrazo,<br>
                      <strong style="color:#1A2535">Javier Benítez Láinez</strong><br>
                      <span style="color:#6B82A0;font-size:14px">La Clase Digital</span>
                    </p>
                    """
                )
                await send_email(u["email"], subject, html)
                sent += 1
            except Exception as exc:  # pragma: no cover
                log.warning("Poll email failed for %s: %s", u.get("email"), exc)
                failed += 1

        await db.polls.update_one(
            {"id": poll_id},
            {"$set": {
                "last_sent_at": now_utc(),
                "last_sent_count": sent,
                "last_sent_to": [u["id"] for u in recipients],
                "last_sent_failed": failed,
            }},
        )
        return {
            "sent": sent,
            "failed": failed,
            "total": len(recipients),
            "recipient_emails": [u["email"] for u in recipients],
        }

    # ─────────── Session recordings — student ───────────

    @api.get("/course/{slug}/recordings")
    async def list_recordings(slug: str, user: dict = Depends(current_user)):
        course = await db.courses.find_one({"slug": slug})
        if not course:
            raise HTTPException(404, "Curso no encontrado")
        # Only enrolled students (or admin) can see recordings.
        if user.get("role") != "admin":
            enr = await db.enrollments.find_one({
                "user_id": user["id"], "course_id": course["id"],
                "status": {"$in": ["active", "completed"]},
            })
            if not enr:
                raise HTTPException(403, "No estás inscrito en este curso")
        recordings: list[dict] = []
        async for r in db.session_recordings.find({"course_slug": slug}).sort("session_n", 1):
            recordings.append({
                "id": r["id"],
                "session_n": r["session_n"],
                "title": r["title"],
                "youtube_id": r["youtube_id"],
                "recorded_at": r.get("recorded_at"),
                "description_md": r.get("description_md"),
            })
        return {"recordings": recordings}

    # ─────────── Session recordings — admin ───────────

    @api.post("/admin/recordings")
    async def admin_create_recording(payload: SessionRecordingIn, admin: dict = Depends(current_admin)):
        course = await db.courses.find_one({"slug": payload.course_slug})
        if not course:
            raise HTTPException(404, "Curso no encontrado")
        youtube_id = _normalize_youtube_id(payload.youtube_id)
        rec = {
            "id": new_id(),
            "course_slug": payload.course_slug,
            "course_id": course["id"],
            "session_n": payload.session_n,
            "title": payload.title.strip(),
            "youtube_id": youtube_id,
            "recorded_at": payload.recorded_at,
            "description_md": payload.description_md,
            "created_at": now_utc(),
            "created_by": admin["email"],
        }
        await db.session_recordings.insert_one(rec)
        rec.pop("_id", None)
        rec["created_at"] = _iso(rec["created_at"])
        return rec

    @api.patch("/admin/recordings/{rec_id}")
    async def admin_update_recording(
        rec_id: str,
        payload: SessionRecordingUpdate,
        _admin: dict = Depends(current_admin),
    ):
        update = {}
        for field in ("title", "recorded_at", "description_md", "session_n"):
            value = getattr(payload, field, None)
            if value is not None:
                update[field] = value.strip() if isinstance(value, str) else value
        if payload.youtube_id is not None:
            update["youtube_id"] = _normalize_youtube_id(payload.youtube_id)
        if not update:
            raise HTTPException(400, "Nada que actualizar")
        update["updated_at"] = now_utc()
        res = await db.session_recordings.update_one({"id": rec_id}, {"$set": update})
        if not res.matched_count:
            raise HTTPException(404, "Grabación no encontrada")
        return {"ok": True}

    @api.delete("/admin/recordings/{rec_id}")
    async def admin_delete_recording(rec_id: str, _admin: dict = Depends(current_admin)):
        res = await db.session_recordings.delete_one({"id": rec_id})
        if not res.deleted_count:
            raise HTTPException(404, "Grabación no encontrada")
        return {"ok": True}

    @api.get("/admin/recordings")
    async def admin_list_recordings(_admin: dict = Depends(current_admin)):
        out: list[dict] = []
        async for r in db.session_recordings.find({}).sort([("course_slug", 1), ("session_n", 1)]):
            out.append({
                "id": r["id"],
                "course_slug": r["course_slug"],
                "session_n": r["session_n"],
                "title": r["title"],
                "youtube_id": r["youtube_id"],
                "recorded_at": r.get("recorded_at"),
                "description_md": r.get("description_md"),
                "created_at": _iso(r.get("created_at")),
            })
        return {"recordings": out}
