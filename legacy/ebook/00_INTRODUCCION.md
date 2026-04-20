# PROMPTS QUE FUNCIONAN
### Guía de ingeniería de prompts para docentes de ELE · Por niveles, destrezas y géneros textuales

\newpage

## INTRODUCCIÓN

### Por qué existe este libro

Hay dos tipos de docentes de ELE que usan inteligencia artificial.

El primero abre ChatGPT o Claude, escribe «crea un ejercicio de gramática para nivel B1» y obtiene algo que podría valer, más o menos, con bastante trabajo de edición. Se frustra a medias, guarda el resultado en alguna carpeta y no vuelve a intentarlo hasta la semana siguiente.

El segundo escribe: «Actúa como especialista en ELE. Crea un ejercicio de 10 ítems para practicar el contraste pretérito indefinido/imperfecto con alumnado universitario estadounidense en España, nivel B1. Tema: anécdotas de viaje. Incluye instrucciones en español, espacio para respuesta y solucionario comentado. Registro informal». Y obtiene exactamente lo que necesitaba, listo para usar o con mínimos ajustes.

La diferencia entre los dos no es el nivel de conocimientos tecnológicos. Es saber construir el prompt.

Este libro existe para convertirte en el segundo tipo de docente.

\newpage

---

### Qué es la ingeniería de prompts

Un **prompt** es cualquier instrucción que le das a un modelo de lenguaje. La **ingeniería de prompts** *(prompt engineering)* es el conjunto de técnicas para diseñar esas instrucciones de manera que el modelo produzca exactamente el resultado que necesitas, de forma consistente y eficiente.

No se trata de «hablar con la máquina de la manera correcta». Se trata de comunicar con precisión: qué quieres, para quién, en qué formato, con qué restricciones. Los modelos de lenguaje actuales son extraordinariamente capaces, pero también extraordinariamente literales. Si tu instrucción es vaga, el resultado será genérico. Si es precisa, el resultado puede ser profesional.

La ingeniería de prompts no es una habilidad técnica reservada a programadores. Es, en esencia, una habilidad comunicativa. Y los docentes de lenguas son, por definición, especialistas en comunicación precisa.

---

### Por qué importa específicamente en ELE

La enseñanza del español como lengua extranjera tiene unas exigencias muy particulares que hacen que la calidad del prompt sea especialmente crítica:

**El nivel lo cambia todo.** Un texto auténtico para A2 y uno para C1 son objetos radicalmente distintos. Si no especificas el nivel con precisión, la IA producirá algo situado en un punto medio que no sirve para ninguno de los dos.

**El contexto cultural importa.** Un diálogo entre estudiantes universitarios estadounidenses en Granada tiene unas convenciones pragmáticas distintas a un diálogo entre ejecutivos latinoamericanos en un contexto formal. La IA puede respetar esas diferencias, pero solo si se las indicas.

**La variedad del español importa.** Español peninsular, rioplatense, mexicano, caribeño: vocabulario, estructuras y marcadores pragmáticos varían. Sin especificación, la IA produce un español genérico que en ocasiones mezcla variedades de forma poco natural.

**El Marco Común Europeo de Referencia (MCER) y el Plan Curricular del Instituto Cervantes (PCIC) son marcos exigentes.** Un material bien alineado con el MCER requiere que el prompt mencione descriptores de logro, funciones comunicativas y tipologías textuales concretas. La IA conoce estos marcos, pero no los aplica por defecto.

**La corrección lingüística no está garantizada.** Los modelos cometen errores gramaticales, producen calcos del inglés o generan registros inadecuados. El prompt puede reducir significativamente estos errores si especifica el nivel de corrección esperado y el registro.

Este libro te enseña a escribir prompts que tienen en cuenta todos estos factores.

---

### Cómo usar este libro

Este no es un libro para leer de principio a fin. Es una guía de referencia pensada para usarse en el momento en que la necesitas: cuando estás preparando una clase, diseñando una tarea o buscando un texto para un nivel concreto.

La estructura responde a tres preguntas diferentes que puede hacerse un docente:

> «Necesito material para mi grupo de B2.» → **Parte II: Por nivel**

> «Necesito trabajar la expresión escrita con mis alumnos.» → **Parte III: Por destreza**

> «Necesito un texto narrativo auténtico para trabajar en clase.» → **Parte IV: Por género textual**

Si eres nuevo en el uso de la IA para ELE, te recomendamos leer primero la **Parte I** (Fundamentos) para entender la lógica que hay detrás de todos los prompts del libro. Si ya tienes experiencia, puedes ir directamente a la sección que necesites y usar los prompts como plantillas.

Cada entrada del catálogo tiene la misma estructura:

```
OBJETIVO        Qué se consigue con este prompt
NIVEL           Nivel MCER al que va dirigido
PROMPT          El prompt completo, listo para copiar y adaptar
OUTPUT REAL     Ejemplo de respuesta generada por IA
VARIANTES       Adaptaciones para otros contextos o niveles
NOTAS           Advertencias, consejos y puntos de verificación
```

---

### Las herramientas de referencia

Los prompts de este libro han sido probados principalmente con **Claude** (Anthropic), que es el modelo de referencia. Sin embargo, todos funcionan, con mínimas adaptaciones, en **ChatGPT** (OpenAI) y **Gemini** (Google).

A lo largo del libro encontrarás notas específicas cuando un prompt produce resultados significativamente distintos según la herramienta. En general:

| Herramienta | Fortalezas para ELE | Consideraciones |
|-------------|---------------------|-----------------|
| Claude | Instrucciones complejas, textos largos, matiz lingüístico, corrección gramatical | Versión gratuita con límites de uso diario |
| ChatGPT | Velocidad, familiaridad, integración con otros servicios | GPT-4o recomendado; GPT-3.5 produce resultados notablemente inferiores |
| Gemini | Integración con Google Workspace, búsqueda actualizada | Menor precisión en tareas lingüísticas complejas |

Para la mayoría de las tareas del libro, **cualquiera de los tres modelos en su versión de pago** produce resultados de calidad profesional. Las versiones gratuitas son útiles para tareas simples, pero muestran limitaciones en prompts complejos o textos largos.

> **Nota sobre versiones:** Los modelos de IA evolucionan rápidamente. Los resultados mostrados en este libro corresponden a modelos disponibles en 2026. Las capacidades pueden haber mejorado en versiones posteriores.

\newpage

### Convenciones del libro

A lo largo del texto encontrarás los siguientes elementos:

**Prompts listos para usar**
Aparecen en recuadro con fondo gris. Puedes copiarlos directamente y sustituir los elementos entre corchetes `[así]` por los datos de tu contexto.

**Outputs reales**
Los ejemplos de respuesta generada aparecen con una línea vertical a la izquierda. No son outputs ideales ni seleccionados por ser perfectos: son representativos de lo que obtienes con ese prompt en condiciones normales.

**Términos técnicos**
Los anglicismos del campo de la IA se introducen siempre en español primero, con el término original en cursiva entre paréntesis. Por ejemplo: prompts con ejemplos *(few-shot)*, razonamiento guiado *(chain of thought)*.

**Niveles MCER**
Se usan las etiquetas estándar: A1, A2, B1, B2, C1, C2. Cuando un prompt sirve para un rango, se indica así: B1-B2.

**Notas de verificación**
Cada prompt incluye una lista de lo que debes comprobar antes de usar el output en clase. La IA puede cometer errores; la revisión docente es siempre necesaria.

---

### Una aclaración importante

Este libro no propone sustituir al docente. Propone ampliar lo que el docente puede hacer en el mismo tiempo.

La IA no sabe quiénes son tus alumnos. No conoce la dinámica de tu grupo, los errores recurrentes de la semana pasada, el chiste interno que rompería el hielo perfectamente, ni la cultura de procedencia que hace que determinada actividad resulte ofensiva o incomprensible. Ese conocimiento es tuyo, y es insustituible.

Lo que la IA puede hacer es generar un borrador de texto en treinta segundos, producir diez variantes de un ejercicio para que elijas la mejor, adaptar un material existente a un nivel diferente, o corregir una redacción con comentarios detallados. Tareas que antes llevaban horas y que ahora pueden llevar minutos, si sabes cómo pedirlas.

Eso es exactamente lo que este libro te enseña a hacer.

---

