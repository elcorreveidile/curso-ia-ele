# Gramática comunicativa
### Crear ejercicios gramaticales con contexto y significado real

\newpage

## GRAMÁTICA COMUNICATIVA CON IA

El riesgo de usar la IA para crear ejercicios de gramática es caer en el mismo error que criticamos en los libros de texto clásicos: ejercicios mecánicos, descontextualizados, donde el alumno rellena huecos sin comprender por qué usa una forma u otra. Los prompts de esta sección están diseñados para producir gramática con significado: ejercicios donde la forma lingüística está al servicio de la comunicación.

---

\newpage

### PROMPT GR-01 — Ejercicio de contraste gramatical en contexto

**Objetivo:** Crear ejercicios donde el alumno debe elegir entre dos formas gramaticales similares en función del contexto comunicativo.

```
Actúa como profesor de ELE especializado en gramática
comunicativa para nivel [NIVEL].

FORMATO: Ejercicio de contraste de [estructura A] vs.
[estructura B], con 10 ítems contextualizados.

AUDIENCIA: [Grupo]

META: El alumnado será capaz de elegir entre [estructura A]
y [estructura B] comprendiendo el valor comunicativo
de cada una, no solo aplicando reglas formales.

ESPECIFICACIONES:
- Cada ítem es una situación comunicativa breve (2-3 frases
  de contexto) seguida de la frase con el hueco
- El contexto hace que una de las dos opciones sea
  claramente más adecuada: no son intercambiables
- Las situaciones deben ser variadas: conversación,
  texto escrito, correo, narración, descripción
- Instrucciones en español explicando que deben leer
  el contexto antes de elegir
- Solucionario con la explicación comunicativa de cada
  respuesta (no solo la regla gramatical)
```

**Output real (Claude) — Ser vs. estar con adjetivos B1:**

> **Lee el contexto y elige la opción correcta:**
>
> 1. *Ana es normalmente muy alegre. Pero esta mañana no ha dormido bien.*
> Hoy Ana _______ muy cansada. *(es / está)*
> *Solución:* **está** → estado temporal, no característica permanente
>
> 2. *El profesor explica las instrucciones del examen.*
> El examen _______ muy claro. No hay preguntas complicadas. *(es / está)*
> *Solución:* **es** → característica del examen en sí, no un estado
>
> 3. *El tomate estaba en el frigorífico desde hace una semana.*
> El tomate _______ malo. No lo comas. *(es / está)*
> *Solución:* **está** → estado resultante de un proceso (se ha puesto malo)
>
> 4. *Conoces a Carlos desde hace años. Siempre ha tenido mucha energía.*
> Carlos _______ muy activo; nunca para quieto. *(es / está)*
> *Solución:* **es** → rasgo de carácter permanente
>
> 5. *Ves a tu amiga después de meses. Ha cambiado mucho.*
> ¡Qué guapa _______ hoy! ¿Te has hecho algo en el pelo? *(eres / estás)*
> *Solución:* **estás** → cambio percibido en ese momento, no afirmación de cómo es siempre

---

### PROMPT GR-02 — Gramática inductiva: descubre la regla

**Objetivo:** Crear una secuencia de gramática inductiva donde el alumno extrae la regla a partir de ejemplos.

```
Actúa como profesor de ELE especializado en metodología
inductiva para nivel [NIVEL].

FORMATO: Secuencia de gramática inductiva en 4 pasos.

AUDIENCIA: [Grupo] que aún no ha estudiado [estructura].

META: El alumnado deducirá el uso de [estructura]
a partir de ejemplos antes de recibir la explicación
formal.

ESPECIFICACIONES:
- Paso 1: 8 ejemplos auténticos con la estructura
  en negrita, sin explicación
- Paso 2: preguntas guiadas para que el alumno observe
  patrones («¿Qué tienen en común las frases 1, 3 y 5?»)
- Paso 3: el alumno formula la regla con sus palabras
  (espacio en blanco)
- Paso 4: verificación — 4 frases donde el alumno
  aplica lo que ha descubierto
- Nota al profesor: la regla completa al final (para
  confirmar o completar lo que los alumnos dedujeron)
```

**Output real (Claude) — Uso de «se» impersonal, B1:**

> **Paso 1 — Observa:**
> 1. En España **se come** tarde: la cena es a las 9 o las 10.
> 2. En esta tienda **se habla** inglés.
> 3. **Se necesita** experiencia para este puesto.
> 4. ¿Cómo **se dice** «umbrella» en español?
> 5. **Se prohíbe** fumar en este edificio.
> 6. Aquí **se venden** pisos de lujo.
> 7. En verano **se vive** muy bien en la costa.
> 8. **Se buscan** camareros con experiencia.
>
> **Paso 2 — Reflexiona:**
> 1. En todas estas frases, ¿quién realiza la acción? ¿Se menciona?
> 2. ¿En qué persona está el verbo en las frases 1-5? ¿Y en 6 y 8? ¿Por qué cambia?
> 3. ¿Cuándo crees que usamos esta construcción?
>
> **Paso 3 — Formula la regla:**
> «Se usa *se* + verbo cuando...»
> *[espacio para que el alumno escriba su hipótesis]*
>
> **Paso 4 — Aplica:**
> Transforma estas frases a la construcción con *se*:
> 1. «La gente habla mucho de política estos días.»
> 2. «La gente necesita un permiso para entrar.»
> 3. «La gente vende muchos coches de segunda mano aquí.»

---

### PROMPT GR-03 — Ejercicio de transformación con cambio de significado

**Objetivo:** Crear ejercicios donde transformar la forma implica transformar el significado, reforzando la conciencia comunicativa.

```
Actúa como profesor de ELE especializado en gramática
funcional para nivel [B1/B2].

FORMATO: Ejercicio de transformación en 3 secciones.

AUDIENCIA: [Grupo]

META: El alumnado comprenderá cómo el cambio de forma
gramatical cambia el significado, la intención y
el efecto comunicativo del enunciado.

ESPECIFICACIONES:
- Estructura trabajada: [indicativo vs. subjuntivo /
  activa vs. pasiva / estilo directo vs. indirecto /
  afirmación vs. pregunta retórica / etc.]
- Sección 1: 5 pares de frases con la misma información
  en dos formas distintas; el alumno explica la diferencia
  de significado o intención
- Sección 2: 5 frases que el alumno transforma según
  la instrucción (cambia la intención comunicativa)
- Sección 3: el alumno escribe 3 pares propios mostrando
  que ha comprendido la diferencia
```

**Output real (Claude) — Estilo directo / indirecto, B2:**

> **Sección 1 — ¿Cuál es la diferencia?**
>
> *Explica qué cambia en el significado o el efecto comunicativo:*
>
> 1a. El director dijo: «No habrá cambios en la empresa.»
> 1b. El director dijo que no habría cambios en la empresa.
> → *¿Cuál es más inmediato, más distante? ¿Por qué?*
>
> 2a. Mi madre me preguntó: «¿Has comido?»
> 2b. Mi madre me preguntó si había comido.
> → *¿En cuál «oímos» más la voz de la madre?*
>
> 3a. El médico aconsejó: «Descanse más y haga ejercicio.»
> 3b. El médico me aconsejó que descansara más y que hiciera ejercicio.
> → *¿Qué verbo introduce el estilo indirecto cuando hay consejo?*
>
> **Sección 2 — Transforma:**
> Pasa al estilo indirecto. Ajusta los tiempos verbales:
>
> 1. La profesora dijo: «El examen es el viernes.» → La profesora dijo que ___
> 2. Mi amigo me preguntó: «¿Cuándo llegas?» → Mi amigo me preguntó ___
> 3. El jefe ordenó: «Terminad el informe hoy.» → El jefe ordenó que ___

---

### PROMPT GR-04 — Gramática a través de textos auténticos

**Objetivo:** Crear una actividad de conciencia gramatical a partir de un texto auténtico (no un ejercicio inventado).

```
Actúa como profesor de ELE especializado en gramática
textual para nivel [NIVEL].

FORMATO: Texto auténtico adaptado + secuencia de
actividades de conciencia gramatical.

AUDIENCIA: [Grupo]

META: El alumnado identificará [estructura gramatical]
en un texto real, comprenderá su función en contexto
y practicará su uso en producción propia.

ESPECIFICACIONES:
- Crea un texto periodístico o literario breve (150-180
  palabras) que contenga al menos 8 ejemplos naturales
  de [estructura] en distintos contextos
- Actividad 1: el alumno localiza todos los ejemplos
  de la estructura y los subraya
- Actividad 2: el alumno clasifica los ejemplos según
  el valor o uso (si la estructura tiene varios usos)
- Actividad 3: producción — el alumno escribe un párrafo
  propio sobre un tema relacionado usando al menos
  3 ejemplos de la estructura
- La estructura no aparece de forma forzada: es un texto
  que existiría aunque no fuera un ejercicio
```

**Output real (Claude) — Condicional simple en texto periodístico, B2:**

> **Texto: Las ciudades del futuro**
>
> ¿Cómo **serían** nuestras ciudades si elimináramos el coche privado? Muchos urbanistas creen que **ganarían** en habitabilidad, silencio y calidad del aire. El espacio que hoy ocupan los aparcamientos **podría** convertirse en zonas verdes o carriles bici. El transporte público **mejoraría** sustancialmente si contara con más financiación.
>
> Algunos ciudadanos, sin embargo, no están convencidos. ¿Cómo **llegarían** al trabajo quienes viven en las afueras? ¿**Podrían** seguir funcionando los servicios de reparto? Las respuestas no son sencillas.
>
> Lo que sí parece claro es que las ciudades que ya han dado pasos en esta dirección —Ámsterdam, Copenhague, Oslo— han comprobado que la resistencia inicial **desaparecería** con el tiempo. El cambio cultural **llevaría** años, pero los datos avalan la transformación.
>
> **Actividad 1:** Subraya todos los verbos en condicional simple.
> **Actividad 2:** ¿Qué tienen en común todas las frases con condicional? ¿En qué contexto aparecen?
> **Actividad 3:** Escribe un párrafo sobre cómo sería tu ciudad ideal usando al menos 4 verbos en condicional.

---

### PROMPT GR-05 — Juego de gramática para el aula

**Objetivo:** Crear un juego de clase que practique una estructura gramatical de forma lúdica.

```
Actúa como profesor de ELE especializado en gamificación
y aprendizaje lúdico para nivel [NIVEL].

FORMATO: Instrucciones completas para un juego de
gramática de 15-20 minutos.

AUDIENCIA: [Grupo] de [N] alumnos.

META: El alumnado practicará [estructura gramatical]
de forma lúdica y competitiva en interacción con
sus compañeros.

ESPECIFICACIONES:
- El juego practica [estructura específica]
- Formato: [tarjetas, dados, bingo, cadena, ¿verdad
  o mentira?, etc.]
- Instrucciones claras en menos de 8 líneas
- Material necesario (que se pueda preparar fácilmente
  o que la IA genere)
- Reglas de puntuación
- Variante más fácil y variante más difícil
```

**Output real (Claude) — Juego «El encadenado» para practicar pretérito indefinido, B1:**

> **El encadenado del indefinido**
>
> *Objetivo:* practicar el pretérito indefinido en cadena. *Jugadores:* grupos de 4-5. *Tiempo:* 15 minutos.
>
> **Cómo se juega:**
> 1. El primer jugador dice una frase en indefinido sobre lo que hizo ayer: «Ayer me levanté a las ocho.»
> 2. El siguiente jugador repite la frase anterior y añade la suya: «Ayer te levantaste a las ocho y yo desayuné tostadas.»
> 3. Se va acumulando la cadena. El que se equivoca en una forma verbal o no recuerda la cadena, queda eliminado.
> 4. Gana el último jugador que queda.
>
> **Puntuación:** 1 punto por cada frase correcta que añades + 2 puntos si repites toda la cadena sin error.
>
> **Variante fácil:** el jugador puede leer las frases anteriores de sus notas.
> **Variante difícil:** añadir la restricción de que cada frase debe empezar con un verbo diferente.
