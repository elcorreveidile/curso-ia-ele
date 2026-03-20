# Los diez errores más frecuentes
### Qué falla y cómo corregirlo

\newpage

## LOS DIEZ ERRORES MÁS FRECUENTES

Después de trabajar con docentes de ELE que usan IA, hay un patrón claro: los mismos errores aparecen una y otra vez. No son errores de conocimiento —los docentes saben perfectamente lo que necesitan—, sino errores de traducción: de saber lo que quieres a comunicárselo a la IA de forma que lo pueda producir.

Los diez errores que siguen cubren la mayoría de los casos de frustración con las herramientas de IA en el aula de ELE.

---

### Error 1: El prompt sin nivel

**El error:**
```
Crea un texto sobre las costumbres alimentarias en España.
```

**El problema:** Sin nivel, la IA produce un texto en un punto medio indeterminado. Puede ser B1, puede ser B2, puede mezclar estructuras de niveles diferentes. En la práctica, el resultado no es aprovechable para ningún grupo concreto.

**La solución:**
```
Crea un texto sobre las costumbres alimentarias en España
para alumnado de nivel A2. Vocabulario básico, frases cortas,
presente de indicativo como tiempo verbal principal.
Máximo 120 palabras.
```

**Regla:** El nivel MCER es el primer dato que siempre debes incluir. Si no lo incluyes, todo lo demás pierde precisión.

---

### Error 2: El objetivo invisible

**El error:**
```
Crea un ejercicio de subjuntivo para B2.
```

**El problema:** El subjuntivo tiene docenas de usos. Sin especificar cuál, la IA elige el más frecuente en sus datos de entrenamiento (generalmente el subjuntivo de deseo o en oraciones subordinadas sustantivas). Si necesitas el subjuntivo de duda, de concesión o de relativo, no lo obtendrás.

**La solución:**
```
Crea un ejercicio de transformación de 8 frases para practicar
el subjuntivo en oraciones de relativo con antecedente
indefinido o negado (por ejemplo: «Busco un apartamento que
tenga terraza»). Nivel B2. Incluye instrucciones en español
y solucionario.
```

**Regla:** Especifica siempre el uso concreto de la estructura gramatical, no solo la estructura en general.

---

### Error 3: La audiencia genérica

**El error:**
```
Crea un diálogo para practicar hacer planes para el fin de semana.
Nivel B1.
```

**El problema:** «Nivel B1» no describe una audiencia, describe un nivel. La IA no sabe si son adolescentes o adultos, si son anglófonos o japoneses, si están en inmersión o aprenden en su país de origen. Esa información cambia el vocabulario, las referencias culturales y las estrategias pragmáticas del diálogo.

**La solución:**
```
Crea un diálogo para practicar hacer planes para el fin de semana.
Nivel B1. Alumnado: adultos jóvenes (25-35 años) de origen
francófono, aprendiendo español online desde Francia.
Sin referencias culturales específicas de España que requieran
conocimiento previo.
```

**Regla:** Describe la audiencia como si le hablaras de tu grupo a un sustituto que no los conoce.

---

### Error 4: El formato asumido

**El error:**
```
Crea material sobre el imperfecto de subjuntivo para C1.
```

**El problema:** «Material» puede ser un texto, un ejercicio, una explicación gramatical, una tabla, una ficha de trabajo o un plan de clase. La IA elegirá y puede elegir cualquier cosa.

**La solución:**
```
Crea un texto periodístico auténtico de 250-280 palabras
que contenga al menos 6 usos del imperfecto de subjuntivo
en contextos naturales. Nivel C1. Al final, subraya o señala
con [IMP.SUB] cada aparición de la forma. Incluye
3 preguntas de análisis lingüístico.
```

**Regla:** Si no describes el formato, la IA decide por ti. Decide siempre tú.

---

### Error 5: La instrucción contradictoria

**El error:**
```
Crea un texto auténtico, natural y coloquial de nivel A1
con vocabulario muy básico pero que sea interesante
y culturalmente rico.
```

**El problema:** Un texto A1 tiene restricciones de vocabulario y complejidad sintáctica que entran en tensión directa con la «riqueza cultural» y el «interés». La IA intentará cumplir todas las instrucciones a la vez y producirá un texto que no cumple ninguna bien.

**La solución:** Cuando los requisitos entran en conflicto, decide cuál es prioritario y especifícalo:

```
Crea un texto de nivel A1 (vocabulario básico, frases cortas,
presente de indicativo). El tema debe ser culturalmente concreto
(una festividad española conocida), pero la complejidad lingüística
tiene prioridad: si un dato cultural requiere vocabulario por
encima de A1, simplifícalo o omítelo.
```

**Regla:** Cuando hay requisitos en tensión, establece explícitamente cuál tiene prioridad.

---

### Error 6: Pedir demasiado en un solo prompt

**El error:**
```
Crea una unidad didáctica completa sobre la ciudad, con textos,
diálogos, ejercicios de gramática, actividades de expresión oral,
tareas de escritura, vídeos sugeridos, rúbrica de evaluación
y materiales de ampliación para nivel B1.
```

**El problema:** Un prompt con diez requisitos produce diez resultados mediocres. La IA distribuye su «atención» entre todos los elementos y no puede desarrollar ninguno con profundidad.

**La solución:** Divide la solicitud en prompts separados, uno por elemento. Usa el output de uno como punto de partida para el siguiente.

```
[Prompt 1] Crea el texto principal de la unidad: narrativo,
180-200 palabras, tema: un día en una ciudad española, nivel B1.

[Prompt 2] Basándote en el texto anterior, crea 5 preguntas
de comprensión lectora de respuesta corta.

[Prompt 3] Basándote en el mismo texto, diseña un ejercicio
de vocabulario: 8 palabras del texto con definición en español
y ejemplo de uso.
```

**Regla:** Un prompt, un material. Los materiales complejos se construyen en cadena.

---

### Error 7: No especificar la variedad del español

**El error:**
```
Crea un diálogo informal entre dos amigos que quedan para comer.
Nivel B1.
```

**El problema:** Sin indicación de variedad, la IA produce un español mezclado que puede incluir «vos» y «tú» en el mismo texto, léxico latinoamericano con fonología peninsular, o expresiones que ningún hablante nativo reconocería como propias de su variedad.

**La solución:**
```
Crea un diálogo informal entre dos amigos que quedan para comer.
Nivel B1. Español peninsular estándar. Usa «tú» (no «vos»).
Incluye 1-2 expresiones coloquiales propias del español de España
(explicadas en nota al pie).
```

**Regla:** Especifica siempre la variedad. Si el contexto de tus alumnos es latinoamericano, especifica el país o la región.

---

### Error 8: Olvidar pedir el solucionario

**El error:**
```
Crea un ejercicio de 10 frases para practicar ser/estar con
adjetivos. Nivel A2.
```

**El problema:** La IA genera el ejercicio pero no el solucionario, y cuando lo pides después, a veces corrige las frases de forma diferente a como las generó.

**La solución:** Pide siempre el solucionario en el mismo prompt:

```
Crea un ejercicio de 10 frases para completar con ser o estar
seguido de adjetivo. Nivel A2. Incluye instrucciones en español
y, al final, el solucionario completo con la opción correcta
y una nota breve que explique el uso en cada caso.
```

**Regla:** Todo lo que necesites en el output, pídelo en el mismo prompt. Añadirlo después puede generar inconsistencias.

---

### Error 9: No verificar la corrección lingüística

**El error:** No está en el prompt, sino en el uso del output. Muchos docentes usan directamente el texto generado sin revisarlo.

**El problema:** Los modelos de lenguaje cometen errores gramaticales, producen calcos del inglés («hacer sentido», «tener éxito con algo»), usan colocaciones poco naturales o generan registros inconsistentes dentro del mismo texto.

**La solución:** Siempre revisa el output antes de usarlo en clase. Para textos largos, puedes pedirle a la propia IA que los revise:

```
Revisa el texto anterior. Comprueba:
1. Corrección gramatical (especialmente concordancias y uso
   de tiempos verbales)
2. Naturalidad del vocabulario (sin calcos del inglés,
   sin colocaciones inusuales)
3. Coherencia de registro (formal/informal de principio a fin)
Indica cualquier problema encontrado y propón la corrección.
```

**Regla:** La IA genera; el docente verifica. Esta es una responsabilidad que no se puede delegar.

---

### Error 10: Descartar un prompt que «no ha funcionado»

**El error:** Ante un resultado que no satisface, el docente cierra la ventana y decide que «la IA no sirve para esto».

**El problema:** En la mayoría de los casos, el prompt era demasiado vago o tenía uno de los errores anteriores. El problema no era la herramienta, sino la instrucción.

**La solución:** Antes de descartar, diagnostica. Pregúntate:
- ¿He especificado el nivel?
- ¿He definido el formato?
- ¿He descrito la audiencia con suficiente detalle?
- ¿He pedido demasiadas cosas a la vez?
- ¿Qué componente de FRAME falta o es impreciso?

Un prompt bien diagnosticado y ajustado produce casi siempre un resultado significativamente mejor en la segunda o tercera ronda.

**Regla:** El problema suele estar en el prompt, no en la herramienta. Antes de descartar, refina.
