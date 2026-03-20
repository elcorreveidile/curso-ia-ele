# Cómo iterar
### Del prompt mediocre al prompt excelente

\newpage

## DEL PROMPT MEDIOCRE AL PROMPT EXCELENTE

El primer prompt rara vez es el definitivo. Esto no es un fallo: es el funcionamiento normal del proceso. La ingeniería de prompts es, por naturaleza, iterativa: se escribe un prompt, se evalúa el resultado, se identifica qué falla y se ajusta.

La diferencia entre un docente que obtiene resultados mediocres y uno que obtiene resultados excelentes no siempre está en la calidad del primer prompt. Está en saber leer el output, diagnosticar qué ha fallado y formular el ajuste correcto.

---

### El proceso iterativo

El ciclo tiene cuatro pasos:

**1. Prompt inicial**
Escribe el mejor prompt que puedas con la información disponible. No tiene que ser perfecto; tiene que ser suficientemente específico para obtener un resultado evaluable.

**2. Evaluación**
Lee el output con criterio docente. No lo evalúes como texto en general, sino en relación con lo que necesitas: ¿sirve para este grupo, en esta clase, para este objetivo?

**3. Diagnóstico**
Identifica qué falla exactamente. No «no me gusta» o «no es lo que quería». Sino: el vocabulario está por encima del nivel, el registro es demasiado formal, falta el solucionario, el texto es 50 palabras más largo de lo necesario.

**4. Prompt de refinamiento**
En lugar de reescribir el prompt desde cero, escribe un prompt que corrija específicamente lo que has diagnosticado. Los modelos de lenguaje mantienen el contexto de la conversación: no hace falta repetir toda la instrucción, solo indicar el ajuste.

---

### Un ejemplo completo de iteración

Veamos el proceso real con un caso concreto: crear un diálogo para nivel A2.

\newpage

**RONDA 1 — Prompt inicial:**

```
Actúa como profesor de ELE. Crea un diálogo de nivel A2
sobre pedir información en una oficina de turismo.
Incluye vocabulario de lugares de la ciudad.
```

**Output ronda 1 (resumen):** La IA genera un diálogo de 18 intervenciones con estructuras como «¿Podría usted indicarme la dirección exacta del museo?» y vocabulario como «a la derecha de la intersección principal».

**Diagnóstico:**
- Demasiado largo para A2 (máximo 10 intervenciones)
- Registro demasiado formal («¿Podría usted...?»)
- Vocabulario por encima del nivel («intersección»)
- No incluye instrucciones para el alumno

---

**RONDA 2 — Prompt de refinamiento:**

```
El diálogo tiene problemas. Corrígelo así:
1. Acórtalo a 8-10 intervenciones máximo.
2. Simplifica el registro: debe ser informal/neutro,
   no formal. Nada de «¿Podría usted...?».
3. Usa solo vocabulario A2: izquierda, derecha,
   recto, cerca, lejos, calle, plaza, museo, hotel.
4. Añade al principio las instrucciones para el alumno
   (en español, 2 líneas máximo).
```

**Output ronda 2 (resumen):** Diálogo de 9 intervenciones, registro neutro, vocabulario adecuado. Pero las instrucciones están en inglés y falta el solucionario de vocabulario.

**Diagnóstico:**
- Las instrucciones deben estar en español (no inglés)
- Falta un glosario de vocabulario al final

---

**RONDA 3 — Prompt de refinamiento:**

```
Dos últimos ajustes:
1. Las instrucciones para el alumno deben estar en
   español, no en inglés.
2. Añade al final un glosario de 6-8 palabras clave
   del diálogo con traducción al inglés.
```

**Output ronda 3:** Diálogo listo para usar en clase.

---

El proceso completo ha llevado tres prompts y unos cinco minutos. El resultado habría requerido veinte minutos de edición manual si se hubiera intentado corregir el primer output directamente.

\newpage

### Tabla de refinamiento: diagnóstico y solución

Cuando el output tiene un problema concreto, este es el prompt de refinamiento que funciona:

| El output es... | Prompt de refinamiento |
|-----------------|------------------------|
| Demasiado largo | «Acorta el texto a [N] palabras/intervenciones manteniendo el contenido esencial» |
| Demasiado corto | «Amplía el texto hasta [N] palabras añadiendo [qué: más detalle, ejemplos, contexto]» |
| Vocabulario demasiado difícil | «Simplifica el vocabulario al nivel [nivel]. Sustituye las palabras más difíciles por sinónimos de nivel [nivel] o explícalas en contexto» |
| Vocabulario demasiado fácil | «Eleva el vocabulario al nivel [nivel]. Añade [N] expresiones idiomáticas o colocaciones propias del nivel» |
| Registro incorrecto | «El registro no es adecuado. Reescribe con registro [formal/informal/coloquial/académico]» |
| Falta un elemento | «Añade [elemento] al final: [descripción concreta de qué debe incluir]» |
| Formato incorrecto | «Cambia el formato al siguiente: [descripción o ejemplo del formato deseado]» |
| Culturalmente genérico | «El texto es demasiado genérico. Añade referencias culturales concretas de [país/región/contexto]» |
| Gramática incorrecta | «Revisa la gramática. Presta especial atención a [estructura específica]. Corrige todos los errores» |
| Demasiado parecido a otro | «El resultado es demasiado similar al anterior. Genera una variante con [tema/contexto/enfoque diferente]» |

---

### Cuándo iterar y cuándo empezar de cero

Iterar sobre un prompt tiene sentido cuando el output base es correcto en sus elementos fundamentales pero necesita ajustes de detalle. Si el output es fundamentalmente incorrecto (nivel equivocado, tipo de material equivocado, enfoque completamente diferente al que necesitas), es más eficiente empezar con un nuevo prompt que intentar corregir el existente.

**Itera cuando:**
- El formato es correcto pero la extensión no
- El contenido es adecuado pero faltan elementos
- El nivel es aproximadamente correcto pero el vocabulario se desvía
- El texto es bueno pero el registro no es el adecuado

**Empieza de cero cuando:**
- El nivel es radicalmente diferente al solicitado
- El tipo de material no es el que necesitabas
- El prompt inicial era tan vago que el output no tiene nada aprovechable
- Has iterado tres veces y el resultado sigue sin funcionar

---

### Guardar los prompts que funcionan

Cuando un prompt produce un resultado excelente, guárdalo. No el output, sino el prompt. El output es material para una clase; el prompt es una herramienta que puedes reutilizar decenas de veces cambiando solo los parámetros variables (nivel, tema, estructura gramatical).

Una biblioteca de prompts propios es uno de los recursos más valiosos que puede tener un docente de ELE. Este libro es, en parte, esa biblioteca: una colección de prompts probados y refinados que puedes usar directamente o adaptar a tu contexto.
