# GUÍA DE IMPLEMENTACIÓN EN MOODLE
### Cómo trasladar todos los contenidos del curso a la plataforma Moodle

---

## 📋 ÍNDICE

1. [Estructura del curso en Moodle](#1-estructura)
2. [Configuración del curso](#2-configuracion)
3. [Creación de secciones y recursos](#3-creacion-recursos)
4. [Configuración de foros](#4-foros)
5. [Configuración de tareas](#5-tareas)
6. [Videotutorías en directo](#6-videotutorias)
7. [Evaluación y calificaciones](#7-evaluacion)
8. [Certificados](#8-certificados)

---

## 1. ESTRUCTURA DEL CURSO EN MOODLE

### Estructura recomendada (6 secciones)

```
📁 CURSO: IA para la enseñanza de ELE (20 horas, 4 semanas)
│
├── 🏠 Sección 0: Bienvenida y orientación
│   ├── 📹 Vídeo de bienvenida (2-3 min)
│   ├── 📄 Esta guía de inicio
│   ├── 📋 Cuestionario diagnóstico
│   ├── 💬 Foro de presentación
│   └── 📅 Calendario del curso
│
├── 📁 Módulo I: IA con criterio
│   ├── 📹 Vídeo presentación (5-10 min)
│   ├── 📄 Lectura 1: Ética de la IA en Educación ELE
│   ├── 📄 Lectura 2: Ingeniería de Prompts para ELE
│   ├── 📄 Casos reales (positivo + problemático)
│   ├── 💬 Foro Módulo I
│   └── 📝 Tarea: Mi declaración de uso ético
│
├── 📁 Módulo II: Tu asistente de ELE
│   ├── 📹 Vídeo tutorial (10-15 min)
│   ├── 📄 Guía comparativa herramientas
│   ├── 📄 Plantillas system prompt (A1-C2)
│   ├── 💬 Foro Módulo II
│   └── 📝 Tarea: Crea tu primer mini asistente ELE
│
├── 📁 Módulo III: Planifica con IA
│   ├── 📹 Vídeo demostrativo (15-20 min)
│   ├── 📄 Banco descriptores MCER/PCIC
│   ├── 📄 Tutorial mini app generador planes
│   ├── 💬 Foro Módulo III
│   └── 📝 Tarea: Genera y evalúa un plan de clase
│
├── 📁 Módulo IV: Crea sin límites
│   ├── 📹 Vídeo 1: Generación de imágenes (5-8 min)
│   ├── 📹 Vídeo 2: Creación de audios (5-8 min)
│   ├── 📹 Vídeo 3: Mapas mentales (5-8 min)
│   ├── 📄 Guía herramientas gratuitas
│   ├── 📄 Criterios de calidad
│   ├── 💬 Foro Módulo IV
│   └── 📝 Tarea: Kit de recursos multimodales
│
└── 🏆 Sección final: Cierre
    ├── 📋 Cuestionario de satisfacción
    ├── 💬 Foro de cierre
    └── 🏅 Información sobre certificado
```

---

## 2. CONFIGURACIÓN DEL CURSO

### 2.1 Ajustes generales

1. Ve a **Administración del curso → Editar ajustes**
2. Configura:

```
Nombre completo: IA para la enseñanza de ELE: planificación de clases y creación de materiales
Nombre corto: IA-ELE-2026
Categoría: Formación del profesorado
Fecha de inicio: 07/04/2026
Fecha de fin: 04/05/2026
Formato del curso: Formato de temas
Número de secciones: 6
```

### 2.2 Ajustes de apariencia

```
Forzar idioma: Español
Número de anuncios: 0
Mostrar informe de actividades: No
Mostrar lista de participantes: No
```

---

## 3. CREACIÓN DE SECCIONES Y RECURSOS

### 3.1 Sección 0: Bienvenida y orientación

**Vídeo de bienvenida:**
- Tipo: **URL** o **Etiqueta** con video incrustado
- Nombre: Vídeo de bienvenida
- URL: [Enlace al video en Vimeo/YouTube]
- Descripción: "Conoce a la Formador y descubre qué aprenderás en este curso"

**Esta guía:**
- Tipo: **Página** o **Archivo** (PDF)
- Nombre: Guía de inicio en Moodle
- Contenido: [Texto de la guía]

**Cuestionario diagnóstico:**
- Tipo: **Cuestionario** o **URL** (si se usa form externo)
- Nombre: Cuestionario diagnóstico
- Si es URL: https://elcorreveidile.github.io/curso-ia-ele/cuestionario-curso.html
- Configuración: Abrir en nueva ventana

**Foro de presentación:**
- Tipo: **Foro**
- Nombre: ¿Quién eres y qué esperas del curso?
- Tipo de foro: Foro para uso general
- Descripción: "Preséntate brevemente: nombre, institución, niveles que enseñas, y qué esperas aprender"
- Calificación: Escala cualitativa (No presentado / Presentado)
- Suscripción: Automática

**Calendario:**
- Tipo: **Calendario** o **Etiqueta** con fechas
- Fechas importantes:
  - 7 abril: Inicio del curso
  - 13 abril: Videotutoría 1
  - 23 abril: Videotutoría 2
  - 30 abril: Videotutoría 3
  - 4 mayo: Fin del curso

### 3.2 Módulos I-IV: Estructura repetida

Para cada módulo, seguir esta estructura:

**Contenido teórico:**
- 📹 Vídeo (URL o Etiqueta)
- 📄 Lectura(s) (Archivo PDF)
- 📄 Recursos adicionales (Archivo PDF)

**Interacción:**
- 💬 Foro del módulo (Foro para uso general)

**Evaluación:**
- 📝 Tarea (Tarea con entrega de archivos)

---

## 4. CONFIGURACIÓN DE FOROS

### 4.1 Configuración recomendada

Para cada foro del módulo:

```
Nombre de foro: Foro Módulo I: Ética y prompts eficaces
Tipo de foro: Foro para uso general
Descripción: [Instrucciones específicas del módulo]

Foro adjunto: No
Suscripción: Automática
Rastreo de lectura: No
Evaluable: Sí
Tipo de calificación: Escala cualitativa

Escala de calificación:
- No participado: 0 puntos
- Participación mínima: 1 punto (1 entrada reflexiva)
- Participación satisfactoria: 2 puntos (1 entrada + 2 respuestas)
- Participación excelente: 3 puntos (1 entrada + 3+ respuestas con calidad)

Máxima calificación: 3
```

### 4.2 Instrucciones para el alumnado

Incluir en la descripción del foro:

```
📋 INSTRUCCIONES:

1. Publica tu entrada reflexiva (150-200 palabras)
2. Lee las entradas de al menos 3 compañeros/as
3. Responde a al menos 2 compañeros/as (50-100 palabras cada respuesta)

💬 TEMAS DEL MÓDULO:
- [Temas específicos del módulo]

📅 FECHA LÍMITE: [Indicar fecha]

💡 CRITERIOS DE CALIDAD:
- Conecta con tu experiencia docente real
- Plantea preguntas o dudas genuinas
- Responde de forma respetuosa y constructiva
```

---

## 5. CONFIGURACIÓN DE TAREAS

### 5.1 Configuración general

Para cada tarea de módulo:

```
Nombre de tarea: Tarea Módulo I: Mi declaración de uso ético
Descripción: [Instrucciones completas de la actividad]

Tipo de actividad: Envío de archivo
Entregas enviadas: 1

Fecha de entrega: [Indicar fecha y hora]
Fecha límite de corte: [30 min después de fecha límite]

Tipos de respuesta:
  - Archivo enviado: Sí
  - Texto en línea: Sí
  - Comentarios: Sí

Archivos máximo: 3
Tamaño máximo: 10 MB

Calificación: Escala cualitativa o numérica según rúbrica
```

### 5.2 Instrucciones de entrega

Incluir en la descripción:

```
📝 QUÉ DEBES ENTREGAR:

1. Tu declaración de uso ético (2-4 páginas, PDF)

2. Documentación de iteraciones (si aplica)

3. Reflexión sobre el proceso (1-2 páginas)

📋 REQUISITOS:
- Formato PDF
- Nombre del archivo: [Apellido]_DeclaracionEtica_M1.pdf
- Extensión: 2-4 páginas
- Fuente: 11-12 puntos, interlineado 1.5

📅 FECHA LÍMITE: [Indicar fecha y hora]

💾 ANTES DE ENTREGAR:
[ ] Revisé que cumplí todos los criterios de la rúbrica
[ ] Verifiqué que el archivo es PDF
[ ] El nombre del archivo sigue el formato correcto
[ ] Guardé una copia para mí

📊 RÚBRICA:
Ver rúbrica de evaluación en [enlace]
```

---

## 6. VIDEOTUTORÍAS EN DIRECTO

### 6.1 Con BigBlueButton (integrado en Moodle UGR)

**Crear sesión:**
1. Añadir actividad → **BigBlueButtonBN**
2. Configurar:

```
Nombre: Videotutoría 1 - Módulos I y II
Descripción: "Presentación del curso, reflexión ética y prompts básicos"

Fecha y hora de apertura: 13/04/2026 14:45 h
Duración: 90 minutos (15 min antes del inicio)

Grabación de la sesión: Sí
Mostrar grabaciones a los estudiantes: Sí

Participantes: Todos los participantes del curso
```

### 6.2 Con Zoom o Google Meet (alternativa externa)

**Crear sesión:**
1. Crear reunión en Zoom o Google Meet con 3 fechas programadas
2. En Moodle, añadir actividad → **URL**
3. Configurar:

```
Nombre: Videotutoría 1 - 13 abril 2026
URL: [Enlace Zoom/Meet]
Descripción: "Sesión 1: Módulos I y II

📅 Fecha: 13 de abril 2026
⏰ Hora: 15:00-16:30 (GMT+2)

Contenido:
- Presentación del curso
- Reflexión ética sobre uso de IA
- Prompts básicos para ELE
- Dudas y preguntas

Después de la sesión, la grabación estará disponible 24h después en esta misma sección."
```

---

## 7. EVALUACIÓN Y CALIFICACIONES

### 7.1 Libro de calificaciones

Ve a **Calificaciones → Configuración del libro de calificaciones**

Crear categorías y elementos:

```
CALIFICACIÓN FINAL DEL CURSO (100 puntos)
│
├── Asistencia videotutorías (30 puntos)
│   └── Mínimo 2 de 3 sesiones obligatorio para certificado
│
├── Participación en foros (20 puntos)
│   ├── Foro presentación: 3 puntos
│   ├── Foro Módulo I: 3 puntos
│   ├── Foro Módulo II: 3 puntos
│   ├── Foro Módulo III: 3 puntos
│   └── Foro Módulo IV: 3 puntos
│
├── Tarea Módulo I (12.5 puntos)
│
├── Tarea Módulo II (12.5 puntos)
│
├── Tarea Módulo III (12.5 puntos)
│
└── Tarea Módulo IV (12.5 puntos)
```

### 7.2 Configurar pesos

```
Asistencia: 30% (requerido para certificado)
Participación foros: 20%
Tarea Módulo I: 12.5%
Tarea Módulo II: 12.5%
Tarea Módulo III: 12.5%
Tarea Módulo IV: 12.5%

Total: 100%
```

---

## 8. CERTIFICADOS

### 8.1 Requisitos para certificado

```
✅ ASISTENCIA: Mínimo 2 de 3 videotutorías
✅ PARTICIPACIÓN: Mínimo 60 puntos en foros (de 60 totales)
✅ TAREAS: Mínimo 50 puntos en tareas (de 50 totales)
✅ CUESTIONARIO: Completar cuestionario de satisfacción

CALIFICACIÓN APROBADO: ≥ 60 puntos
CALIFICACIÓN SOBRESALIENTE: ≥ 90 puntos
```

### 8.2 Generación de certificados

**Opción A: Certificado simple (PDF)**
- Crear plantilla en Canva o similar
- Generar PDFs para participantes aprobados
- Enviar por correo o subir a Moodle

**Opción B: Certificado con plugin Moodle**
- Usar plugin "Custom Certificate" en Moodle
- Configurar con datos del CLM-UGR
- Generación automática para aprobados

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Preparación (Semana antes del curso)
- [ ] Crear curso en Moodle
- [ ] Configurar ajustes generales
- [ ] Crear las 6 secciones
- [ ] Preparar videos para subir
- [ ] Convertir documentos a PDF
- [ ] Configurar foros
- [ ] Configurar tareas
- [ ] Configurar videotutorías

### Fase 2: Primera semana
- [ ] Abrir curso a alumnado
- [ ] Dar la bienvenida en foro de presentación
- [ ] Enviar recordatorio de videotutoría 1
- [ ] Monitorizar foros y tareas

### Fase 3: Durante el curso
- [ ] Moderar foros diariamente
- [ ] Calificar tareas dentro de 7 días
- [ ] Enviar grabaciones de videotutorías
- [ ] Resolver dudas técnicas

### Fase 4: Final del curso
- [ ] Calificar todas las tareas
- [ ] Verificar asistencias
- [ ] Enviar cuestionario de satisfacción
- [ ] Generar certificados
- [ ] Cerrar el curso

---

**Guía creada para el curso "IA para la enseñanza de ELE" - CLM UGR 2026**
**Versión:** 1.0 | **Fecha:** Marzo 2026
