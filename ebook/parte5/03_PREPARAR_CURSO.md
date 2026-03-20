# Flujo 3: Preparar un curso de cero
### Del diagnóstico inicial al programa completo en una sesión de trabajo

\newpage

## CUANDO HAY QUE EMPEZAR DESDE CERO

Llega un grupo nuevo. Tienes el nivel aproximado, algunos datos sobre las necesidades y poco tiempo. Crear un programa de curso coherente, con objetivos secuenciados, selección de contenidos justificada y distribución de unidades, es un trabajo que normalmente cuesta días. Con un flujo de prompts bien diseñados, puede hacerse en una sesión de trabajo: la IA genera el borrador; el docente revisa, ajusta y decide. Este flujo muestra cómo hacerlo paso a paso, desde el diagnóstico hasta el programa detallado.

---

\newpage

### PASO 1 — Cuestionario de diagnóstico de necesidades

Antes de diseñar nada, hay que saber con quién se trabaja. Este prompt genera un cuestionario para recoger datos del grupo.

```
Actúa como especialista en análisis de necesidades
para la enseñanza de ELE.

FORMATO: Cuestionario de diagnóstico de necesidades
en dos partes (para el alumno y para el docente).

AUDIENCIA: [Perfil del grupo: adultos / adolescentes /
profesionales / universitarios, etc.]

META: Recoger la información necesaria para diseñar
un curso de ELE ajustado a las necesidades reales
del grupo: motivaciones, usos de la lengua, puntos
débiles percibidos y expectativas.

ESPECIFICACIONES:
- Parte A (para el alumno, máximo 10 preguntas):
  uso del español fuera del aula, dificultades
  percibidas, motivación principal, objetivos
  concretos, experiencia previa
- Parte B (para el docente, 5 puntos de observación):
  qué observar en las primeras sesiones para
  completar el diagnóstico
- Instrucciones en español sencillo (nivel A2-B1
  para que el cuestionario sea accesible a distintos
  perfiles)
- Formato imprimible: preguntas con espacio para responder
```

**Output real (Claude) — Adultos, contexto general B1:**

> **Cuestionario de diagnóstico — Curso de español**
>
> *Por favor, responde estas preguntas. No hay respuestas correctas o incorrectas. Queremos conocerte mejor para preparar un curso que se adapte a lo que necesitas.*
>
> **1.** ¿Para qué usas o quieres usar el español?
> ☐ Trabajo ☐ Viajes ☐ Familia o amigos ☐ Estudios ☐ Otro: ________
>
> **2.** ¿Dónde usas el español fuera de clase? (Marca todas las que correspondan)
> ☐ En el trabajo ☐ Con amigos ☐ En internet ☐ Viendo películas/series ☐ Casi nunca
>
> **3.** ¿Qué es lo más difícil para ti en español? (Elige 1 o 2)
> ☐ Hablar (me pongo nervioso/a) ☐ Entender cuando hablan rápido ☐ Escribir correctamente
> ☐ La gramática ☐ El vocabulario ☐ El acento / la pronunciación
>
> **4.** ¿Qué quieres ser capaz de hacer en español al final del curso?
> *Escribe 1 o 2 frases:* _______________________________________________
>
> **5.** ¿Qué tipo de actividades te gustan más en clase?
> ☐ Hablar con compañeros ☐ Leer y analizar textos ☐ Ejercicios de gramática
> ☐ Ver vídeos ☐ Juegos y actividades dinámicas ☐ Trabajar solo/a
>
> **6.** ¿Cuánto tiempo puedes dedicar al español fuera de clase cada semana?
> ☐ Menos de 1 hora ☐ 1-2 horas ☐ 3-5 horas ☐ Más de 5 horas
>
> **Parte B — Observación docente (primeras 2 sesiones):**
> 1. ¿Cómo responde el grupo a las actividades orales? (¿Participan espontáneamente o esperan que se les llame?)
> 2. ¿Qué errores gramaticales son sistemáticos? (Tomar nota de los 3 más frecuentes)
> 3. ¿Cuál es el nivel de vocabulario activo real frente al nivel pasivo que parece tener?
> 4. ¿Hay alumnos con necesidades muy distintas al resto del grupo?
> 5. ¿Qué temas o contextos generan más participación y motivación?

---

### PASO 2 — Perfil del grupo y objetivos del curso

Con los datos del diagnóstico (reales o estimados), este prompt genera el perfil del grupo y los objetivos generales del curso.

```
Actúa como diseñador curricular de ELE especializado
en programación de cursos por objetivos comunicativos.

FORMATO: Perfil del grupo + objetivos generales
del curso en formato estructurado.

AUDIENCIA: [Describir el grupo con los datos del
diagnóstico o los datos disponibles]

META: Definir con precisión quiénes son los alumnos,
qué necesitan y qué serán capaces de hacer al
final del curso.

ESPECIFICACIONES:
- Perfil del grupo: nivel, motivaciones principales,
  usos del español, dificultades más frecuentes,
  características del grupo
- 5 objetivos comunicativos del curso (lo que el
  alumno podrá hacer: no «conocerá el subjuntivo»,
  sino «podrá expresar opiniones matizadas en
  una conversación formal»)
- 3 objetivos de actitud o autonomía (cómo el
  alumno se relacionará con la lengua y el aprendizaje
  al final del curso)
- Ajustar al nivel MCER correspondiente

[INTRODUCIR AQUÍ LOS DATOS DEL DIAGNÓSTICO O EL
PERFIL DISPONIBLE]
```

**Output real (Claude) — Grupo de profesionales, B1+:**

> **Perfil del grupo:**
> Adultos de entre 28 y 45 años, profesionales en activo, nivel B1 consolidado. Motivación principal: el trabajo en entornos internacionales donde el español es necesario. Usan el español principalmente por escrito (correo, informes) y en reuniones. Dificultad principal percibida: hablar con fluidez bajo presión de tiempo y expresar matices en reuniones formales.
>
> **Objetivos comunicativos del curso:**
> 1. Participar con seguridad en reuniones de trabajo en español, incluyendo la toma de turno, la defensa de ideas y la negociación.
> 2. Redactar correos, informes y resúmenes ejecutivos con el registro y la estructura apropiados.
> 3. Comprender presentaciones, podcast y vídeos profesionales en distintas variedades del español.
> 4. Expresar opiniones, acuerdos y desacuerdos con matiz en contextos formales.
> 5. Narrar situaciones pasadas y presentar proyectos con coherencia y precisión.
>
> **Objetivos de actitud y autonomía:**
> 1. El alumno desarrollará estrategias para comunicarse eficazmente incluso cuando el vocabulario falla (circunloquio, reformulación, pedir aclaración).
> 2. El alumno ganará confianza para hablar en español sin esperar a «estar seguro», aceptando el error como parte del proceso.
> 3. El alumno identificará recursos para continuar aprendiendo fuera del aula (podcasts, prensa, comunidades de hablantes).

---

### PASO 3 — Programa del curso por unidades

Con el perfil y los objetivos definidos, este prompt genera el programa completo.

```
Actúa como diseñador curricular de ELE especializado
en programación de cursos para [contexto].

FORMATO: Programa de curso con [N] unidades,
estructura detallada por semanas.

AUDIENCIA: [Perfil del grupo — resultado del Paso 2]

META: Crear un programa de curso coherente, con
objetivos comunicativos secuenciados, selección
de contenidos justificada y distribución temporal
realista para [N horas / N semanas].

ESPECIFICACIONES:
- Número de unidades: [N]
- Duración total: [N horas]
- Cada unidad incluye: título, semana(s), objetivo
  comunicativo, contenidos (funcional, gramatical,
  léxico), destreza prioritaria, tarea final
- Secuencia coherente: las unidades progresan
  en complejidad y se apoyan mutuamente
- Unidad 1: siempre arranca con terreno conocido
  para calibrar el grupo y generar confianza
- Última unidad: tarea integradora que usa
  los contenidos de todo el curso
```

**Output real (Claude) — Curso de 40 horas, B1+, español profesional:**

> **Programa: Español para el trabajo — Nivel B1+ (40 horas)**
>
> | Unidad | Semanas | Objetivo | Contenidos | Tarea final |
> |--------|---------|----------|-----------|-------------|
> | **1. Punto de partida** | 1-2 | Presentarse y describir el trabajo propio con precisión | Presente + pasado reciente, léxico profesional, descripción de funciones | Presentación profesional de 3' (oral) |
> | **2. En reunión** | 3-4 | Participar en reuniones: tomar el turno, proponer, valorar | Expresiones para reuniones, acuerdo/desacuerdo formal, condicional de propuesta | Simulación de reunión de equipo |
> | **3. Por escrito** | 5-6 | Redactar correos y notas internas con el registro adecuado | Registro formal/semiformal, estructura del correo, léxico corporativo | Correo de solicitud + correo de respuesta |
> | **4. Informar y reportar** | 7-8 | Presentar información y resultados de forma estructurada | Texto expositivo, marcadores de organización, pasiva refleja | Presentación de datos (oral + diapositiva) |
> | **5. Negociar y convencer** | 9-10 | Defender una postura y llegar a acuerdos en contexto profesional | Argumentación, concesión, condicional compuesto | Role-play de negociación |
> | **6. Tarea integradora** | 11-12 | Usar de forma integrada todo lo trabajado en el curso | Consolidación de todos los contenidos | Proyecto final: presentación de un plan de trabajo + informe escrito |
>
> **Distribución horaria por unidad:** 6 horas por unidad (4 sesiones de 90 min) + 4 horas de evaluación y retroalimentación.

---

### PASO 4 — Planificación detallada de una unidad

Con el programa en la mano, este prompt desglosa una unidad concreta hasta el nivel de sesión.

```
Actúa como diseñador curricular de ELE especializado
en planificación de sesiones para nivel [NIVEL].

FORMATO: Planificación detallada de la Unidad [N]
del programa, con 4 sesiones de 90 minutos.

AUDIENCIA: [Perfil del grupo]

META: Planificar con detalle la secuencia de
actividades de la unidad [N] — «[título]» —
del programa diseñado en el Paso 3.

ESPECIFICACIONES:
- 4 sesiones de 90 minutos
- Cada sesión: objetivo de sesión, actividades
  secuenciadas (con tiempo estimado), materiales
  necesarios, agrupación (individual/pareja/grupo)
- La secuencia respeta el principio PPP
  (presentación, práctica, producción) o el
  enfoque por tareas según se especifique
- La Sesión 4 incluye la tarea final y un momento
  de reflexión sobre el aprendizaje
```

**Output real (Claude) — Unidad 2: «En reunión», B1+:**

> **Sesión 1 — «¿Cómo se dice eso en una reunión?»**
>
> *Objetivo:* el alumno identificará las expresiones propias del español de reuniones y las distinguirá por función comunicativa.
>
> | Tiempo | Actividad | Agrupación | Material |
> |--------|-----------|-----------|---------|
> | 10' | Activación: ¿qué dices en tu lengua cuando quieres tomar el turno en una reunión? | Grupo | — |
> | 20' | Lectura y análisis de transcripción de reunión: identificar expresiones y clasificarlas por función | Parejas | Transcripción |
> | 20' | Presentación del banco de expresiones por categorías (proponer, valorar, rebatir, pedir turno) | Grupo | Ficha de expresiones |
> | 30' | Práctica controlada: completar mini-diálogos de reunión con las expresiones correctas | Individual | Ejercicio |
> | 10' | Puesta en común y cierre | Grupo | — |
>
> **Sesión 2 — «Practicamos: la reunión corta»**
>
> *Objetivo:* el alumno usará las expresiones trabajadas en una reunión simulada breve.
>
> | Tiempo | Actividad | Agrupación | Material |
> |--------|-----------|-----------|---------|
> | 15' | Repaso del banco de expresiones: juego de traducción inversa | Parejas | Ficha |
> | 45' | Simulación de reunión (grupos de 4): decidir el presupuesto para un proyecto | Grupos de 4 | Tarjetas de rol |
> | 20' | Retroalimentación: ¿qué expresiones usaste? ¿Cuáles te faltaron? | Grupo | — |
> | 10' | Ficha de autorregulación: ¿qué necesito practicar más? | Individual | Ficha |

---

### PASO 5 — Generar el material de evaluación del curso

```
Actúa como especialista en evaluación de ELE para
nivel [NIVEL] en contexto [profesional / general /
académico].

FORMATO: Plan de evaluación completo del curso
con instrumentos, criterios y temporización.

AUDIENCIA: [Perfil del grupo]

META: Diseñar un sistema de evaluación coherente
con los objetivos del curso, que incluya evaluación
continua y evaluación final.

ESPECIFICACIONES:
- Evaluación continua: 3 instrumentos para
  recoger evidencias durante el curso (portfolio,
  observación, autoevaluación, tareas de unidad)
- Evaluación final: descripción de la tarea
  integradora + rúbrica con criterios alineados
  con los objetivos del curso
- Peso de cada componente (porcentajes)
- Criterios de progresión al siguiente nivel
```

**Output real (Claude) — Curso B1+, español profesional:**

> **Sistema de evaluación del curso**
>
> | Componente | Instrumento | Peso | Cuándo |
> |-----------|------------|------|-------|
> | Participación y proceso | Observación docente con ficha de seguimiento | 20% | Continuo |
> | Tareas de unidad | Tarea final de cada unidad (oral o escrita) | 40% | Al final de cada unidad |
> | Autoevaluación | Portfolio del alumno: reflexión al final de cada unidad | 10% | Al final de cada unidad |
> | Proyecto final | Presentación + informe escrito (Unidad 6) | 30% | Semanas 11-12 |
>
> **Criterios del proyecto final:**
> - Claridad y precisión en la presentación oral (4')
> - Adecuación del registro escrito en el informe (300 palabras)
> - Uso del vocabulario profesional trabajado
> - Coherencia y cohesión del informe
> - Respuesta a preguntas en la presentación oral
>
> **Criterios de progresión al siguiente nivel (B2):**
> El alumno demuestra capacidad de participar en interacciones profesionales complejas con fluidez suficiente, producir textos escritos con registro formal consistente y comprender discurso profesional sin apoyo visual o textual.

---

### RESUMEN DEL FLUJO

> **5 prompts encadenados → programa de curso completo:**
>
> | Paso | Prompt | Output |
> |------|--------|--------|
> | 1 | Diagnóstico | Cuestionario para el alumno + lista de observación docente |
> | 2 | Perfil y objetivos | Descripción del grupo + 5 objetivos comunicativos |
> | 3 | Programa | Tabla de unidades con objetivos, contenidos y tareas |
> | 4 | Planificación de sesión | Actividades detalladas con tiempos y materiales |
> | 5 | Evaluación | Plan de evaluación con instrumentos, criterios y pesos |
>
> **El papel del docente en este flujo:** la IA genera el borrador; el docente aporta el conocimiento del grupo real, toma las decisiones pedagógicas y ajusta lo que la IA no puede saber. El flujo funciona porque el docente formula las preguntas correctas y revisa el resultado con criterio profesional.
