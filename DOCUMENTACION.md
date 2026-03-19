# Documentación del proyecto · IA para la enseñanza de ELE
**Centro de Lenguas Modernas · Universidad de Granada**  
Última actualización: marzo 2026

---

## Índice

1. [Visión general del proyecto](#1-visión-general-del-proyecto)
2. [Lo que hemos creado](#2-lo-que-hemos-creado)
3. [Estructura del repositorio](#3-estructura-del-repositorio)
4. [Cómo trabajar con el proyecto](#4-cómo-trabajar-con-el-proyecto)
5. [Instrucciones para completar los materiales](#5-instrucciones-para-completar-los-materiales)
6. [Sistema de diagnóstico y perfiles](#6-sistema-de-diagnóstico-y-perfiles)
7. [Guía para trasladar los contenidos a Moodle](#7-guía-para-trasladar-los-contenidos-a-moodle)
8. [Formulario Formspree y gestión de respuestas](#8-formulario-formspree-y-gestión-de-respuestas)
9. [Mantenimiento y actualizaciones futuras](#9-mantenimiento-y-actualizaciones-futuras)

---

## 1. Visión general del proyecto

Este proyecto comprende **dos productos digitales distintos pero interconectados**:

### A) Curso de formación docente
**«IA para la enseñanza de ELE: planificación de clases y creación de materiales»**

- **Destinatarios:** Docentes de ELE del CLM (aproximadamente 41 profesores)
- **Duración:** 20 horas en 4 semanas
- **Modalidad:** Semipresencial — Moodle + 3 videotutorías en directo
- **Fechas (primera edición):** Abril 2027
- **Videotutorías:** 13, 23 y 30 de abril · 15:00–16:30 h (GMT+2)

### B) Sistema de diagnóstico de IA para todo el CLM
**Diagnóstico general para los ~110 trabajadores del CLM**

- Cubre 8 áreas de trabajo: docencia ELE, lenguas modernas, administración, informática, diseño, biblioteca, conserjería y dirección
- Genera un perfil personalizado (4 niveles) y una ruta de aprendizaje adaptada al área

---

## 2. Lo que hemos creado

### 2.1 Documentos PDF

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| `curso_ia_ele.pdf` | Guía completa del curso: descripción, módulos, calendario, metodología y evaluación | ✅ Completo |
| `cuestionario_diagnostico_ELE.pdf` | Versión imprimible del cuestionario diagnóstico (52 preguntas, 5 secciones) | ✅ Completo |

### 2.2 Web del curso

URL pública: `https://elcorreveidile.github.io/curso-ia-ele/`  
Repositorio: `https://github.com/elcorreveidile/curso-ia-ele`

| Página | URL | Contenido |
|--------|-----|-----------|
| Landing | `index.html` | Página de inicio con dos botones: diagnóstico general CLM y cuestionario del curso |
| Descripción | `descripcion.html` | Descripción, finalidad, objetivos, destinatarios, **¿para quién es este curso?** |
| Programa | `programa.html` | Los 4 módulos con contenidos y actividades |
| Calendario | `calendario.html` | Fechas de videotutorías y datos del curso |
| Metodología | `metodologia.html` | Metodología y criterios de evaluación |
| Diagnóstico CLM | `diagnostico-clm.html` | Cuestionario general para los 110 trabajadores del CLM (35 preguntas, 5 bloques) |
| Cuestionario curso | `cuestionario-curso.html` | Cuestionario específico para docentes ELE inscritos (29 preguntas, 4 bloques) |

### 2.3 Módulos del curso

| Módulo | Título | Actividad |
|--------|--------|-----------|
| I | IA con criterio: ética, equidad y prompts eficaces | Mi declaración de uso ético de la IA |
| II | Tu asistente de ELE: chatbots a tu medida | Crea tu primer mini asistente ELE |
| III | Planifica con IA: clases alineadas con el MCER | Genera y evalúa un plan de clase con IA |
| IV | Crea sin límites: recursos multimodales con IA gratuita | Kit de recursos multimodales |

### 2.4 Sistema de diagnóstico

**Diagnóstico general CLM** — mide 3 dimensiones:
- Conocimiento objetivo de IA (50% del peso) — preguntas con respuesta correcta
- Competencia digital general (25%)
- Uso de herramientas digitales en el trabajo (25%)

**Cuestionario del curso** — mide 3 dimensiones docentes:
- Práctica docente en ELE (40%)
- Actitud e integración de IA en ELE (30%)
- Uso real de IA en docencia (30%)

---

## 3. Estructura del repositorio

```
curso-ia-ele/
│
├── index.html                  ← Landing: página de elección entre los dos tests
├── descripcion.html            ← Descripción del curso + ¿para quién es?
├── programa.html               ← Los 4 módulos con contenidos y actividades
├── calendario.html             ← Videotutorías y datos prácticos
├── metodologia.html            ← Metodología y evaluación
│
├── diagnostico-clm.html        ← Diagnóstico IA general (110 trabajadores CLM)
├── cuestionario-curso.html     ← Cuestionario específico docentes ELE inscritos
│
├── css/
│   └── style.css               ← Sistema de diseño completo (variables, componentes)
│
├── js/
│   └── main.js                 ← Motor de diagnóstico + lógica de secciones + envío
│
├── README.md                   ← Instrucciones básicas de instalación y uso
└── DOCUMENTACION.md            ← Este archivo
```

### Variables CSS clave (identidad visual CLM)

```css
--clm-red:      #C8102E;   /* Rojo corporativo CLM — color principal */
--clm-red-dark: #9E0B22;   /* Rojo oscuro para hovers */
--blue:         #1A3A6B;   /* Azul UGR — color secundario */
--ink:          #141820;   /* Negro cálido — textos */
--canvas:       #F8F7F4;   /* Blanco roto — fondos */
--font-display: 'Syne';    /* Fuente de títulos */
--font-body:    'DM Sans'; /* Fuente de texto */
```

---

## 4. Cómo trabajar con el proyecto

### Requisitos previos
- Git instalado
- Editor de código (VS Code recomendado)
- Claude Code (opcional pero recomendado para ediciones asistidas)

### Clonar el proyecto en local

```bash
git clone https://github.com/elcorreveidile/curso-ia-ele.git
cd "curso-ia-ele"
```

### Ver los cambios en local

Abre `index.html` directamente en el navegador, o usa una extensión como **Live Server** en VS Code.

### Subir cambios a GitHub

```bash
git add -A
git commit -m "Descripción del cambio"
git push origin main
```

Los cambios se publican automáticamente en GitHub Pages en 1-2 minutos.

### Trabajar con Claude Code

```bash
cd "ruta/al/proyecto"
claude
```

Ejemplos de instrucciones útiles para Claude Code:
- `"Añade una sección de FAQ al final de descripcion.html"`
- `"Cambia las fechas del curso de abril a junio en todas las páginas"`
- `"Añade un quinto módulo sobre evaluación del aprendizaje con IA"`
- `"Traduce toda la web al inglés"`
- `"Añade un nuevo perfil de diagnóstico para coordinadores académicos"`

---

## 5. Instrucciones para completar los materiales

### 5.1 Lo que falta por crear

Estos son los materiales del curso que quedan por desarrollar para poder impartirlo en Moodle:

#### Módulo I · IA con criterio: ética, equidad y prompts eficaces

- [ ] **Vídeo de presentación** del módulo (5-10 min) — grabar con OBS o Loom
- [ ] **Lectura 1:** Seleccionar o elaborar texto sobre ética de la IA en educación (2-3 páginas)
- [ ] **Lectura 2:** Guía de ingeniería de prompts básica adaptada a ELE (crear desde cero)
- [ ] **Caso real 1** para la actividad: ejemplo positivo de uso de IA en ELE
- [ ] **Caso real 2** para la actividad: ejemplo problemático de uso de IA en ELE
- [ ] **Rúbrica de evaluación** de la declaración de uso ético
- [ ] **Prompt de ejemplo** para cada género textual (texto narrativo, diálogo, ejercicio de gramática, texto periodístico)

#### Módulo II · Tu asistente de ELE: chatbots a tu medida

- [ ] **Vídeo tutorial** — cómo crear un GPT personalizado o usar el system prompt en Claude (10-15 min)
- [ ] **Plantilla de system prompt** base para asistente de ELE (por niveles A1-C2)
- [ ] **Guía de herramientas:** comparativa de ChatGPT, Claude, Gemini y Copilot para docentes
- [ ] **Rúbrica de evaluación** del mini asistente creado
- [ ] **Ejemplos de asistentes** ya configurados (al menos 2 niveles distintos)

#### Módulo III · Planifica con IA: clases alineadas con el MCER

- [ ] **Prompt plantilla** para generación de planes de clase (el más importante del curso)
- [ ] **Plantilla de plan de clase** en formato Word/PDF para que el alumnado la rellene
- [ ] **Vídeo demostrativo** — generación de un plan de clase completo en tiempo real (15-20 min)
- [ ] **Banco de descriptores MCER/PCIC** en formato prompt-friendly (para incluir en instrucciones)
- [ ] **Rúbrica de evaluación** del plan de clase generado y revisado
- [ ] **Tutorial de mini app** — cómo crear un generador de planes de clase con GPT Builder o similar

#### Módulo IV · Crea sin límites: recursos multimodales con IA gratuita

- [ ] **Guía de herramientas gratuitas** para cada tipo de recurso:
  - Imágenes: DALL-E (vía ChatGPT), Bing Image Creator, Adobe Firefly
  - Audio: ElevenLabs (plan gratuito), Murf.ai
  - Mapas mentales: ChatGPT + Coggle, Miro con IA
- [ ] **Vídeo tutorial por tipo de recurso** (3 vídeos cortos de 5-8 min cada uno)
- [ ] **Criterios de calidad** para evaluar recursos generados con IA
- [ ] **Rúbrica de evaluación** del kit de recursos multimodales

#### Materiales transversales

- [ ] **Vídeo de bienvenida** al curso (2-3 min) — presentación de la formadora y del enfoque
- [ ] **Guía de inicio en Moodle** para el participante (cómo navegar, entregar tareas, participar en foros)
- [ ] **Glosario de términos de IA** para docentes de ELE (PDF descargable)
- [ ] **Cuestionario de satisfacción** al final del curso

### 5.2 Criterios de diseño para los materiales

Al crear los materiales, ten en cuenta:

1. **Siempre con ejemplos reales de ELE** — nunca ejemplos genéricos. Usa niveles concretos (B2), perfiles de alumnado reales (universitarios estadounidenses, adultos europeos en programa Study Abroad) y temas culturales auténticos.

2. **Formato vídeo: máximo 15 minutos** — si necesitas más tiempo, divide en dos vídeos. Los participantes trabajan de forma asincrónica y los vídeos largos se abandonan.

3. **Cada actividad debe producir algo reutilizable** — al terminar el curso, el participante debe tener un banco de prompts, asistentes configurados y materiales listos para usar en sus clases reales.

4. **Incluye siempre la revisión crítica** — ningún material generado por IA debe presentarse sin que el participante practique evaluarlo y mejorarlo. La IA como borrador, el docente como editor.

5. **Herramientas siempre gratuitas** — todos los recursos del curso deben poder completarse con planes gratuitos de las herramientas.

---

## 6. Sistema de diagnóstico y perfiles

### 6.1 Niveles del diagnóstico general CLM

| Nivel | Nombre | Puntuación | Perfil típico en el CLM |
|-------|--------|------------|------------------------|
| 1 | 🌱 Descubridor/a | 0–27 | Conserjería, biblioteca, parte de administración |
| 2 | 🚀 Explorador/a activo/a | 28–51 | Docentes con uso digital básico, administración con tareas digitales |
| 3 | ⚡ Practicante | 52–71 | Docentes con uso habitual de herramientas digitales |
| 4 | 🏆 Referente digital | 72–100 | Informática, diseño web, programación, parte de dirección |

### 6.2 Perfiles del cuestionario del curso (docentes ELE)

| Perfil | Descripción |
|--------|-------------|
| 🌱 Docente en transición | Práctica docente sólida, IA completamente nueva |
| 🚀 Explorador/a | Ha probado la IA pero sin método ni criterio |
| ⚡ Integrador/a activo/a | Uso regular, quiere sistematizar y profundizar |
| 🏆 Docente innovador/a | Dominio avanzado, candidato/a a rol de liderazgo interno |

### 6.3 Cómo modificar el algoritmo de diagnóstico

El motor está en `js/main.js`. Para ajustar los umbrales de nivel:

```javascript
// Línea ~100 en main.js — ajusta estos valores según los resultados reales
let nivel;
if (total < 28)      nivel = 1;  // Descubridor/a
else if (total < 52) nivel = 2;  // Explorador/a activo/a
else if (total < 72) nivel = 3;  // Practicante
else                 nivel = 4;  // Referente digital
```

Para añadir o modificar rutas de aprendizaje por área, edita el objeto `RUTAS_AREA` y la función `getRuta()` en `main.js`.

### 6.4 Cómo añadir un nuevo perfil de área

1. Añadir la opción en el HTML del formulario (`diagnostico-clm.html`):
```html
<label class="area-option">
  <input type="radio" name="area_trabajo" value="nueva-area">
  <span class="area-option__icon">🔑</span>
  <span class="area-option__info">
    <span class="area-option__label">Nombre del área</span>
    <span class="area-option__desc">Descripción breve</span>
  </span>
</label>
```

2. Añadir la entrada en `RUTAS_AREA` en `main.js`:
```javascript
'nueva-area': {
  label: 'Nombre del área',
  icono: '🔑',
  contexto: 'Descripción del contexto específico de este área en el CLM.'
}
```

3. Añadir rutas específicas en la función `getRuta()` si se quieren rutas distintas a las base.

---

## 7. Guía para trasladar los contenidos a Moodle

### 7.1 Estructura recomendada del curso en Moodle

```
📁 CURSO: IA para la enseñanza de ELE
│
├── 🏠 Sección 0 — Bienvenida y orientación
│   ├── 📹 Vídeo de bienvenida de la formadora
│   ├── 📄 Guía de inicio: cómo navegar por el curso
│   ├── 📋 Cuestionario diagnóstico inicial (integrado o enlace a la web)
│   ├── 💬 Foro de presentación: "Cuéntanos quién eres y qué esperas del curso"
│   └── 📅 Calendario de videotutorías (con enlace a la sala Zoom/Meet)
│
├── 📁 Módulo I — IA con criterio: ética, equidad y prompts eficaces
│   ├── 📹 Vídeo de introducción al módulo (10 min)
│   ├── 📄 Lectura 1: Ética de la IA en educación
│   ├── 📄 Lectura 2: Guía de ingeniería de prompts para ELE
│   ├── 🔗 Recursos complementarios (enlaces curados)
│   ├── 💬 Foro del módulo: "Mi reflexión sobre el uso ético de la IA"
│   └── 📝 Tarea: Mi declaración de uso ético de la IA
│
├── 📁 Módulo II — Tu asistente de ELE: chatbots a tu medida
│   ├── 📹 Tutorial: Cómo crear un mini asistente con ChatGPT o Claude
│   ├── 📄 Guía comparativa de herramientas (ChatGPT, Claude, Gemini)
│   ├── 📄 Plantillas de system prompt por nivel MCER
│   ├── 💬 Foro del módulo: "Comparte tu asistente y prueba el de un compañero"
│   └── 📝 Tarea: Entrega tu mini asistente ELE
│
├── 📁 Módulo III — Planifica con IA: clases alineadas con el MCER
│   ├── 📹 Demostración: Generación de un plan de clase completo en tiempo real
│   ├── 📄 Prompt plantilla para planes de clase (el recurso central del módulo)
│   ├── 📄 Banco de descriptores MCER/PCIC en formato prompt-friendly
│   ├── 💬 Foro del módulo: "Tu plan de clase generado con IA"
│   └── 📝 Tarea: Plan de clase revisado + reflexión sobre el proceso
│
├── 📁 Módulo IV — Crea sin límites: recursos multimodales con IA gratuita
│   ├── 📹 Tutorial: Generación de imágenes para ELE
│   ├── 📹 Tutorial: Creación de audios y diálogos con IA
│   ├── 📹 Tutorial: Mapas mentales de vocabulario con IA
│   ├── 📄 Guía de herramientas gratuitas (con capturas actualizadas)
│   ├── 💬 Foro final: "Presenta tu kit de recursos multimodales"
│   └── 📝 Tarea final: Kit de recursos multimodales
│
└── 🏆 Sección final — Cierre y certificación
    ├── 📋 Cuestionario de satisfacción del curso
    ├── 💬 Foro de cierre: "¿Qué me llevo del curso?"
    └── 🏅 Información sobre el certificado de aprovechamiento
```

### 7.2 Configuración del curso en Moodle

#### Ajustes generales del curso

1. Ve a **Administración del curso → Editar ajustes**
2. Configura:
   - **Nombre completo:** `IA para la enseñanza de ELE: planificación de clases y creación de materiales`
   - **Nombre corto:** `IA-ELE-2027`
   - **Categoría:** Formación del profesorado
   - **Fecha de inicio:** 07/04/2027
   - **Fecha de fin:** 04/05/2027
   - **Formato del curso:** Formato de temas
   - **Número de secciones:** 6 (bienvenida + 4 módulos + cierre)

#### Ajustes de matrícula

- **Método de matrícula:** Manual (la formadora inscribe a los participantes) o mediante clave de matriculación
- **Clave de matriculación:** Crear una clave sencilla y comunicarla a los inscritos

### 7.3 Crear cada tipo de recurso en Moodle

#### Añadir un vídeo

**Opción A — Vídeo subido a YouTube/Drive (recomendada):**
1. Activa el modo edición
2. Haz clic en **+ Añadir una actividad o recurso**
3. Selecciona **Etiqueta** o **Página**
4. Inserta el vídeo con el botón de insertar media o con código embed de YouTube:
```html
<iframe width="100%" height="450" 
  src="https://www.youtube.com/embed/TU_ID_DE_VIDEO" 
  frameborder="0" allowfullscreen>
</iframe>
```

**Opción B — Archivo de vídeo directo:**
1. Selecciona **Archivo**
2. Sube el vídeo (máximo recomendado: 500 MB)
3. Configura que se abra en línea, no como descarga

#### Añadir una lectura o documento

1. Selecciona **Archivo** y sube el PDF, o
2. Selecciona **Página** para crear contenido directamente en Moodle con el editor

#### Añadir un foro

1. Selecciona **Foro**
2. Configura:
   - **Tipo:** Foro para uso general (para reflexión abierta) o Foro P y R (para discusión estructurada)
   - **Suscripción:** Suscripción automática (para que todos reciban notificaciones)
   - **Evaluación:** Sí, con una rúbrica sencilla (Participación reflexiva: 0/1/2)

#### Añadir una tarea

1. Selecciona **Tarea**
2. Configura:
   - **Nombre:** Tarea Módulo I — Mi declaración de uso ético
   - **Descripción:** Instrucciones detalladas de la actividad (copia del texto de la web)
   - **Tipo de entrega:** Texto en línea + Archivos adjuntos
   - **Número máximo de archivos:** 3
   - **Fecha límite de entrega:** (ajustar según el calendario)
   - **Calificación:** Escala sencilla (No entregado / Entregado / Entregado con reflexión)

#### Integrar el cuestionario diagnóstico

**Opción A — Enlace a la web (más sencillo):**
1. Añade un **URL** en la sección de bienvenida
2. URL: `https://elcorreveidile.github.io/curso-ia-ele/cuestionario-curso.html`
3. Configura para que **se abra en una nueva ventana**

**Opción B — Cuestionario nativo de Moodle (más integrado):**
1. Selecciona **Cuestionario**
2. Crea las preguntas manualmente en el **Banco de preguntas**
3. Ventaja: las respuestas quedan guardadas en Moodle y puedes analizarlas fácilmente

### 7.4 Configurar las videotutorías en Moodle

#### Con BigBlueButton (integrado en Moodle UGR)

1. Añade la actividad **BigBlueButton**
2. Configura:
   - **Nombre:** Videotutoría 1 — 13 de abril de 2027
   - **Descripción:** Presentación del curso, primeras reflexiones éticas e introducción a los prompts
   - **Fecha y hora de apertura:** 13/04/2027 14:45 h (15 min antes del inicio)
   - **Duración:** 90 minutos
   - **Grabación:** Activar grabación automática
3. Repite para las sesiones 2 (23 abril) y 3 (30 abril)

#### Con Zoom o Google Meet (alternativa externa)

1. Crea la reunión en Zoom/Meet con las 3 fechas programadas
2. En Moodle, añade un **URL** con el enlace a cada sesión
3. Sube las grabaciones a Google Drive o YouTube (privado) tras cada sesión
4. Añade el enlace a la grabación en el mismo bloque de la sesión, después de celebrarse

### 7.5 Configurar la evaluación y el certificado

#### Libro de calificaciones

Ve a **Calificaciones → Configuración del libro de calificaciones** y crea:

| Elemento | Peso | Descripción |
|----------|------|-------------|
| Asistencia videotutorías | 30% | Mínimo 2 de 3 (requisito obligatorio) |
| Participación en foros | 20% | Al menos 1 entrada reflexiva por módulo |
| Tarea Módulo I | 12,5% | Declaración de uso ético |
| Tarea Módulo II | 12,5% | Mini asistente ELE |
| Tarea Módulo III | 12,5% | Plan de clase revisado |
| Tarea Módulo IV | 12,5% | Kit de recursos multimodales |

#### Certificado de aprovechamiento

El CLM gestiona los certificados a través de su sistema interno. Para generar el listado de participantes que han superado el curso:

1. Ve a **Calificaciones → Exportar → Hoja de cálculo Excel**
2. Filtra los participantes con nota ≥ 5 (apto) Y asistencia a ≥ 2 videotutorías
3. Envía el listado al servicio de gestión de certificados del CLM

### 7.6 Accesibilidad y buenas prácticas en Moodle

- **Nombra todos los archivos en minúsculas y sin espacios:** `guia_prompts_ele.pdf` ✓ — `Guía Prompts ELE.pdf` ✗
- **Incluye texto alternativo en todas las imágenes**
- **Formatos de vídeo:** siempre con subtítulos (genera subtítulos automáticos en YouTube o con Whisper)
- **Tamaño de archivos:** PDFs < 5 MB, imágenes < 2 MB
- **Nombres de secciones claros:** el participante debe saber dónde está con solo leer el título

---

## 8. Formulario Formspree y gestión de respuestas

### Configuración actual

- **Formulario Formspree:** `https://formspree.io/f/mjgalypd`
- **Correo de destino:** `benitezl@go.ugr.es`
- **Límite plan gratuito:** 50 envíos/mes

### Qué llega al correo con cada envío

**Diagnóstico general CLM:**
- Área de trabajo del participante
- Nivel obtenido (1-4 + nombre del perfil)
- Puntuaciones desglosadas: conocimiento objetivo, competencia digital, herramientas digitales
- Respuestas abiertas sobre dudas y expectativas

**Cuestionario del curso:**
- Nombre y correo del participante (si los ha indicado)
- Perfil docente obtenido
- Puntuaciones: práctica docente ELE, actitud ante IA, uso real de IA
- Expectativas concretas del curso
- Contexto docente especial indicado

### Cómo ampliar el límite

Si superas los 50 envíos/mes (muy probable con 110 trabajadores), actualiza a **Formspree Plus** (~10 €/mes, envíos ilimitados) o migra a **Google Forms** con las mismas preguntas y exporta a Google Sheets.

### Migración a Google Forms (alternativa gratuita sin límites)

1. Crea un formulario en `forms.google.com` con las mismas preguntas
2. Activa la respuesta automática por correo en **Respuestas → Obtener notificaciones por correo**
3. En `diagnostico-clm.html` y `cuestionario-curso.html`, sustituye el `action` del formulario:
```html
<!-- Antes (Formspree) -->
<form action="https://formspree.io/f/mjgalypd">

<!-- Después (Google Forms — usa el action de tu formulario) -->
<form action="https://docs.google.com/forms/d/e/TU_ID/formResponse">
```
> ⚠️ Con Google Forms pierdes la página de resultados personalizada. La alternativa es mantener Formspree solo para el envío y el resultado se muestra igualmente en el navegador.

---

## 9. Mantenimiento y actualizaciones futuras

### Tareas antes de cada edición del curso

- [ ] Actualizar las fechas de las videotutorías en `calendario.html`, `index.html` (cards del hero) y en los PDFs
- [ ] Verificar que el formulario Formspree sigue activo y el correo de destino no ha cambiado
- [ ] Comprobar que los enlaces de GitHub Pages funcionan correctamente
- [ ] Actualizar el año en el footer de todas las páginas

### Cómo cambiar las fechas del curso

Las fechas aparecen en varios sitios. Busca y reemplaza `abril 2027` en:
- `index.html`
- `calendario.html`
- `cuestionario-curso.html`
- `descripcion.html`
- Footer de todas las páginas

### Ideas para versiones futuras

- **Versión en inglés** de la web para el alumnado extranjero del CLM
- **Dashboard de resultados** que agregue y visualice las respuestas del diagnóstico CLM
- **Módulo V** sobre evaluación del aprendizaje con IA y feedback automatizado
- **App móvil** del cuestionario con notificaciones de resultado
- **Integración con Moodle** del cuestionario diagnóstico (via plugin o iframe)
- **Certificación digital verificable** con código QR para los participantes

### Personas de contacto

| Rol | Persona | Contacto |
|-----|---------|----------|
| Formadora y coordinadora del curso | Javier Benítez Láinez | benitezl@go.ugr.es |
| Subdirección Académica de Español | Sonia A. Sánchez Molero / María Estévez Funes | subdireccionhisp@clm.ugr.es |
| Soporte técnico Moodle CLM | Equipo de informática | angel.espigares@clm.ugr.es |
| Web y diseño | Equipo de diseño gráfico | francisco.arco@fyg.ugr.es |

---

*Documento generado con Claude (Anthropic) · Proyecto IA para la enseñanza de ELE · CLM-UGR · 2026*
