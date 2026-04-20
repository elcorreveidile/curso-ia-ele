# Cultura e interculturalidad
### Crear materiales para la competencia cultural y el diálogo intercultural

\newpage

## CULTURA E INTERCULTURALIDAD CON IA

La competencia intercultural no se enseña con listas de curiosidades culturales. El docente de ELE sabe que lo que diferencia a un hablante eficaz de uno torpe en una L2 no es solo la gramática: es la capacidad de moverse con naturalidad entre marcos culturales distintos, de entender lo no dicho, de gestionar el malentendido sin ofender. La IA puede generar materiales para trabajar estos aspectos: textos que muestran choques culturales, actividades de reflexión comparativa, análisis de registros sociales, materiales sobre variedades del español. Los prompts de esta sección están diseñados para ir más allá del estereotipo y trabajar la cultura como práctica real.

---

\newpage

### PROMPT CU-01 — Texto de choque cultural para análisis

**Objetivo:** Crear un texto narrativo que muestre un malentendido intercultural real para analizarlo en clase.

```
Actúa como profesor de ELE especializado en competencia
intercultural para nivel [NIVEL].

FORMATO: Texto narrativo breve (200-250 palabras) que
narra un malentendido intercultural, seguido de preguntas
de análisis.

AUDIENCIA: [Grupo, especificando el origen cultural
predominante si es relevante]

META: El alumnado identificará las causas de un
malentendido intercultural, distinguirá diferencias
entre prácticas culturales y comprenderá que los
malentendidos no implican mala intención.

ESPECIFICACIONES:
- Situación: un personaje extranjero en un contexto
  hispanohablante (o al revés) vive un malentendido
  por diferencias culturales reales (no estereotipos)
- El malentendido surge de diferencias en: uso del
  espacio o tiempo, fórmulas de cortesía, gestión
  del conflicto, relaciones jerárquicas, comunicación
  directa/indirecta, etc.
- El texto presenta ambas perspectivas sin juzgar
  ninguna como incorrecta
- Preguntas de análisis: 5 preguntas que lleven al
  alumno a reflexionar sobre las causas culturales
  del malentendido, la perspectiva de cada personaje
  y cómo podría haberse evitado
- Actividad de producción: el alumno escribe cómo
  actuaría en la misma situación
```

**Output real (Claude) — Nivel B2, contexto laboral:**

> **El informe que llegó tarde**
>
> Kenji llevaba tres semanas trabajando en la oficina de Madrid. Era meticuloso, puntual y nunca salía antes de terminar cada tarea. El lunes por la mañana, su jefa, Ana, le pidió el informe «para el jueves».
>
> Kenji entregó el informe el jueves a las 11:57 de la noche. Técnicamente, era jueves. Desde su perspectiva, había cumplido el plazo.
>
> Ana, que esperaba el documento a primera hora para revisarlo antes de la reunión del viernes, estaba frustrada. No dijo nada directamente —no quería parecer inflexible—, pero durante la reunión fue notablemente más fría con Kenji que de costumbre. Kenji no entendió por qué.
>
> Ninguno de los dos preguntó. Ninguno de los dos explicó. El malentendido quedó flotando entre ellos durante semanas.
>
> **Preguntas de análisis:**
> 1. ¿Cuál fue la causa real del malentendido? ¿Fue culpa de alguien?
> 2. ¿Qué significaba «el jueves» para cada uno? ¿Qué convenciones culturales operaban?
> 3. ¿Por qué Ana no explicó sus expectativas directamente? ¿Y por qué Kenji no preguntó?
> 4. ¿Cómo gestiona tu cultura los plazos y los acuerdos implícitos en el trabajo?
> 5. ¿Qué habrías hecho tú en el lugar de Kenji? ¿Y en el de Ana?

---

### PROMPT CU-02 — Comparación de prácticas culturales

**Objetivo:** Crear una actividad de comparación cultural que evite estereotipos y fomente la reflexión crítica.

```
Actúa como profesor de ELE especializado en didáctica
intercultural para nivel [B1/B2].

FORMATO: Ficha de comparación cultural con textos
breves y preguntas de reflexión.

AUDIENCIA: Grupo multicultural o de origen cultural
homogéneo: [especificar]

META: El alumnado comparará prácticas culturales
en torno a [tema] en distintos contextos hispanohablantes
y en su propia cultura, desarrollando una visión
crítica y no etnocéntrica.

ESPECIFICACIONES:
- Tema: [comida y sociabilidad / gestión del tiempo /
  relaciones de amistad / vida familiar / trabajo /
  celebraciones / uso del espacio público, etc.]
- 3 textos breves (80-100 palabras cada uno) que
  describen la práctica cultural en 3 contextos
  hispanohablantes diferentes (no «España» genérica:
  elegir contextos específicos y contrastivos)
- Evitar afirmaciones absolutas: usar «en muchos
  contextos», «es frecuente que», «suele ocurrir»
- 5 preguntas que comparen los textos entre sí
  y los contrasten con la cultura del alumno
- Actividad final: el alumno escribe su propia
  «cápsula cultural» sobre este tema en su cultura
  (150 palabras)
```

**Output real (Claude) — Tema: la comida como espacio social, B2:**

> **Texto 1 — Buenos Aires:**
> En muchos hogares porteños, el asado del domingo es mucho más que una comida: es una institución social. Se convoca a familia extensa, amigos, vecinos. El ritual puede durar cuatro o cinco horas. El asador —normalmente un hombre, aunque esto está cambiando— tiene un rol casi ceremonial. No se trata de comer rápido: se trata de estar juntos. La sobremesa es tan importante como el asado mismo.
>
> **Texto 2 — Ciudad de México:**
> La comida del mediodía —entre las 2 y las 4— es en muchos contextos mexicanos la comida principal del día. En familias tradicionales, es frecuente que todos se reúnan en casa. Los restaurantes de menú del día ofrecen tres o cuatro tiempos a precio asequible. Comer solo se percibe a veces como algo un poco triste; comer acompañado es la norma esperada.
>
> **Texto 3 — Madrid:**
> El tapeo madrileño tiene su propia lógica: no es una comida, es un recorrido. Se va de bar en bar, se pide algo pequeño, se charla, se sigue. El objetivo no es saciarse sino socializar en movimiento. La barra del bar, de pie, es un espacio de comunicación horizontal donde el rango social se diluye. Los domingos, sin embargo, la comida familiar en casa sigue siendo un ritual importante para muchas familias.
>
> **Preguntas:**
> 1. ¿Qué función social cumple la comida en los tres contextos? ¿Es la misma?
> 2. ¿Qué diferencias encuentras en el tiempo dedicado a comer?
> 3. ¿Cuál de los tres contextos se parece más al tuyo? ¿Y cuál te resulta más diferente?
> 4. ¿Existen en tu cultura rituales alimentarios con función social similar al asado o al tapeo?
> 5. ¿Crees que estas prácticas están cambiando en las generaciones más jóvenes? ¿Por qué?

---

### PROMPT CU-03 — Análisis de comunicación no verbal

**Objetivo:** Crear materiales para trabajar los aspectos no verbales de la comunicación en español.

```
Actúa como profesor de ELE especializado en comunicación
no verbal para nivel [NIVEL].

FORMATO: Ficha de trabajo sobre comunicación no verbal
en contextos hispanohablantes.

AUDIENCIA: [Grupo]

META: El alumnado identificará convenciones de
comunicación no verbal en español (gestos, distancia,
contacto físico, mirada, silencio) y las comparará
con las de su propia lengua y cultura.

ESPECIFICACIONES:
- Foco: [gestos / proxémica / contacto visual /
  paralenguaje / uso del silencio / expresión facial]
- Descripción de 5 situaciones comunicativas donde
  la comunicación no verbal es culturalmente específica
- Para cada situación: cómo se interpreta en muchos
  contextos hispanohablantes y cómo podría interpretarse
  de forma diferente en otras culturas
- Ejercicio de observación: 3 fragmentos de vídeo
  descritos (el docente puede buscarlos) o 3 situaciones
  para dramatizar en clase
- Actividad de reflexión: el alumno describe 3 gestos
  o convenciones no verbales de su cultura que un
  hispanohablante podría malinterpretar
```

**Output real (Claude) — Foco: distancia y contacto, B1:**

> **Situación 1 — El saludo**
> En muchos contextos hispanohablantes, el saludo entre conocidos implica contacto físico: dos besos (España), un beso (varios países latinoamericanos) o un abrazo. Evitar el contacto puede interpretarse como frialdad o distancia emocional, aunque el receptor no lo piense conscientemente. En contextos más formales o profesionales, el apretón de manos es la norma, pero la distancia entre interlocutores suele ser menor que en el norte de Europa o Japón.
>
> *Posible malentendido:* una persona de cultura con mayor distancia interpersonal puede sentirse incómoda y retroceder sin querer; el hispanohablante puede interpretarlo como rechazo.
>
> **Situación 2 — La conversación**
> Durante una conversación en muchos contextos del sur de España o Latinoamérica, los interlocutores pueden superponerse, interrumpirse o completar las frases del otro. Esto no se percibe como mala educación: al contrario, indica implicación e interés. Un interlocutor que espera siempre su turno en silencio puede parecerle poco participativo a su interlocutor hispanohablante.
>
> *Posible malentendido:* el silencio activo que en algunas culturas indica respeto puede interpretarse como desinterés o timidez.
>
> **Situación 3 — El «sí» que no significa sí**
> En algunos contextos hispanohablantes, decir «sí, sí» o «claro» durante una conversación no necesariamente indica acuerdo: puede ser una señal de que se está escuchando. Del mismo modo, un «ya» puede significar «lo haré» o «te estoy escuchando» según el contexto y la entonación.
>
> **Actividad:** Describe 3 gestos o convenciones no verbales de tu lengua/cultura que un hispanohablante podría malinterpretar. ¿Cuál es el significado real? ¿Qué podría pensar alguien que no lo conoce?

---

### PROMPT CU-04 — Variedades del español: sensibilización

**Objetivo:** Crear materiales para que el alumno desarrolle conciencia sobre la diversidad del español y sus variedades.

```
Actúa como profesor de ELE especializado en variedades
del español para nivel [B1/B2/C1].

FORMATO: Ficha de sensibilización a las variedades
del español con textos, audio descrito y ejercicios.

AUDIENCIA: [Grupo]

META: El alumnado reconocerá que el español es una
lengua pluricéntrica con variedades legítimas y
desarrollará una actitud de respeto y curiosidad
ante la variación lingüística.

ESPECIFICACIONES:
- Selecciona [2/3] variedades del español para comparar:
  [Rioplatense / Caribeño / Andino / Peninsular centro-norte /
  Canario / Mexicano / Chileno / etc.]
- Para cada variedad: un texto breve (100 palabras)
  con rasgos léxicos y pragmáticos propios, sin
  transcripción fonética (que requiere audio real)
- Tabla comparativa de 8 palabras o expresiones que
  varían entre las variedades seleccionadas
- Ejercicio: el alumno identifica de qué variedad
  procede cada fragmento y justifica su respuesta
- Reflexión final: ¿qué variedad del español es
  «correcta»? ¿Existe una sola norma?
- Nota al profesor: cómo presentar la variación
  sin crear jerarquías entre variedades
```

**Output real (Claude) — Rioplatense vs. Mexicano vs. Peninsular, B2:**

> **Texto 1:**
> «Che, ¿vos tenés el celular de Mariana? Te juro que la llamé un montón de veces y no me atiende. Mirá, si la ves, decile que la estoy esperando en el boliche. Salí recién del laburo y estoy hecho mierda.»
>
> **Texto 2:**
> «Oye, ¿tienes el cel de Mariana? La marqué un chingo de veces y no me cae. Si la ves, dile que la espero en la fiesta. Acabo de salir chamba y estoy bien cansado, ¿eh?»
>
> **Texto 3:**
> «Tío, ¿tienes el móvil de Mariana? La he llamado mogollón de veces y no me lo coge. Si la ves, dile que la espero en la discoteca. Acabo de salir del curro y estoy hecho polvo.»
>
> **Tabla comparativa:**
> | Concepto | Rioplatense | Mexicano | Peninsular |
> |----------|-------------|----------|------------|
> | teléfono móvil | celular | cel | móvil |
> | trabajo | laburo | chamba | curro |
> | fiesta/discoteca | boliche | fiesta / antro | discoteca |
> | muy cansado | hecho mierda | bien cansado | hecho polvo |
> | pronombre 2ª sg. | vos | tú | tú |
> | llamar por teléfono | llamar | marcar | llamar |
>
> **Ejercicio:** ¿Cuál de los tres textos pertenece a cada variedad? ¿Qué palabras o formas te han dado la pista?
>
> **Reflexión:** ¿Cuál de los tres textos te parece «más correcto»? ¿Por qué? ¿Qué dice esa respuesta sobre tus propias actitudes ante la variación lingüística?

---

### PROMPT CU-05 — Textos literarios y culturales auténticos

**Objetivo:** Crear una actividad de lectura con un texto literario o cultural auténtico que sirva como ventana a la cultura hispanohablante.

```
Actúa como profesor de ELE especializado en literatura
y cultura para nivel [B2/C1].

FORMATO: Actividad de lectura literaria con texto
auténtico adaptado y secuencia de actividades.

AUDIENCIA: [Grupo]

META: El alumnado leerá un fragmento literario o
cultural auténtico en español, comprenderá su
contenido y contexto, y lo usará como punto de
partida para la reflexión cultural y la producción
propia.

ESPECIFICACIONES:
- Crea o adapta un fragmento (150-200 palabras) de
  [cuento, artículo, poema, canción, crónica] sobre
  un aspecto de la cultura hispanohablante
- El texto tiene valor literario o estético, no
  es un texto didáctico disfrazado de literario
- Actividad 1: comprensión literal (3 preguntas
  sobre el contenido)
- Actividad 2: comprensión interpretativa (2 preguntas
  sobre el significado o la intención del autor)
- Actividad 3: conexión cultural (2 preguntas que
  relacionen el texto con la experiencia del alumno)
- Actividad 4: producción — el alumno escribe su
  propio texto breve inspirado en el mismo tema
  o formato
```

**Output real (Claude) — Crónica urbana, C1:**

> **Texto: «Las doce menos cuarto»**
>
> Hay una hora en Madrid que no existe en ningún manual de español. Ocurre cuando los bares empiezan a llenarse y los restaurantes todavía están vacíos, cuando la ciudad ha terminado de cenar pero aún no ha empezado la noche. Es las doce menos cuarto.
>
> A esa hora, las terrazas de Malasaña están llenas de gente que no tiene prisa. No es que no tengan nada que hacer mañana: es que mañana, de momento, puede esperar. Los niños corren entre las sillas con una libertad que en otras capitales europeas provocaría miradas de desaprobación. Aquí nadie mira. Aquí los niños simplemente están.
>
> Un turista de Berlín me preguntó una vez si en España se dormía poco. «No», le dije. «Es que dormimos en otro momento.»
>
> **Actividad 1 — Comprensión literal:**
> 1. ¿Qué hora describe el texto? ¿Qué está pasando en la ciudad a esa hora?
> 2. ¿Qué dice el narrador sobre los niños?
> 3. ¿Qué le responde a el turista de Berlín?
>
> **Actividad 2 — Comprensión interpretativa:**
> 1. ¿Qué quiere decir «dormimos en otro momento»? ¿Qué actitud ante el tiempo refleja esta frase?
> 2. ¿Por qué crees que el autor dice que esa hora «no existe en ningún manual de español»?
>
> **Actividad 3 — Conexión cultural:**
> 1. ¿Existe en tu ciudad o cultura una hora o un momento equivalente? ¿Cómo lo describirías?
> 2. ¿Cómo reaccionarías tú si vieras niños corriendo en una terraza a medianoche?
>
> **Actividad 4 — Tu crónica:**
> Escribe una crónica breve (150 palabras) sobre una hora, un lugar o un ritual cotidiano de tu ciudad o cultura que un extranjero no entendería sin explicación. Usa la misma voz reflexiva del texto.
