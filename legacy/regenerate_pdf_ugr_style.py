#!/usr/bin/env python3
"""
Regenerar PDFs con estilo CLM/UGR correcto
"""

import os
import re
from pathlib import Path
from weasyprint import HTML, CSS

# Configuración
OUTPUT_DIR = Path("/Users/javierbenitez/Desktop/AI/Formación IA/Curso formación CLM/PDFs")
CONTENT_DIR = Path("/Users/javierbenitez/Desktop/AI/Formación IA/Curso formación CLM/materiales")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# CSS estilo CLM/UGR
PDF_CSS = CSS(string="""
    @page {
        size: A4;
        margin: 2cm 2.5cm 2.5cm 2.5cm;
    }

    body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #000;
    }

    .header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #C8102E;
        padding-bottom: 12px;
    }

    .universidad {
        font-size: 10pt;
        font-weight: bold;
        margin-bottom: 8px;
    }

    .curso-title {
        font-size: 12pt;
        font-weight: bold;
        color: #C8102E;
        margin-bottom: 10px;
    }

    .info-table {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        font-size: 9pt;
        margin-bottom: 15px;
    }

    .info-table td {
        padding: 3px 8px;
        text-align: left;
    }

    .info-label {
        font-weight: bold;
    }

    .main-title {
        font-size: 16pt;
        font-weight: bold;
        text-align: center;
        margin: 20px 0 15px 0;
        color: #C8102E;
    }

    h2 {
        font-size: 13pt;
        font-weight: bold;
        margin: 15px 0 10px 0;
        color: #C8102E;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
    }

    h3 {
        font-size: 11pt;
        font-weight: bold;
        margin: 12px 0 8px 0;
        color: #333;
    }

    h4 {
        font-size: 10pt;
        font-weight: bold;
        margin: 10px 0 6px 0;
        color: #555;
    }

    ul, ol {
        margin: 8px 0;
        padding-left: 25px;
    }

    li {
        margin: 4px 0;
        line-height: 1.4;
    }

    strong {
        font-weight: bold;
        color: #C8102E;
    }

    p {
        margin: 6px 0;
        line-height: 1.5;
        text-align: justify;
    }

    em {
        font-style: italic;
    }

    code {
        font-family: 'Courier New', monospace;
        background-color: #f4f4f4;
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 10pt;
    }

    pre {
        background-color: #f4f4f4;
        padding: 10px;
        border-radius: 5px;
        overflow-x: auto;
        font-size: 9pt;
        line-height: 1.3;
    }

    blockquote {
        margin: 10px 0;
        padding-left: 15px;
        border-left: 3px solid #C8102E;
        font-style: italic;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 10pt;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #C8102E;
        color: white;
        font-weight: bold;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 15px 0;
    }

    .page-footer {
        position: running(footer);
        text-align: center;
        font-size: 9pt;
        color: #666;
    }

    @page {
        @bottom-center {
            content: "Página " counter(page) " de " counter(pages);
            font-size: 9pt;
            color: #666;
        }
    }
""")


def markdown_to_html(markdown_content, title="Material del Curso"):
    """Convierte markdown a HTML con encabezado CLM"""

    # Extraer título
    lines = markdown_content.split('\n')
    main_title = title
    for i, line in enumerate(lines):
        if line.startswith('# '):
            main_title = line[2:].strip()
            lines = lines[i+1:]
            break

    # Construir HTML
    html_lines = []
    html_lines.append(f'<div class="header">')
    html_lines.append(f'<p class="universidad">Universidad de Granada · Centro de Lenguas Modernas</p>')
    html_lines.append(f'<p class="curso-title">IA para la enseñanza de ELE: planificación de clases y creación de materiales</p>')
    html_lines.append(f'<table class="info-table">')
    html_lines.append(f'<tr><td class="info-label">Curso:</td><td>Formación del profesorado (Abril 2026)</td></tr>')
    html_lines.append(f'<tr><td class="info-label">Profesor:</td><td>Javier Benítez Láinez</td></tr>')
    html_lines.append(f'<tr><td class="info-label">Email:</td><td>benitezl@go.ugr.es</td></tr>')
    html_lines.append(f'</table>')
    html_lines.append(f'</div>')

    # Título principal
    html_lines.append(f'<h1 class="main-title">{main_title}</h1>')

    # Procesar contenido
    i = 0
    in_list = False
    in_code_block = False

    while i < len(lines):
        line = lines[i]

        # Code blocks
        if line.strip().startswith('```'):
            if not in_code_block:
                html_lines.append('<pre><code>')
                in_code_block = True
            else:
                html_lines.append('</code></pre>')
                in_code_block = False
            i += 1
            continue

        if in_code_block:
            html_lines.append(f'{line}')
            i += 1
            continue

        # Títulos
        if line.startswith('## '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            text = line[3:].strip()
            # Eliminar número al inicio si existe
            text = re.sub(r'^\d+\.?\s*', '', text)
            html_lines.append(f'<h2>{format_text(text)}</h2>')
            i += 1

        elif line.startswith('### '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            text = line[4:].strip()
            text = re.sub(r'^\d+\.?\s*', '', text)
            html_lines.append(f'<h3>{format_text(text)}</h3>')
            i += 1

        elif line.startswith('#### '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            text = line[5:].strip()
            text = re.sub(r'^\d+\.?\s*', '', text)
            html_lines.append(f'<h4>{format_text(text)}</h4>')
            i += 1

        # Listas
        elif line.strip().startswith('- '):
            if not in_list:
                html_lines.append('<ul>')
                in_list = True
            text = line.strip()[2:]
            html_lines.append(f'<li>{format_text(text)}</li>')
            i += 1

        elif re.match(r'^\d+\.', line.strip()):
            if not in_list:
                html_lines.append('<ol>')
                in_list = True
            text = re.sub(r'^\d+\.?\s*', '', line.strip())
            html_lines.append(f'<li>{format_text(text)}</li>')
            i += 1

        # Líneas vacías
        elif not line.strip():
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            html_lines.append('<p>&nbsp;</p>')
            i += 1

        # Párrafos normales
        else:
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            html_lines.append(f'<p>{format_text(line)}</p>')
            i += 1

    if in_list:
        html_lines.append('</ul>')

    body_html = '\n'.join(html_lines)

    html_template = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>{main_title}</title>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            h1.main-title {{ color: #C8102E; text-align: center; }}
        </style>
    </head>
    <body>
        {body_html}
    </body>
    </html>
    """

    return html_template


def format_text(text):
    """Formatea texto con negritas, cursivas, etc."""
    # **negrita**
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # *cursiva*
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
    # `código`
    text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
    # [enlace](url)
    text = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', text)
    return text


def create_pdf(md_file):
    """Crea un PDF desde markdown"""
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Determinar ruta de salida manteniendo estructura
        relative_path = md_file.relative_to(CONTENT_DIR)
        output_path = OUTPUT_DIR / relative_path.with_suffix('.pdf')
        output_path.parent.mkdir(parents=True, exist_ok=True)

        html_string = markdown_to_html(content, md_file.stem)
        HTML(string=html_string).write_pdf(str(output_path), stylesheets=[PDF_CSS])

        print(f"✅ {relative_path}")
        return True

    except Exception as e:
        print(f"❌ {md_file.name}: {e}")
        return False


def main():
    print("📚 Regenerando PDFs con estilo CLM/UGR...")
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
    print(f"✅ Total: {count} PDFs regenerados con estilo CLM/UGR")
    print(f"📁 Ubicación: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
