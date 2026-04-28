"""eBook PDF builder using ReportLab (pure Python, no system deps).

Builds a single full PDF from the seeded ebook chapters. Brand palette
matches La Clase Digital: navy/blue/amber on cream.
"""
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT  # noqa: F401
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm  # noqa: F401
from reportlab.platypus import (
    BaseDocTemplate, Frame, NextPageTemplate, PageBreak, PageTemplate,
    Paragraph, Preformatted, Spacer, Table, TableStyle,
)


def build_ebook_pdf(chapters: list[dict]) -> bytes:
    """Generate the full book PDF from a list of chapter dicts.

    Each chapter dict needs: part_order, part_label, title, content_md.
    Returns the raw PDF bytes.
    """
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
    QUOTE_BG = colors.HexColor("#FEF6DC")
    LINE = colors.HexColor("#E0E2EA")

    # ── Styles ──
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
                code_style = ParagraphStyle(
                    "code", fontName="Courier", fontSize=8.8, leading=12,
                    textColor=INK, leftIndent=0, rightIndent=0,
                )
                txt = "\n".join(code_buf).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                inner = Preformatted(txt, code_style)
                tbl = Table([[inner]], colWidths=[18 * cm], hAlign="LEFT")
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
    return buf.getvalue()
