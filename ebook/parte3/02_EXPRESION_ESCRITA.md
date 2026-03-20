# Expresión e interacción escrita
### Crear modelos, andamiajes y tareas de escritura para cualquier nivel

\newpage

## EXPRESIÓN ESCRITA CON IA

La IA es especialmente poderosa para la expresión escrita porque puede actuar en tres momentos diferentes del proceso: antes de escribir (generando modelos, andamiajes y banco de recursos), durante la escritura (como herramienta de consulta del alumno) y después de escribir (como corrector y evaluador). Los prompts de esta sección cubren los tres momentos.

---

\newpage

### PROMPT EE-01 — Texto modelo con andamiaje visible

**Objetivo:** Crear un texto modelo que muestre explícitamente la estructura y los recursos del género para que el alumno los imite.

```
Actúa como profesor de ELE especializado en expresión
escrita para nivel [NIVEL].

FORMATO: Texto modelo de [tipo de texto] de [N] palabras
con andamiaje visible: cada sección marcada y sus recursos
señalados.

AUDIENCIA: [Grupo]

META: El alumnado será capaz de escribir su propio [tipo
de texto] siguiendo el modelo estructural y usando
los recursos lingüísticos señalados.

ESPECIFICACIONES:
- Tipo de texto: [correo, narración, descripción,
  argumentación, etc.]
- El texto modelo está dividido en secciones con una
  etiqueta entre corchetes: [INTRODUCCIÓN], [ARGUMENTO 1], etc.
- Después de cada sección, una nota entre paréntesis
  señala los recursos lingüísticos usados:
  (Recursos: conector de contraste «sin embargo»,
  presente de subjuntivo para expresar deseo)
- Al final: plantilla vacía con la misma estructura
  para que el alumno complete con sus propias ideas
```

**Output real (Claude) — Texto modelo argumentativo B2:**

> **[INTRODUCCIÓN — presenta el tema y anuncia la postura]**
>
> El debate sobre la semana laboral de cuatro días lleva años presente en países del norte de Europa, pero en España todavía genera controversia. En mi opinión, implantar esta medida de forma generalizada beneficiaría tanto a los trabajadores como a las empresas, siempre que se haga de forma planificada.
>
> *(Recursos: «lleva + tiempo + gerundio» para duración, «en mi opinión» para presentar postura, «siempre que + subjuntivo» para condición)*
>
> **[ARGUMENTO 1 — el más importante]**
>
> En primer lugar, existe evidencia científica de que trabajar menos horas no reduce la productividad. Varios países que han realizado pruebas piloto, como Islandia o Japón, han obtenido resultados sorprendentes: los empleados rinden igual o más en cuatro días que en cinco.
>
> *(Recursos: «en primer lugar» para ordenar, «como» para ejemplificar, «han + participio» para resultados recientes)*
>
> **[ARGUMENTO 2 — apoya y añade]**
>
> Además, una jornada más corta mejoraría la conciliación familiar. Muchas familias tienen dificultades para compatibilizar el horario laboral con el escolar. Un día libre adicional permitiría dedicar más tiempo a los hijos, reducir el estrés doméstico y, en consecuencia, mejorar el bienestar general.
>
> *(Recursos: «además» para añadir, condicional para hipótesis, «en consecuencia» para resultado)*
>
> **[CONTRAARGUMENTO + REFUTACIÓN]**
>
> Es cierto que algunos sectores, como la hostelería o el comercio, tendrían dificultades para adaptarse. No obstante, esta objeción no invalida la propuesta: bastaría con establecer modelos flexibles adaptados a cada tipo de empresa.
>
> *(Recursos: «es cierto que» para conceder, «no obstante» para refutar, «bastaría con» para proponer solución)*
>
> **[CONCLUSIÓN]**
>
> En definitiva, la semana de cuatro días no es una utopía: es una medida con respaldo empírico que merece un debate serio en nuestro país.
>
> *(Recursos: «en definitiva» para concluir, refuerzo de la postura inicial)*
>
> ---
>
> **Plantilla para el alumno:**
> [INTRODUCCIÓN — presenta el tema y tu postura]
> ___
> [ARGUMENTO 1] ___
> [ARGUMENTO 2] ___
> [CONTRAARGUMENTO + REFUTACIÓN] ___
> [CONCLUSIÓN] ___

---

### PROMPT EE-02 — Banco de recursos para un género textual

**Objetivo:** Crear un banco de expresiones útiles para un género textual concreto, organizado por función.

```
Actúa como profesor de ELE especializado en escritura
funcional para nivel [NIVEL].

FORMATO: Banco de recursos organizado por función
comunicativa.

AUDIENCIA: [Grupo] que va a escribir [tipo de texto].

META: El alumnado dispondrá de un repertorio de expresiones
para cada parte del texto y cada función comunicativa,
organizadas por grado de formalidad.

ESPECIFICACIONES:
- Tipo de texto: [correo formal, carta de queja, correo
  informal, artículo, descripción, narración, etc.]
- Organiza las expresiones por función (no por orden
  en el texto): abrir, cerrar, presentar, argumentar,
  pedir, agradecer, contrastar, etc.
- Para cada función: 4-5 expresiones de diferentes
  grados de formalidad (muy formal / formal / neutro /
  informal)
- Señala cuándo no usar cada expresión
  (registro incorrecto, contexto inapropiado)
```

**Output real (Claude) — Banco para correo formal:**

> **Banco de recursos — Correo formal en español**
>
> **Abrir el correo:**
> - Muy formal: *«Me dirijo a usted para...»* / *«En respuesta a su comunicación del...»*
> - Formal: *«Le escribo para...»* / *«Me pongo en contacto con usted con motivo de...»*
> - Neutro: *«Le escribo porque...»*
> - ⚠️ No usar: *«Hola»* / *«Buenos días»* sin apellido en correos muy formales
>
> **Pedir información o acción:**
> - Muy formal: *«Le agradecería que me facilitara...»* / *«Sería posible que...»*
> - Formal: *«¿Podría usted informarme sobre...?»* / *«Le ruego que...»*
> - Neutro: *«¿Me podría decir...?»* / *«Necesitaría saber...»*
> - ⚠️ No usar: *«Quiero que...»* / *«Dame...»*
>
> **Expresar el motivo:**
> - *«Con motivo de...»* / *«En relación con...»* / *«A raíz de...»* / *«Dado que...»*
>
> **Adjuntar documentos:**
> - *«Adjunto a este correo...»* / *«Le remito en documento adjunto...»* / *«Encontrará adjunto...»*
>
> **Cerrar:**
> - Muy formal: *«En espera de su respuesta, reciba un cordial saludo»*
> - Formal: *«Quedo a su disposición para cualquier consulta»*
> - Neutro: *«Un saludo»* / *«Atentamente»*
> - ⚠️ No usar: *«Besos»* / *«Un abrazo»*

---

### PROMPT EE-03 — Tarea de escritura con instrucciones completas

**Objetivo:** Crear una tarea de expresión escrita con contexto comunicativo real, instrucciones claras y criterios de evaluación.

```
Actúa como profesor de ELE especializado en evaluación
de la expresión escrita para nivel [NIVEL].

FORMATO: Tarea completa de expresión escrita.

AUDIENCIA: [Grupo]

META: El alumnado será capaz de producir un texto de
[tipo] adaptado a una situación comunicativa concreta,
con el registro, la extensión y la estructura adecuados.

ESPECIFICACIONES:
- Tipo de texto: [especificar]
- La tarea incluye: contexto comunicativo (quién escribe,
  a quién, por qué), instrucciones claras en español,
  extensión requerida, notas de registro
- Criterios de evaluación: rúbrica con 4 criterios
  (adecuación, coherencia, corrección, variedad léxica)
  en 4 niveles (0-3 puntos cada uno, total 12)
- Una pregunta de reflexión post-tarea
```

**Output real (Claude) — Tarea nivel B1:**

> **Tarea: Una reseña para un grupo de viaje**
>
> *Situación:* Formas parte de un grupo de WhatsApp de viajeros hispanohablantes. Acabas de visitar un restaurante, museo o lugar turístico en tu ciudad (real o imaginario) y quieres compartir tu opinión con el grupo.
>
> *Escribe una reseña* para el grupo de 130-160 palabras en la que:
> - Describas brevemente el lugar
> - Cuentes qué hiciste o viste allí
> - Des tu opinión (qué te gustó y qué mejorarías)
> - Termines con una recomendación o contradicción
>
> *Registro:* informal-neutro (es un grupo de amigos con intereses comunes)
>
> ---
>
> **Rúbrica de evaluación:**
>
> | Criterio | 3 (Excelente) | 2 (Bien) | 1 (Suficiente) | 0 (Insuficiente) |
> |----------|--------------|---------|---------------|-----------------|
> | **Adecuación** | Texto completamente adecuado al género, registro y extensión | Alguna desviación menor de registro o extensión | Registro inconsistente o extensión inadecuada | No responde a la tarea |
> | **Coherencia** | Ideas bien organizadas, progresión lógica clara | Organización correcta con alguna imprecisión | Organización básica, algunas rupturas | Texto desorganizado |
> | **Corrección** | Errores mínimos que no dificultan la comprensión | Errores frecuentes pero sin obstaculizar la comunicación | Errores que dificultan la comprensión | Errores graves y sistemáticos |
> | **Variedad léxica** | Léxico variado y apropiado al nivel; sin repeticiones | Léxico adecuado con algunas repeticiones | Léxico limitado pero funcional | Léxico muy pobre o inapropiado |
>
> **Reflexión post-tarea:**
> ¿Qué fue lo más difícil de escribir este texto? ¿Qué buscarías en un diccionario o gramática si lo hicieras de nuevo?

---

### PROMPT EE-04 — Corrección con comentarios pedagógicos

**Objetivo:** Crear una plantilla de corrección de textos que sea pedagógica y no solo señale errores.

```
Actúa como profesor de ELE especializado en corrección
y retroalimentación escrita para nivel [NIVEL].

TAREA: Corrige el siguiente texto de un alumno de [NIVEL].

AUDIENCIA: El alumno que escribió el texto.

META: El alumno comprenderá sus errores, sabrá cómo
corregirlos y podrá aplicar ese conocimiento en textos
futuros.

ESPECIFICACIONES:
- Texto del alumno: [pegar aquí]
- Tipo de corrección: no corrección directa; usa un
  sistema de marcas que el alumno debe interpretar:
  · [G] = error gramatical → el alumno busca la regla
  · [L] = léxico inadecuado → el alumno busca alternativa
  · [R] = registro inadecuado → el alumno reformula
  · [C] = problema de coherencia → el alumno reorganiza
  · (✓) = expresión especialmente buena → señalar siempre
- Después de las marcas: 3 comentarios generales
  (1 positivo, 1 prioridad de mejora, 1 consejo)
- Versión corregida completa al final (para que el alumno
  pueda comparar después de intentar la autocorrección)
```

**Output real (Claude):**

> **Texto del alumno con marcas:**
>
> «El verano pasado he ido[G] a Barcelona con mis amigos. Fue muy divertido. Visitamos muchos lugares bonitos, como el Sagrada Familia[G] y el Parque Güell. La ciudad es muy grande y hay muchas cosas que hacer[✓]. Me gustó mucho la comida española, especialmente las tapas. Sin embargo, el tiempo fue[G] muy caluroso y a veces era difícil caminar[L]. Pero en total, fue una experiencia increíble[✓] y quiero volver otra vez[R].»
>
> **Comentarios generales:**
> 1. *(Positivo)* Buena estructura narrativa y uso correcto de los tiempos para narrar eventos. Las expresiones «hay muchas cosas que hacer» y «fue una experiencia increíble» son naturales y precisas.
> 2. *(Prioridad)* Revisa el uso del pretérito perfecto vs. indefinido: en español peninsular, «el verano pasado» exige indefinido («fui», no «he ido»).
> 3. *(Consejo)* Para decir que algo es difícil físicamente puedes usar «era agotador» o «resultaba difícil». «Caminar» es correcto, pero «pasear» sería más natural en contexto turístico.

---

### PROMPT EE-05 — Ejercicio de cohesión textual

**Objetivo:** Crear ejercicios específicos para trabajar los mecanismos de cohesión: conectores, referencia, elipsis y repetición.

```
Actúa como profesor de ELE especializado en cohesión
textual para nivel [B2/C1].

FORMATO: Tres ejercicios de cohesión textual.

AUDIENCIA: [Grupo]

META: El alumnado será capaz de usar mecanismos de
cohesión textual (conectores, pronombres de referencia,
elipsis, sinónimos) para crear textos coherentes y
fluidos.

ESPECIFICACIONES:
- Ejercicio 1: un texto «descohesionado» (sin conectores,
  con repetición de palabras) que el alumno debe mejorar
  añadiendo conectores y variantes léxicas
- Ejercicio 2: un texto con pronombres de referencia
  ambiguos que el alumno debe clarificar
- Ejercicio 3: un párrafo fragmentado en frases simples
  que el alumno debe conectar con subordinación y
  coordinación para crear un texto más elaborado
- Solucionario con varias opciones posibles (hay más
  de una solución correcta en muchos casos)
```

**Output real (Claude):**

> **Ejercicio 1 — Mejora la cohesión:**
>
> *Texto original (repetitivo, sin conectores):*
> «María estudia medicina. María estudia mucho. María está cansada. María quiere terminar la carrera. María quiere trabajar en un hospital. El hospital es grande. El hospital está en Madrid. María quiere trabajar en Madrid.»
>
> *Reescribe el texto usando conectores y evitando repeticiones.*
>
> *Posible solución:* «María estudia medicina y, aunque está agotada, se esfuerza mucho porque quiere terminar la carrera cuanto antes. Su sueño es trabajar en un gran hospital de Madrid, ciudad a la que espera mudarse en cuanto se gradúe.»
>
> **Ejercicio 2 — Clarifica las referencias:**
>
> *Texto con ambigüedad:*
> «Carlos le dijo a su hermano que él tenía que hablar con el jefe antes de que él tomara una decisión. Él estaba muy preocupado porque él sabía que él no aceptaría la propuesta fácilmente.»
>
> *¿A quién se refiere cada «él»? Reescribe el texto eliminando la ambigüedad.*

---

### PROMPT EE-06 — Escritura colaborativa: estructura de actividad

**Objetivo:** Diseñar una actividad de escritura colaborativa entre alumnos con roles definidos.

```
Actúa como profesor de ELE especializado en metodología
colaborativa para nivel [NIVEL].

FORMATO: Instrucciones completas para una actividad de
escritura colaborativa en grupos de 3-4 personas.

AUDIENCIA: [Grupo]

META: El alumnado producirá un texto colaborativo de
[tipo] desarrollando estrategias de negociación,
revisión entre pares y escritura cooperativa.

ESPECIFICACIONES:
- Tipo de texto: [narrativo / argumentativo / descriptivo]
- Duración total de la actividad: 45-60 minutos
- Roles en el grupo: coordinador, redactor, corrector,
  portavoz (pueden rotar)
- Fases: planificación (10'), borrador (15'), revisión
  entre grupos (10'), versión final (15'), puesta en
  común (5')
- Para cada fase: instrucciones específicas, tiempo
  asignado y producto esperado
- Rúbrica de coevaluación (el grupo evalúa a otro grupo)
```

**Output real (Claude):**

> **Actividad: El relato encadenado**
>
> *Tipo de texto:* narración colectiva
> *Duración:* 50 minutos | *Grupos:* 3-4 personas
>
> **Roles:**
> - **Coordinador/a:** gestiona el tiempo y el turno de palabra
> - **Redactor/a:** escribe la versión del grupo
> - **Corrector/a:** revisa gramática y coherencia
> - **Portavoz:** presenta el texto al resto de la clase
>
> **Fase 1 — Planificación (10'):**
> Cada grupo recibe la primera frase de un relato. Decidid: ¿quiénes son los personajes? ¿Qué va a pasar? ¿Cómo termina? Escribid un esquema de 5 puntos.
>
> *Primera frase (ejemplo):* «Cuando abrió el cajón, encontró una carta que no esperaba.»
>
> **Fase 2 — Borrador (15'):**
> Escribid el relato completo (150-180 palabras). Todos contribuyen ideas; el redactor escribe.
>
> **Fase 3 — Revisión entre grupos (10'):**
> Intercambiad el texto con otro grupo. Usad la rúbrica de coevaluación para señalar puntos fuertes y áreas de mejora.
>
> **Fase 4 — Versión final (10') + Puesta en común (5'):**
> Incorporad los comentarios recibidos. El portavoz lee el relato en voz alta.
>
> **Rúbrica de coevaluación (1-3):**
> - ¿El relato tiene inicio, nudo y desenlace? 1 2 3
> - ¿Los tiempos verbales son correctos? 1 2 3
> - ¿El texto engancha al lector? 1 2 3
