"""Course documents: source content embedded directly in Python so that PDF
rendering works in any deploy environment (no binary file dependency).

Two documents are exposed:
  - bienvenida-videotutoria-1: welcome letter + Zoom invite for session 1
  - consentimiento-grabacion: GDPR recording consent (signature required)

Both are rendered on the fly to a brand-consistent PDF via ReportLab.
A DOCX export is also generated on the fly via python-docx so the student
can edit the content if they need to fill it in by hand.

Visible to enrolled students and admins through /api/documents.
"""
from __future__ import annotations

import io
from dataclasses import dataclass, field
from typing import Iterable

from docx import Document as DocxDocument
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


# Brand palette (mirrors pdf_builder.py and the website).
NAVY = colors.HexColor("#0F4C81")
AMBER = colors.HexColor("#F5A623")
INK = colors.HexColor("#1A2535")
INK_SOFT = colors.HexColor("#46476A")
INK_MUTED = colors.HexColor("#6B82A0")


# ──────────────────────────── Document model ──────────────────────────────

# Each paragraph is a (kind, text) tuple:
#   - "h2"      → section heading
#   - "h3"      → subsection heading
#   - "body"    → regular paragraph (supports inline **bold**, raw URLs, mailto:)
#   - "bullet"  → unordered list item
#   - "spacer"  → vertical breathing room (text ignored)


@dataclass(frozen=True)
class CourseDocument:
    slug: str
    title: str
    description: str
    icon: str
    requires_signature: bool
    pdf_basename: str
    docx_basename: str
    paragraphs: tuple = field(default_factory=tuple)


# ───────────────────────── Source content ──────────────────────────────

_BIENVENIDA_PARAGRAPHS = (
    ("body",
     "Querida compañera, querido compañero,"),
    ("body",
     "Me alegra mucho que formes parte de la primera edición de "
     "«IA para la enseñanza de ELE». Somos un grupo pequeño y selecto, y eso "
     "es exactamente lo que quería: un espacio donde podamos trabajar de "
     "verdad, compartir dudas reales y construir materiales que uses "
     "directamente en clase."),
    ("body",
     "A continuación encontrarás toda la información para conectarte a la "
     "primera videotutoría del lunes 4 de mayo."),
    ("h2", "Datos de conexión · Videotutoría 1"),
    ("bullet", "**Fecha:** Lunes, 4 de mayo de 2026"),
    ("bullet", "**Hora:** 16:00 h (hora peninsular española, GMT+2)"),
    ("bullet", "**Duración:** 90 minutos"),
    ("bullet", "**Plataforma:** Zoom"),
    ("bullet",
     "**Enlace:** https://us06web.zoom.us/j/88207551531?pwd=hXoWzDCi2wdN01dP4a5BGhkgQ6Xe30.1"),
    ("bullet", "**ID de reunión:** 882 0755 1531"),
    ("h2", "Calendario de las 3 videotutorías"),
    ("bullet",
     "**Sesión 1 · Lunes 4 de mayo · 16:00 h.** Bienvenida y Módulo 0 (GitHub): "
     "presentación del curso, configuración del repositorio, primeras "
     "reflexiones éticas e introducción a la ingeniería de prompts."),
    ("bullet",
     "**Sesión 2 · Jueves 14 de mayo · 16:00 h.** Módulos 1-2: revisión de "
     "mini asistentes, puesta en común de planes de clase y resolución de dudas."),
    ("bullet",
     "**Sesión 3 · Jueves 21 de mayo · 16:00 h.** Módulos 3-4: presentación "
     "de kits de recursos multimodales y cierre del curso."),
    ("body",
     "Las tres sesiones se hacen en la misma sala de Zoom y duran 90 minutos. "
     "El enlace y el ID también están disponibles en tu área privada."),
    ("h2", "Qué vamos a hacer en la primera sesión"),
    ("bullet",
     "Módulo 0 — Guía de inicio en GitHub: crearemos juntos la cuenta, el "
     "repositorio del curso y subiremos un archivo de prueba."),
    ("bullet", "Presentarnos y compartir nuestros puntos de partida como docentes."),
    ("bullet",
     "Introducción al marco FRAME: el sistema de prompts que vertebra todo el curso."),
    ("bullet",
     "Primera práctica en directo: construir un prompt desde cero, componente a componente."),
    ("bullet", "Responder las dudas que hayan surgido tras revisar los materiales del Módulo I."),
    ("h2", "Antes de la sesión"),
    ("body",
     "Si aún no has completado el cuestionario de inicio, te pido que lo "
     "hagas antes del lunes. Me ayuda a conocer tu punto de partida y a "
     "adaptar la sesión a vuestras necesidades reales. Puedes acceder desde "
     "aquí: https://laclasedigital.com/cuestionario"),
    ("body",
     "También te he enviado el documento de consentimiento para la grabación "
     "de las sesiones (lo encontrarás también en tu área privada, sección "
     "Documentos del curso). Por favor, léelo, fírmalo y envíamelo antes del "
     "lunes. Es un trámite sencillo pero necesario."),
    ("h2", "Información técnica"),
    ("bullet", "Conecta con auriculares si puedes: mejora mucho la calidad del audio para todos."),
    ("bullet", "Activa la cámara durante las sesiones — la interacción es parte del aprendizaje."),
    ("bullet",
     "Si tienes algún problema técnico al conectar, escríbeme a benitezl@go.ugr.es."),
    ("body", "Nos vemos el lunes."),
    ("body", "Javier Benítez Láinez"),
    ("body", "La Clase Digital · Formación Docente ELE"),
    ("body", "benitezl@go.ugr.es · laclasedigital.com"),
)


_CONSENTIMIENTO_PARAGRAPHS = (
    ("h2", "1. Identificación del responsable"),
    ("bullet", "**Responsable:** Javier Benítez Láinez"),
    ("bullet", "**Actividad formativa:** IA para la enseñanza de ELE · Primera edición, mayo 2026"),
    ("bullet", "**Plataforma:** laclasedigital.com"),
    ("bullet", "**Contacto:** benitezl@go.ugr.es"),
    ("h2", "2. Objeto del consentimiento"),
    ("body",
     "Las videotutorías del curso «IA para la enseñanza de ELE» serán "
     "grabadas en vídeo y audio. El presente documento tiene por objeto "
     "informarte de forma clara y transparente sobre el uso que se hará de "
     "esas grabaciones, y recabar tu consentimiento expreso para ello."),
    ("h2", "3. Usos de las grabaciones"),
    ("body",
     "Las grabaciones podrán utilizarse para los siguientes fines:"),
    ("h3", "Uso interno del curso"),
    ("body",
     "Las grabaciones estarán disponibles para los participantes inscritos "
     "en esta edición durante el período de duración del curso, con el fin "
     "de repasar los contenidos trabajados en las sesiones en directo."),
    ("h3", "Material de formación futura"),
    ("body",
     "Fragmentos de las sesiones podrán utilizarse como ejemplos o material "
     "didáctico en ediciones futuras del curso u otras actividades formativas "
     "organizadas por La Clase Digital."),
    ("h3", "Difusión y promoción"),
    ("body",
     "Con tu consentimiento explícito en el apartado correspondiente de este "
     "documento, podrán publicarse fragmentos breves en redes sociales o en "
     "la web del curso con fines demostrativos o promocionales. En ningún "
     "caso se publicará material sin el consentimiento específico marcado a "
     "continuación."),
    ("h2", "4. Tus derechos"),
    ("body",
     "De acuerdo con el Reglamento General de Protección de Datos (RGPD) y "
     "la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de "
     "los derechos digitales (LOPDGDD), tienes derecho a:"),
    ("bullet", "Acceder a los datos personales que te conciernen."),
    ("bullet", "Solicitar la rectificación de datos inexactos."),
    ("bullet", "Solicitar la supresión de tus datos cuando ya no sean necesarios."),
    ("bullet", "Oponerte al tratamiento de tus datos en cualquier momento."),
    ("bullet",
     "Retirar este consentimiento en cualquier momento, sin que ello afecte "
     "a la licitud del tratamiento basado en el consentimiento previo a su retirada."),
    ("body",
     "Para ejercer cualquiera de estos derechos, contacta con benitezl@go.ugr.es."),
    ("h2", "5. Conservación de los datos"),
    ("body",
     "Las grabaciones se conservarán mientras sean necesarias para los fines "
     "descritos en el apartado 3. En ningún caso se cederán a terceros sin "
     "tu consentimiento previo y expreso."),
    ("h2", "6. Declaración de consentimiento"),
    ("body", "Marca las opciones que correspondan y firma a continuación:"),
    ("bullet",
     "[X]  Consiento la grabación de las videotutorías para uso interno del "
     "curso (acceso de participantes inscritos)."),
    ("bullet",
     "[X]  Consiento el uso de las grabaciones como material de formación en "
     "ediciones futuras del curso."),
    ("bullet",
     "[ ]  Consiento la publicación de fragmentos en redes sociales o en la "
     "web del curso con fines demostrativos o promocionales. (opcional)"),
    ("body",
     "Los dos primeros consentimientos son necesarios para participar en las "
     "sesiones en directo y acceder a las grabaciones como material de repaso. "
     "El tercero es voluntario."),
    ("h2", "7. Firma"),
    ("body", "Nombre completo:"),
    ("body", " "),
    ("body", "Fecha:"),
    ("body", " "),
    ("body", "Firma:"),
)


COURSE_DOCUMENTS: list[CourseDocument] = [
    CourseDocument(
        slug="bienvenida-videotutoria-1",
        title="Bienvenida · Videotutoría 1",
        description=(
            "Carta de bienvenida con los datos de conexión a la primera "
            "videotutoría (Zoom · 4 mayo, 16:00) y la agenda completa de las "
            "tres sesiones del curso."
        ),
        icon="👋",
        requires_signature=False,
        pdf_basename="Bienvenida-Videotutoria1.pdf",
        docx_basename="Bienvenida-Videotutoria1.docx",
        paragraphs=_BIENVENIDA_PARAGRAPHS,
    ),
    CourseDocument(
        slug="consentimiento-grabacion",
        title="Consentimiento de grabación · RGPD",
        description=(
            "Documento de consentimiento informado para la grabación de las "
            "videotutorías. Léelo, fírmalo y devuélvemelo antes del lunes."
        ),
        icon="📝",
        requires_signature=True,
        pdf_basename="Consentimiento-Grabacion.pdf",
        docx_basename="Consentimiento-Grabacion.docx",
        paragraphs=_CONSENTIMIENTO_PARAGRAPHS,
    ),
]


def get_document(slug: str) -> CourseDocument | None:
    return next((d for d in COURSE_DOCUMENTS if d.slug == slug), None)


# ──────────────────────────── PDF rendering ───────────────────────────────

def _build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "h1": ParagraphStyle(
            "H1", parent=base["Heading1"], fontName="Helvetica-Bold",
            fontSize=20, leading=24, textColor=NAVY,
            spaceBefore=18, spaceAfter=12, alignment=TA_LEFT,
        ),
        "h2": ParagraphStyle(
            "H2", parent=base["Heading2"], fontName="Helvetica-Bold",
            fontSize=14, leading=18, textColor=NAVY,
            spaceBefore=14, spaceAfter=8, alignment=TA_LEFT,
        ),
        "h3": ParagraphStyle(
            "H3", parent=base["Heading3"], fontName="Helvetica-Bold",
            fontSize=12, leading=15, textColor=INK,
            spaceBefore=10, spaceAfter=6, alignment=TA_LEFT,
        ),
        "body": ParagraphStyle(
            "Body", parent=base["BodyText"], fontName="Helvetica",
            fontSize=10.5, leading=15, textColor=INK_SOFT,
            spaceAfter=6, alignment=TA_LEFT,
        ),
        "bullet": ParagraphStyle(
            "Bullet", parent=base["BodyText"], fontName="Helvetica",
            fontSize=10.5, leading=15, textColor=INK_SOFT,
            spaceAfter=4, leftIndent=14, bulletIndent=2,
            alignment=TA_LEFT,
        ),
        "label": ParagraphStyle(
            "Label", fontName="Helvetica-Bold", fontSize=9, leading=11,
            textColor=AMBER, alignment=TA_CENTER, spaceAfter=2,
        ),
        "brand": ParagraphStyle(
            "Brand", fontName="Helvetica-Bold", fontSize=22, leading=24,
            textColor=AMBER, alignment=TA_CENTER, spaceAfter=14,
        ),
    }


import re

_INLINE_BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
_INLINE_LINK_RE = re.compile(r"(https?://[\w\-./?=&%#:+]+)")
_INLINE_MAILTO_RE = re.compile(r"(?<![\w./@:])([\w._%+-]+@[\w.-]+\.[A-Za-z]{2,})")


def _format_inline(text: str) -> str:
    """Convert a tiny subset of Markdown (bold, raw URLs, emails) to ReportLab markup."""
    out = _INLINE_BOLD_RE.sub(r"<b>\1</b>", text)
    out = _INLINE_LINK_RE.sub(r'<link href="\1" color="#0F4C81"><u>\1</u></link>', out)
    out = _INLINE_MAILTO_RE.sub(
        r'<link href="mailto:\1" color="#0F4C81"><u>\1</u></link>', out,
    )
    return out


def _draw_page_chrome(canvas, doc, title: str) -> None:
    """Header band + footer with page number on every page."""
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(AMBER)
    canvas.rect(0, height - 0.4 * cm, width, 0.4 * cm, stroke=0, fill=1)
    canvas.setFillColor(NAVY)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(2 * cm, height - 1.0 * cm, "LA CLASE DIGITAL")
    canvas.setFillColor(INK_MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(width - 2 * cm, height - 1.0 * cm, title)
    canvas.setStrokeColor(colors.HexColor("#E8EEF5"))
    canvas.setLineWidth(0.4)
    canvas.line(2 * cm, 1.6 * cm, width - 2 * cm, 1.6 * cm)
    canvas.setFillColor(INK_MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(2 * cm, 1.1 * cm, "laclasedigital.com · benitezl@go.ugr.es")
    canvas.drawRightString(width - 2 * cm, 1.1 * cm, f"Página {doc.page}")
    canvas.restoreState()


def render_document_pdf(slug: str) -> bytes:
    """Render the given course document to a brand-consistent PDF (in-memory)."""
    doc_meta = get_document(slug)
    if doc_meta is None:
        raise ValueError(f"Unknown document slug: {slug}")

    styles = _build_styles()
    buf = io.BytesIO()
    pdf = BaseDocTemplate(
        buf, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=1.8 * cm, bottomMargin=2 * cm,
        title=doc_meta.title, author="La Clase Digital",
    )
    frame = Frame(
        pdf.leftMargin, pdf.bottomMargin,
        pdf.width, pdf.height,
        leftPadding=0, rightPadding=0,
        topPadding=0, bottomPadding=0,
        showBoundary=0,
    )
    pdf.addPageTemplates([
        PageTemplate(
            id="default", frames=[frame],
            onPage=lambda c, d: _draw_page_chrome(c, d, doc_meta.title),
        ),
    ])

    story = []
    story.append(Paragraph("[ | ]", styles["brand"]))
    story.append(Paragraph("LA CLASE DIGITAL", styles["label"]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(doc_meta.title, styles["h1"]))
    sep = Table([[""]], colWidths=[16.5 * cm], rowHeights=[0.06 * cm])
    sep.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), AMBER)]))
    story.append(sep)
    story.append(Spacer(1, 0.4 * cm))

    for kind, text in doc_meta.paragraphs:
        if kind == "spacer":
            story.append(Spacer(1, 0.3 * cm))
            continue
        formatted = _format_inline(text)
        if kind == "bullet":
            story.append(Paragraph(formatted, styles["bullet"], bulletText="•"))
        else:
            style = styles.get(kind, styles["body"])
            story.append(Paragraph(formatted, style))

    if doc_meta.requires_signature:
        story.append(Spacer(1, 0.6 * cm))
        story.append(Paragraph(
            "<b>Cómo devolver este documento firmado:</b> imprime, firma a "
            "mano (o usa una herramienta de firma digital) y envíame el PDF "
            'firmado a <link href="mailto:benitezl@go.ugr.es" color="#0F4C81">'
            "<u>benitezl@go.ugr.es</u></link>.",
            styles["body"],
        ))

    pdf.build(story)
    return buf.getvalue()


# ──────────────────────────── DOCX rendering ──────────────────────────────

def render_document_docx(slug: str) -> bytes:
    """Generate a fresh DOCX from the same source data, on the fly.
    Lets the student edit the content (e.g., fill in the consent form) without
    relying on a binary file shipped with the deploy."""
    doc_meta = get_document(slug)
    if doc_meta is None:
        raise ValueError(f"Unknown document slug: {slug}")

    docx = DocxDocument()
    # Title
    title = docx.add_heading(doc_meta.title, level=0)
    for kind, text in doc_meta.paragraphs:
        # Strip lightweight markdown (**bold**) when writing into DOCX.
        cleaned = _INLINE_BOLD_RE.sub(r"\1", text)
        if kind == "spacer":
            docx.add_paragraph("")
        elif kind == "h2":
            docx.add_heading(cleaned, level=1)
        elif kind == "h3":
            docx.add_heading(cleaned, level=2)
        elif kind == "bullet":
            docx.add_paragraph(cleaned, style="List Bullet")
        else:
            docx.add_paragraph(cleaned)
    if doc_meta.requires_signature:
        docx.add_paragraph("")
        p = docx.add_paragraph()
        p.add_run(
            "Cómo devolver este documento firmado: imprime, firma a mano (o "
            "usa una herramienta de firma digital) y envíame el archivo "
            "firmado a benitezl@go.ugr.es."
        )
    buf = io.BytesIO()
    docx.save(buf)
    return buf.getvalue()
