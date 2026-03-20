# Comprensión lectora
### Crear textos e instrumentos de evaluación lectora para cualquier nivel

\newpage

## COMPRENSIÓN LECTORA CON IA

La comprensión lectora es probablemente la destreza para la que la IA resulta más inmediatamente útil en ELE. Generar textos auténticos calibrados a un nivel concreto, crear preguntas de comprensión de diferente tipología, diseñar actividades de prelectura y poslectura: todas estas tareas, que consumen horas de preparación docente, pueden resolverse en minutos con los prompts adecuados.

Los prompts de esta sección están organizados por función: no por nivel (que varía según el grupo) sino por lo que el docente necesita hacer con el texto.

---

\newpage

### PROMPT CL-01 — Texto graduado para comprensión lectora

**Objetivo:** Crear un texto auténtico calibrado a un nivel específico con todos los elementos de una ficha de comprensión lectora.

```
Actúa como profesor de ELE especializado en comprensión
lectora para nivel [NIVEL].

FORMATO: Ficha completa de comprensión lectora con texto
y actividades.

AUDIENCIA: [Descripción del grupo: edad, origen, contexto]

META: El alumnado será capaz de comprender el texto,
identificar las ideas principales e inferir el significado
de vocabulario en contexto.

ESPECIFICACIONES:
- Texto: [tipo de texto] de [N] palabras sobre [tema]
- Vocabulario estrictamente de nivel [NIVEL]
- Preuniversal (prelectura): 2 preguntas para activar
  conocimiento previo
- Comprensión global: 3 preguntas abiertas sobre las
  ideas principales
- Comprensión detallada: 4 preguntas de verdadero/falso
  con justificación textual
- Vocabulario en contexto: 4 palabras del texto con su
  significado inferible, el alumno escribe la definición
- Poslectura: 1 pregunta de opinión o conexión personal
- Solucionario completo
```

**Output real (Claude) — Ejemplo para B1:**

> **Texto:** *El mercado de segunda mano*
>
> Cada primer domingo de mes, la plaza Mayor de Segovia se llena de mesas, cajas y maletas abiertas. Es el mercadillo de segunda mano: un lugar donde conviven las cosas que ya no tienen dueño y las personas que quieren darles una segunda vida.
>
> Algunos vendedores llevan años ocupando el mismo rincón. Carlos, por ejemplo, llegó hace doce años con una caja de libros de su abuelo y ya no ha parado. «Al principio lo hacía para ganar un dinero extra, pero ahora es mi hobby favorito. Me encanta la gente que pasa, las historias que traen los objetos».
>
> Lo que más sorprende a los visitantes es la variedad: hay discos de vinilo, juguetes de los años ochenta, ropa vintage, herramientas antiguas y postales de ciudades que ya no existen. Cada objeto tiene una historia, aunque no siempre se conoce.
>
> *[Texto completo: ~180 palabras]*
>
> **Prelectura:**
> 1. ¿Has comprado o vendido alguna vez en un mercado de segunda mano?
> 2. ¿Qué tipo de objetos crees que se venden en estos mercados?
>
> **Comprensión global:**
> 1. ¿Dónde y cuándo tiene lugar el mercadillo?
> 2. ¿Por qué sigue yendo Carlos después de doce años?
> 3. ¿Qué hace especiales a los objetos de estos mercados?
>
> **V/F con justificación:**
> 1. Carlos empezó a vender por afición desde el principio. *(F: «al principio lo hacía para ganar un dinero extra»)*

**Variantes:**
- Pide el mismo texto en tres niveles distintos (A2, B1, B2) para trabajar con grupos mixtos
- Solicita una versión con énfasis en tiempos verbales específicos
- Añade una actividad de relectura en voz alta con marcas de entonación

---

### PROMPT CL-02 — Texto con vocabulario en contexto

**Objetivo:** Crear un texto donde el vocabulario nuevo sea inferible desde el contexto, con un ejercicio de deducción léxica.

```
Actúa como profesor de ELE especializado en vocabulario
y comprensión lectora para nivel [NIVEL].

FORMATO: Texto de [N] palabras + ejercicio de inferencia
léxica.

AUDIENCIA: [Grupo]

META: El alumnado será capaz de deducir el significado
de palabras desconocidas a partir del contexto sin
recurrir al diccionario.

ESPECIFICACIONES:
- El texto debe incluir exactamente 6 palabras o expresiones
  que probablemente sean nuevas para el nivel [NIVEL]
- Estas palabras deben ser deducibles desde el contexto:
  por la estructura de la frase, por palabras conocidas
  cercanas o por el sentido general
- Señálalas en el texto en negrita
- Ejercicio: el alumno lee el texto, intenta deducir
  el significado de cada palabra en negrita y escribe
  su propia definición en español (no traducción)
- Clave con el significado y la explicación de las pistas
  contextuales que permiten deducirlo
```

**Output real (Claude) — Ejemplo para B2:**

> **El arte de la siesta**
>
> La siesta española es, para muchos extranjeros, un **enigma** cultural. ¿Cómo puede un país moderno, integrado en la economía global, mantener la costumbre de interrumpir el día laboral para dormir? La respuesta es más compleja de lo que parece.
>
> En realidad, la siesta no es exclusiva de España ni es tan universal como se cree. En muchas regiones del país, especialmente en las ciudades grandes, la siesta ha **menguado** considerablemente en las últimas décadas. Los horarios de trabajo europeos, adoptados progresivamente, han ido **erosionando** una costumbre que sobrevive más en los mitos que en la práctica cotidiana.
>
> Sin embargo, la ciencia ha venido a **reivindicar** la pausa de mediodía. Estudios recientes demuestran que una siesta breve —entre quince y veinte minutos— mejora la **agudeza** mental, reduce el estrés y aumenta la productividad de la tarde. Los países del norte de Europa, **escépticos** durante décadas ante esta costumbre mediterránea, empiezan ahora a explorar su implementación en el entorno laboral.
>
> **Deduce el significado:**
> 1. *enigma* → contexto: «algo que los extranjeros no entienden» → significa: ___
> 2. *menguado* → contexto: «ha [menguado] considerablemente» + «adoptados horarios europeos» → significa: ___
> 3. *erosionando* → contexto: «horarios que van [erosionando] una costumbre» → significa: ___
>
> *Clave:* 1. misterio / cosa difícil de entender | 2. disminuido / reducido | 3. desgastando / destruyendo poco a poco

---

### PROMPT CL-03 — Texto con diferentes perspectivas

**Objetivo:** Crear un texto que presente varias voces o perspectivas sobre un tema para trabajar la comprensión inferencial y el análisis crítico.

```
Actúa como profesor de ELE nivel [B1/B2/C1].

FORMATO: Texto periodístico de perspectivas múltiples
de 280-320 palabras + preguntas de análisis.

AUDIENCIA: [Grupo]

META: El alumnado será capaz de identificar las diferentes
perspectivas presentes en un texto, distinguir hechos
de opiniones y reconocer el posicionamiento implícito
del autor.

ESPECIFICACIONES:
- Tema: [tema con perspectivas diversas: turismo, trabajo,
  tecnología, medio ambiente, etc.]
- El texto presenta al menos tres voces diferentes
  (experto, ciudadano común, representante institucional)
- El autor tiene una postura implícita visible a través
  de la selección léxica y la estructura
- Preguntas: 2 de comprensión literal + 2 de inferencia
  + 2 de análisis crítico (¿qué no dice el texto?
  ¿cuál es la perspectiva del autor?)
```

**Output real (Claude) — Ejemplo para B2:**

> **Airbnb en el barrio**
>
> Cuando Patricia llegó a vivir al barrio de Gràcia hace diez años, los vecinos se conocían. Ahora, me cuenta mientras toma un café en el único bar que queda en su calle, muchos pisos están vacíos durante la semana y llenos de maletas los fines de semana. «Ya no sé quiénes son mis vecinos», dice.
>
> El fenómeno tiene un nombre: turistificación. Y tiene una cara visible: las plataformas de alquiler de corta estancia, que han transformado el tejido residencial de ciudades como Barcelona, Madrid o Sevilla en menos de una década.
>
> Para el Ayuntamiento, la solución está en la regulación. «Necesitamos limitar el número de licencias y proteger el acceso a la vivienda de los residentes», explica un portavoz municipal. Desde 2021, Barcelona ha retirado más de cuatro mil licencias turísticas.
>
> Los propietarios, sin embargo, tienen otra lectura. «Es mi propiedad y tengo derecho a hacer con ella lo que quiera dentro de la ley», argumenta Jordi, que alquila su piso a turistas los meses de verano para complementar su pensión.
>
> **Preguntas:**
> 1. *(Literal)* ¿Qué ha hecho Barcelona desde 2021?
> 2. *(Literal)* ¿Por qué alquila Jordi su piso a turistas?
> 3. *(Inferencia)* ¿Qué actitud tiene el autor hacia la turistificación? ¿Cómo lo sabes?
> 4. *(Inferencia)* ¿Qué perspectiva está poco representada en el texto?
> 5. *(Análisis)* ¿El texto es objetivo? Justifica con ejemplos concretos.
> 6. *(Análisis)* ¿Qué información necesitarías para formarte una opinión más completa?

---

### PROMPT CL-04 — Texto con huecos para completar (cloze)

**Objetivo:** Crear un texto con huecos para trabajar comprensión lectora y gramática de forma integrada.

```
Actúa como profesor de ELE nivel [NIVEL].

FORMATO: Texto de [N] palabras con 10 huecos numerados
+ lista de palabras para completar (con distractores)
+ solucionario.

AUDIENCIA: [Grupo]

META: El alumnado será capaz de seleccionar la palabra
correcta para cada hueco demostrando comprensión global
y local del texto.

ESPECIFICACIONES:
- El texto trata sobre [tema]
- Los 10 huecos corresponden a: 4 conectores discursivos,
  3 verbos en forma conjugada y 3 elementos léxicos
- Lista de palabras: 14 opciones (10 correctas + 4
  distractores plausibles)
- Los distractores son gramaticalmente posibles pero
  semánticamente incorrectos en contexto
- El solucionario explica por qué cada respuesta es
  correcta y por qué los distractores son incorrectos
```

**Output real (Claude) — Ejemplo para B1:**

> **El voluntariado en España**
>
> En España, más de tres millones de personas (1)_______ su tiempo libre para hacer voluntariado. Esta cifra ha (2)_______ de forma constante en los últimos diez años, (3)_______ el número de organizaciones que trabajan con voluntarios también ha aumentado.
>
> El voluntariado puede adoptar muchas formas: ayudar en un banco de alimentos, enseñar español a personas migrantes, cuidar animales abandonados o (4)_______ en proyectos medioambientales. Lo que todas estas actividades tienen en (5)_______ es que se realizan de forma gratuita y por elección propia.
>
> (6)_______, algunos estudios demuestran que los voluntarios también se benefician. Trabajar por los demás mejora el bienestar emocional, (7)_______ nuevas habilidades y amplía la red de contactos sociales. (8)_______, el voluntariado no es solo un acto de generosidad: es también una inversión personal.
>
> **Palabras:** dedican / ha crecido / sin embargo / participar / común / además / desarrolla / aunque / mientras que / por eso / ofrecen / disminuido / individual / especial
>
> *Solucionario:* 1. dedican | 2. crecido | 3. mientras que | 4. participar | 5. común | 6. Sin embargo | 7. desarrolla | 8. Por eso

---

### PROMPT CL-05 — Secuencia de prelectura

**Objetivo:** Crear actividades de prelectura que activen el conocimiento previo y anticipen el contenido del texto.

```
Actúa como profesor de ELE especializado en didáctica
de la lectura para nivel [NIVEL].

FORMATO: Secuencia de tres actividades de prelectura.

AUDIENCIA: [Grupo]

META: El alumnado activará su conocimiento previo sobre
el tema, anticipará el contenido del texto y establecerá
un propósito de lectura antes de leer.

ESPECIFICACIONES:
- El texto que van a leer trata sobre [tema]
- Actividad 1: lluvia de ideas visual — el alumno asocia
  palabras al tema (formato: mapa de palabras con 6
  categorías vacías)
- Actividad 2: predecir el contenido — 5 afirmaciones
  sobre las que el alumno marca «creo que sí / creo que
  no» antes de leer y comprueba después
- Actividad 3: establecer propósito — 3 preguntas que
  el alumno quiere que el texto responda (formato abierto)
- Las predicciones deben ser plausibles pero no obvias
```

**Output real (Claude) — Ejemplo para B2, texto sobre migración:**

> **Actividad 1 — ¿Qué sabes sobre la migración en España?**
> *Escribe palabras relacionadas con estas categorías:*
>
> - Razones para emigrar: ___
> - Países de origen de los migrantes en España: ___
> - Dificultades del proceso: ___
> - Aportaciones al país de acogida: ___
> - Términos legales o administrativos: ___
> - Emociones del proceso migratorio: ___
>
> **Actividad 2 — ¿Verdad o mito? Marca antes de leer:**
> 1. España es el país de la UE con más inmigrantes en proporción a su población. *(V / M)*
> 2. La mayoría de los inmigrantes en España vienen de América Latina. *(V / M)*
> 3. Los migrantes tienen más dificultades para acceder a la vivienda que los nativos. *(V / M)*
> 4. El número de solicitudes de asilo ha disminuido en los últimos cinco años. *(V / M)*
> 5. Los trabajadores migrantes contribuyen más en impuestos de lo que reciben en prestaciones. *(V / M)*
>
> **Actividad 3 — Tus preguntas:**
> *Antes de leer, escribe tres preguntas que esperas que el texto responda:*
> 1. ___
> 2. ___
> 3. ___
> *Después de leer: ¿el texto ha respondido tus preguntas?*

---

### PROMPT CL-06 — Adaptación de texto auténtico a nivel inferior

**Objetivo:** Adaptar un texto periodístico real a un nivel inferior manteniendo las ideas esenciales.

```
Actúa como especialista en adaptación de textos para ELE.

FORMATO: Texto original + versión adaptada + tabla de
cambios realizados.

AUDIENCIA: Alumnado de nivel [NIVEL INFERIOR AL ORIGINAL].

META: El alumnado será capaz de leer y comprender
el texto adaptado sin pérdida significativa de información.

ESPECIFICACIONES:
- Adapta el siguiente texto a nivel [B1/A2/B2]:
  [pegar aquí el texto original]
- Criterios de adaptación:
  · Vocabulario: sustituir términos por encima del nivel
  · Sintaxis: simplificar oraciones subordinadas largas
  · Extensión: mantener entre el 80 y el 100% de la
    longitud original
  · Información: conservar las ideas principales;
    se pueden eliminar detalles secundarios
- Tabla de cambios: dos columnas (original / adaptación)
  con los 8-10 cambios más significativos y el motivo
- NO simplificar tanto que el texto pierda autenticidad:
  el objetivo es hacer el texto accesible, no infantilizar
```

**Output real (Claude):**

> *(La IA produce la versión adaptada con la tabla de cambios)*
>
> **Tabla de cambios (extracto):**
>
> | Original (C1) | Adaptación (B1) | Motivo |
> |---------------|-----------------|--------|
> | «ostenta el liderazgo» | «es el líder» | vocabulario por encima del nivel |
> | «en detrimento de» | «a costa de / en perjuicio de» | expresión idiomática compleja |
> | «cabe plantearse si» | «podemos preguntarnos si» | registro académico → estándar |
> | oración de 45 palabras con tres subordinadas | dividida en dos frases | complejidad sintáctica |

**Variantes:**
- Adaptar en sentido inverso: subir un texto de A2 a B2
- Pedir tres versiones del mismo texto en A2, B1 y B2 para trabajar en grupos de nivel mixto
- Adaptar el texto manteniendo el vocabulario pero simplificando solo la sintaxis

---

### PROMPT CL-07 — Cuestionario de metacognición lectora

**Objetivo:** Crear un cuestionario de reflexión sobre el proceso lector para desarrollar estrategias de comprensión.

```
Actúa como docente especializado en estrategias de
aprendizaje y comprensión lectora para [NIVEL].

FORMATO: Cuestionario de metacognición lectora en dos
partes: antes y después de leer.

AUDIENCIA: Adultos [NIVEL] que quieren mejorar sus
estrategias de lectura en español.

META: El alumnado desarrollará conciencia sobre su propio
proceso lector y aprenderá a identificar qué estrategias
usa y cuáles necesita desarrollar.

ESPECIFICACIONES:
- Parte 1 (antes de leer, 5 preguntas): qué hace el alumno
  habitualmente cuando encuentra texto difícil
- Parte 2 (después de leer, 6 preguntas): reflexión sobre
  el texto específico recién leído
- Las preguntas combinan: escala Likert (1-4), selección
  múltiple y respuesta breve abierta
- Incluir una pregunta sobre el uso del diccionario y
  una sobre la estrategia de inferencia por contexto
- Tono: reflexivo, no evaluativo (no hay respuestas
  correctas o incorrectas)
```

**Output real (Claude):**

> **Antes de leer — ¿Cómo lees en español?**
>
> 1. Cuando veo una palabra desconocida, normalmente... *(selecciona)*
> a) Busco inmediatamente en el diccionario
> b) Intento deducir el significado por el contexto
> c) La ignoro y continúo leyendo
> d) Depende de si parece importante para entender el texto
>
> 2. Antes de empezar a leer un texto, yo... *(1=nunca, 4=siempre)*
> - Leo el título e intento predecir el contenido: 1 2 3 4
> - Miro si hay imágenes, subtítulos o gráficos: 1 2 3 4
> - Recuerdo lo que ya sé sobre el tema: 1 2 3 4
>
> **Después de leer — Reflexión:**
>
> 1. ¿Cuántas palabras desconocidas had en el texto? ¿Cuántas dedujiste del contexto?
> 2. ¿Qué parte del texto fue más difícil de entender? ¿Por qué crees que fue difícil?
> 3. Si tuvieras que explicar el texto a alguien, ¿qué dirías en tres frases?
> 4. ¿Qué estrategia usarías la próxima vez que leas un texto similar?
