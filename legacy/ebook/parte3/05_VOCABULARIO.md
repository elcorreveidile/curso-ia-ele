# Vocabulario en contexto
### Crear materiales de léxico con uso real

\newpage

## VOCABULARIO CON IA

El vocabulario aprendido de forma aislada —lista de palabras + traducción— se olvida rápidamente. La IA puede generar materiales de léxico contextualizado: palabras en uso, en textos reales, en colocaciones naturales, en redes semánticas. Los prompts de esta sección producen materiales de vocabulario que van más allá de la definición.

---

\newpage

### PROMPT VO-01 — Campo semántico en contexto narrativo

**Objetivo:** Presentar vocabulario temático integrado en un texto narrativo auténtico.

```
Actúa como profesor de ELE especializado en léxico
para nivel [NIVEL].

FORMATO: Texto narrativo de [N] palabras que integra
de forma natural el vocabulario de un campo semántico.

AUDIENCIA: [Grupo]

META: El alumnado adquirirá vocabulario del campo
semántico de [tema] en contexto de uso real, no
en listas aisladas.

ESPECIFICACIONES:
- Campo semántico: [trabajo, viaje, salud, alimentación,
  ciudad, relaciones, etc.]
- Incluir exactamente 15 palabras o expresiones del campo
  en el texto, en negrita
- El texto es una narración real y fluida, no un texto
  construido artificialmente para meter palabras
- Después del texto: las 15 palabras en una tabla con
  su definición en español y un ejemplo de uso diferente
  al del texto
- Ejercicio de producción: el alumno escribe 5 frases
  propias usando 5 palabras de la lista
```

**Output real (Claude) — Campo semántico: trabajo, nivel B1:**

> **Un lunes de oficina**
>
> Carmen llegó a la **oficina** a las nueve en punto. Tenía una reunión de **equipo** a las diez, así que aprovechó para revisar sus **correos** electrónicos y organizar sus **tareas** del día.
>
> Su **jefa**, la señora Rodríguez, era muy **exigente** pero justa. Siempre valoraba el **esfuerzo** de los **empleados** y reconocía cuando hacían un buen **trabajo**. Por eso, Carmen no se quejaba demasiado del **horario**, que terminaba a las seis.
>
> Lo que más le gustaba de su **puesto** era la variedad. Nunca hacía lo mismo dos días seguidos. Aunque el **sueldo** no era espectacular, tenía buenas condiciones: **vacaciones** generosas, **seguro** médico y la posibilidad de **teletrabajar** dos días a la semana.
>
> «No es el trabajo perfecto», pensaba Carmen mientras encendía el ordenador, «pero tampoco está mal».
>
> **Vocabulario:**
> | Palabra | Definición | Otro ejemplo |
> |---------|-----------|-------------|
> | oficina | lugar donde se trabaja, normalmente en una empresa | «La reunión es en la oficina del director.» |
> | equipo | grupo de personas que trabajan juntas | «Nuestro equipo tiene cinco personas.» |
> | exigente | que pide mucho esfuerzo o calidad | «El curso es muy exigente.» |

---

### PROMPT VO-02 — Colocaciones léxicas frecuentes

**Objetivo:** Crear ejercicios específicos para aprender las combinaciones léxicas más naturales en español.

```
Actúa como especialista en léxico y colocaciones del
español para nivel [NIVEL].

FORMATO: Ficha de colocaciones con tres ejercicios.

AUDIENCIA: [Grupo]

META: El alumnado será capaz de combinar palabras de
forma natural usando las colocaciones más frecuentes
del español en torno al campo semántico de [tema].

ESPECIFICACIONES:
- Punto de partida: 6 sustantivos frecuentes del campo
  de [tema]
- Para cada sustantivo: sus 4 colocaciones verbales más
  frecuentes (qué verbos lo acompañan habitualmente)
- Ejercicio 1: completar con el verbo colocacional
  correcto (4 opciones para 10 huecos)
- Ejercicio 2: detectar colocaciones incorrectas en
  5 frases (calcos del inglés u otras lenguas)
- Ejercicio 3: el alumno escribe 5 frases propias
  usando colocaciones de la ficha
- Señalar qué colocaciones son más formales o coloquiales
```

**Output real (Claude) — Colocaciones con «tiempo», B2:**

> **Colocaciones con «tiempo»:**
>
> | Verbo | + tiempo | Ejemplo |
> |-------|----------|---------|
> | perder | el tiempo | «No pierdas el tiempo con eso.» |
> | ganar | tiempo | «Necesitamos ganar tiempo antes de decidir.» |
> | pasar | el tiempo | «¿Cómo pasas el tiempo libre?» |
> | dedicar | tiempo a | «Dedica más tiempo a tu familia.» |
> | tener | tiempo (para) | «No tengo tiempo para todo.» |
> | ahorrar | tiempo | «Este método ahorra mucho tiempo.» |
> | matar | el tiempo | «Maté el tiempo leyendo en el aeropuerto.» *(coloquial)* |
> | aprovechar | el tiempo | «Hay que aprovechar el tiempo.» |
>
> **Ejercicio 2 — Detecta los errores:**
> *(Colocaciones calcadas del inglés u otras lenguas)*
>
> 1. «Él hizo tiempo para verte.» *(incorrecto: «hizo» no colocaciona con «tiempo» en este sentido → «encontró tiempo para verte»)*
> 2. «No quiero gastar tiempo en eso.» *(calco: en español «gastar» no funciona aquí → «perder» o «invertir»)*
> 3. «Voy a tomar tiempo para pensar.» *(calco del inglés «take time» → «voy a tomarme tiempo» o «necesito tiempo para pensar»)*

---

### PROMPT VO-03 — Red semántica: palabras relacionadas

**Objetivo:** Crear una actividad de organización léxica para que el alumno visualice y comprenda las relaciones entre palabras.

```
Actúa como profesor de ELE especializado en léxico
para nivel [NIVEL].

FORMATO: Actividad de red semántica con mapa y ejercicios.

AUDIENCIA: [Grupo]

META: El alumnado organizará el vocabulario de [campo]
en una red semántica que muestre las relaciones entre
palabras: sinónimos, antónimos, hiperónimos, hipónimos
y colocaciones.

ESPECIFICACIONES:
- Palabra central: [sustantivo abstracto frecuente]
- La red incluye: 4 sinónimos (con matices), 3 antónimos,
  5 hipónimos (palabras más específicas), 4 verbos
  relacionados, 3 adjetivos frecuentes y 2 expresiones
  idiomáticas con esa palabra
- Formato: tabla que el alumno puede convertir en mapa
  mental propio
- Ejercicio: 5 frases donde el alumno elige el término
  más preciso entre dos opciones de la red
```

**Output real (Claude) — Red de «miedo», B2:**

> **Red semántica: MIEDO**
>
> | Categoría | Palabras |
> |-----------|----------|
> | Sinónimos (con matiz) | terror *(más intenso)*, temor *(más intelectual)*, pavor *(físico e intenso)*, aprensión *(anticipatorio)* |
> | Antónimos | valentía, seguridad, confianza |
> | Hipónimos (tipos) | fobia, pánico, angustia, vértigo, claustrofobia |
> | Verbos relacionados | tener miedo, dar miedo, asustar, aterrar, temer, sobresaltarse |
> | Adjetivos frecuentes | aterrador, escalofriante, inquietante, perturbador |
> | Expresiones | «quedarse helado/a», «el corazón en un puño», «poner los pelos de punta» |
>
> **Elige la palabra más precisa:**
> 1. No es exactamente miedo, sino una sensación de que algo malo puede pasar. Es más bien _______ *(miedo / aprensión)*
> 2. Cuando vi la araña, me _______ un susto terrible. *(tuve / di)*
> 3. La película fue absolutamente _______. No pude dormir después. *(miedosa / aterradora)*

---

### PROMPT VO-04 — Vocabulario productivo: de comprensión a uso

**Objetivo:** Crear una secuencia que lleve al alumno de reconocer palabras a usarlas activamente.

```
Actúa como profesor de ELE especializado en adquisición
de vocabulario para nivel [NIVEL].

FORMATO: Secuencia de cuatro actividades para pasar
del vocabulario pasivo al activo.

AUDIENCIA: [Grupo]

META: El alumnado pasará de reconocer vocabulario nuevo
en un texto a usarlo de forma activa y autónoma
en producción propia.

ESPECIFICACIONES:
- Palabras objetivo: [lista de 8 palabras que quieres
  que el alumno aprenda activamente]
- Actividad 1 (reconocimiento): localizar las palabras
  en un texto y subrayarlas
- Actividad 2 (comprensión): relacionar cada palabra
  con su definición o sinónimo
- Actividad 3 (uso controlado): completar frases con
  las palabras en la forma correcta
- Actividad 4 (uso libre): el alumno escribe un párrafo
  propio usando al menos 5 de las 8 palabras
- Cada actividad incluye instrucciones claras y un
  ejemplo resuelto
```

**Output real (Claude) — Palabras sobre emociones, B1:**

> **Palabras objetivo:** añorar, sobresaltarse, agobiarse, alegrarse de, avergonzarse, entusiasmarse, decepcionar, angustiarse
>
> **Actividad 2 — Relaciona con su significado:**
> 1. añorar → a) sorprenderse de repente con un susto
> 2. sobresaltarse → b) echar de menos algo del pasado
> 3. agobiarse → c) sentir demasiada presión o estrés
> 4. entusiasmarse → d) sentir mucha ilusión o emoción por algo
>
> **Actividad 3 — Completa:**
> 1. Cuando vuelvo a mi ciudad natal, siempre me _______ de las calles de mi infancia.
> 2. Me _______ tanto con los exámenes que no podía dormir.
> 3. ¡No me _______ así! Estaba concentrado y no te oí llegar.
>
> **Actividad 4 — Usa 5 palabras en un párrafo:**
> *Escribe sobre un momento en que sentiste emociones intensas (un viaje, un reencuentro, un cambio importante). Usa al menos 5 de las 8 palabras.*

---

### PROMPT VO-05 — Vocabulario a través de textos de especialidad

**Objetivo:** Crear materiales de vocabulario específico (lenguaje de negocios, académico, turístico, médico) con ejemplos auténticos.

```
Actúa como especialista en lenguaje de especialidad
para ELE nivel [B2/C1].

FORMATO: Ficha de vocabulario especializado de [campo]
con textos auténticos y ejercicios.

AUDIENCIA: Adultos [NIVEL] con necesidades específicas
de aprendizaje: [contexto profesional o académico].

META: El alumnado adquirirá y usará el vocabulario
específico del campo de [especialidad] en situaciones
comunicativas propias de ese contexto.

ESPECIFICACIONES:
- Campo: [turismo, negocios, medicina, derecho, educación,
  tecnología, etc.]
- 3 textos auténticos breves (80-100 palabras cada uno)
  del campo con 5 términos específicos en negrita
  por texto
- Glosario de los 15 términos con: definición profesional
  en español + contexto de uso + registro
- Ejercicio de uso: 5 situaciones del campo donde el
  alumno escribe la respuesta usando el vocabulario dado
```

**Output real (Claude) — Lenguaje de negocios, B2:**

> **Texto 1 — Email corporativo:**
>
> «Nos complace informarle de que su **propuesta** ha sido aprobada por el **consejo de administración**. Procedemos a la **firma del contrato** la próxima semana. Le rogamos que nos envíe antes el **presupuesto** definitivo y las condiciones de **entrega**. Quedamos a su disposición para cualquier aclaración.»
>
> **Términos:**
> - *propuesta* → documento formal que presenta un plan o proyecto para su aprobación. Registro: formal.
> - *consejo de administración* → órgano máximo de gobierno de una empresa. Registro: muy formal.
> - *firma del contrato* → acto oficial de formalizar un acuerdo. Registro: formal.
>
> **Situación de uso:**
> Tu empresa acaba de ganar un contrato importante. Escribe un correo breve al director de tu departamento dándole la noticia y mencionando los próximos pasos. Usa al menos 4 términos del glosario.
