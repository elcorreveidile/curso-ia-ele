#!/bin/bash

# Script simple para convertir .md a PDF con estilo CLM
BASE_DIR="/Users/javierbenitez/Desktop/AI/Formación IA/Curso formación CLM"
MATERIALES_DIR="$BASE_DIR/materiales"
PDF_DIR="$BASE_DIR/PDFs"

echo "🔄 Iniciando conversión de Markdown a PDF con estilo CLM..."
mkdir -p "$PDF_DIR"

count=0

# Convertir cada archivo .md
find "$MATERIALES_DIR" -name "*.md" -type f | sort | while read md_file; do
    relative_path="${md_file#$MATERIALES_DIR/}"
    pdf_name="${relative_path%.md}.pdf"
    pdf_path="$PDF_DIR/$pdf_name"

    # Crear directorio destino
    pdf_dir=$(dirname "$pdf_path")
    mkdir -p "$pdf_dir"

    echo "📄 Convirtiendo: $relative_path"

    pandoc "$md_file" \
        -o "$pdf_path" \
        --pdf-engine=xelatex \
        -V geometry:margin=2cm \
        -V geometry:top=1.8cm \
        -V geometry:bottom=2cm \
        -V geometry:left=2cm \
        -V geometry:right=2cm \
        -V fontsize=11pt \
        -V mainfont="Arial" \
        -V colorlinks=true \
        -V linkcolor=black \
        -V urlcolor=black \
        -V documentclass=article \
        -V classoption=a4paper \
        --highlight-style=tango \
        -M title="IA para la enseñanza de ELE" \
        -M author="Javier Benítez Láinez" \
        2>/dev/null

    if [ $? -eq 0 ]; then
        echo "✅ $pdf_name"
        ((count++))
    else
        echo "❌ Error: $relative_path"
    fi
done

echo ""
echo "🎉 Conversión completada!"
echo "📁 Los PDFs están en: $PDF_DIR"
echo "📏 Estilo: CLM (márgenes 2cm, sin números de página)"
