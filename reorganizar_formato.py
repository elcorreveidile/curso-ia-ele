#!/usr/bin/env python3
"""
Reorganiza archivos markdown para formato uniforme PDF:
- Página 1: Solo índice
- Página 2: Título + contenido
"""

import re
from pathlib import Path

MATERIALES_DIR = Path("/Users/javierbenitez/Desktop/AI/Formación IA/Curso formación CLM/materiales")

def reorganize_markdown(md_file):
    """Reorganiza un archivo markdown"""
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # Extraer título principal (línea que empieza con #)
        main_title = ""
        main_title_idx = -1
        for i, line in enumerate(lines):
            if line.strip().startswith('# '):
                main_title = line.strip()
                main_title_idx = i
                break

        if not main_title:
            print(f"⚠️  No tiene título principal: {md_file.name}")
            return False

        # Extraer subtítulo (línea que empieza con ###)
        subtitle = ""
        subtitle_idx = -1
        for i, line in enumerate(lines[main_title_idx+1:], start=main_title_idx+1):
            if line.strip().startswith('###'):
                subtitle = line.strip()
                subtitle_idx = i
                break

        # Buscar el índice
        indice_start = -1
        indice_end = -1
        for i, line in enumerate(lines):
            if '## 📋 ÍNDICE' in line or '## ÍNDICE' in line or '# ÍNDICE' in line:
                indice_start = i
            if indice_start != -1 and line.strip().startswith('---'):
                indice_end = i
                break

        # Si no hay índice, crear uno básico
        if indice_start == -1:
            print(f"ℹ️  No tiene índice: {md_file.name} - Creando índice básico")
            # No hacer nada, dejar como está
            return False

        # Construir nuevo contenido
        new_lines = []

        # Página 1: Solo índice
        new_lines.append("# ÍNDICE\n")
        new_lines.append("\n")

        # Copiar el índice
        in_indice = False
        for line in lines[indice_start:]:
            if line.strip().startswith('##'):
                if 'ÍNDICE' in line or 'INDICE' in line:
                    in_indice = True
                    continue
            if in_indice:
                if line.strip() == '---':
                    break
                # Limpiar el índice (quitar enlaces markdown)
                cleaned_line = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', line)
                new_lines.append(cleaned_line)

        new_lines.append("\n")
        new_lines.append("\\newpage\n")
        new_lines.append("\n")

        # Página 2: Título + contenido
        # Copiar desde el título principal hasta antes del índice
        for i in range(main_title_idx, indice_start):
            new_lines.append(lines[i])

        # Copiar desde después del índice hasta el final
        for i in range(indice_end + 1, len(lines)):
            new_lines.append(lines[i])

        # Guardar archivo
        with open(md_file, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)

        print(f"✅ {md_file.relative_to(MATERIALES_DIR)}")
        return True

    except Exception as e:
        print(f"❌ {md_file.name}: {e}")
        return False

def main():
    print("🔄 Reorganizando archivos markdown para formato PDF uniforme...")
    print("=" * 70)

    # Encontrar todos los archivos .md
    md_files = sorted(MATERIALES_DIR.glob("**/*.md"))

    count = 0
    for md_file in md_files:
        # Saltar el glosario (ya está hecho)
        if 'GLOSARIO' in md_file.name:
            continue

        # Saltar archivos que no son de contenido principal
        if 'README' in md_file.name:
            continue

        if reorganize_markdown(md_file):
            count += 1

    print()
    print(f"✅ Total: {count} archivos reorganizados")

if __name__ == "__main__":
    main()
