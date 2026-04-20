# Handoff completo del proyecto
**Directorio raíz:** `/Users/javierbenitez/Desktop/AI/Formación IA/Curso formación CLM`
**Fecha de este documento:** 20/03/2026
**Para:** cualquier agente que continúe el trabajo

---

## Quién es el usuario

**Javier Benítez Láinez** — Docente de ELE en el Centro de Lenguas Modernas (CLM), Universidad de Granada. Trabaja solo en este proyecto con asistencia de IA. Prefiere respuestas cortas y directas. No usar emojis salvo que los pida. Cuando hace preguntas de planificación, prefiere que se le hagan una a una, no todas a la vez.

---

## Visión general: dos productos distintos en el mismo repositorio

### PRODUCTO 1 — Curso de formación CLM (institucional)
**«IA para la enseñanza de ELE: planificación de clases y creación de materiales»**
- Destinatarios: ~41 docentes de ELE del CLM, Universidad de Granada
- Duración: 20 horas, 4 semanas, semipresencial (Moodle + 3 videotutorías)
- Primera edición: **abril 2026** (videotutorías: 13, 23 y 30 de abril, 15:00–16:30 GMT+2)
- Lleva **branding CLM**: logo `clm-rojo.png`, header con nombre del autor y fecha en todos los PDFs
- Se sube a **Moodle del CLM** (Aula Virtual)

### PRODUCTO 2 — Ebook independiente (comercial)
**«Prompts que Funcionan: Guía de ingeniería de prompts para docentes de ELE»**
- Destinatarios: profesores de ELE de todo el mundo
- Producto independiente, **sin ninguna referencia al CLM ni a la UGR**
- Solo aparece el nombre del autor en portada y página de créditos
- En desarrollo activo — ver sección dedicada más abajo

---

## PRODUCTO 1: Curso CLM — estado y estructura

### Archivos principales

| Archivo/carpeta | Descripción |
|----------------|-------------|
| `materiales/` | Archivos fuente `.md` de todos los materiales del curso |
| `PDFs/` | PDFs generados (espeja la estructura de `materiales/`) |
| `generar_pdfs_clm.py` | Script Python que convierte los `.md` en PDFs con formato CLM |
| `index.html` | Landing page del curso (web pública) |
| `descripcion.html` | Página de descripción del curso |
| `programa.html` | Página con los 4 módulos |
| `materiales.html` | Página de descarga de materiales |
| `calendario.html` | Calendario del curso |
| `metodologia.html` | Metodología |
| `diagnostico-clm.html` | Cuestionario diagnóstico general para los ~110 trabajadores del CLM |
| `cuestionario-curso.html` | Cuestionario de diagnóstico específico del curso (52 preguntas) |
| `CHECKLIST_SUBIDA_MOODLE.md` | Lista de tareas para subir los materiales a Moodle |
| `DOCUMENTACION.md` | Documentación técnica completa del proyecto (leer antes de tocar nada) |
| `RESUMEN_EJECUTIVO_PROYECTO.md` | Resumen ejecutivo para presentar el proyecto |

### Estructura de materiales y PDFs

```
materiales/              PDFs/
├── modulo-01-etica/     ├── modulo-01-etica/
│   ├── casos-reales/    │   ├── casos-reales/
│   ├── lecturas/        │   ├── lecturas/
│   ├── rubricas/        │   ├── rubricas/
│   └── videos/          │   └── videos/
├── modulo-02-asistentes/├── modulo-02-asistentes/
│   ├── guias-comparativas│   ├── guias-comparativas/
│   ├── plantillas/      │   ├── plantillas/
│   ├── rubricas/        │   ├── rubricas/
│   └── videos/          │   └── videos/
├── modulo-03-planificacion/ (ídem)
├── modulo-04-recursos/  (ídem)
├── propuesta/           (ídem)
└── transversales/       (ídem)
    ├── evaluacion/
    ├── glosarios/
    ├── guias/
    └── videos/
```

**Total:** 27 archivos `.md` fuente → 27 PDFs generados (todos con formato CLM).

### Cómo regenerar los PDFs del curso

```bash
python3 generar_pdfs_clm.py
```

Genera todos los PDFs en `PDFs/` manteniendo la estructura de `materiales/`. Requiere `weasyprint`.

### Formato de los PDFs del curso (CLM)

- Header en cada página: logo CLM (izquierda) + «Javier Benítez Láinez · CLM · 2026» (derecha)
- Tipografía: Georgia para cuerpo, Arial para headers
- Colores institucionales: azul oscuro `#1a1a2e`, naranja `#e8a020`
- El título del documento se extrae de la **primera línea `# `** en las primeras 15 líneas del `.md`
  - **Solo `#` simple** — los `##` no se extraen como título (bug corregido en esta sesión)

### Bug corregido en esta sesión (curso CLM)

**Problema:** En `LECTURA_2_INGENIERIA_PROMPTS_ELE.md`, la sección `## 1. INTRODUCCIÓN` aparecía a la altura de la línea 18, dentro de la ventana de búsqueda de título (`lines[:20]`). El parser la elegía como título porque buscaba tanto `# ` como `## `, lo que hacía que la sección INTRODUCCIÓN desapareciera del PDF y la numeración empezara en 2.

**Fix aplicado en `generar_pdfs_clm.py`:**
- Ventana de búsqueda: `lines[:20]` → `lines[:15]`
- Criterio: `line.startswith('# ') or line.startswith('## ')` → solo `line.startswith('# ')`

### Web del curso

- URL pública: `https://elcorreveidile.github.io/curso-ia-ele/`
- Repositorio GitHub: `https://github.com/elcorreveidile/curso-ia-ele`
- La web es estática (HTML/CSS/JS puro), no usa framework
- Los archivos `.html` están en la raíz; CSS en `css/`, JS en `js/`

### Pendiente del curso CLM

- [ ] Subir todos los PDFs a Moodle (ver `CHECKLIST_SUBIDA_MOODLE.md`)
- [ ] Verificar que la web funciona correctamente en producción
- [ ] Preparar materiales para las videotutorías (13, 23 y 30 de abril)
- [ ] El cuestionario de diagnóstico usa Formspree — revisar `DOCUMENTACION.md` sección 8 para gestión de respuestas

---

## PRODUCTO 2: Ebook «Prompts que Funcionan» — estado y estructura

### Archivos principales

| Archivo/carpeta | Descripción |
|----------------|-------------|
| `ebook/` | Todo el contenido del ebook en `.md` + PDF final |
| `generar_ebook.py` | Script Python que genera el PDF del ebook (diseño libro, sin branding CLM) |
| `HANDOFF_EBOOK.md` | Handoff detallado solo del ebook (leer para detalles técnicos del generador) |

### Cómo regenerar el PDF del ebook

```bash
python3 generar_ebook.py
```

Genera `ebook/PROMPTS_QUE_FUNCIONAN.pdf` (2,3 MB). Requiere `weasyprint`.

### Estructura del ebook (31 archivos .md)

```
ebook/
├── 00_INTRODUCCION.md
├── parte1/          — Fundamentos (FRAME, iteración, errores, técnicas avanzadas)
├── parte2/          — Por nivel MCER (A1, A2, B1, B2, C1, C2)
├── parte3/          — Por destreza (CL, EE, EO, gramática, vocabulario, cultura, evaluación)
├── parte4/          — Por género textual (narrativa, diálogo, opinión, correo, debate, expositivo)
├── parte5/          — Flujos de trabajo (unidad didáctica, adaptación, curso, feedback)
└── apendices/       — Banco de prompts, plantillas en blanco, glosario
```

### Convenciones del markdown del ebook

| Elemento | Cómo se escribe | Resultado en PDF |
|----------|----------------|-----------------|
| Título del capítulo | `# Título` (primeras 15 líneas, solo `#`) | Cabecera grande azul oscuro |
| Subtítulo | `### Subtítulo` (justo después del título) | Cursiva gris bajo el título |
| Sección numerada | `## Nombre sección` | Número en círculo + texto en negrita |
| Subsección / prompt | `### PROMPT XX-01` | Fondo gris, borde izquierdo azul |
| Bloque de prompt | ` ```...``` ` | Fondo azul claro, monospace |
| Output real de IA | `> texto` | Borde ámbar, fondo crema |
| Salto de página | `\newpage` | Salto de página explícito |
| Separador visual | `---` | Línea horizontal gris |

### Bugs corregidos en esta sesión (ebook)

1. **`>` sueltos aparecían como texto** — dentro de blockquotes con líneas vacías `>` el parser salía del bloque y emitía `>` como párrafo. Fix: el loop de blockquote ahora también acepta líneas que son solo `>` y las ignora.
2. **Salto de página** antes de «Ejemplo de system prompt para un asistente de conversación B2» — añadido `\newpage` en `parte1/04_TECNICAS_AVANZADAS.md`.
3. **Índice automático** — añadida función `build_toc()` en `generar_ebook.py` que genera el índice con partes en negrita y capítulos sangrados. Se inserta tras la página de créditos. **Limitación:** sin números de página (WeasyPrint no los soporta fácilmente en TOC).

### Pendiente del ebook — revisión de contenido

- [ ] Leer el libro completo y comprobar saltos de página incorrectos (añadir `\newpage` donde haga falta en los `.md`)
- [ ] Verificar que no quedan `>` sueltos visibles en el PDF
- [ ] Revisar que el índice muestra los títulos correctos de todos los capítulos
- [ ] Comprobar que las tablas largas no se cortan a mitad de página
- [ ] **Versión en inglés de los prompts** — acordada pero no implementada. Pendiente decidir: ¿bilingüe en el mismo PDF o libro separado en inglés?
- [ ] Revisar outputs reales de IA — son ejemplos generados durante la redacción, verificar que son representativos
- [ ] Números de página en el índice (mejora técnica no trivial)
- [ ] Posible página de separación entre partes (una página completa con solo «Parte I — Fundamentos»)

---

## Scripts Python: resumen técnico

### `generar_pdfs_clm.py` — PDFs del curso CLM

- Lee `.md` de `materiales/`, escribe `.pdf` en `PDFs/` manteniendo la estructura
- Añade header CLM con logo + autor en cada página
- Parser markdown propio (no usa librería externa)
- Extrae título del primer `# ` en las primeras 15 líneas
- Función clave: `markdown_to_html_clm(content, title)`

### `generar_ebook.py` — PDF del ebook

- Lee `.md` de `ebook/parte1/` a `ebook/parte5/` y `ebook/apendices/`, en orden alfabético
- Genera portada (fondo `#1a1a2e`), página de créditos, índice automático
- Sin header CLM — diseño de libro limpio
- Parser markdown propio, mismo núcleo que el del curso pero con CSS diferente
- Funciones clave: `markdown_to_html_book()`, `build_toc()`, `build_ebook()`
- La etiqueta naranja sobre cada capítulo («Parte I — Fundamentos») se asigna en `main()` según la carpeta

**Dependencia compartida:** `weasyprint` (HTML+CSS → PDF)

---

## Git: estado del repositorio

Rama: `main`. Últimos commits relevantes:
- `5b07ffe` — Mejora formatting PDFs: saltos de página y blockquotes (último commit antes del ebook)
- El ebook y sus correcciones de esta sesión **no están commiteados aún**

Archivos modificados sin commitear:
- `generar_pdfs_clm.py` (fix del bug de título)
- `generar_ebook.py` (fix blockquotes + índice)
- `ebook/parte1/04_TECNICAS_AVANZADAS.md` (salto de página)
- Todo el contenido de `ebook/` (nuevo — no existía en el último commit)
- `HANDOFF_EBOOK.md` (nuevo)
- `HANDOFF_PROYECTO_COMPLETO.md` (este archivo)

---

## Decisiones de diseño tomadas (no reabrir sin causa)

- Los PDFs del curso llevan header CLM en todas las páginas
- El ebook no lleva ninguna referencia al CLM ni a la UGR
- Claude como herramienta de referencia principal del ebook, pero multi-herramienta
- El ebook asume que el lector ya conoce las herramientas de IA a nivel básico
- Todos los ajustes de diseño del ebook se dejaron para el final (usuario así lo decidió)
- El ebook incluye outputs reales de IA tras cada prompt (en blockquote ámbar)
- El ebook es solo en español de momento; versión en inglés: pendiente de decidir formato

---

## Cómo continuar — guía rápida para el siguiente agente

**Si la tarea es revisar/corregir el ebook:**
1. Leer `HANDOFF_EBOOK.md` para detalles técnicos del generador
2. Editar los `.md` en `ebook/` directamente
3. Regenerar con `python3 generar_ebook.py`

**Si la tarea es añadir material al curso CLM:**
1. Crear/editar el `.md` en `materiales/modulo-XX/`
2. Regenerar con `python3 generar_pdfs_clm.py`
3. Subir el PDF generado a Moodle (ver `CHECKLIST_SUBIDA_MOODLE.md`)

**Si la tarea es trabajar en la web del curso:**
1. Editar los `.html` en la raíz
2. La web es estática — no hay build step
3. Push al repositorio GitHub para desplegar en GitHub Pages

**Si la tarea es commitear el trabajo pendiente:**
- Stagear los archivos del ebook + cambios en los scripts + handoffs
- Mensaje sugerido: «Añade ebook Prompts que Funcionan completo (31 capítulos) + fix blockquotes + índice automático»
