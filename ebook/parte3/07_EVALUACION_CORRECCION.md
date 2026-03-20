# Evaluación y corrección
### Crear rúbricas, feedback y herramientas de evaluación formativa

\newpage

## EVALUACIÓN Y CORRECCIÓN CON IA

La evaluación es uno de los aspectos más costosos en tiempo para el docente de ELE: corregir producción escrita, preparar rúbricas, dar feedback individualizado, diseñar pruebas. La IA puede asumir una parte significativa de ese trabajo sin sustituir el juicio del docente. Los prompts de esta sección producen rúbricas, herramientas de autoevaluación, modelos de feedback escrito y pruebas de evaluación. El docente revisa, adapta y decide: la IA hace el trabajo preparatorio.

---

\newpage

### PROMPT EV-01 — Rúbrica analítica para producción escrita

**Objetivo:** Crear una rúbrica detallada y calibrada para evaluar textos escritos por nivel y tipo de tarea.

```
Actúa como especialista en evaluación de ELE y
diseño de rúbricas para nivel [NIVEL].

FORMATO: Rúbrica analítica con 5 criterios y 4
niveles de desempeño.

AUDIENCIA: [Grupo] que ha realizado la tarea:
[describir la tarea de escritura]

META: La rúbrica permitirá evaluar de forma coherente
y transparente la producción escrita del alumnado,
comunicar expectativas con claridad y proporcionar
feedback específico sobre cada criterio.

ESPECIFICACIONES:
- Criterios: adecuación al género y registro,
  coherencia y cohesión, corrección gramatical,
  riqueza y precisión léxica, cumplimiento de
  la tarea (contenido)
- 4 niveles: Excelente (4), Competente (3),
  En desarrollo (2), Insuficiente (1)
- Cada celda: descripción concreta del desempeño
  en ese nivel (no solo adjetivos)
- Ponderación opcional: indicar si algún criterio
  tiene más peso
- Versión simplificada para autoevaluación del alumno
  (mismos criterios, lenguaje accesible, primera persona)
```

**Output real (Claude) — Correo formal, B1:**

> **Rúbrica: Correo formal de reclamación (B1)**
>
> | Criterio | Excelente (4) | Competente (3) | En desarrollo (2) | Insuficiente (1) |
> |----------|--------------|----------------|-------------------|-----------------|
> | **Adecuación al género y registro** | El texto cumple todas las convenciones del correo formal: saludo apropiado, despedida formal, tono consistentemente neutro o formal, estructura clara. | Cumple la mayoría de convenciones. Algún desliz de registro (tuteo puntual, expresión coloquial) que no interrumpe la comunicación. | El texto tiene forma de correo pero el registro es inconsistente: mezcla fórmulas formales e informales de forma notoria. | El texto no respeta las convenciones del género: ausencia de fórmulas de cortesía, tuteo generalizado, ausencia de estructura. |
> | **Coherencia y cohesión** | Las ideas están bien organizadas en párrafos con función clara. Los conectores son variados y precisos. No hay saltos lógicos. | La organización es clara aunque algún párrafo mezcla ideas o falta un conector en momentos puntuales. | La organización es difícil de seguir. Uso escaso o incorrecto de conectores. Las ideas aparecen sin orden claro. | El texto es un bloque sin estructura. Las ideas no están relacionadas entre sí de forma coherente. |
> | **Corrección gramatical** | Las estructuras del nivel B1 se usan con corrección. Los errores son mínimos y no afectan a la comprensión. | Algunos errores gramaticales, pero no sistemáticos. Las estructuras principales del nivel se usan correctamente. | Errores frecuentes que a veces dificultan la comprensión. El alumno intenta estructuras del nivel pero con errores recurrentes. | Errores sistemáticos que dificultan seriamente la comprensión. |
> | **Riqueza léxica** | Vocabulario variado y preciso. El alumno usa sinónimos y evita repeticiones. Léxico apropiado al contexto de reclamación. | Vocabulario suficiente. Algunas repeticiones o palabras comodín, pero el mensaje es claro. | Vocabulario limitado con repeticiones frecuentes. Algunas palabras usadas con imprecisión. | Vocabulario muy básico que impide expresar matices. Uso frecuente de palabras de la L1 o aproximaciones. |
> | **Cumplimiento de la tarea** | El correo presenta el problema con claridad, incluye los datos necesarios, pide una solución concreta y da todos los detalles pedidos en la tarea. | Cumple los puntos principales de la tarea aunque omite algún detalle secundario. | Cumple solo parte de la tarea. Falta información importante o el propósito comunicativo no queda claro. | El texto no cumple los objetivos de la tarea. |
>
> **Autoevaluación (versión alumno):**
> 1. ¿He usado un saludo y una despedida formales?
> 2. ¿Mis ideas están organizadas en párrafos con un orden lógico?
> 3. ¿He revisado los verbos y los tiempos que más me cuestan?
> 4. ¿He intentado no repetir las mismas palabras?
> 5. ¿He incluido toda la información que pedía la tarea?

---

### PROMPT EV-02 — Feedback escrito personalizado

**Objetivo:** Crear un modelo de feedback escrito equilibrado, específico y accionable sobre una producción del alumno.

```
Actúa como profesor de ELE especializado en corrección
formativa para nivel [NIVEL].

FORMATO: Comentario de feedback escrito en 3 secciones.

AUDIENCIA: [Alumno/a específico/a o perfil de alumno]

META: El feedback ayudará al alumno a comprender
qué ha hecho bien, qué puede mejorar y cómo hacerlo
concretamente, sin desanimarle ni abrumarlo con
demasiadas correcciones.

ESPECIFICACIONES:
- Sección 1 (Lo que funciona): 2-3 aspectos
  concretos que el alumno ha hecho bien, con cita
  del texto original
- Sección 2 (Para mejorar): máximo 3 aspectos
  de mejora priorizados por impacto comunicativo
  (no por frecuencia de error), con explicación
  breve y reformulación correcta
- Sección 3 (Tu próximo paso): 1 solo objetivo
  concreto para la próxima producción
- Tono: alentador pero honesto; no dar falsas
  impresiones sobre un texto con problemas graves
- Texto del alumno a evaluar: [pegar aquí el texto]
```

**Output real (Claude) — Texto de alumno B1, correo informal:**

*(Texto del alumno:)* «Hola Sara! Como estás? Yo estoy bien. El fin de semana pasé muy bien. Fui a una fiesta en la casa de mi amigo. La fiesta era muy divertida y hay mucha gente. Comí muchas cosas ricas y bailé toda la noche. Espero que tú también pasaste bien tu fin de semana. Hasta pronto!»

> **Sección 1 — Lo que funciona:**
> - Usas el pretérito indefinido correctamente en la mayoría de los verbos: «fui», «comí», «bailé». Eso muestra que tienes controlado el paradigma regular.
> - El correo tiene una estructura coherente: saludo, contenido, pregunta de vuelta, despedida. Eso es exactamente lo que se espera en un correo informal.
> - La expresión «espero que tú también» muestra que intentas ir más allá del vocabulario básico.
>
> **Sección 2 — Para mejorar:**
>
> 1. **Mezcla de tiempos: indefinido e imperfecto.** Escribes «La fiesta era muy divertida y hay mucha gente». En una narración, usamos el imperfecto para describir el contexto («era divertida», «había mucha gente»), no el presente. Quedaría: *«La fiesta era muy divertida y había mucha gente.»*
>
> 2. **Signos de puntuación en español.** En español, los signos de exclamación e interrogación van al principio y al final: *«¡Hola, Sara! ¿Cómo estás?»* No es un error grave, pero en un correo informal mejora mucho la presentación.
>
> 3. **Verbos de emoción: «pasarlo bien».** La expresión correcta es «lo pasé muy bien» (no «pasé muy bien»). El pronombre «lo» es obligatorio en esta construcción.
>
> **Sección 3 — Tu próximo objetivo:**
> En tu próximo correo, concéntrate en un solo aspecto: cada vez que describes algo del pasado, pregúntate «¿es una acción (indefinido) o una descripción del contexto (imperfecto)?». Si lo tienes claro antes de escribir, los tiempos saldrán solos.

---

### PROMPT EV-03 — Prueba de evaluación por destrezas

**Objetivo:** Crear una prueba de evaluación completa para una unidad o bloque de contenidos.

```
Actúa como especialista en evaluación de ELE para
nivel [NIVEL].

FORMATO: Prueba de evaluación completa con 4 partes
(comprensión lectora, gramática y léxico, expresión
escrita, expresión oral).

AUDIENCIA: [Grupo] que ha trabajado los contenidos:
[listar los contenidos de la unidad o bloque]

META: La prueba evaluará de forma equilibrada las
competencias trabajadas, con ítems variados que
van más allá del reconocimiento y exigen producción
y uso real de la lengua.

ESPECIFICACIONES:
- Parte 1 (Comprensión lectora, 20 min): texto
  auténtico adaptado de 200-250 palabras + 5 preguntas
  de comprensión (verdadero/falso con justificación
  + 2 preguntas abiertas breves)
- Parte 2 (Gramática y léxico, 15 min): 3 ejercicios
  breves (completar, elegir, transformar) sobre
  los contenidos trabajados; evitar ejercicios
  de reconocimiento puro
- Parte 3 (Expresión escrita, 25 min): tarea de
  escritura de 120-150 palabras con instrucciones
  claras y criterios de evaluación al pie
- Parte 4 (Expresión oral, 10 min por pareja):
  tarjeta de tarea oral para dos alumnos
- Solucionario completo con criterios de corrección
```

**Output real (Claude) — Unidad sobre viajes y pasado, B1:**

> **PRUEBA DE EVALUACIÓN — Unidad 4: Viajes y experiencias**
>
> **Parte 1 — Comprensión lectora (20 min)**
>
> *Lee el texto y responde:*
>
> «El Camino de Santiago no es solo una ruta turística. Es una experiencia que transforma a quien lo hace. Durante ocho días caminé entre veinticinco y treinta kilómetros diarios. Al principio me dolían los pies y pensaba en abandonar. Luego, poco a poco, el paisaje, los encuentros con otros peregrinos y el silencio de los bosques gallegos me fueron cambiando. Llegué a Santiago con ampollas en los pies y algo diferente dentro. No sé exactamente qué. Pero sé que algo cambió.»
>
> *Preguntas:*
> 1. El autor pensó en abandonar el camino. ¿Verdadero o falso? Cita el texto.
> 2. ¿Qué tres cosas cambiaron la actitud del autor durante el camino?
> 3. ¿Cómo describe el autor su llegada a Santiago? Escribe dos detalles.
>
> **Parte 2 — Gramática y léxico (15 min)**
>
> *Elige la forma correcta y explica por qué:*
> 1. Cuando _______ (llegué / llegaba) al aeropuerto, mi vuelo ya _______ (salió / había salido).
> 2. De pequeño, todos los veranos _______ (fui / iba) a la playa con mis abuelos.
> 3. Ayer _______ (estuve / estaba) muy cansado porque no _______ (dormí / dormía) bien la noche anterior.
>
> **Parte 3 — Expresión escrita (25 min)**
>
> *Escribe un texto (120-150 palabras):* Cuéntale a un amigo una experiencia de viaje que hayas tenido. Explica adónde fuiste, qué hiciste y qué recuerdas especialmente de ese viaje. Usa el pretérito indefinido y el imperfecto correctamente.
>
> *Criterios:* ✓ Contenido completo ✓ Uso correcto de tiempos del pasado ✓ Cohesión y organización ✓ Léxico variado
>
> **Parte 4 — Expresión oral (10 min)**
>
> *Tarjeta para los dos alumnos:*
> Sois dos amigos que se encuentran después de las vacaciones. Uno/a ha hecho un viaje increíble; el/la otro/a tuvo unas vacaciones muy tranquilas en casa. Contad vuestras experiencias, haced preguntas y comparad cómo fue el verano de cada uno.

---

### PROMPT EV-04 — Autocorrección guiada para el alumno

**Objetivo:** Crear una secuencia de autocorrección que enseñe al alumno a detectar y corregir sus propios errores.

```
Actúa como profesor de ELE especializado en autonomía
del aprendizaje para nivel [NIVEL].

FORMATO: Guía de autocorrección en 4 pasos para
que el alumno revise su propia producción escrita.

AUDIENCIA: [Grupo]

META: El alumnado desarrollará estrategias de
autocorrección y aprenderá a detectar sus errores
más frecuentes antes de entregar una producción escrita.

ESPECIFICACIONES:
- Basada en los errores más frecuentes del nivel:
  [indicar 3-4 tipos de error habituales en ese nivel]
- Paso 1: primera lectura — comprensión global
  (¿he respondido a la tarea?, ¿está todo?)
- Paso 2: revisión de coherencia (¿mis ideas se
  entienden?, ¿hay conectores?)
- Paso 3: revisión gramatical focalizada (una
  ronda para cada tipo de error habitual)
- Paso 4: revisión léxica (¿he repetido mucho?,
  ¿puedo usar una palabra más precisa?)
- Lista de verificación final con casillas para marcar
- Consejo: cómo llevar un «diario de errores» personal
```

**Output real (Claude) — Nivel B1:**

> **Guía de autocorrección — Nivel B1**
>
> Antes de entregar cualquier texto escrito, lee tu producción cuatro veces. Cada lectura tiene un objetivo diferente.
>
> **Lectura 1 — ¿He respondido a la tarea?**
> - ¿He escrito el tipo de texto pedido (correo, artículo, narración...)?
> - ¿He incluido toda la información que pedían las instrucciones?
> - ¿La extensión es la adecuada?
>
> **Lectura 2 — ¿Se entiende bien?**
> - ¿Hay una idea por párrafo?
> - ¿He usado conectores para unir las ideas? *(además, sin embargo, por eso, aunque, en primer lugar...)*
> - ¿Alguien que no conoce el contexto puede entender mi texto?
>
> **Lectura 3 — Revisión gramatical** *(lee una vez para cada punto)*
> - [ ] Verbos: ¿están en la forma y el tiempo correcto? *(en B1: indefinido vs. imperfecto es el error más frecuente)*
> - [ ] Concordancia: ¿los adjetivos concuerdan con el sustantivo en género y número?
> - [ ] Pronombres: ¿he usado bien los pronombres de objeto directo e indirecto?
> - [ ] Subjuntivo: si he usado expresiones como «quiero que», «es importante que», ¿el verbo va en subjuntivo?
>
> **Lectura 4 — Revisión léxica**
> - ¿He repetido la misma palabra más de dos veces? *(subraya las repeticiones)*
> - ¿Hay alguna palabra que he usado pero no estoy seguro/a de que sea correcta?
> - ¿Puedo sustituir alguna expresión básica por una más precisa?
>
> **Lista de verificación final:**
> - [ ] El texto responde a la tarea
> - [ ] Las ideas están organizadas con párrafos y conectores
> - [ ] He revisado los verbos
> - [ ] He revisado la concordancia
> - [ ] He reducido las repeticiones léxicas
>
> **Diario de errores:** crea un documento donde apuntas cada error que el profesor te señala. Categorízalo (gramática / léxico / registro / puntuación) y escribe la versión correcta. Antes de cada nueva producción, lee tu diario: así evitarás cometer los mismos errores.

---

### PROMPT EV-05 — Diseño de tarea de evaluación auténtica

**Objetivo:** Crear una tarea de evaluación auténtica donde el alumno usa la lengua con un propósito real, no para demostrar que sabe gramática.

```
Actúa como especialista en evaluación auténtica
de ELE para nivel [NIVEL].

FORMATO: Diseño completo de una tarea de evaluación
auténtica con instrucciones, recursos y rúbrica.

AUDIENCIA: [Grupo]

META: El alumnado demostrará su competencia comunicativa
realizando una tarea con un propósito real: no «escribe
un texto», sino «escribe un texto que alguien leerá
y que tiene un efecto en el mundo real».

ESPECIFICACIONES:
- La tarea tiene un destinatario real o simulado
  (no «el profesor»): un compañero, una empresa,
  un diario, una asociación, una red social
- Un propósito comunicativo genuino: informar,
  convencer, entretener, solicitar, protestar
- Un producto final tangible: un cartel, un correo
  real, una reseña publicable, una presentación
  grabada, un podcast de clase
- Instrucciones en 3 niveles: qué hacer, cómo
  hacerlo, cómo se evaluará
- Rúbrica alineada con el propósito comunicativo
  (no solo corrección gramatical)
```

**Output real (Claude) — Nivel B2, tarea de escritura persuasiva:**

> **Tarea: La guía de tu ciudad para recién llegados**
>
> **¿Qué harás?**
> Escribirás una entrada para una guía colaborativa dirigida a personas que acaban de llegar a tu ciudad por primera vez. Tu entrada tiene que ser útil de verdad: alguien que no conoce tu ciudad la leerá y tomará decisiones basándose en lo que escribas.
>
> **El destinatario real:**
> Tus compañeros de clase actuarán como los «recién llegados». Al final de la actividad, leerán todas las entradas y votarán la más útil e interesante. La ganadora se publica en el blog de la clase.
>
> **¿Qué debe incluir tu entrada?**
> - Un título atractivo (no «Mi ciudad»: algo que invite a leer)
> - Un barrio o zona que recomiendes especialmente, con justificación
> - Dos o tres lugares concretos: uno para comer, uno para pasear, uno sorprendente
> - Una advertencia honesta: algo que el recién llegado debería saber para no llevarse una sorpresa
> - Entre 200 y 250 palabras
>
> **Cómo se evaluará:**
> | Criterio | Lo que busco |
> |----------|-------------|
> | Utilidad | ¿Hay información concreta y verificable? ¿Ayuda de verdad? |
> | Voz propia | ¿Se nota que es tu experiencia personal, no una entrada de Wikipedia? |
> | Organización | ¿Es fácil de leer? ¿Tiene una estructura lógica? |
> | Corrección | ¿El texto está bien escrito? ¿Los errores interrumpen la lectura? |
> | Atractivo | ¿Invita a leer? ¿Convence? |
>
> **Nota al docente:** esta tarea puede adaptarse para que los alumnos escriban sobre su propia ciudad de origen, convirtiendo la actividad en un intercambio cultural genuino.
