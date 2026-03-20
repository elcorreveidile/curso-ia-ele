# Anatomía de un prompt eficaz
### El marco FRAME

\newpage

## EL MARCO FRAME

Antes de abrir cualquier herramienta de IA, necesitas saber qué vas a pedirle. Esa parece una observación obvia, pero es donde falla la mayoría de los docentes que se frustran con los resultados.

Un prompt eficaz no es una frase larga. Es una instrucción estructurada que responde a seis preguntas concretas. El marco **FRAME** recoge esas seis preguntas en un sistema fácil de recordar y aplicar.

> **FRAME** es una herramienta nemotécnica para construir prompts completos. Las seis letras corresponden a seis componentes: **F**ormato, **R**ol, **A**udiencia, **M**eta, **E**specificaciones y **E**jemplo. Las dos últimas comparten inicial porque ambas empiezan por *E*: la primera define los requisitos técnicos del output; la segunda, cómo debe verse ese output.

La diferencia entre un prompt incompleto y uno construido con FRAME es consistentemente la diferencia entre un resultado que hay que reescribir y uno que se puede usar directamente.

---

### F — FORMATO

La primera pregunta es la más básica y la más ignorada: **¿qué tipo de material quieres obtener?**

El formato no es solo el tipo de texto. Es la forma concreta que debe tener el output: cuántas partes, qué extensión, qué estructura, en qué orden aparecen los elementos.

**Ejemplos de formato bien especificado:**

- *Texto narrativo de 180-200 palabras en primera persona*
- *Diálogo de 10 intervenciones (5 por interlocutor) en registro informal*
- *Ejercicio de emparejamiento con 8 ítems, instrucciones en español y solucionario al final*
- *Plan de clase de 90 minutos con actividades de calentamiento, desarrollo y cierre*
- *Tabla comparativa de tres columnas: forma, uso y ejemplo*

**El error más frecuente:** Decir «crea un ejercicio» sin especificar el tipo. La IA elegirá el formato que más ha visto en sus datos de entrenamiento, que no necesariamente es el que necesitas.

**Regla práctica:** Si puedes describir cómo se vería el resultado sobre el papel, tienes suficiente información para especificar el formato.

---

### R — ROL

La segunda pregunta define el punto de vista desde el que la IA debe generar el output: **¿qué papel debe adoptar el modelo?**

Asignar un rol no es un truco retórico. Es una forma de activar el marco de referencia correcto en el modelo: cuando le pides que actúe como especialista en ELE, el modelo prioriza criterios pedagógicos y lingüísticos que de otro modo quedan en segundo plano.

**Roles útiles en ELE:**

- *«Actúa como profesor de ELE especializado en gramática para niveles B1-B2»*
- *«Eres un corrector de textos experto en español académico»*
- *«Actúa como especialista en el MCER y el Plan Curricular del Instituto Cervantes»*
- *«Eres un hablante nativo de español rioplatense escribiendo para una revista cultural»*
- *«Actúa como diseñador instruccional especializado en materiales de lengua para adultos»*

**El error más frecuente:** No definir ningún rol, o definirlo de forma tan genérica que no aporta información (por ejemplo, «actúa como profesor»).

**Regla práctica:** Cuanto más específico es el rol, más calibrado es el resultado. Un rol bien definido puede sustituir a varias líneas de especificaciones.

---

### A — AUDIENCIA

La tercera pregunta define para quién es el material: **¿quiénes son los destinatarios finales?**

En ELE, la audiencia no se describe solo con el nivel MCER. Se describe con varios parámetros que la IA puede usar para ajustar vocabulario, referencias culturales, complejidad sintáctica y registro.

**Parámetros para describir la audiencia en ELE:**

| Parámetro | Ejemplo concreto |
|-----------|-----------------|
| Nivel MCER | B1, B2, rango A2-B1 |
| Edad y etapa | Adolescentes (14-16 años), adultos jóvenes, personas mayores |
| Origen | Estudiantes anglófonos, grupo heterogéneo, alumnado japonés |
| Contexto | Inmersión en España, clase online, contexto universitario |
| Objetivo | Preparación DELE, español de negocios, turismo |
| Conocimientos previos | Sin conocimientos previos del subjuntivo, familiarizados con el pretérito |

**El error más frecuente:** Escribir «para estudiantes de español» o «nivel intermedio». Esas indicaciones son tan vagas que la IA no puede hacer nada útil con ellas.

**Regla práctica:** Imagina que le describes el grupo a un colega que va a sustituirte. Esa descripción es tu especificación de audiencia.

---

### M — META

La cuarta pregunta define el propósito de aprendizaje del material: **¿qué será capaz de hacer el alumno gracias a este recurso?**

La meta no es «aprender el subjuntivo». Eso es un contenido. La meta es un objetivo comunicativo observable:

> **El alumnado será capaz de [acción comunicativa] usando [contenido lingüístico] en [contexto].**

**Ejemplos de metas bien formuladas:**

- *«El alumnado será capaz de narrar experiencias pasadas usando el contraste indefinido/imperfecto en contextos de anécdotas personales»*
- *«El alumnado será capaz de expresar acuerdo y desacuerdo de forma matizada usando conectores contraargumentativos en debates sobre tecnología»*
- *«El alumnado será capaz de redactar un correo formal de queja usando el registro adecuado y las fórmulas de cortesía en español peninsular»*

**Por qué importa la meta en el prompt:** Cuando especificas el objetivo comunicativo, la IA ajusta automáticamente la selección léxica, las estructuras gramaticales y el tipo de input que genera. Sin meta, produce material genérico; con meta, produce material alineado con el aprendizaje.

**El error más frecuente:** Confundir el contenido lingüístico con el objetivo. «Practicar el subjuntivo» es un contenido. «Ser capaz de expresar deseos y recomendaciones usando el subjuntivo en conversaciones cotidianas» es una meta.

---

### E — ESPECIFICACIONES

La quinta pregunta define los requisitos técnicos del output: **¿qué debe incluir, cómo debe estar escrito y qué restricciones tiene?**

Las especificaciones son la lista de condiciones que el resultado debe cumplir. En ELE, estas condiciones son especialmente importantes porque afectan directamente a la usabilidad del material en clase.

**Especificaciones frecuentes en ELE:**

- Longitud exacta o rango (*«entre 150 y 200 palabras»*, *«exactamente 10 ítems»*)
- Elementos obligatorios (*«incluye instrucciones en español, solucionario y nota cultural»*)
- Variedad del español (*«español peninsular»*, *«sin modismos regionales»*, *«léxico latinoamericano estándar»*)
- Registro (*«informal entre amigos»*, *«formal escrito»*, *«oral espontáneo»*)
- Restricciones de vocabulario (*«sin léxico superior a B1»*, *«evita estructuras subordinadas complejas»*)
- Formato de respuesta (*«usa corchetes para los huecos»*, *«numera los ítems»*)

**El error más frecuente:** Asumir que la IA va a tomar las decisiones correctas por defecto. No las toma. O las toma de una forma que puede no coincidir con tus necesidades.

**Regla práctica:** Imagina que vas a entregar el resultado directamente a tus alumnos. ¿Qué faltaría o qué habría que cambiar? Eso es lo que debes especificar.

---

### E — EJEMPLO

La sexta pregunta invita a mostrar cómo debe verse el resultado: **¿puedes incluir un modelo del output esperado?**

Esta componente es opcional, pero es la que más mejora la calidad del resultado cuando se incluye. Un ejemplo elimina ambigüedad de una forma que ninguna descripción verbal puede igualar.

**Cuándo incluir un ejemplo:**

- Cuando el formato es inusual o muy específico
- Cuando tienes un estilo propio que quieres replicar
- Cuando las especificaciones anteriores no capturan del todo lo que quieres
- Cuando el nivel de lengua es crítico y quieres calibrarlo con precisión

**Cómo incluir el ejemplo:**

```
El ejercicio debe tener este formato:

Instrucción: Completa las frases con la forma correcta del verbo.

1. Ayer _______ (ir, yo) al mercado y _______ (comprar) fruta fresca.
2. Mientras _______ (leer, ella), sonó el teléfono.

Solucionario:
1. fui / compré
2. leía
```

**El error más frecuente:** No incluir ejemplo porque parece redundante después de las especificaciones. En realidad, un ejemplo concreto comunica más información que tres líneas de descripción.

\newpage

## FRAME EN ACCIÓN: UN PROMPT PASO A PASO

Vamos a construir un prompt completo usando FRAME, componente a componente. El objetivo: crear un texto narrativo para trabajar en clase con un grupo de B2.

---

**Sin FRAME** (prompt típico de docente que empieza):

```
Crea un texto narrativo para nivel B2 sobre un viaje.
```

Resultado probable: Un texto correcto pero genérico, sin anclaje cultural, posiblemente demasiado largo o demasiado corto, sin actividades asociadas, con un vocabulario que puede no corresponder al B2.

---

**Con FRAME** (prompt construido componente a componente):

```
[F] FORMATO: Texto narrativo en primera persona, 180-200 palabras,
con título. Al final: 5 preguntas de comprensión lectora (respuesta
corta) y 1 pregunta de opinión para debate.

[R] ROL: Actúa como profesor de ELE especializado en destrezas
escritas para niveles B2.

[A] AUDIENCIA: Estudiantes universitarios de entre 20 y 25 años,
de origen anglófono, en un programa de inmersión en Madrid.
Nivel B2 consolidado.

[M] META: El alumnado será capaz de identificar el uso narrativo
del pretérito imperfecto e indefinido en un texto auténtico
y reflexionar sobre experiencias de choque cultural.

[E] ESPECIFICACIONES:
- Español peninsular estándar, registro personal y cercano
- Vocabulario B2 (sin léxico C1 sin contextualización)
- Narración en primera persona sobre un momento de choque cultural
  en España experimentado por una persona extranjera
- Usar tanto pretérito imperfecto como indefinido de forma natural
- Incluir 2-3 expresiones coloquiales españolas en contexto
- Las preguntas de comprensión deben ser de respuesta abierta corta
  (2-3 frases), no de verdadero/falso

[E] EJEMPLO DE ESTILO:
"La primera vez que fui al mercado de la Boqueria, no entendía
por qué nadie hacía cola. La gente simplemente se acercaba al
mostrador y pedía a gritos. Yo esperé veinte minutos sin que
nadie me atendiera..."
[Tono personal, ligeramente humorístico, con observaciones
culturales concretas]
```

La diferencia en el resultado no es marginal. Es la diferencia entre material que hay que reescribir y material que se puede usar.

---

## FRAME EN UNA TABLA DE REFERENCIA RÁPIDA

| Componente | Pregunta clave | Error frecuente | Ejemplo correcto |
|-----------|---------------|-----------------|-----------------|
| **F** Formato | ¿Qué tipo de material? | «Crea un ejercicio» | «Ejercicio de completar, 10 ítems, con solucionario» |
| **R** Rol | ¿Desde qué posición? | Sin rol o rol genérico | «Especialista en ELE para B2» |
| **A** Audiencia | ¿Para quién? | «Para estudiantes» | «Adultos anglófonos, B1, contexto online» |
| **M** Meta | ¿Qué aprenderán? | «Practicar el subjuntivo» | «Expresar deseos usando el subjuntivo en situaciones cotidianas» |
| **E** Especificaciones | ¿Qué condiciones? | Sin restricciones | «180-200 palabras, español peninsular, instrucciones en español» |
| **E** Ejemplo | ¿Cómo debe verse? | No incluir ejemplo | Fragmento modelo del estilo o formato deseado |
