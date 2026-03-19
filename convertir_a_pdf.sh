#!/bin/bash

# Script para convertir todos los archivos .md a PDF
# Autor: Javier Benítez Láinez
# Fecha: Marzo 2026

BASE_DIR="/Users/javierbenitez/Desktop/AI/Formación IA/Curso formación CLM"
MATERIALES_DIR="$BASE_DIR/materiales"
PDF_DIR="$BASE_DIR/PDFs"

echo "🔄 Iniciando conversión de Markdown a PDF..."
echo "📁 Directorio de materiales: $MATERIALES_DIR"
echo "📁 Directorio de salida: $PDF_DIR"
echo ""

# Crear directorio de salida si no existe
mkdir -p "$PDF_DIR"

# Contador de archivos convertidos
count=0

# Función para convertir un archivo .md a PDF
convert_md_to_pdf() {
    local md_file="$1"
    local relative_path="${md_file#$MATERIALES_DIR/}"
    local pdf_name="${relative_path%.md}.pdf"
    local pdf_path="$PDF_DIR/$pdf_name"

    # Crear directorio destino si no existe
    local pdf_dir=$(dirname "$pdf_path")
    mkdir -p "$pdf_dir"

    echo "📄 Convirtiendo: $relative_path"

    # Convertir usando pandoc con formato profesional
    pandoc "$md_file" \
        -o "$pdf_path" \
        --pdf-engine=xelatex \
        -V geometry:margin=2.5cm \
        -V fontsize=12pt \
        -V mainfont="Helvetica" \
        -V colorlinks=true \
        -V linkcolor=blue \
        -V urlcolor=blue \
        -V toccolor=blue \
        --toc \
        --toc-depth=3 \
        --highlight-style=tango \
        -M title="IA para la enseñanza de ELE" \
        -M author="Javier Benítez Láinez" \
        2>/dev/null

    if [ $? -eq 0 ]; then
        echo "✅ Guardado: $pdf_name"
        ((count++))
    else
        echo "❌ Error al convertir: $relative_path"
    fi
    echo ""
}

# Exportar la función para usar con find
export -f convert_md_to_pdf
export MATERIALES_DIR PDF_DIR count

# Encontrar y convertir todos los archivos .md
find "$MATERIALES_DIR" -name "*.md" -type f | while read md_file; do
    convert_md_to_pdf "$md_file"
done

echo ""
echo "🎉 Conversión completada!"
echo "📊 Total de archivos convertidos: $count"
echo "📁 Los PDFs están en: $PDF_DIR"
echo ""
echo "✅ Lista de PDFs generados:"
find "$PDF_DIR" -name "*.pdf" -type f | sort
