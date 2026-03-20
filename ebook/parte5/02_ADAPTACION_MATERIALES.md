# Flujo 2: Adaptar materiales existentes
### Cómo transformar un texto, un ejercicio o una actividad para otro nivel, grupo o contexto

\newpage

## ADAPTAR EN LUGAR DE CREAR: UN FLUJO ESENCIAL

No siempre hay que crear desde cero. La mayoría de los docentes de ELE tiene materiales que funcionan bien para un grupo pero no para otro: un texto demasiado difícil para el nivel actual, un ejercicio diseñado para adultos que hay que convertir para adolescentes, una actividad oral que hay que transformar en tarea escrita, un material de español europeo que llega a un grupo latinoamericano. La IA es especialmente eficaz en este tipo de trabajo: adaptar requiere comprender el material original, identificar qué hay que cambiar y reescribir con criterio. Este flujo muestra cómo hacerlo de forma sistemática.

---

\newpage

### PROMPT AD-01 — Adaptar un texto a otro nivel

El caso más frecuente: tienes un texto auténtico que te gusta pero está por encima o por debajo del nivel de tu grupo.

```
Actúa como profesor de ELE especializado en
adaptación de textos para distintos niveles.

FORMATO: Versión adaptada de un texto al nivel [NIVEL],
manteniendo el contenido esencial y el interés.

AUDIENCIA: [Grupo] nivel [NIVEL destino].

META: Adaptar el siguiente texto al nivel [NIVEL
destino] sin perder su valor informativo ni su
capacidad de interés para el lector.

ESPECIFICACIONES:
- Nivel original estimado: [NIVEL original]
- Nivel destino: [NIVEL destino]
- Cambios en vocabulario: sustituir léxico complejo
  por equivalentes del nivel destino, sin simplificar
  en exceso ni infantilizar el texto
- Cambios en sintaxis: acortar o simplificar las
  frases más complejas (si se adapta a la baja);
  enriquecer la sintaxis si se adapta al alza
- Mantener: la voz del texto, el tema, los datos
  esenciales, el tono
- No convertir el texto en un ejercicio: que siga
  siendo un texto real, no un texto didáctico
- Después: tabla con 5 cambios realizados y su justificación

[PEGAR AQUÍ EL TEXTO ORIGINAL]
```

**Output real (Claude) — Texto periodístico C1 → B1:**

> **Texto original (C1):**
> «La proliferación de plataformas de streaming ha fragmentado el consumo audiovisual de una manera sin precedentes en la historia de la industria, generando un ecosistema en el que la hegemonía de los grandes estudios convive, de forma paradójica, con una atomización de la audiencia que dificulta la emergencia de fenómenos culturales de masa comparables a los de décadas anteriores.»
>
> **Versión adaptada (B1):**
> «Hoy en día hay muchas plataformas de streaming: Netflix, HBO, Disney+, Amazon... Esto ha cambiado mucho la forma en que vemos películas y series. Antes, toda la gente veía los mismos programas en televisión. Ahora cada persona elige lo que quiere ver, cuándo y cómo. Por eso es más difícil que todo el mundo hable de la misma serie al mismo tiempo.»
>
> **Cambios realizados:**
> | Cambio | Elemento original | Adaptación |
> |--------|-----------------|-----------|
> | Léxico | «proliferación de plataformas» | «hay muchas plataformas» |
> | Sintaxis | frase única de 55 palabras | 4 frases cortas |
> | Léxico | «fragmentado el consumo audiovisual» | «cambiado la forma en que vemos» |
> | Estructura | nominalización abstracta | construcción verbal directa |
> | Léxico | «fenómenos culturales de masa» | «que todo el mundo hable de la misma serie» |

---

### PROMPT AD-02 — Adaptar una actividad para otro grupo

A veces el problema no es el nivel sino el tipo de grupo: una actividad diseñada para adultos hay que adaptarla para adolescentes, o al revés.

```
Actúa como profesor de ELE especializado en
didáctica para [grupo destino: adolescentes /
adultos / niños / contexto profesional, etc.].

FORMATO: Versión adaptada de la siguiente actividad
para [grupo destino].

AUDIENCIA ORIGINAL: [describir el grupo original]
AUDIENCIA DESTINO: [describir el grupo destino]

META: Adaptar la actividad manteniendo el objetivo
didáctico y el nivel lingüístico, pero ajustando
el tema, el formato, los ejemplos y la motivación
al nuevo grupo.

ESPECIFICACIONES:
- Qué puede mantenerse igual: la estructura de
  la actividad, el objetivo gramatical o funcional
- Qué debe cambiar: los temas, los personajes,
  los ejemplos, el tono de las instrucciones,
  el tipo de incentivo o motivación
- Versión adaptada completa (no solo los cambios)
- Nota de adaptación: 3 decisiones tomadas y
  su justificación

[PEGAR AQUÍ LA ACTIVIDAD ORIGINAL]
```

**Output real (Claude) — Role-play de adultos → adolescentes:**

> **Actividad original (adultos, B1):**
> Role-play de negociación de alquiler de piso. Alumno A: inquilino que busca piso. Alumno B: propietario. Vocabulario: contrato, fianza, gastos, nómina, garantías.
>
> **Versión adaptada (adolescentes, B1):**
>
> **«Negociamos el plan»**
>
> *Situación:* Este fin de semana hay dos eventos y tu grupo de amigos tiene que decidir a cuál ir. El problema: no todos quieren lo mismo y el presupuesto es limitado.
>
> *Alumno A:* quieres ir a un festival de música. Tienes entradas con descuento (15 € por persona). Solo duran hasta mañana.
> *Alumno B:* prefieres ir a la ciudad a ver una película y cenar. Calculas que cuesta unos 20 € por persona, pero no hay prisa.
>
> *Tenéis que llegar a un acuerdo.*
>
> *Vocabulario útil:* proponer, convencer, llegar a un acuerdo, comprometerse, tener en cuenta, a cambio, ¿y si...?, yo que tú...
>
> **Decisiones de adaptación:**
> 1. *Tema:* del alquiler de piso (irrelevante para adolescentes) a la negociación de planes de fin de semana (universal y motivador para ese grupo).
> 2. *Vocabulario:* del léxico jurídico-administrativo al léxico de la negociación cotidiana, igual de funcional pero más próximo.
> 3. *Tono:* las instrucciones usan segunda persona informal y el escenario es social, no transaccional. Se mantiene el mismo objetivo comunicativo (negociar y llegar a un acuerdo).

---

### PROMPT AD-03 — Cambiar la destreza de una actividad

Tienes un material de comprensión lectora y quieres convertirlo en actividad de expresión oral, o al revés.

```
Actúa como profesor de ELE especializado en diseño
de actividades comunicativas para nivel [NIVEL].

FORMATO: Versión de la siguiente actividad adaptada
para trabajar [destreza destino] en lugar de
[destreza original].

AUDIENCIA: [Grupo]

META: Transformar la actividad manteniendo el
tema, el vocabulario y el nivel, pero cambiando
la destreza principal de trabajo.

ESPECIFICACIONES:
- Destreza original: [comprensión lectora /
  expresión escrita / expresión oral / comprensión
  auditiva]
- Destreza destino: [la que quieres trabajar]
- El contenido lingüístico trabajado debe ser
  el mismo: solo cambia el canal y el formato
- Versión adaptada completa con instrucciones
  claras para el alumno
- Nota: qué gana y qué pierde la actividad
  con este cambio de destreza

[PEGAR AQUÍ LA ACTIVIDAD ORIGINAL]
```

**Output real (Claude) — Lectura → Expresión oral:**

> **Actividad original (comprensión lectora):**
> Texto sobre el teletrabajo + preguntas de comprensión (verdadero/falso + preguntas abiertas).
>
> **Versión adaptada (expresión oral — debate corto):**
>
> **«Teletrabajo: ¿sí o no?»**
>
> *Fase 1 — Prepara tu postura (5 min):*
> Lee estas dos afirmaciones. Elige la que más se acerca a tu opinión y prepara 2 argumentos:
> - «El teletrabajo mejora la calidad de vida de los trabajadores.»
> - «El teletrabajo aísla y dificulta la comunicación en los equipos.»
>
> *Fase 2 — Debate en grupos de 4 (10 min):*
> En grupos de 4 (2 a favor, 2 en contra), debatid durante 8 minutos. El moderador del grupo tiene un minuto al final para resumir los argumentos de cada postura.
>
> *Expresiones útiles:* yo creo que / en mi opinión / estoy de acuerdo en que, pero... / no estoy convencido/a de que / a diferencia de...
>
> **Qué gana y qué pierde:**
> *Gana:* interacción real, producción oral espontánea, trabajo con el léxico en uso activo.
> *Pierde:* trabajo profundo con el texto, comprensión detallada, práctica de la lectura.
> *Cuándo elegir esta versión:* cuando el grupo necesita más práctica oral y el texto ya se ha trabajado en otra sesión, o cuando el objetivo de la sesión es la expresión oral.

---

### PROMPT AD-04 — Adaptar materiales a un contexto cultural diferente

Un material de español europeo que llega a un grupo en México, Argentina o cualquier otro contexto hispanohablante (o viceversa).

```
Actúa como profesor de ELE especializado en
variedad lingüística y adaptación cultural.

FORMATO: Versión adaptada del siguiente material
al contexto cultural y lingüístico de [país /
región / variedad del español].

AUDIENCIA ORIGINAL: [contexto original]
AUDIENCIA DESTINO: [contexto destino]

META: Adaptar el material para que sea lingüística
y culturalmente relevante y auténtico para el
nuevo contexto, sin cambiar el objetivo didáctico
ni el nivel.

ESPECIFICACIONES:
- Cambios léxicos: sustituir palabras o expresiones
  propias de la variedad original por equivalentes
  de la variedad destino
- Cambios de referentes culturales: sustituir
  ejemplos, lugares, marcas, situaciones o personas
  que solo tienen sentido en el contexto original
- Mantener: el objetivo, la estructura, el nivel,
  el tipo de ejercicio
- Tabla de cambios: qué se ha cambiado y por qué

[PEGAR AQUÍ EL MATERIAL ORIGINAL]
```

**Output real (Claude) — Adaptación España → México:**

> **Material original (contexto España):**
> Diálogo en una farmacia: «¿Tiene algo para el catarro? / Sí, aquí tiene un jarabe. / ¿Lo cubre la Seguridad Social? / No, este no. Tiene que pagar en caja. / De acuerdo. ¿Me da también un pañuelo de papel?»
>
> **Versión adaptada (contexto México):**
> «¿Tiene algo para el resfriado? / Sí, aquí tiene un jarabe. / ¿Lo cubre el IMSS? / No, este no está en el cuadro básico. Tiene que pagarlo de su bolsillo. / Está bien. ¿Y me da también un kleenex?»
>
> **Tabla de cambios:**
> | Elemento | Original (España) | Adaptado (México) | Justificación |
> |----------|------------------|-------------------|---------------|
> | «catarro» | catarro | resfriado | Término más frecuente en México |
> | «Seguridad Social» | Seguridad Social | IMSS | Institución equivalente en México |
> | «no lo cubre» | no lo cubre | no está en el cuadro básico | Expresión más específica del sistema mexicano |
> | «pagar en caja» | pagar en caja | pagarlo de su bolsillo | Formulación más natural en ese contexto |
> | «pañuelo de papel» | pañuelo de papel | kleenex | Uso del genérico como nombre común en México |

---

### PROMPT AD-05 — Crear variantes de dificultad de una misma actividad

Para atender la diversidad dentro de un mismo grupo: misma actividad en tres versiones de dificultad.

```
Actúa como profesor de ELE especializado en
atención a la diversidad y diseño multinivel.

FORMATO: 3 versiones de la siguiente actividad
con diferente nivel de apoyo y exigencia.

AUDIENCIA: Grupo con distintos niveles o ritmos
de aprendizaje dentro del mismo aula.

META: Las tres versiones trabajan el mismo objetivo
comunicativo con el mismo vocabulario, pero
ofrecen distinto nivel de andamiaje para que
cada alumno pueda participar con éxito.

ESPECIFICACIONES:
- Versión A (con más apoyo): texto más corto,
  vocabulario dado, estructura muy guiada
- Versión B (estándar): el material tal como está
- Versión C (más desafío): mayor exigencia de
  producción, menos andamiaje, extensión mayor,
  pregunta de reflexión adicional
- Las tres versiones tienen el mismo título
  y el mismo objetivo visible para el alumno;
  el nivel de apoyo no debe estigmatizar

[PEGAR AQUÍ LA ACTIVIDAD ORIGINAL]
```

**Output real (Claude) — Actividad de escritura sobre un viaje, B1:**

> **Versión A — Con apoyo:**
> *Escribe sobre un viaje. Usa estas preguntas como guía:*
> 1. ¿Adónde fuiste? ¿Con quién?
> 2. ¿Qué hiciste allí? (escribe 3 actividades)
> 3. ¿Qué fue lo mejor?
> 4. ¿Volvería a ir?
>
> *Vocabulario de ayuda: visité / comí / conocí / me alojé en / lo mejor fue / me gustó mucho / volvería porque...*
>
> *Extensión: 80-100 palabras.*
>
> **Versión B — Estándar:**
> *Escribe un texto sobre un viaje que hayas hecho. Explica adónde fuiste, qué hiciste y qué recuerdas especialmente. Usa el pretérito indefinido y el imperfecto. (120-150 palabras)*
>
> **Versión C — Con más desafío:**
> *Escribe un texto sobre un viaje que hayas hecho. Incluye: una descripción del lugar y el ambiente (imperfecto), la narración de al menos dos anécdotas específicas (indefinido) y una reflexión personal: ¿qué aprendiste de ese viaje o de ti mismo? Intenta usar vocabulario variado y evitar repeticiones. (180-220 palabras)*
>
> *Pregunta adicional: ¿Crees que viajar cambia la forma de ver el mundo? ¿Por qué sí o por qué no?*

---

### RESUMEN DEL FLUJO

> **5 tipos de adaptación con un prompt cada uno:**
>
> | Prompt | Transformación |
> |--------|---------------|
> | AD-01 | Texto → otro nivel |
> | AD-02 | Actividad → otro grupo |
> | AD-03 | Actividad → otra destreza |
> | AD-04 | Material → otro contexto cultural |
> | AD-05 | Actividad → tres niveles de dificultad |
>
> **Principio clave:** nunca pidas a la IA que «simplifique» o «haga más fácil» sin dar criterios. Especifica siempre qué debe cambiar y qué debe mantenerse. La adaptación sin criterio produce simplificación sin sentido.
