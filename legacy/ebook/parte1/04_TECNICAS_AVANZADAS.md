# Técnicas avanzadas
### Más allá de FRAME

\newpage

## MÁS ALLÁ DE FRAME: TÉCNICAS PARA PROMPTS COMPLEJOS

El marco FRAME es suficiente para la mayoría de las tareas cotidianas de un docente de ELE. Pero hay situaciones en las que se necesita más control sobre el output: cuando el material es muy específico, cuando el proceso de generación requiere varios pasos, o cuando se quiere crear un asistente que mantenga un comportamiento consistente a lo largo del tiempo.

Las cuatro técnicas de este capítulo amplían las posibilidades de FRAME y permiten abordar esas situaciones más complejas.

---

### Técnica 1: Prompts con ejemplos *(few-shot prompting)*

**Qué es:** Incluir en el prompt uno o más ejemplos del output que quieres obtener, antes de hacer la petición. La IA aprende del patrón que muestran los ejemplos y lo replica en el resultado.

**Por qué funciona:** Los modelos de lenguaje son extraordinariamente buenos en reconocer y continuar patrones. Si les muestras exactamente cómo debe verse el output, reducen drásticamente la variabilidad y el margen de interpretación.

**Cuándo usarlo en ELE:**
- Cuando tienes un estilo propio que quieres replicar
- Cuando el formato es muy específico y difícil de describir en palabras
- Cuando el nivel de lengua es crítico y quieres calibrarlo con precisión
- Cuando has encontrado un output excelente y quieres más del mismo tipo

**Estructura del prompt con ejemplos:**

```
[Instrucción general]

Aquí tienes dos ejemplos del tipo de ejercicio que necesito:

EJEMPLO 1:
[Output de ejemplo 1]

EJEMPLO 2:
[Output de ejemplo 2]

Siguiendo exactamente ese patrón, crea [N] ítems nuevos sobre
[tema/estructura].
```

**Ejemplo aplicado a ELE:**

```
Crea 8 ítems para un ejercicio de transformación de estilo
periodístico a coloquial. Nivel B2.

Aquí tienes dos ejemplos del tipo de ítem que necesito:

EJEMPLO 1:
Periodístico: «El Gobierno ha anunciado medidas para reducir
la tasa de desempleo juvenil.»
Coloquial: «El Gobierno ha dicho que va a hacer algo para que
los jóvenes encuentren trabajo.»

EJEMPLO 2:
Periodístico: «Se prevé un incremento sustancial de las
temperaturas durante el periodo estival.»
Coloquial: «Dicen que este verano va a hacer mucho más calor
de lo normal.»

Siguiendo exactamente ese patrón (misma estructura, mismo nivel
de transformación), crea 8 pares nuevos sobre temas de
actualidad social o medioambiental.
```

**Output real (Claude):**

> **Ítem 1:**
> Periodístico: «Las autoridades sanitarias han registrado un aumento considerable en los casos de enfermedades respiratorias.»
> Coloquial: «La sanidad dice que cada vez hay más gente que se pone mala del pecho.»
>
> **Ítem 2:**
> Periodístico: «El municipio ha implementado un programa de reciclaje con el objetivo de reducir la generación de residuos.»
> Coloquial: «El ayuntamiento ha puesto en marcha algo para que reciclemos más y tiremos menos basura.»

---

### Técnica 2: Razonamiento guiado *(chain of thought)*

**Qué es:** Pedir a la IA que explique su proceso de razonamiento antes de dar el resultado final. La instrucción «piensa paso a paso» o «explica tu razonamiento» activa en el modelo un modo de procesamiento más cuidadoso y menos propenso a errores.

**Por qué funciona:** Los modelos cometen menos errores cuando «piensan en voz alta» porque cada paso del razonamiento puede servir de control para el siguiente. Es especialmente útil para tareas que requieren precisión lingüística o pedagógica.

**Cuándo usarlo en ELE:**
- Al pedir análisis lingüístico de un texto
- Al diseñar una secuencia didáctica con justificación pedagógica
- Al pedir la corrección de un texto de alumno con comentarios
- Al clasificar materiales según el MCER

**Ejemplo aplicado a ELE:**

```
Analiza el siguiente texto de un alumno de B1 y corrígelo.
Antes de dar la versión corregida, explica paso a paso tu
proceso: primero identifica los errores, clasifícalos por tipo
(gramática, vocabulario, registro, puntuación), explica
brevemente por qué cada uno es un error, y luego presenta
la versión corregida con los cambios marcados.

TEXTO DEL ALUMNO:
«El fin de semana pasado yo he ido al cine con mis amigos.
Hemos visto una película muy interesante que trata sobre
una familia que vive en el futuro. Me ha gustado mucho
porque los actores son muy bien.»
```

**Output real (Claude):**

> **Paso 1 — Identificación de errores:**
>
> Error 1: «yo he ido» → pretérito perfecto incorrecto en este contexto. En español peninsular estándar, para referirse a una acción completada en el pasado (el fin de semana pasado), se usa el pretérito indefinido: «fui». El pretérito perfecto en España se usa para acciones recientes o conectadas con el presente.
>
> Error 2: «Hemos visto» → mismo problema. Debe ser «Vimos».
>
> Error 3: «Me ha gustado» → ídem. «Me gustó».
>
> Error 4: «son muy bien» → *bien* es adverbio y no puede usarse como atributo con *ser*. La forma correcta es «son muy buenos».
>
> **Paso 2 — Clasificación:**
> Errores 1, 2, 3: uso de tiempos verbales (pretérito perfecto vs. indefinido)
> Error 4: categoría gramatical (confusión adverbio/adjetivo)
>
> **Versión corregida:**
> «El fin de semana pasado [fui] al cine con mis amigos. [Vimos] una película muy interesante que trata sobre una familia que vive en el futuro. [Me gustó] mucho porque los actores son muy [buenos].»

\newpage

### Técnica 3: Prompts encadenados *(prompt chaining)*

**Qué es:** Usar el output de un prompt como input del siguiente, construyendo un material complejo en varias etapas. Cada prompt produce un resultado que sirve de base para el siguiente.

**Por qué funciona:** Los materiales pedagógicos complejos tienen componentes interdependientes (un texto y sus ejercicios, un ejercicio y su solucionario con comentarios, un plan de clase y sus materiales). Construirlos en cadena permite controlar cada componente por separado y garantizar la coherencia entre ellos.

**Cuándo usarlo en ELE:**
- Para crear una secuencia didáctica completa
- Para producir texto + ejercicios + solucionario de forma coherente
- Para adaptar un material existente a varios niveles
- Para crear un banco de ítems a partir de un texto base

**Ejemplo de cadena para crear una ficha completa:**

```
PROMPT 1 — El texto base:
Crea un texto periodístico de opinión de 250-280 palabras
sobre el uso de las redes sociales por los adolescentes.
Nivel B2. Español peninsular. Incluye conectores argumentativos
variados (sin embargo, no obstante, por otro lado, a pesar de).
Registro formal-periodístico.

─────────────────────────────────────────

PROMPT 2 — Ejercicio de comprensión (usa el texto del Prompt 1):
Basándote en el texto anterior, crea:
a) 4 preguntas de comprensión lectora de respuesta abierta
   (2-3 frases por respuesta)
b) 2 preguntas de análisis del texto (estructura argumentativa,
   función de los conectores)
Incluye el solucionario completo.

─────────────────────────────────────────

PROMPT 3 — Trabajo de vocabulario (usa el texto del Prompt 1):
Del mismo texto, extrae 10 palabras o expresiones de nivel B2+
que sean relevantes para ampliar el vocabulario del alumno.
Para cada una: definición en español, ejemplo de uso diferente
al del texto, y una colocación frecuente.

─────────────────────────────────────────

PROMPT 4 — Tarea de producción escrita:
Diseña una tarea de escritura de 200-250 palabras que surja
de manera natural del texto anterior. El alumno debe escribir
una réplica argumentativa en la que defienda una postura
diferente. Incluye: criterios de evaluación (4 puntos),
conectores sugeridos y estructura recomendada.
```

El resultado de los cuatro prompts es una ficha de trabajo completa, coherente en nivel, tema y enfoque.

---

### Técnica 4: El *system prompt* para asistentes permanentes

**Qué es:** Una instrucción larga y detallada que define el comportamiento permanente de la IA en una conversación o en un asistente personalizado. No es una petición puntual, sino una configuración de base que el modelo mantiene durante toda la interacción.

**Por qué funciona:** En lugar de repetir en cada prompt quién es el modelo, cuál es el nivel, cuáles son las restricciones y cuál es el contexto, el *system prompt* establece todo eso una vez. Todos los prompts posteriores se interpretan en ese marco.

**Cuándo usarlo en ELE:**
- Para crear un asistente de conversación para un grupo concreto
- Para tener un corrector de textos calibrado para un nivel específico
- Para un generador de ejercicios con parámetros fijos

\newpage

**Ejemplo de *system prompt* para un asistente de conversación B2:**

```
Eres un asistente de conversación en español para estudiantes
de nivel B2.

QUIÉN ERES:
- Tu nombre es Lucía y eres una estudiante universitaria
  española de 24 años, de Madrid.
- Hablas con un español peninsular natural: usas expresiones
  coloquiales propias del registro oral español, pero sin
  argot muy especializado.

CÓMO HABLAS:
- Nivel B2: ni demasiado simple ni demasiado complejo.
- Frases de longitud media. Alguna oración subordinada,
  pero no párrafos largos y complejos.
- Uso natural del pretérito perfecto e indefinido
  (según la norma peninsular).
- Puedes usar algunas expresiones coloquiales: «o sea»,
  «a ver», «la verdad es que», «no sé si me explico».

LO QUE HACES:
- Mantienes una conversación natural sobre cualquier tema
  cotidiano.
- Si el alumno comete un error importante, lo corriges
  de forma amable al final de tu respuesta entre corchetes:
  [Por cierto, en español decimos X, no Y].
- Si el alumno usa una expresión muy formal o muy rígida,
  sugieres la versión más natural entre paréntesis.
- No traduces al inglés salvo que el alumno te lo pida
  explícitamente.

LO QUE NO HACES:
- No usas vocabulario C1 o C2 sin explicarlo.
- No hablas de ti misma como IA: eres Lucía, una persona.
- No corriges cada pequeño error: solo los errores que
  dificultan la comunicación o son muy frecuentes en este nivel.
```

Con este *system prompt* configurado, el docente puede dar acceso al asistente a sus alumnos para que practiquen conversación de forma autónoma, con un interlocutor calibrado exactamente para su nivel.

---

### Cuándo usar cada técnica

| Situación | Técnica recomendada |
|-----------|---------------------|
| El formato del output es difícil de describir | Prompts con ejemplos |
| Necesitas más precisión en un análisis lingüístico | Razonamiento guiado |
| El material tiene varios componentes interdependientes | Prompts encadenados |
| Quieres un asistente con comportamiento fijo | *System prompt* |
| Tarea estándar, formato conocido | FRAME es suficiente |

Las cuatro técnicas son compatibles entre sí y con FRAME. Un *system prompt* puede incorporar ejemplos *(few-shot)*; una cadena de prompts puede pedir razonamiento guiado en alguno de sus pasos. A medida que ganas experiencia, irás combinándolas de forma intuitiva.
