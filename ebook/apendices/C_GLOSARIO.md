# Apéndice C: Glosario
### Términos de ingeniería de prompts y conceptos clave del libro

\newpage

## NOTA PRELIMINAR

Este glosario recoge los términos técnicos usados a lo largo del libro, organizados alfabéticamente. Algunos provienen de la ingeniería de prompts (un campo en inglés, de ahí los anglicismos inevitables); otros son conceptos de didáctica de lenguas o de lingüística aplicada que aparecen en el contexto del trabajo con IA. Cuando existe un equivalente español consolidado, se usa en primer lugar.

---

\newpage

**Alucinación** *(hallucination)*
Fenómeno por el que un modelo de lenguaje genera información plausible pero incorrecta o inventada. La IA no miente: produce texto estadísticamente coherente que puede no corresponder a ningún hecho real. En el uso docente, conviene verificar siempre los datos concretos (fechas, cifras, referencias bibliográficas) que genera la IA antes de usarlos con alumnos.

---

**Andamiaje** *(scaffolding)*
En didáctica de lenguas, estructura de apoyo temporal que permite al alumno realizar una tarea que aún no podría hacer de forma completamente autónoma. En el contexto del libro, los prompts pueden generar andamiaje para la escritura (preguntas guía, bancos de expresiones, modelos) o para la comprensión (pre-lectura, glosarios, estructuras visibles).

---

**Cadena de pensamiento** *(chain of thought)*
Técnica de prompting en la que se pide al modelo que razone paso a paso antes de dar una respuesta. Útil para tareas complejas de análisis, planificación curricular o diseño de rúbricas. El modelo produce un razonamiento visible que el docente puede verificar y corregir.

---

**Calibración de nivel**
Proceso de ajustar el léxico, la sintaxis, la extensión y las estructuras gramaticales de un texto o actividad al nivel MCER del grupo. Un texto bien calibrado no es ni demasiado fácil ni demasiado difícil: está en la zona de desarrollo próximo del alumno.

---

**Contexto** *(context)*
En ingeniería de prompts, toda la información que se proporciona al modelo antes de la instrucción principal: el rol, la audiencia, los ejemplos previos, el historial de la conversación. Cuanto más contexto relevante se proporciona, más pertinente es el output. El contexto también limita: los modelos tienen una «ventana de contexto» máxima (cantidad de texto que pueden procesar a la vez).

---

**Corrección formativa**
Tipo de retroalimentación que no se limita a señalar el error, sino que explica la causa, proporciona la forma correcta y orienta al alumno hacia la mejora futura. En este libro, los prompts de feedback están diseñados para producir corrección formativa, no corrección sumativa o punitiva.

---

**Destreza** *(skill)*
En didáctica de lenguas, cada una de las cuatro competencias receptivas o productivas: comprensión lectora, comprensión auditiva, expresión escrita y expresión oral. La expresión oral incluye tanto el monólogo (exposición) como la interacción (conversación).

---

**Enfoque por tareas** *(task-based language teaching)*
Metodología de enseñanza de lenguas en la que la unidad de planificación no es la estructura gramatical sino la tarea comunicativa: lo que el alumno necesita hacer con la lengua. Los prompts de este libro están orientados al enfoque por tareas: el objetivo siempre se formula como lo que el alumno podrá hacer, no como lo que sabrá.

---

**Few-shot prompting**
Técnica de prompting en la que se incluyen en el propio prompt entre dos y cinco ejemplos del tipo de output esperado. A diferencia del *zero-shot* (sin ejemplos) o el *one-shot* (un ejemplo), el few-shot proporciona suficientes modelos para que el output sea más predecible y coherente con el formato deseado.

---

**FRAME**
Marco de ingeniería de prompts desarrollado en este libro para docentes de ELE. Acrónimo de: **F**ormato, **R**ol, **A**udiencia, **M**eta, **E**specificaciones, **E**jemplo. Proporciona una estructura mnemotécnica para construir prompts completos y eficaces.

---

**Género textual**
Categoría de texto definida por su función comunicativa, su estructura convencional y su contexto de uso. El correo formal, el artículo de opinión, el cuento y el informe son géneros distintos con sus propias convenciones. Los prompts de la Parte IV están organizados por género textual porque cada uno requiere instrucciones específicas.

---

**Guardrail**
Restricción o limitación incorporada en un modelo de IA para evitar outputs dañinos, sesgados o inapropiados. Los modelos de uso general tienen guardrails por defecto; algunos prompts pedagógicos pueden activarlos si incluyen vocabulario o temática sensible. En ese caso, conviene reencuadrar el prompt de forma más explícitamente educativa.

---

**Input comprensible**
Concepto de Stephen Krashen: input lingüístico que está ligeramente por encima del nivel actual del aprendiente (i+1), lo que facilita la adquisición. Los textos generados con los prompts de este libro están diseñados para ser input comprensible: ni demasiado fácil (no aporta) ni demasiado difícil (no se procesa).

---

**Instrucción de sistema** *(system prompt)*
Mensaje que precede a la conversación con un modelo de IA y establece el comportamiento, el rol y las restricciones del modelo para toda la sesión. En plataformas como Claude o ChatGPT, el system prompt puede configurarse en entornos de API o en versiones avanzadas. En el uso docente, equivale a la configuración del «personaje» con el que trabajamos.

---

**Iteración**
En ingeniería de prompts, el proceso de refinar un prompt a partir del output obtenido: si el resultado no es el esperado, se modifica el prompt (o se añade una instrucción de seguimiento) para corregirlo. La iteración es la habilidad central del prompting: no se trata de escribir el prompt perfecto a la primera, sino de refinar hasta llegar al output deseado.

---

**Lenguaje de especialidad**
Variedad funcional de la lengua usada en ámbitos profesionales o académicos específicos: lenguaje jurídico, médico, económico, científico, turístico. El prompting para ELE de especialidad requiere especificar el campo y el registro con precisión.

---

**Marco MCER** *(Marco Común Europeo de Referencia para las Lenguas)*
Sistema de referencia del Consejo de Europa que describe las competencias lingüísticas en seis niveles: A1, A2, B1, B2, C1, C2. Es el estándar de referencia para la didáctica de lenguas en Europa y en gran parte del mundo hispanohablante. Todos los prompts de este libro están calibrados para uno o varios niveles del MCER.

---

**Metacognición**
Capacidad de reflexionar sobre el propio proceso de aprendizaje: qué se sabe, qué se desconoce, qué estrategias funcionan mejor. Algunos prompts del libro producen actividades metacognitivas (cuestionarios de reflexión, autorregistros, autoevaluaciones) diseñadas para desarrollar la autonomía del alumno.

---

**Modelo de lenguaje** *(Large Language Model, LLM)*
Sistema de inteligencia artificial entrenado sobre grandes cantidades de texto para generar, completar o transformar texto de forma estadísticamente coherente. Claude, ChatGPT (GPT-4) y Gemini son ejemplos de LLM de uso general. No «entienden» el texto en sentido humano: predicen el texto más probable dado el contexto.

---

**Output**
El resultado producido por el modelo de IA en respuesta a un prompt. En este libro, «output real» designa los ejemplos de respuesta generados durante la elaboración del material, que se incluyen después de cada prompt para mostrar qué produce la IA cuando el prompt está bien construido.

---

**Pluricentrismo**
Característica del español como lengua que no tiene un único centro normativo, sino varios: la norma culta de Madrid, Buenos Aires, Ciudad de México, Bogotá, Lima u otros centros hispanohablantes son igualmente legítimas. Un material de ELE con perspectiva pluricéntrica no trata ninguna variedad como «el español correcto» frente a las demás.

---

**Prompt**
Instrucción o conjunto de instrucciones que se proporciona a un modelo de IA para obtener un determinado output. En el contexto de este libro, el prompt es el texto que el docente escribe en la interfaz de la IA para generar materiales didácticos.

---

**Prompt encadenado** *(prompt chaining)*
Técnica en la que el output de un prompt se usa como input del siguiente. Permite construir materiales complejos en pasos secuenciales, donde cada prompt refina, amplía o transforma lo generado anteriormente. Los flujos de trabajo de la Parte V son ejemplos de prompt chaining.

---

**Registro**
Variedad lingüística determinada por el contexto social de uso: formal, informal, semiformal, coloquial, académico, profesional. El registro afecta al léxico, la sintaxis, las fórmulas de apertura y cierre, y el grado de explicitación del mensaje. Especificar el registro en el prompt es fundamental para obtener materiales sociolingüísticamente adecuados.

---

**Rol** *(role)*
En el marco FRAME, el rol es la identidad que se asigna al modelo de IA al inicio del prompt: «actúa como profesor de ELE especializado en...». Especificar el rol orienta el registro, el enfoque y el tipo de output que el modelo producirá.

---

**Temperatura** *(temperature)*
Parámetro técnico de los modelos de lenguaje que controla el grado de aleatoriedad o creatividad del output. A temperatura alta, el modelo es más creativo e impredecible; a temperatura baja, es más conservador y predecible. En la mayoría de interfaces de uso general (Claude, ChatGPT), la temperatura no es configurable directamente por el usuario, aunque algunos entornos de API sí lo permiten.

---

**Variedad lingüística**
Forma de una lengua asociada a un grupo de hablantes por criterios geográficos (variedad dialectal), sociales (variedad sociolectal) o contextuales (variedad de registro o funcional). El español tiene una enorme variación geográfica entre sus veinte países hispanohablantes. Los prompts de este libro pueden especificar la variedad deseada cuando es relevante para el grupo.

---

**Zero-shot prompting**
Técnica de prompting en la que no se incluyen ejemplos del output esperado: solo la instrucción. Es la forma más sencilla de prompt. Funciona bien para tareas estándar y bien definidas; para outputs más específicos o inusuales, el few-shot suele producir resultados más precisos.

---

**Zona de desarrollo próximo** *(ZDP)*
Concepto de Vygotski: el espacio entre lo que el aprendiente puede hacer solo y lo que puede hacer con ayuda. En didáctica de lenguas, los materiales más eficaces operan en la ZDP del alumno: son accesibles con esfuerzo, pero no imposibles. Calibrar bien el nivel en el prompt es, en gran medida, apuntar a la ZDP del grupo.
