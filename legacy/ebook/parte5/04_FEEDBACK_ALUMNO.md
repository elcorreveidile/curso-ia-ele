# Flujo 4: Generar feedback individualizado
### Cómo usar la IA para dar retroalimentación personalizada a escala

\newpage

## EL PROBLEMA DEL FEEDBACK A ESCALA

Dar feedback de calidad es lo más valioso que puede hacer un docente. También es lo que más tiempo cuesta. Un grupo de 20 alumnos que entrega una producción escrita representa 20 textos que hay que leer, evaluar y comentar de forma individual. Con clases de varios grupos, el volumen puede ser inmanejable. El resultado suele ser feedback genérico, tardío o escaso.

La IA no da feedback: el docente da feedback. Pero la IA puede hacer el trabajo preparatorio que permite al docente dar más feedback, más específico, en menos tiempo. Este flujo muestra cómo.

---

\newpage

### PASO 1 — Identificar patrones de error en un grupo

Antes de dar feedback individual, conviene entender qué está fallando en el grupo. Este prompt analiza un conjunto de producciones y detecta los errores más frecuentes.

```
Actúa como especialista en análisis de errores
y didáctica de ELE para nivel [NIVEL].

FORMATO: Informe de análisis de errores frecuentes
a partir de producciones del grupo.

AUDIENCIA: Docente que quiere entender los patrones
de error de su grupo para planificar la respuesta
pedagógica.

META: Identificar los 5 errores más frecuentes en
las producciones del grupo, clasificarlos por tipo
y proponer una respuesta pedagógica para cada uno.

ESPECIFICACIONES:
- Analiza las producciones que se pegan a continuación
- Clasifica los errores en: gramatical, léxico,
  registro, cohesión, ortografía/puntuación
- Para cada tipo de error: descripción, ejemplo
  del texto, versión correcta y posible causa
  (interferencia de L1, generalización de regla,
  desconocimiento del punto)
- Propuesta pedagógica: qué trabajar en clase
  para abordar cada error de forma comunicativa
  (no solo corregir, sino prevenir)

[PEGAR AQUÍ LAS PRODUCCIONES DEL GRUPO
O UN RESUMEN DE LOS ERRORES OBSERVADOS]
```

**Output real (Claude) — Análisis de errores en correos B1:**

> **Informe de análisis de errores — Tarea: correo formal, B1**
>
> **Error 1 — Mezcla de tuteo y ustedeo**
> *Frecuencia:* 12 de 18 textos
> *Ejemplo:* «Estimado señor García: te escribo para informarte de que...»
> *Corrección:* «Estimado señor García: le escribo para informarle de que...»
> *Causa:* el alumno conoce la fórmula de apertura formal pero no mantiene la coherencia del tratamiento en el desarrollo.
> *Respuesta pedagógica:* actividad de detección de inconsistencias de registro en correos con errores intencionados; tabla de coherencia de tratamiento (si abres con «estimado», el resto del correo usa usted).
>
> **Error 2 — «Como» causal al inicio de frase sin inversión**
> *Frecuencia:* 8 de 18 textos
> *Ejemplo:* «Como no recibí respuesta, por eso le escribo de nuevo.»
> *Corrección:* «Como no recibí respuesta, le escribo de nuevo.» (o: «Le escribo de nuevo porque no recibí respuesta.»)
> *Causa:* interferencia de estructura de L1 o calco de construcción con «ya que... por eso».
> *Respuesta pedagógica:* par mínimo de frases correctas e incorrectas para que el alumno detecte el problema; regla explícita: «como» causal al inicio no admite «por eso» en la segunda cláusula.
>
> **Error 3 — Léxico de apertura informal en correo formal**
> *Frecuencia:* 7 de 18 textos
> *Ejemplo:* «Hola, soy Kenji y te escribo porque...» (en correo a desconocido)
> *Corrección:* «Me pongo en contacto con usted para...» / «Le escribo en relación con...»
> *Causa:* transferencia del modelo del correo informal al formal.
> *Respuesta pedagógica:* trabajo explícito con gradiente de formalidad (los 5 prompts del capítulo CO).

---

### PASO 2 — Generar feedback escrito individualizado

Con el texto del alumno, este prompt produce un comentario de feedback equilibrado y accionable.

```
Actúa como profesor de ELE especializado en
corrección formativa para nivel [NIVEL].

FORMATO: Comentario de feedback en 3 secciones
para la producción escrita de un alumno.

AUDIENCIA: Alumno/a nivel [NIVEL].

META: El feedback ayudará al alumno a comprender
qué ha hecho bien, qué puede mejorar y cuál es
su próximo objetivo concreto.

ESPECIFICACIONES:
- Sección 1 (Lo que funciona): 2-3 aspectos
  concretos que el alumno ha hecho bien, con
  cita del texto original
- Sección 2 (Para mejorar): máximo 3 errores
  o aspectos de mejora, priorizados por impacto
  comunicativo, con versión correcta y breve
  explicación
- Sección 3 (Tu próximo objetivo): 1 solo punto
  de mejora para la próxima producción
- Tono: directo, honesto, orientado al futuro
- No corregir todo: priorizar los errores de
  mayor impacto comunicativo

TEXTO DEL ALUMNO:
[PEGAR AQUÍ]
```

**Output real (Claude) — Texto de alumno B1:**

*(Texto del alumno:)* «Estimado señor director: me llamo Ana y soy alumna de tu escuela desde hace dos años. Te escribo porque quiero informarte que el aula 3 tiene problemas con la calefacción desde hace dos semanas. Muchos alumnos tienen frío y es difícil concentrarse. Espero que puedas solucionar este problema pronto. Muchas gracias. Un saludo, Ana»

> **Sección 1 — Lo que funciona:**
> - Estructuras el correo con claridad: presentación, descripción del problema, petición y cierre. Eso es exactamente lo que necesita un correo de reclamación.
> - La descripción del problema es específica y con consecuencias: «desde hace dos semanas» y «es difícil concentrarse» dan peso real a la queja. Bien.
> - El cierre con agradecimiento («Muchas gracias») es apropiado y cortés.
>
> **Sección 2 — Para mejorar:**
>
> 1. **Registro inconsistente: tuteas al director.** Has escrito «te escribo», «puedas solucionar» y «tu escuela». En un correo al director, la norma es el ustedeo: *«le escribo», «pueda solucionar», «su escuela»*. Es el error que más afecta a la imagen profesional del correo.
>
> 2. **La apertura puede ser más formal.** «Me llamo Ana» funciona en conversación, pero en un correo formal es mejor: *«Me dirijo a usted para comunicarle...»* o *«Le escribo en relación con un problema...»*. Reserva las presentaciones personales para cuando la otra persona no sabe quién eres; en este caso, el director ya te conoce.
>
> 3. **La petición es vaga.** «Espero que puedas solucionar este problema pronto» no es una petición concreta. Mejor: *«Le agradecería que enviara a un técnico esta semana para revisar la instalación»* o *«Le solicito que se revise el sistema antes del próximo lunes»*.
>
> **Sección 3 — Tu próximo objetivo:**
> En tu próximo correo formal, antes de enviarlo, revisa todo el texto y asegúrate de que el tratamiento (tú/usted) es coherente de principio a fin. Elige uno y mantenlo.

---

### PASO 3 — Generar feedback de producción oral

El feedback oral tiene sus propias dificultades: hay que evaluar fluidez, pronunciación, interacción y no solo corrección. Este prompt produce comentarios útiles para la expresión oral.

```
Actúa como profesor de ELE especializado en
evaluación de la expresión oral para nivel [NIVEL].

FORMATO: Comentario de feedback oral en 4 dimensiones.

AUDIENCIA: Alumno/a nivel [NIVEL] que ha realizado
[tipo de tarea oral: presentación / debate /
role-play / conversación].

META: El feedback orientará al alumno sobre sus
fortalezas y áreas de mejora en la expresión oral,
con criterios específicos y objetivos accionables.

ESPECIFICACIONES:
- Dimensión 1: fluidez y naturalidad (¿fluye la
  comunicación o hay pausas que bloquean?)
- Dimensión 2: corrección (errores que afectan
  a la comprensión vs. errores menores)
- Dimensión 3: vocabulario (¿variado, preciso,
  adecuado al registro?)
- Dimensión 4: interacción (¿gestiona bien los
  turnos, reacciona a su interlocutor, usa
  estrategias de comunicación?)
- Para cada dimensión: valoración + ejemplo
  concreto + sugerencia de mejora
- Tono: positivo pero honesto

DESCRIPCIÓN DE LO OBSERVADO:
[Describir brevemente lo que el alumno hizo:
duración, tipo de tarea, aspectos observados]
```

**Output real (Claude) — Presentación oral, B2:**

> *(Descripción proporcionada al modelo: alumna de B2, presentación de 5 min sobre turismo sostenible, habla con pausas largas, buen vocabulario, evita el contacto visual, hace errores en el subjuntivo pero se recupera)*
>
> **Dimensión 1 — Fluidez:**
> Tu mensaje llega con claridad y el tema está bien estructurado. Las pausas que haces cuando buscas la palabra exacta son largas: a veces dan la impresión de que has perdido el hilo, aunque en realidad solo estás buscando el término. *Sugerencia:* practica usar «marcadores de tiempo»: «a ver...», «es decir...», «me refiero a...» mientras piensas. Funcionan como puentes y dan menos sensación de bloqueo que el silencio.
>
> **Dimensión 2 — Corrección:**
> El error más frecuente fue en el subjuntivo: dijiste «espero que el turismo cambia» en lugar de «espero que cambie». Lo corregiste tú sola en una ocasión, lo que muestra que tienes interiorizada la regla; el reto es aplicarla en tiempo real. No es un error que bloquee la comunicación, pero en B2 ya debería ser más automático. *Sugerencia:* practica oralmente con frases de «espero que / quiero que / es importante que» fuera de clase, hasta que salga sin pensar.
>
> **Dimensión 3 — Vocabulario:**
> Muy buen uso del vocabulario específico del tema: «huella de carbono», «capacidad de carga», «turismo de proximidad». Eso demuestra preparación y amplitud léxica. En algún momento recurriste a palabras muy generales («cosa», «hacer») cuando podías haber usado términos más precisos.
>
> **Dimensión 4 — Interacción:**
> La presentación fue monológica, lo que es lo esperado. Sin embargo, en el turno de preguntas, respondiste de forma muy directa sin gestionar el turno: cuando no entendiste una pregunta, te lanzaste a responder. *Sugerencia:* practica pedir aclaración: «¿Te refieres a...?» o «Si he entendido bien, me preguntas si...» antes de responder. Da tiempo a pensar y demuestra escucha activa.

---

### PASO 4 — Generar un plan de mejora personalizado

Para alumnos que necesitan un plan más estructurado, este prompt genera un itinerario de mejora individual.

```
Actúa como tutor de ELE especializado en aprendizaje
autónomo para nivel [NIVEL].

FORMATO: Plan de mejora individualizado para un
alumno con un perfil específico.

AUDIENCIA: Alumno/a con este perfil: [describir
nivel, puntos fuertes, dificultades principales,
disponibilidad de tiempo, objetivos]

META: El plan orientará al alumno sobre qué trabajar
fuera del aula, con recursos concretos, actividades
específicas y una secuencia temporal realista.

ESPECIFICACIONES:
- Diagnóstico en 3 líneas: qué está bien, qué
  hay que trabajar, cuál es el objetivo próximo
- Plan de 4 semanas: 2-3 actividades por semana,
  con tiempo estimado y recursos específicos
  (tipos de recursos, no URLs)
- Diferencia entre práctica pasiva (escuchar,
  leer) y práctica activa (escribir, hablar)
- Consejo final: 1 hábito que puede marcar
  la diferencia para este perfil específico
```

**Output real (Claude) — Alumno B1 con dificultad en producción oral:**

> **Diagnóstico:**
> Tus competencias receptivas (lectura y comprensión auditiva) son sólidas para el nivel. Tu vocabulario pasivo es amplio. El cuello de botella está en la producción oral: tienes los recursos pero no los activas rápido cuando hablas. El objetivo de las próximas cuatro semanas es automatizar lo que ya sabes.
>
> **Plan de 4 semanas:**
>
> *Semana 1 — Habla contigo mismo:*
> - 5 min al día: grábate en voz alta describiendo qué has hecho ese día en pasado. No te corrijas mientras hablas. Solo habla.
> - 15 min, 3 veces: escucha un podcast en español de nivel B1 (sin transcripción). Después, resume oralmente en 2 minutos lo que has entendido.
>
> *Semana 2 — Práctica controlada:*
> - 10 min al día: elige 5 expresiones del banco de expresiones de tu curso y crea 2 frases con cada una, en voz alta.
> - 20 min, 2 veces: busca un compañero de intercambio lingüístico (Tandem, HelloTalk) y mantén una conversación de 15 minutos. El objetivo no es no cometer errores: es no parar.
>
> *Semana 3 — Producción extendida:*
> - 10 min al día: grábate hablando durante 2 minutos sobre un tema que te interese. Escúchate: ¿qué palabras repites? ¿Dónde te bloqueas?
> - 30 min, 1 vez: prepara una mini-presentación de 3 minutos sobre algo que hayas leído o visto en español. Preséntala en clase o a tu compañero de intercambio.
>
> *Semana 4 — Evaluación:*
> - Compara la grabación de la semana 1 con la de la semana 4. ¿Qué ha mejorado?
> - Elige tu próximo objetivo: ¿qué quieres mejorar en las próximas cuatro semanas?
>
> **El hábito que más te puede ayudar:**
> Habla en español cuando estés solo. En el coche, en casa, en la ducha. No importa si nadie te escucha. Lo que necesitas no es más gramática: es más tiempo de boca en movimiento.

---

### RESUMEN DEL FLUJO

> **4 prompts para un sistema de feedback escalable:**
>
> | Paso | Prompt | Output | Tiempo del docente |
> |------|--------|--------|-------------------|
> | 1 | Análisis de errores del grupo | Informe de patrones + respuesta pedagógica | 20 min (revisar y ajustar) |
> | 2 | Feedback escrito individual | Comentario personalizado por texto | 5-10 min por alumno (revisar) |
> | 3 | Feedback oral | Comentario en 4 dimensiones | 10 min por alumno (revisar) |
> | 4 | Plan de mejora | Itinerario personalizado de 4 semanas | 15 min por alumno (ajustar) |
>
> **El flujo no elimina el juicio docente:** la IA genera el borrador del feedback a partir de la descripción o el texto del alumno. El docente revisa, ajusta el tono y añade lo que la IA no puede saber: la historia del alumno, su motivación, el contexto del aula. El resultado es feedback de mayor calidad en menos tiempo, no feedback sin docente.
