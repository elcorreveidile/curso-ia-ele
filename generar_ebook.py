#!/usr/bin/env python3
"""
Generador de PDF para el ebook "Prompts que Funcionan"
Diseño de libro: sin header CLM, numeración de páginas, tipografía limpia.
"""

import os
import re
from pathlib import Path
from weasyprint import HTML, CSS

EBOOK_DIR = Path(__file__).parent / "ebook"
OUTPUT_FILE = EBOOK_DIR / "PROMPTS_QUE_FUNCIONAN.pdf"

BOOK_TITLE = "Prompts que Funcionan"
BOOK_AUTHOR = "Javier Benítez Láinez"
BOOK_YEAR = "2026"

BOOK_CSS = CSS(string="""
    @font-face {
        font-family: 'Georgia';
        src: local('Georgia');
    }

    @page {
        size: A4;
        margin: 2.2cm 2.5cm 2.8cm 3cm;

        @bottom-center {
            content: counter(page);
            font-family: Arial, sans-serif;
            font-size: 9pt;
            color: #666;
        }

        @top-right {
            content: string(chapter-title);
            font-family: Arial, sans-serif;
            font-size: 8pt;
            color: #888;
            font-style: italic;
        }
    }

    @page cover {
        margin: 0;
        @bottom-center { content: none; }
        @top-right { content: none; }
    }

    @page chapter-start {
        @top-right { content: none; }
    }

    body {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 11pt;
        line-height: 1.65;
        color: #1a1a1a;
    }

    /* ── PORTADA ── */
    .cover {
        page: cover;
        page-break-after: always;
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        background-color: #1a1a2e;
        color: white;
        padding: 0;
        margin: 0;
        box-sizing: border-box;
    }

    .cover-inner {
        padding: 4cm 3cm;
    }

    .cover-label {
        font-family: Arial, sans-serif;
        font-size: 9pt;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #a0a8c0;
        margin-bottom: 2.5cm;
    }

    .cover-title {
        font-family: Georgia, serif;
        font-size: 36pt;
        font-weight: bold;
        line-height: 1.15;
        color: #ffffff;
        margin-bottom: 0.6cm;
    }

    .cover-subtitle {
        font-family: Arial, sans-serif;
        font-size: 13pt;
        color: #c0c8e0;
        line-height: 1.4;
        margin-bottom: 3cm;
        font-style: italic;
    }

    .cover-divider {
        width: 60px;
        height: 3px;
        background-color: #e8a020;
        margin: 0 auto 3cm auto;
    }

    .cover-author {
        font-family: Arial, sans-serif;
        font-size: 12pt;
        color: #d0d8f0;
        margin-bottom: 0.3cm;
    }

    .cover-year {
        font-family: Arial, sans-serif;
        font-size: 10pt;
        color: #9098b8;
    }

    /* ── PÁGINA DE CRÉDITOS ── */
    .credits-page {
        page-break-after: always;
        padding-top: 14cm;
        font-family: Arial, sans-serif;
        font-size: 8.5pt;
        color: #555;
        line-height: 1.6;
    }

    .credits-page p {
        margin: 4px 0;
    }

    /* ── TABLA DE CONTENIDOS ── */
    .toc-page {
        page-break-after: always;
    }

    .toc-title {
        font-family: Arial, sans-serif;
        font-size: 18pt;
        font-weight: bold;
        margin-bottom: 1.2cm;
        padding-bottom: 8px;
        border-bottom: 2px solid #1a1a2e;
        color: #1a1a2e;
    }

    .toc-entry {
        font-family: Arial, sans-serif;
        font-size: 10pt;
        margin: 5px 0;
        color: #222;
    }

    .toc-part {
        font-family: Arial, sans-serif;
        font-size: 10pt;
        font-weight: bold;
        margin-top: 12px;
        margin-bottom: 4px;
        color: #1a1a2e;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .toc-sub {
        margin-left: 16px;
        color: #444;
    }

    /* ── CAPÍTULO / SECCIÓN PRINCIPAL ── */
    .chapter-header {
        page: chapter-start;
        page-break-before: always;
        page-break-after: avoid;
        padding-bottom: 1.2cm;
        margin-bottom: 0.8cm;
        border-bottom: 3px solid #1a1a2e;
        string-set: chapter-title content();
    }

    .chapter-label {
        font-family: Arial, sans-serif;
        font-size: 9pt;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: #e8a020;
        margin-bottom: 0.4cm;
        display: block;
    }

    .chapter-title {
        font-family: Georgia, serif;
        font-size: 22pt;
        font-weight: bold;
        color: #1a1a2e;
        line-height: 1.2;
        margin: 0;
    }

    /* ── TÍTULO PRINCIPAL (h1 en body) ── */
    h1 {
        font-family: Georgia, serif;
        font-size: 22pt;
        font-weight: bold;
        color: #1a1a2e;
        margin: 0.6cm 0 0.4cm 0;
        page-break-after: avoid;
        border-bottom: 3px solid #1a1a2e;
        padding-bottom: 8px;
    }

    /* ── SECCIONES (##) ── */
    .section {
        margin: 0.8cm 0 0.4cm 0;
        page-break-inside: avoid;
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: Arial, sans-serif;
        font-size: 13pt;
        font-weight: bold;
        color: #1a1a2e;
        margin-bottom: 0.3cm;
        page-break-after: avoid;
    }

    .section-number {
        width: 22px;
        height: 22px;
        background-color: #1a1a2e;
        color: white;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 9pt;
        font-weight: bold;
        flex-shrink: 0;
        font-family: Arial, sans-serif;
    }

    /* ── SUBSECCIONES (###) ── */
    h3 {
        font-family: Arial, sans-serif;
        font-size: 11.5pt;
        font-weight: bold;
        color: #1a1a2e;
        margin: 0.5cm 0 0.2cm 0;
        padding: 6px 12px;
        background-color: #eef0f5;
        border-left: 4px solid #1a1a2e;
        page-break-after: avoid;
    }

    /* ── SUB-SUBSECCIONES (####) ── */
    h4 {
        font-family: Arial, sans-serif;
        font-size: 10.5pt;
        font-weight: bold;
        color: #333;
        margin: 0.4cm 0 0.15cm 0;
        padding: 3px 8px;
        border-left: 3px solid #e8a020;
        page-break-after: avoid;
    }

    /* ── PÁRRAFOS ── */
    p {
        margin: 0.2cm 0;
        line-height: 1.65;
        text-align: justify;
        orphans: 3;
        widows: 3;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }

    /* ── LISTAS ── */
    ul, ol {
        margin: 0.2cm 0 0.2cm 0;
        padding-left: 22px;
        page-break-inside: avoid;
    }

    li {
        margin: 3px 0;
        line-height: 1.55;
        page-break-inside: avoid;
    }

    /* ── PROMPTS (bloques de código) ── */
    pre {
        background-color: #f4f6fa;
        border: 1px solid #d0d6e8;
        border-left: 4px solid #1a1a2e;
        padding: 12px 14px;
        border-radius: 4px;
        font-size: 9pt;
        font-family: 'Courier New', monospace;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 1.45;
        margin: 0.3cm 0;
        page-break-inside: avoid;
    }

    code {
        font-family: 'Courier New', monospace;
        font-size: 9pt;
        background-color: #f0f2f8;
        padding: 1px 4px;
        border-radius: 2px;
    }

    /* ── OUTPUTS REALES (blockquote) ── */
    blockquote {
        margin: 0.3cm 0;
        padding: 10px 14px;
        border-left: 4px solid #e8a020;
        background-color: #fdfbf5;
        font-style: normal;
        font-size: 10.5pt;
        page-break-inside: avoid;
    }

    blockquote p {
        margin: 2px 0;
        text-align: left;
    }

    /* ── TABLAS ── */
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 0.3cm 0;
        font-size: 9.5pt;
        font-family: Arial, sans-serif;
        page-break-inside: avoid;
    }

    th {
        background-color: #1a1a2e;
        color: white;
        padding: 6px 10px;
        text-align: left;
        font-weight: bold;
    }

    td {
        padding: 5px 10px;
        border: 1px solid #d0d4e0;
        vertical-align: top;
    }

    tr:nth-child(even) td {
        background-color: #f4f6fa;
    }

    /* ── SEPARADORES ── */
    .page-break {
        page-break-after: always;
    }

    .section-divider {
        border: none;
        border-top: 1px solid #d0d4e0;
        margin: 0.5cm 0;
    }

    /* ── NOTA TIPOGRÁFICA ── */
    .subtitle {
        font-family: Arial, sans-serif;
        font-size: 11pt;
        font-style: italic;
        color: #555;
        margin: -0.2cm 0 0.4cm 0;
    }

    strong {
        font-weight: bold;
        color: #111;
    }
""")


COVER_HTML = f"""
<div class="cover">
  <div class="cover-inner">
    <div class="cover-label">Guía profesional para docentes de ELE</div>
    <div class="cover-title">Prompts que<br>Funcionan</div>
    <div class="cover-subtitle">Guía de ingeniería de prompts para docentes de ELE<br>Por niveles, destrezas y géneros textuales</div>
    <div class="cover-divider"></div>
    <div class="cover-author">{BOOK_AUTHOR}</div>
    <div class="cover-year">{BOOK_YEAR}</div>
  </div>
</div>

<div class="credits-page">
  <p><strong>Prompts que Funcionan</strong></p>
  <p>Guía de ingeniería de prompts para docentes de ELE</p>
  <p>Por niveles, destrezas y géneros textuales</p>
  <br>
  <p>© {BOOK_AUTHOR}, {BOOK_YEAR}</p>
  <p>Todos los derechos reservados.</p>
  <br>
  <p>Los outputs de IA incluidos en este libro han sido generados con Claude (Anthropic),</p>
  <p>ChatGPT (OpenAI) y Gemini (Google) durante 2025-2026.</p>
  <p>Los modelos de lenguaje evolucionan; los resultados pueden variar.</p>
  <br>
  <p>Primera edición, {BOOK_YEAR}</p>
</div>
"""


def markdown_to_html_book(markdown_content, chapter_label="", is_intro=False):
    """Convierte markdown a HTML con estilo libro."""
    html_lines = []
    lines = markdown_content.split('\n')
    i = 0
    section_num = 0
    in_code_block = False
    code_lines = []

    # Extraer título (último # en las primeras 15 líneas)
    title = ""
    title_idx = -1
    for idx, line in enumerate(lines[:15]):
        if line.startswith('# '):
            title_idx = idx
    if title_idx >= 0:
        title = lines[title_idx][2:].strip()
        lines = lines[title_idx + 1:]

    # Extraer subtítulo opcional (### inmediatamente tras el título)
    subtitle = ""
    for j, line in enumerate(lines[:5]):
        stripped = line.strip()
        if not stripped or stripped == r'\newpage' or stripped == '---':
            continue
        if line.startswith('### '):
            subtitle = line[4:].strip()
            lines = lines[j + 1:]
        break

    # Header del capítulo
    if title:
        label_html = f'<span class="chapter-label">{chapter_label}</span>' if chapter_label else ''
        html_lines.append(f'''
<div class="chapter-header">
  {label_html}
  <div class="chapter-title">{title}</div>
</div>
''')
        if subtitle:
            html_lines.append(f'<p class="subtitle">{subtitle}</p>')

    # Procesar cuerpo
    while i < len(lines):
        line = lines[i].rstrip()

        if not line:
            i += 1
            continue

        if line.strip() in ('---', '***', '___'):
            html_lines.append('<div class="section-divider"></div>')
            i += 1
            continue

        if line.strip() == r'\newpage':
            html_lines.append('<div class="page-break"></div>')
            i += 1
            continue

        if line.startswith('# '):
            i += 1
            continue

        # Bloques de código (prompts)
        if line.strip().startswith('```'):
            if not in_code_block:
                in_code_block = True
                code_lines = []
            else:
                code_content = escape_html('\n'.join(code_lines))
                html_lines.append(f'<pre><code>{code_content}</code></pre>')
                in_code_block = False
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # ## Secciones numeradas
        if line.startswith('## '):
            section_num += 1
            text = line[3:].strip()
            text = re.sub(r'^\d+\.?\s*', '', text)
            html_lines.append(f'''
<div class="section">
<div class="section-title">
<span class="section-number">{section_num}</span>
<span>{text}</span>
</div>
</div>''')
            i += 1

        elif line.startswith('> ') or line.strip() == '>':
            html_lines.append('<blockquote>')
            while i < len(lines) and (lines[i].strip().startswith('> ') or lines[i].strip() == '>'):
                stripped = lines[i].strip()
                if stripped == '>':
                    i += 1
                    continue
                text = stripped[2:]
                text = apply_inline(text)
                html_lines.append(f'<p>{text}</p>')
                i += 1
            html_lines.append('</blockquote>')

        elif line.startswith('### '):
            text = line[4:].strip()
            text = re.sub(r'^\d+\.?\s*', '', text)
            html_lines.append(f'<h3>{text}</h3>')
            i += 1

        elif line.startswith('#### '):
            text = line[5:].strip()
            html_lines.append(f'<h4>{text}</h4>')
            i += 1

        elif line.startswith('|'):
            html_lines.append('<table>')
            headers = [c.strip() for c in line.split('|')[1:-1]]
            html_lines.append('<thead><tr>')
            for h in headers:
                html_lines.append(f'<th>{apply_inline(h)}</th>')
            html_lines.append('</tr></thead><tbody>')
            i += 1
            if i < len(lines) and lines[i].strip().startswith('|') and '---' in lines[i]:
                i += 1
            while i < len(lines) and lines[i].strip().startswith('|'):
                cells = [c.strip() for c in lines[i].split('|')[1:-1]]
                html_lines.append('<tr>')
                for cell in cells:
                    html_lines.append(f'<td>{apply_inline(cell)}</td>')
                html_lines.append('</tr>')
                i += 1
            html_lines.append('</tbody></table>')

        elif line.startswith('- '):
            html_lines.append('<ul>')
            while i < len(lines) and lines[i].strip().startswith('- '):
                text = lines[i].strip()[2:]
                html_lines.append(f'<li>{apply_inline(text)}</li>')
                i += 1
            html_lines.append('</ul>')

        elif re.match(r'^\d+\.', line):
            html_lines.append('<ol>')
            while i < len(lines) and re.match(r'^\d+\.', lines[i].strip()):
                text = re.sub(r'^\d+\.?\s*', '', lines[i].strip())
                html_lines.append(f'<li>{apply_inline(text)}</li>')
                i += 1
            html_lines.append('</ol>')

        else:
            html_lines.append(f'<p>{apply_inline(line)}</p>')
            i += 1

    return '\n'.join(html_lines)


def escape_html(text):
    """Escapa caracteres HTML en bloques de código."""
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def apply_inline(text):
    """Aplica formato inline: negrita, cursiva, código."""
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
    text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
    return text


def extract_title(md_file):
    """Extrae el título principal (# ) de un archivo markdown."""
    with open(md_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('# '):
                return line[2:].strip()
    return md_file.stem


def build_toc(md_files_with_labels):
    """Genera el HTML de la tabla de contenidos."""
    toc_lines = ['<div class="toc-page">']
    toc_lines.append('<div class="toc-title">Índice</div>')

    current_part = None
    for md_file, chapter_label in md_files_with_labels:
        title = extract_title(md_file)
        if chapter_label != current_part:
            current_part = chapter_label
            toc_lines.append(f'<div class="toc-part">{chapter_label}</div>')
        toc_lines.append(f'<div class="toc-entry toc-sub">{title}</div>')

    toc_lines.append('</div>')
    return '\n'.join(toc_lines)


def build_ebook(md_files_with_labels):
    """Construye el ebook completo desde una lista de (archivo, etiqueta_capítulo)."""

    toc_html = build_toc(md_files_with_labels)
    all_body_parts = [COVER_HTML, toc_html]

    for md_file, chapter_label in md_files_with_labels:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        body = markdown_to_html_book(content, chapter_label=chapter_label)
        all_body_parts.append(body)

    full_body = '\n'.join(all_body_parts)

    html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Prompts que Funcionan</title>
</head>
<body>
    {full_body}
</body>
</html>
"""
    HTML(string=html, base_url=str(EBOOK_DIR)).write_pdf(
        str(OUTPUT_FILE),
        stylesheets=[BOOK_CSS]
    )
    print(f"✅ Ebook generado: {OUTPUT_FILE}")


def main():
    print("📖 Generando ebook 'Prompts que Funcionan'...")

    # Lista de archivos en orden con su etiqueta de capítulo
    # Formato: (ruta, "etiqueta visible")
    chapters = []

    # Introducción
    intro = EBOOK_DIR / "00_INTRODUCCION.md"
    if intro.exists():
        chapters.append((intro, "Introducción"))

    # Parte I
    parte1_dir = EBOOK_DIR / "parte1"
    if parte1_dir.exists():
        for f in sorted(parte1_dir.glob("*.md")):
            chapters.append((f, "Parte I — Fundamentos"))

    # Parte II
    parte2_dir = EBOOK_DIR / "parte2"
    if parte2_dir.exists():
        for f in sorted(parte2_dir.glob("*.md")):
            chapters.append((f, "Parte II — Por nivel MCER"))

    # Parte III
    parte3_dir = EBOOK_DIR / "parte3"
    if parte3_dir.exists():
        for f in sorted(parte3_dir.glob("*.md")):
            chapters.append((f, "Parte III — Por destreza"))

    # Parte IV
    parte4_dir = EBOOK_DIR / "parte4"
    if parte4_dir.exists():
        for f in sorted(parte4_dir.glob("*.md")):
            chapters.append((f, "Parte IV — Por género textual"))

    # Parte V
    parte5_dir = EBOOK_DIR / "parte5"
    if parte5_dir.exists():
        for f in sorted(parte5_dir.glob("*.md")):
            chapters.append((f, "Parte V — Flujos de trabajo"))

    # Apéndices
    apendices_dir = EBOOK_DIR / "apendices"
    if apendices_dir.exists():
        for f in sorted(apendices_dir.glob("*.md")):
            chapters.append((f, "Apéndices"))

    if not chapters:
        print("⚠️  No se encontraron capítulos. Añade archivos .md en ebook/")
        return

    build_ebook(chapters)


if __name__ == "__main__":
    main()
