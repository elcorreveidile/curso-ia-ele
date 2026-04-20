# Handoff: Ebook "Prompts que Funcionan"

## Estado actual
El ebook está **completo en contenido y generado en PDF**. Se generó sin errores el 20/03/2026. El PDF pesa 2,3 MB y está en:
`ebook/PROMPTS_QUE_FUNCIONAN.pdf`

El script generador es:
`generar_ebook.py` (en la raíz del proyecto)

---

## El libro

**Título completo:** *Prompts que Funcionan: Guía de ingeniería de prompts para docentes de ELE · Por niveles, destrezas y géneros textuales*

**Autor:** Javier Benítez Láinez

**Público objetivo:** Profesores de ELE de todo el mundo (no vinculado a ninguna institución)

**Propósito:** Guía comercial independiente, no material del curso CLM/UGR. Sin logo, sin header CLM, sin referencias institucionales. Solo el nombre del autor en portada y créditos.

---

## Estructura de archivos

```
ebook/
├── 00_INTRODUCCION.md
├── parte1/
│   ├── 01_FRAME.md
│   ├── 02_ITERACION.md
│   ├── 03_ERRORES.md
│   └── 04_TECNICAS_AVANZADAS.md
├── parte2/
│   ├── 01_A1.md
│   ├── 02_A2.md
│   ├── 03_B1.md
│   ├── 04_B2.md
│   ├── 05_C1.md
│   └── 06_C2.md
├── parte3/
│   ├── 01_COMPRENSION_LECTORA.md
│   ├── 02_EXPRESION_ESCRITA.md
│   ├── 03_EXPRESION_ORAL.md
│   ├── 04_GRAMATICA.md
│   ├── 05_VOCABULARIO.md
│   ├── 06_CULTURA_INTERCULTURALIDAD.md
│   └── 07_EVALUACION_CORRECCION.md
├── parte4/
│   ├── 01_NARRATIVA.md
│   ├── 02_DIALOGO_CONVERSACION.md
│   ├── 03_ARTICULO_OPINION.md
│   ├── 04_CORREO_COMUNICACION.md
│   ├── 05_DEBATE_ARGUMENTACION.md
│   └── 06_TEXTO_EXPOSITIVO.md
├── parte5/
│   ├── 01_UNIDAD_DIDACTICA.md
│   ├── 02_ADAPTACION_MATERIALES.md
│   ├── 03_PREPARAR_CURSO.md
│   └── 04_FEEDBACK_ALUMNO.md
└── apendices/
    ├── A_BANCO_PROMPTS.md
    ├── B_PLANTILLAS.md
    └── C_GLOSARIO.md
```

**Contenido por parte:**
- **Introducción:** hook, qué es prompt engineering, cómo usar el libro, tabla comparativa de herramientas, convenciones
- **Parte I — Fundamentos:** marco FRAME, iteración, 10 errores frecuentes, técnicas avanzadas (few-shot, chain of thought, prompt chaining, system prompts)
- **Parte II — Por nivel MCER:** A1, A2, B1, B2, C1, C2 — cada uno con perfil del nivel y 5-8 prompts con output real
- **Parte III — Por destreza:** comprensión lectora, expresión escrita, expresión oral, gramática, vocabulario, cultura e interculturalidad, evaluación y corrección
- **Parte IV — Por género textual:** narrativa, diálogo, artículo de opinión, correo, debate, texto expositivo
- **Parte V — Flujos de trabajo:** unidad didáctica completa, adaptación de materiales, preparar un curso de cero, feedback individualizado
- **Apéndices:** banco de prompts (tabla de todos los prompts), plantillas en blanco (9 plantillas FRAME), glosario (30 términos)

---

## El generador: cómo funciona

**Ejecutar:**
```bash
python3 generar_ebook.py
```

**Qué hace:**
1. Auto-descubre todos los `.md` en `ebook/parte1/` a `ebook/parte5/` y `ebook/apendices/`, en orden alfabético
2. Genera portada oscura + página de créditos + índice automático
3. Convierte cada `.md` a HTML con parser propio (no usa librería markdown externa)
4. Genera PDF con WeasyPrint

**Dependencias:** `weasyprint` (ya instalado en el sistema del usuario)

**Convenciones del markdown:**
- `# Título` → título del capítulo (solo en las primeras 15 líneas, solo `#` simple)
- `### Subtítulo` → subtítulo en cursiva bajo el título
- `## Sección` → sección numerada con círculo azul
- `### Prompt XX-01` → subsección con fondo gris y borde izquierdo azul
- ` ```...``` ` → bloque de prompt (fondo azul claro, borde izquierdo oscuro)
- `> texto` → output real de IA (fondo amarillo crema, borde ámbar)
- `\newpage` → salto de página explícito
- `---` → línea divisoria horizontal

**chapter_label** (etiqueta naranja sobre el título): se asigna en `main()` según la carpeta. Para cambiar la etiqueta de una parte, modificar `generar_ebook.py` en la función `main()`.

---

## Lo que el usuario necesita revisar

### Revisión de diseño y maquetación
- [ ] **Índice:** comprobar que los títulos listados corresponden al contenido real y que el formato visual (parte en negrita, capítulos sangrados) es correcto. El índice NO tiene números de página (limitación de WeasyPrint sin JavaScript); si el usuario lo quiere con números de página, es un cambio técnico no trivial.
- [ ] **Saltos de página:** recorrer el libro completo y añadir `\newpage` donde haya secciones que queden mal cortadas. Cada `\newpage` se añade directamente en el `.md` correspondiente.
- [ ] **Portada:** verificar que el diseño (fondo oscuro `#1a1a2e`, título blanco, subtítulo, divisor naranja, autor) es el deseado.
- [ ] **Cabeceras de página:** en la esquina superior derecha aparece el título del capítulo activo. Verificar que es correcto en todas las secciones.
- [ ] **Tablas:** algunas tablas largas pueden cortarse entre páginas. Si ocurre, se puede añadir `page-break-inside: avoid` en el CSS del generador o dividir la tabla en el markdown.
- [ ] **Bloques de código (prompts):** verificar que se leen bien y no hay texto desbordado.
- [ ] **Blockquotes (outputs de IA):** verificar que el borde ámbar aparece correctamente y que no quedan `>` sueltos visibles (se corrigió en la última versión).

### Revisión de contenido
- [ ] **Introducción (`00_INTRODUCCION.md`):** leer completa y verificar que el tono, el alcance y las convenciones descritas coinciden con el resto del libro.
- [ ] **Parte I:** revisar que los ejemplos de FRAME, iteración y técnicas avanzadas son correctos y actualizados.
- [ ] **Parte II (niveles):** los outputs de IA son ejemplos generados durante la redacción. Verificar que son representativos de lo que cada nivel puede producir realmente.
- [ ] **Consistencia del marco FRAME:** todos los prompts usan la estructura Formato / Rol / Audiencia / Meta / Especificaciones. Verificar que no hay prompts que se desvíen del marco sin justificación.
- [ ] **Outputs reales de IA:** el libro afirma que son outputs reales de Claude. Verificar que lo son o ajustar la nota de créditos si alguno fue editado significativamente.
- [ ] **Versión en inglés:** acordado incluir versión bilingüe de los prompts (español + inglés). **Pendiente de implementar.** Decisión: ¿versión bilingüe en el mismo libro, o libro separado en inglés?

### Posibles mejoras de diseño pendientes
- [ ] **Números de página en el índice:** técnicamente complejo con WeasyPrint. Alternativa: añadir una columna de página manualmente una vez el libro esté definitivamente maquetado.
- [ ] **Página de parte:** algunos libros insertan una página de separación entre partes (ej. "Parte I — Fundamentos" en página entera). No implementado. Si se desea, añadir un archivo `00_PARTE1.md` en cada carpeta con solo el título de la parte.
- [ ] **Fuente de portada:** actualmente Georgia. Si se desea fuente diferente para la portada, modificar `.cover-title` en el CSS del generador.

---

## Bugs corregidos en la última sesión

1. **`>` sueltos aparecían como texto** — los blockquotes con líneas vacías `>` se procesaban mal. Corregido en el parser de `generar_ebook.py`.
2. **Salto de página antes de "Ejemplo de system prompt"** — añadido `\newpage` en `parte1/04_TECNICAS_AVANZADAS.md` línea 195.
3. **Índice generado automáticamente** — añadida función `build_toc()` en `generar_ebook.py`.

---

## Historial de decisiones relevantes

- El libro es **independiente** del curso CLM/UGR. Sin logo, sin header institucional.
- **Claude como referencia principal**, pero multi-herramienta (menciona también ChatGPT y Gemini).
- **Outputs reales incluidos** después de cada prompt, en blockquote con borde ámbar.
- **Bilingüe (español + inglés)** acordado pero pendiente. La versión actual es solo en español.
- El libro **asume que el lector ya conoce las herramientas de IA** a nivel básico. No hay tutorial de cómo abrir ChatGPT.
- Todos los ajustes de diseño se dejaron para el final (el usuario así lo decidió).
- Los apéndices (banco, plantillas, glosario) se decidieron como cierre del libro.

---

## Cómo añadir contenido nuevo

Para añadir un capítulo nuevo a cualquier parte:
1. Crear el archivo `.md` en la carpeta correspondiente con nombre `NN_NOMBRE.md` (el orden alfabético-numérico determina el orden en el PDF)
2. Empezar el archivo con `# Título del capítulo` (una sola `#`)
3. Opcionalmente, añadir `### Subtítulo` justo después del título
4. Ejecutar `python3 generar_ebook.py` para regenerar el PDF

Para añadir una nueva parte (ej. `parte6/`):
1. Crear la carpeta `ebook/parte6/`
2. Añadir el bloque correspondiente en la función `main()` de `generar_ebook.py`, siguiendo el patrón de las partes anteriores
