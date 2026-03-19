#!/usr/bin/env python3
"""
Generar PDFs con estilo CLM para el curso de IA-ELE
"""

import os
import re
from pathlib import Path
from weasyprint import HTML, CSS

OUTPUT_DIR = Path("/Users/javierbenitez/Desktop/AI/Formación IA/Curso formación CLM/PDFs")
CONTENT_DIR = Path("/Users/javierbenitez/Desktop/AI/Formación IA/Curso formación CLM/materiales")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# CSS estilo CLM
PDF_CSS = CSS(string="""
    @page {
        size: A4;
        margin: 1.8cm 2cm 2cm 2cm;
    }

    body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #000;
    }

    .header {
        text-align: center;
        margin-bottom: 18px;
        border-bottom: 1px solid #000;
        padding-bottom: 10px;
    }

    .universidad {
        font-size: 9pt;
        margin-bottom: 6px;
    }

    .curso-title {
        font-size: 13pt;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .info-table {
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
        font-size: 9pt;
    }

    .info-table td {
        padding: 2px 6px;
        text-align: left;
    }

    .info-label {
        font-weight: bold;
    }

    .main-title {
        font-size: 17pt;
        font-weight: bold;
        text-align: center;
        margin: 18px 0 15px 0;
    }

    .section {
        margin: 15px 0;
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12pt;
        font-weight: bold;
        margin-bottom: 8px;
    }

    .section-number {
        width: 18px;
        height: 18px;
        background-color: #000;
        color: white;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10pt;
        font-weight: bold;
        flex-shrink: 0;
    }

    h2 {
        font-size: 12pt;
        font-weight: bold;
        margin: 12px 0 6px 0;
    }

    h3 {
        font-size: 11pt;
        font-weight: bold;
        margin: 10px 0 6px 0;
    }

    ul, ol {
        margin: 6px 0;
        padding-left: 22px;
    }

    li {
        margin: 3px 0;
        line-height: 1.4;
    }

    strong {
        font-weight: bold;
    }

    p {
        margin: 5px 0;
        line-height: 1.4;
    }
""")


def markdown_to_html(markdown_content):
    """Convierte markdown a HTML"""
    html_lines = []
    lines = markdown_content.split('\n')
    i = 0
    section_num = 0

    # Extraer título
    title = "IA para la enseñanza de ELE"
    for line in lines[:15]:
        if line.startswith('# '):
            title = line[2:].strip()
            lines = lines[lines.index(line)+1:]
            break
        elif line.startswith('## '):
            title = line[3:].strip()
            lines = lines[lines.index(line)+1:]
            break

    # Construir HTML con header CLM
    header_html = f"""
    <div class="header">
        <p class="universidad">Universidad de Granada · Centro de Lenguas Modernas</p>
        <p class="curso-title">IA para la enseñanza de ELE: planificación de clases y creación de materiales</p>
        <table class="info-table">
            <tr><td class="info-label">Curso:</td><td>Formación del profesorado (Abril 2026)</td></tr>
            <tr><td class="info-label">Profesor:</td><td>Javier Benítez Lainez</td></tr>
            <tr><td class="info-label">Email:</td><td>benitezl@go.ugr.es</td></tr>
        </table>
    </div>
    <h1 class="main-title">{title}</h1>
    """

    while i < len(lines):
        line = lines[i].rstrip()

        if not line:
            i += 1
            continue

        # Títulos de sección
        if line.startswith('## '):
            section_num += 1
            text = line[3:].strip()
            text = re.sub(r'^\d+\.?\s*', '', text)
            html_lines.append(f'<div class="section">')
            html_lines.append(f'<div class="section-title">')
            html_lines.append(f'<span class="section-number">{section_num}</span>')
            html_lines.append(f'<span>{text}</span>')
            html_lines.append(f'</div>')
            i += 1

        elif line.startswith('### '):
            text = line[4:].strip()
            text = re.sub(r'^\d+\.?\s*', '', text)
            html_lines.append(f'<h3>{text}</h3>')
            i += 1

        elif line.startswith('- '):
            html_lines.append('<ul>')
            while i < len(lines) and lines[i].strip().startswith('- '):
                text = lines[i].strip()[2:]
                text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
                html_lines.append(f'<li>{text}</li>')
                i += 1
            html_lines.append('</ul>')

        elif re.match(r'^\d+\.', line):
            html_lines.append('<ol>')
            while i < len(lines) and re.match(r'^\d+\.', lines[i].strip()):
                text = re.sub(r'^\d+\.?\s*', '', lines[i].strip())
                text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
                html_lines.append(f'<li>{text}</li>')
                i += 1
            html_lines.append('</ol>')

        else:
            text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', line)
            html_lines.append(f'<p>{text}</p>')
            i += 1

    body_html = '\n'.join(html_lines)

    html_template = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
    </head>
    <body>
        {header_html}
        {body_html}
    </body>
    </html>
    """

    return html_template


def create_pdf(md_file):
    """Crea un PDF desde markdown"""
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        html_string = markdown_to_html(content)

        # Determinar ruta de salida manteniendo estructura
        relative_path = md_file.relative_to(CONTENT_DIR)
        output_path = OUTPUT_DIR / relative_path.with_suffix('.pdf')
        output_path.parent.mkdir(parents=True, exist_ok=True)

        HTML(string=html_string).write_pdf(str(output_path), stylesheets=[PDF_CSS])

        print(f"✅ {relative_path}")
        return True

    except Exception as e:
        print(f"❌ {md_file.name}: {e}")
        return False


def main():
    print("📚 Generando PDFs con estilo CLM...")
    print("=" * 60)

    # Encontrar todos los archivos .md
    md_files = sorted(CONTENT_DIR.glob("**/*.md"))

    count = 0
    for md_file in md_files:
        # Saltar archivos que no queremos convertir
        if any(x in md_file.name for x in ['README', '.git']):
            continue

        if create_pdf(md_file):
            count += 1

    print()
    print(f"✅ Total: {count} PDFs generados con estilo CLM")
    print(f"📁 Ubicación: {OUTPUT_DIR}")
    print("📏 Formato: Header CLM + márgenes estándar")


if __name__ == "__main__":
    main()
