# Flujo 1: Crear una unidad didáctica completa
### Del objetivo comunicativo a los materiales listos para el aula

\newpage

## DE LA IDEA A LA UNIDAD: EL FLUJO COMPLETO

Una unidad didáctica no es una colección de ejercicios: es una secuencia coherente con un objetivo comunicativo central, materiales que se apoyan entre sí y una evaluación alineada con lo que se ha trabajado. Crear una unidad así desde cero cuesta tiempo. Con la IA, el flujo puede completarse en una sesión de trabajo si los prompts están bien diseñados y se encadenan con lógica.

Este flujo muestra cómo ir del objetivo comunicativo inicial hasta una unidad con texto de entrada, secuencia de actividades, material de producción y rúbrica. Cada paso usa el output del anterior como insumo.

---

\newpage

### PASO 1 — Definir la unidad: prompt de planificación

El primer prompt no produce materiales: produce el mapa de la unidad. Es el más importante porque todo lo demás depende de él.

```
Actúa como diseñador curricular de ELE especializado
en enfoque comunicativo para nivel [NIVEL].

FORMATO: Mapa de unidad didáctica en tabla estructurada.

AUDIENCIA: [Grupo: número, nivel, contexto, necesidades]

META: Diseña una unidad de [N sesiones / N horas]
sobre [tema o función comunicativa] que desarrolle
las cuatro destrezas y trabaje la gramática y el
vocabulario en contexto comunicativo.

ESPECIFICACIONES:
- Objetivo comunicativo central (lo que el alumno
  podrá hacer al final)
- Contenidos: funcional, gramatical, léxico,
  cultural (una línea por cada uno)
- Secuencia de sesiones: título + objetivo +
  destreza principal + tipo de actividad (por sesión)
- Tarea final integradora (que use todo lo trabajado)
- Evaluación: qué se evalúa y con qué instrumento
```

**Output real (Claude) — Unidad B1: «Decisiones importantes»:**

> **Objetivo comunicativo:** El alumnado será capaz de narrar y comentar decisiones importantes de su vida, expresar arrepentimiento o satisfacción y aconsejar a otros en situaciones similares.
>
> **Contenidos:**
> - *Funcional:* narrar en el pasado, expresar arrepentimiento («ojalá hubiera...»), dar consejos con matiz («yo que tú...», «si fuera tú...»)
> - *Gramatical:* contraste indefinido/imperfecto, condicional simple, introducción al condicional compuesto
> - *Léxico:* decisiones vitales (estudios, trabajo, relaciones, viajes), verbos de emoción y valoración
> - *Cultural:* expectativas sociales sobre las decisiones vitales en distintos contextos hispanohablantes
>
> **Secuencia (4 sesiones de 60 minutos):**
>
> | Sesión | Título | Objetivo | Destreza | Actividad |
> |--------|--------|----------|----------|-----------|
> | 1 | «La decisión que cambió todo» | Comprensión + activación léxica | Comprensión lectora | Texto narrativo + vocabulario de decisiones |
> | 2 | «¿Por qué lo hice?» | Narrar decisiones en el pasado | Expresión oral | Role-play con tarjetas de personaje |
> | 3 | «Si pudiera volver atrás...» | Expresar arrepentimiento y deseo | Expresión escrita | Texto modelo + producción propia |
> | 4 | «Te lo digo yo» | Dar consejos sobre decisiones | Interacción oral | Debate + simulación de consulta |
>
> **Tarea final:** el alumno graba un audio o escribe un texto de 200 palabras contando una decisión importante de su vida, qué pasó, cómo se siente ahora y qué consejo daría a alguien en su situación.
>
> **Evaluación:** rúbrica de producción oral/escrita con 4 criterios: narración coherente del pasado, expresión de valoración personal, uso del vocabulario trabajado, adecuación al registro.

---

### PASO 2 — Generar el texto de entrada (Sesión 1)

Con el mapa de la unidad como referencia, el segundo prompt genera el material de la primera sesión.

```
Actúa como autor de textos didácticos para ELE
nivel B1.

FORMATO: Texto narrativo de 220 palabras para
la primera sesión de la unidad «Decisiones importantes».

AUDIENCIA: Adultos B1 que estudian español.

META: El texto activará el tema de las decisiones
vitales, presentará vocabulario clave de la unidad
y servirá como modelo de narración en pasado.

ESPECIFICACIONES:
- Un personaje narra una decisión importante de
  su vida (cambiar de trabajo, mudarse, estudiar
  en el extranjero) con sus consecuencias
- El texto usa el pretérito indefinido e imperfecto
  de forma natural y contrastada
- Vocabulario en negrita: 8 palabras o expresiones
  del campo semántico de las decisiones
- El final queda abierto: ¿fue una buena decisión?
- Después del texto: 3 preguntas de comprensión
  + 2 preguntas de conexión personal
```

**Output real (Claude):**

> **Una maleta y un billete de ida**
>
> Cuando Marcos cumplió treinta años, llevaba cinco trabajando en el mismo banco. El **sueldo** era bueno, los compañeros eran amables y el horario era predecible. Pero todas las mañanas, mientras esperaba el metro, pensaba lo mismo: *esto no es lo que quería*.
>
> Un día, su empresa le ofreció una **oportunidad**: un puesto en la sede de Buenos Aires. Dos años. Sin garantía de volver al mismo puesto. Sin red de seguridad.
>
> Marcos **dudó** durante semanas. Habló con su familia, con sus amigos, consigo mismo. Todos le daban razones para quedarse. Él solo encontraba una para irse: que si no lo hacía, siempre se lo **reprocharía**.
>
> Firmó el contrato un martes por la tarde, casi sin pensar. Esa misma noche **hizo las maletas** y llamó a su madre.
>
> Dos años después, Marcos sigue en Buenos Aires. Ha **tomado decisiones** que no esperaba tomar. Ha **renunciado** a cosas que creía imprescindibles. Ha ganado otras que no sabía que necesitaba.
>
> ¿Fue la decisión correcta? Depende del día que le preguntes.
>
> *1. ¿Por qué Marcos no era feliz en su trabajo a pesar de las condiciones?*
> *2. ¿Qué le hizo **tomar la decisión** de irse?*
> *3. ¿Tú tomarías la misma decisión? ¿Por qué?*

---

### PASO 3 — Generar las tarjetas de role-play (Sesión 2)

```
Actúa como profesor de ELE especializado en
expresión oral para nivel B1.

FORMATO: 3 pares de tarjetas de role-play con
información asimétrica para la Sesión 2 de la
unidad «Decisiones importantes».

AUDIENCIA: Adultos B1.

META: Los alumnos narrarán y comentarán decisiones
del pasado en una conversación informal, usando
el vocabulario y los tiempos trabajados en la
Sesión 1.

ESPECIFICACIONES:
- Cada par: un personaje que tomó una decisión
  importante + un amigo/a que reacciona y pregunta
- El personaje A narra (usa el pasado)
- El personaje B reacciona, pregunta y da su opinión
- Información asimétrica: el personaje A sabe
  cómo acabó todo; el personaje B no
- Vocabulario sugerido al pie de cada tarjeta
- Tiempo: 6-8 minutos por par
```

**Output real (Claude):**

> **PAR 1 — Tarjeta A (Personaje: dejé la carrera)**
> *Quién eres:* Estudiabas Medicina en tercer año. Era una carrera que elegiste por tus padres, no por ti. Un día dejaste de ir a clase y te matriculaste en una escuela de diseño gráfico. Tus padres se enfadaron mucho. Eso fue hace cuatro años.
> *Lo que sabes (solo tú):* Ahora trabajas en una agencia de publicidad y eres bastante feliz. Pero a veces piensas que podrías haber seguido en Medicina.
>
> **PAR 1 — Tarjeta B (Amigo/a que escucha)**
> *Quién eres:* Tu amigo/a te acaba de contar que dejó Medicina. No sabías nada. Reacciona, haz preguntas, da tu opinión (¿fue valiente? ¿una locura? ¿lo entiendes?).
> *Preguntas sugeridas:* ¿Cuándo lo decidiste? ¿Cómo reaccionaron tus padres? ¿Lo volvería a hacer? ¿Qué fue lo más difícil?

---

### PASO 4 — Generar el texto modelo de escritura (Sesión 3)

```
Actúa como profesor de ELE especializado en
escritura creativa y expresión de emociones,
nivel B1.

FORMATO: Texto modelo de 180 palabras para la
Sesión 3 de la unidad «Decisiones importantes»,
centrado en expresar arrepentimiento y deseo.

AUDIENCIA: Adultos B1.

META: El texto sirve como modelo para que el alumno
escriba su propio texto sobre una decisión pasada
que valora positiva o negativamente.

ESPECIFICACIONES:
- El narrador reflexiona sobre una decisión
  del pasado: qué pasó, cómo se siente ahora
- Usa: ojalá + subjuntivo, debería haber + participio,
  si pudiera volver atrás... (introducción de estas
  estructuras en contexto)
- Tono: reflexivo, personal, sin dramatismo excesivo
- Después del modelo: guía de escritura para
  el alumno (4 preguntas que estructuran su texto)
```

**Output real (Claude):**

> **Lo que no dije**
>
> Hubo una persona en mi vida a la que nunca le dije lo importante que era para mí. Vivíamos en la misma ciudad, nos veíamos a veces, pero yo siempre pensaba que habría otro momento, otra oportunidad. Y luego se fue a vivir al otro lado del mundo.
>
> Ojalá le hubiera dicho algo. No sé qué habría cambiado, pero al menos no tendría esta sensación de que dejé algo sin terminar.
>
> Si pudiera volver atrás, no cambiaría muchas cosas. Pero esa conversación, sí. Debería haber tenido más valor.
>
> Ahora nos escribimos de vez en cuando. Es diferente. Pero está bien.
>
> *Guía para tu texto:*
> 1. ¿Cuál es la decisión que quieres contar?
> 2. ¿Qué pasó? ¿Cómo te sentiste en ese momento?
> 3. ¿Cómo te sientes ahora? ¿Ha cambiado tu valoración?
> 4. ¿Qué harías diferente? Usa: *ojalá hubiera / debería haber / si pudiera volver atrás...*

---

### PASO 5 — Generar la rúbrica de evaluación de la tarea final

```
Actúa como especialista en evaluación de ELE
nivel B1.

FORMATO: Rúbrica analítica para evaluar la tarea
final de la unidad «Decisiones importantes»
(texto o audio de 200 palabras).

AUDIENCIA: Docente que evalúa la producción
del alumnado.

META: La rúbrica evaluará de forma precisa si el
alumno ha alcanzado el objetivo comunicativo de
la unidad: narrar una decisión importante,
valorarla y aconsejar.

ESPECIFICACIONES:
- 4 criterios alineados con los objetivos de la unidad:
  narración coherente del pasado, expresión de
  valoración personal, léxico de la unidad,
  adecuación al registro
- 4 niveles de desempeño por criterio
- Versión de autoevaluación para el alumno
```

**Output real (Claude):**

> | Criterio | Excelente (4) | Competente (3) | En desarrollo (2) | Insuficiente (1) |
> |----------|--------------|----------------|-------------------|-----------------|
> | **Narración del pasado** | Usa indefinido e imperfecto de forma contrastada y natural. El lector entiende claramente qué pasó y en qué contexto. | Usa los tiempos del pasado correctamente en la mayoría de los casos. Algún error que no impide la comprensión. | Usa los tiempos del pasado con errores frecuentes. A veces no queda claro qué es acción y qué es contexto. | No diferencia indefinido e imperfecto o usa solo el presente para narrar. |
> | **Valoración personal** | Expresa cómo se siente ahora con precisión y matiz. Usa estructuras de la unidad (ojalá / si pudiera / debería haber) de forma natural. | Expresa valoración personal con alguna de las estructuras trabajadas. Puede mejorar la variedad. | Expresa opinión pero sin usar las estructuras de la unidad. La valoración es vaga. | No hay valoración personal o se limita a «fue bueno/malo». |
> | **Léxico de la unidad** | Usa 5 o más palabras/expresiones del campo semántico de las decisiones de forma precisa y en contexto. | Usa 3-4 palabras de la unidad correctamente. | Usa 1-2 palabras de la unidad; el resto del léxico es muy básico. | No se aprecia uso del vocabulario trabajado. |
> | **Registro** | El texto o audio tiene un registro personal y reflexivo consistente con la tarea. La voz es auténtica. | El registro es adecuado aunque con algún cambio de tono puntual. | El registro es inconsistente o demasiado formal / informal para la tarea. | El registro no es adecuado para la tarea. |

---

### RESUMEN DEL FLUJO

> **5 prompts encadenados → 1 unidad didáctica completa:**
>
> | Paso | Prompt | Output |
> |------|--------|--------|
> | 1 | Planificación de la unidad | Mapa con objetivos, contenidos y secuencia |
> | 2 | Texto de entrada | Texto narrativo para la Sesión 1 |
> | 3 | Actividad oral | Tarjetas de role-play para la Sesión 2 |
> | 4 | Modelo de escritura | Texto modelo + guía para la Sesión 3 |
> | 5 | Evaluación | Rúbrica de la tarea final |
>
> **Tiempo estimado de trabajo con IA:** 45-60 minutos de prompting + revisión.
> **Resultado:** materiales listos para imprimir o proyectar, adaptados al grupo.
