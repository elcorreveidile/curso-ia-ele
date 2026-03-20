# Expresión e interacción oral
### Preparar actividades de habla para cualquier nivel

\newpage

## EXPRESIÓN ORAL CON IA

La IA no habla: no puede sustituir la interacción oral en el aula. Pero puede diseñar con gran eficacia las actividades que la propician: tarjetas de role-play, guiones de debate, situaciones de negociación, actividades de conversación guiada, materiales de exposición oral. Todo lo que el docente necesita preparar antes de que los alumnos abran la boca puede generarse con un prompt bien construido.

---

\newpage

### PROMPT EO-01 — Role-play con tarjetas de personaje

**Objetivo:** Crear tarjetas de role-play con información asimétrica para generar interacción comunicativa real.

```
Actúa como profesor de ELE especializado en expresión
oral para nivel [NIVEL].

FORMATO: 2 tarjetas de role-play con información asimétrica
(cada personaje sabe cosas que el otro no sabe).

AUDIENCIA: [Grupo]

META: El alumnado será capaz de [función comunicativa]
usando [estructuras y vocabulario específicos] en una
situación de [contexto].

ESPECIFICACIONES:
- Situación: [describir la situación comunicativa]
- Cada tarjeta incluye: quién eres, qué sabes, qué
  quieres conseguir, información que SOLO TÚ tienes
- La información asimétrica obliga a los alumnos a
  comunicarse de verdad para resolver la situación
- Instrucciones en español (máximo 3 líneas por tarjeta)
- Lista de vocabulario útil al pie de cada tarjeta
- Tiempo sugerido para la actividad
```

**Output real (Claude) — Nivel B1, negociación de piso:**

> **TARJETA A — Inquilino/a que busca piso**
>
> *Quién eres:* Buscas un piso de alquiler en el centro de la ciudad. Llevas tres semanas buscando y estás un poco desesperado/a.
>
> *Lo que quieres:* un piso de al menos dos habitaciones, con buena conexión al transporte público y a menos de 800 € al mes. Tienes trabajo estable y puedes pagar dos meses de fianza.
>
> *Información solo para ti:* Tu presupuesto máximo real es 950 €, pero empiezas pidiendo 800 €. Tienes una mascota (un gato pequeño) y no sabes si el propietario lo acepta. Necesitas entrar a vivir en menos de dos semanas.
>
> *Vocabulario útil:* alquiler, fianza, gastos incluidos, comunidad, orientación, metro, ruidoso/tranquilo, negociar, comprometerse
>
> ---
>
> **TARJETA B — Propietario/a del piso**
>
> *Quién eres:* Alquilas un piso de dos habitaciones en el barrio de Malasaña, Madrid. El precio es 950 € al mes (gastos de comunidad incluidos).
>
> *Lo que quieres:* encontrar un inquilino/a responsable, que pague puntualmente y cuide el piso. Prefieres contratos de al menos un año.
>
> *Información solo para ti:* El piso tiene un problema: la calefacción hace ruido por las noches, aunque funciona bien. Puedes bajar el precio a 900 € si el inquilino/a acepta no pets. Tienes prisa por alquilarlo.
>
> *Vocabulario útil:* contrato, garantías, nómina, referencias, mascotas, desperfectos, clausula, mensualidad, negociable
>
> **Tiempo:** 8-10 minutos

---

### PROMPT EO-02 — Debate estructurado con posiciones asignadas

**Objetivo:** Diseñar una actividad de debate donde el alumno debe defender una posición, esté o no de acuerdo con ella.

```
Actúa como profesor de ELE especializado en expresión
oral y debate para nivel [B1/B2/C1].

FORMATO: Instrucciones completas para un debate
estructurado de 20-25 minutos.

AUDIENCIA: [Grupo] de [N] alumnos.

META: El alumnado será capaz de expresar y defender
una posición, rebatir argumentos contrarios y llegar
a una conclusión usando el lenguaje del debate formal.

ESPECIFICACIONES:
- Tema: [tema con dos posiciones claras]
- Estructura: apertura (2'), ronda de argumentos (10'),
  réplicas (5'), conclusiones (3'), valoración (5')
- Para cada grupo: hoja de preparación con la postura
  asignada, 4 argumentos desarrollados y expresiones
  para el debate
- Hoja del moderador con las instrucciones y los turnos
- Ficha de observación para los alumnos que no debaten
  (evalúan a sus compañeros)
```

**Output real (Claude) — Tema: turismo de masas:**

> **Debate: ¿Debe limitarse el turismo en las ciudades históricas?**
>
> **Grupo A — A favor de la limitación:**
> *Argumentos:*
> 1. El turismo masivo destruye el tejido social de los barrios históricos, expulsando a los residentes por la subida del precio de la vivienda.
> 2. Los monumentos y espacios naturales sufren un deterioro irreversible con millones de visitantes al año.
> 3. Los beneficios económicos del turismo no se distribuyen equitativamente entre la población local.
> 4. Existen modelos de turismo sostenible que generan más valor con menos impacto.
>
> **Expresiones para el debate:**
> - Presentar: «Defendemos que...» / «Nuestra postura es clara:...»
> - Rebatir: «Ese argumento no tiene en cuenta...» / «Si bien es cierto que..., no podemos ignorar que...»
> - Insistir: «Volviendo al punto central...» / «No debemos olvidar que...»
>
> **Ficha de observación (para alumnos que escuchan):**
> - ¿El grupo presentó su postura con claridad? Sí / No / Parcialmente
> - ¿Usó ejemplos concretos? ¿Cuáles?
> - ¿Respondió a los argumentos contrarios?
> - ¿Qué expresión del debate te ha parecido más eficaz?

---

### PROMPT EO-03 — Actividad de conversación guiada

**Objetivo:** Crear tarjetas de conversación para actividades de interacción oral espontánea.

```
Actúa como profesor de ELE especializado en conversación
para nivel [NIVEL].

FORMATO: 12 tarjetas de conversación en grupos pequeños
(3-4 personas).

AUDIENCIA: [Grupo]

META: El alumnado participará en conversaciones informales
sobre temas de interés personal usando el vocabulario
y las estructuras del nivel [NIVEL].

ESPECIFICACIONES:
- Tema general: [vida cotidiana, viajes, cultura,
  trabajo, relaciones, tecnología, etc.]
- Cada tarjeta: una pregunta principal + 2 preguntas
  de seguimiento (para que la conversación no se pare)
- Las preguntas progresan de lo más personal/fácil
  a lo más reflexivo/abstracto
- Las tarjetas 1-4: preguntas de experiencia personal
- Las tarjetas 5-8: preguntas de opinión
- Las tarjetas 9-12: preguntas de reflexión o hipótesis
- Instrucción al pie: «Cuando termines, elige tú la
  siguiente tarjeta y haz la pregunta a otro compañero»
```

**Output real (Claude) — Nivel B2, tema: tecnología y vida:**

> **Tarjeta 1 — Experiencia**
> ¿Cuántas horas al día pasas con el móvil? ¿Cuándo usas más el teléfono? ¿Hay momentos en que lo apagas?
>
> **Tarjeta 5 — Opinión**
> ¿Crees que las redes sociales mejoran o empeoran las relaciones personales? ¿Tienes algún ejemplo de tu propia experiencia?
>
> **Tarjeta 9 — Reflexión**
> Si pudieras vivir sin internet durante un mes, ¿lo harías? ¿Qué crees que cambiaría en tu vida? ¿Sería para mejor o para peor?
>
> **Tarjeta 12 — Hipótesis**
> Imagina que la IA puede hacer tu trabajo mejor que tú en los próximos diez años. ¿Qué harías? ¿Cómo te adaptarías?

---

### PROMPT EO-04 — Exposición oral: guión y estructura

**Objetivo:** Crear una guía para preparar y estructurar una exposición oral de 5-7 minutos.

```
Actúa como profesor de ELE especializado en expresión
oral formal para nivel [B2/C1].

FORMATO: Guía de preparación para una exposición oral
con estructura, recursos lingüísticos y consejos.

AUDIENCIA: [Grupo] que debe presentar un tema ante
la clase.

META: El alumnado será capaz de estructurar y presentar
una exposición oral de 5-7 minutos con introducción,
desarrollo y cierre usando marcadores de discurso oral.

ESPECIFICACIONES:
- Tema de la exposición: libre (el alumno elige)
- La guía incluye: estructura en 5 partes (con tiempo
  orientativo para cada parte), recursos lingüísticos
  para cada parte, consejos de comunicación no verbal,
  errores más frecuentes en exposiciones en L2 y cómo
  evitarlos
- Lista de marcadores discursivos orales específicos
  (diferentes de los escritos)
```

**Output real (Claude):**

> **Guía para tu exposición oral en español**
>
> **Estructura (6 minutos):**
>
> **1. Apertura (30'')** — Capta la atención
> *No empieces con «Voy a hablar sobre...». Prueba con:*
> - Una pregunta: «¿Sabíais que...?»
> - Una cifra sorprendente: «Cada año, más de...»
> - Una anécdota breve: «Hace tres semanas, me ocurrió algo que...»
>
> **2. Presentación del tema (30'')** — Di qué vas a contar
> *Recursos:* «Hoy quiero hablaros de...» / «Mi exposición se centra en...» / «Voy a tratar tres puntos: primero..., después..., y finalmente...»
>
> **3. Desarrollo (4')** — El contenido, en partes claras
> *Marcadores para ordenar:*
> - Iniciar: «Para empezar...» / «En primer lugar...»
> - Seguir: «Pasando al segundo punto...» / «Otro aspecto importante es...»
> - Ejemplificar: «Por ejemplo...» / «Un caso concreto es...» / «Imaginad que...»
> - Resumir un punto: «En resumen...» / «Lo esencial aquí es...»
>
> **4. Cierre (30'')** — Concluye con fuerza
> *Recursos:* «Para terminar...» / «En definitiva...» / «Lo que me gustaría que os llevarais es...»
>
> **5. Turno de preguntas (30'')** — Gestiona las preguntas
> *Si no entiendes:* «¿Podrías repetir la pregunta?» / «Si he entendido bien, me preguntas si...»
> *Si no sabes:* «No tengo datos exactos sobre eso, pero...» / «Es una pregunta interesante; mi opinión es...»
>
> **Errores frecuentes a evitar:**
> - Leer en lugar de hablar → usa notas, no el texto completo
> - Hablar demasiado rápido cuando estás nervioso → respira
> - No mirar al público → elige 3 puntos en la sala y rota
> - Empezar con «Bueno... pues... yo...» → practica la apertura hasta que salga sola

---

### PROMPT EO-05 — Actividad de información incompleta

**Objetivo:** Crear una actividad de information gap donde los alumnos comparten información para completar una tarea.

```
Actúa como profesor de ELE especializado en interacción
oral para nivel [A2/B1].

FORMATO: Actividad de información incompleta (information
gap) para dos alumnos.

AUDIENCIA: [Grupo]

META: El alumnado será capaz de pedir y dar información
específica para completar una tarea usando preguntas
y respuestas simples.

ESPECIFICACIONES:
- Tipo de actividad: los dos alumnos tienen el mismo
  cuadro/mapa/horario pero con la mitad de la información
  cada uno; deben hablar (sin enseñarse las tarjetas)
  para completar el cuadro
- Tema: [horarios, mapa de ciudad, programa de eventos,
  menú de restaurante, ficha de personaje, etc.]
- Incluir: tarjeta A con información, tarjeta B con
  información complementaria, cuadro vacío para completar
  y expresiones útiles para pedir y dar información
```

**Output real (Claude) — Nivel A2, programa de actividades:**

> **Actividad: El programa del festival**
>
> *Instrucciones:* Alumno A y Alumno B tienen partes diferentes del programa del festival de verano. Pregúntate para completar tu programa. No puedes ver la tarjeta de tu compañero/a.
>
> **Tarjeta A:**
> | Hora | Escenario Principal | Escenario Pequeño |
> |------|--------------------|--------------------|
> | 18:00 | Concierto de jazz | ??? |
> | 20:00 | ??? | Monólogos cómicos |
> | 22:00 | Flamenco | ??? |
>
> **Tarjeta B:**
> | Hora | Escenario Principal | Escenario Pequeño |
> |------|--------------------|--------------------|
> | 18:00 | ??? | Teatro infantil |
> | 20:00 | Baile latino | ??? |
> | 22:00 | ??? | Música folk |
>
> **Preguntas útiles:**
> ¿Qué hay a las [hora] en el escenario [nombre]?
> ¿A qué hora empieza [actividad]?
> ¿Dónde es el concierto de [tipo]?

---

### PROMPT EO-06 — Simulación de situación real

**Objetivo:** Crear el guión de una simulación de situación comunicativa real para practicar la interacción oral funcional.

```
Actúa como profesor de ELE especializado en lengua
funcional para nivel [NIVEL].

FORMATO: Simulación completa de [situación] con ficha
del alumno, tarjeta del interlocutor y lista de recursos.

AUDIENCIA: [Grupo]

META: El alumnado será capaz de [función comunicativa]
en una situación de [contexto real] usando el registro
y las fórmulas adecuadas.

ESPECIFICACIONES:
- Situación: [hotel, aeropuerto, médico, banco,
  trabajo, reclamación, entrevista, etc.]
- Ficha del alumno: quién es y qué necesita conseguir
- Tarjeta del interlocutor (para el profesor o un compañero):
  quién es, información que tiene, posibles complicaciones
  que puede introducir (para hacer la simulación más real)
- Lista de 10 expresiones funcionales clave para la situación
- Criterios de éxito: ¿cómo sabe el alumno que ha completado
  la tarea con éxito?
```

**Output real (Claude) — Nivel B1, reclamación en hotel:**

> **Simulación: Reclamación en la recepción del hotel**
>
> **Ficha del alumno:**
> Llegas a un hotel con reserva confirmada para esta noche. Cuando llegas, te dicen que tu habitación no está disponible. Quieres: que te den una habitación equivalente o mejor, o que te devuelvan el dinero. Tienes la confirmación de la reserva en el móvil.
>
> **Tarjeta del recepcionista (para el otro alumno o el profesor):**
> Eres el recepcionista. El problema real: cometiste un error al asignar esa habitación a otro cliente. Opciones que puedes ofrecer: habitación superior sin coste adicional, o reembolso completo. Complicación: el cliente está nervioso y habla rápido; a veces tienes que pedir que repita.
>
> **Expresiones clave:**
> - Explicar el problema: «Tengo una reserva a nombre de...» / «Me confirmaron que...»
> - Reclamar: «Esto no es lo que acordé» / «Necesito que solucionen esto»
> - Pedir alternativas: «¿Qué opciones tienen?» / «¿Es posible...?»
> - Agradecer la solución: «De acuerdo, acepto» / «Muy bien, gracias por su ayuda»
>
> **Criterios de éxito:**
> ✓ Explicaste el problema claramente
> ✓ Pediste una solución específica
> ✓ Negociaste hasta obtener una resolución
> ✓ Usaste el registro adecuado (educado pero firme)
