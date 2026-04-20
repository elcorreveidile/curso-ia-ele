# Apéndice A: Banco de prompts
### Todos los prompts del libro en formato de referencia rápida

\newpage

## CÓMO USAR ESTE APÉNDICE

Este apéndice recoge todos los prompts del libro en un formato compacto para consulta rápida. Cada entrada incluye el código del prompt, su objetivo, el nivel recomendado y las variables que hay que completar antes de usarlo. Para ver el prompt completo con instrucciones y ejemplo de output, consulta el capítulo correspondiente.

Los prompts están organizados por parte y sección. Las variables aparecen entre corchetes: `[NIVEL]`, `[GRUPO]`, `[TEMA]`. Sustitúyelas siempre antes de ejecutar el prompt.

---

\newpage

## PARTE I — FUNDAMENTOS

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| FR-01 | Prompt FRAME básico | Todos | [NIVEL], [GRUPO], [OBJETIVO], [ESPECIFICACIONES] |
| IT-01 | Iteración sobre un prompt | Todos | [PROMPT ANTERIOR], [PROBLEMA A MEJORAR] |
| ER-01 | Corrección del error más frecuente | Todos | [PROMPT CON PROBLEMA], [TIPO DE ERROR] |
| TA-01 | Few-shot con ejemplos | Todos | [EJEMPLOS], [TAREA] |
| TA-02 | Chain of thought | B2-C2 | [PROBLEMA COMPLEJO], [PASOS DE RAZONAMIENTO] |
| TA-03 | Prompt encadenado | Todos | [OUTPUT DEL PROMPT ANTERIOR] |

---

## PARTE II — POR NIVEL

### Nivel A1

| Código | Nombre | Objetivo | Variables clave |
|--------|--------|----------|----------------|
| A1-01 | Diálogo presentación | Producir diálogo funcional A1 | [SITUACIÓN], [N] intervenciones |
| A1-02 | Vocabulario con imagen mental | Léxico temático A1 | [CAMPO SEMÁNTICO], [N] palabras |
| A1-03 | Texto modelo A1 | Escritura controlada | [TIPO DE TEXTO], [TEMA] |
| A1-04 | Actividad de identificación | Comprensión lectora A1 | [TEMA], [TIPO DE ÍTEM] |
| A1-05 | Ser/estar en contexto | Gramática comunicativa | [SITUACIONES], [N] ítems |
| A1-06 | Tarjetas de rol A1 | Interacción oral funcional | [SITUACIÓN], [FUNCIÓN] |
| A1-07 | Adaptación de texto | Reescritura a A1 | [TEXTO ORIGINAL] |
| A1-08 | Orden de palabras | Sintaxis A1 | [ESTRUCTURAS], [N] frases |

### Nivel A2

| Código | Nombre | Objetivo | Variables clave |
|--------|--------|----------|----------------|
| A2-01 | Diálogo situación cotidiana | Funciones comunicativas A2 | [SITUACIÓN], [FUNCIÓN] |
| A2-02 | Narración en pasado | Indefinido en contexto | [PERSONAJE], [SITUACIÓN] |
| A2-03 | Descripción de personas/lugares | Léxico descriptivo A2 | [OBJETO DE DESCRIPCIÓN] |
| A2-04 | Ir a + infinitivo | Futuro próximo en contexto | [SITUACIONES], [N] ítems |
| A2-05 | Comparación | Estructuras comparativas A2 | [OBJETOS A COMPARAR] |
| A2-06 | Correo informal | Escritura funcional A2 | [SITUACIÓN], [DESTINATARIO] |
| A2-07 | Receta / instrucciones | Imperativo en contexto | [TIPO DE INSTRUCCIÓN] |
| A2-08 | Verbos modales A2 | Poder/querer/tener que | [SITUACIONES], [N] ítems |

### Nivel B1

| Código | Nombre | Objetivo | Variables clave |
|--------|--------|----------|----------------|
| B1-01 | Indefinido vs. imperfecto | Contraste de pasado | [SITUACIONES], [N] ítems |
| B1-02 | Expresión de opinión | Dar y defender opiniones | [TEMAS], [GRUPO] |
| B1-03 | Introducción al subjuntivo | Subjuntivo en contexto | [ESTRUCTURAS], [SITUACIONES] |
| B1-04 | Noticia adaptada | Comprensión lectora B1 | [TEMA DE ACTUALIDAD] |
| B1-05 | Carta de queja | Escritura funcional formal | [SITUACIÓN], [DESTINATARIO] |
| B1-06 | Pasado habitual | Imperfecto de hábito | [CONTEXTO], [N] ítems |
| B1-07 | Texto instructivo | Secuencias procedimentales | [PROCESO A DESCRIBIR] |
| B1-08 | Actividad de escucha | Comprensión auditiva B1 | [TIPO DE TEXTO ORAL] |

### Nivel B2

| Código | Nombre | Objetivo | Variables clave |
|--------|--------|----------|----------------|
| B2-01 | Artículo de opinión | Escritura argumentativa | [TEMA], [EXTENSIÓN] |
| B2-02 | Tarjetas de debate | Argumentación oral | [TEMA], [N] alumnos |
| B2-03 | Condicionales | Hipótesis y condición | [SITUACIONES], [TIPO] |
| B2-04 | Análisis de publicidad | Lectura crítica | [TIPO DE ANUNCIO] |
| B2-05 | Correo formal | Escritura profesional | [FUNCIÓN], [DESTINATARIO] |
| B2-06 | Texto literario | Literatura en ELE | [GÉNERO], [TEMA] |
| B2-07 | Contraste de registro | Conciencia sociolingüística | [SITUACIÓN], [REGISTROS] |
| B2-08 | Resumen de texto | Síntesis y comprensión | [TEXTO BASE] |

### Nivel C1

| Código | Nombre | Objetivo | Variables clave |
|--------|--------|----------|----------------|
| C1-01 | Ensayo académico | Escritura académica | [TEMA], [EXTENSIÓN] |
| C1-02 | Modismos y fraseología | Léxico avanzado | [CAMPO], [N] expresiones |
| C1-03 | Análisis de discurso | Pragmática avanzada | [TIPO DE TEXTO] |
| C1-04 | Colocaciones avanzadas | Léxico colocacional | [CAMPO SEMÁNTICO] |
| C1-05 | Reformulación | Paráfrasis y precisión | [TEXTO BASE] |
| C1-06 | Preparación DELE C1 | Prueba de certificación | [TIPO DE TAREA] |
| C1-07 | Escritura creativa | Estilo y voz | [GÉNERO], [RESTRICCIÓN] |

### Nivel C2

| Código | Nombre | Objetivo | Variables clave |
|--------|--------|----------|----------------|
| C2-01 | Ensayo de voz autorial | Escritura con estilo | [TEMA], [VOZ] |
| C2-02 | Contraste dialectal | Variación y norma | [VARIEDADES], [TEMA] |
| C2-03 | Traducción literaria | Traducción y comentario | [FRAGMENTO] |
| C2-04 | Historia de la lengua | Diacronía del español | [FENÓMENO], [PERÍODO] |
| C2-05 | Debate filosófico | Argumentación compleja | [TEMA], [POSICIONES] |

---

## PARTE III — POR DESTREZA

### Comprensión lectora

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| CL-01 | Texto graduado por nivel | Todos | [NIVEL], [TEMA], [EXTENSIÓN] |
| CL-02 | Vocabulario en contexto | A2-B2 | [PALABRAS OBJETIVO], [TEXTO] |
| CL-03 | Perspectivas múltiples | B2-C1 | [TEMA CONTROVERTIDO] |
| CL-04 | Texto con huecos (cloze) | B1-C1 | [TIPO DE HUECO], [NIVEL] |
| CL-05 | Pre-lectura | Todos | [TEXTO BASE], [NIVEL] |
| CL-06 | Adaptación de texto | Todos | [TEXTO ORIGINAL], [NIVEL DESTINO] |
| CL-07 | Cuestionario metacognitivo | B1-C2 | [ESTRATEGIA DE LECTURA] |

### Expresión escrita

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| EE-01 | Texto modelo con andamiaje | A2-B2 | [GÉNERO], [NIVEL], [TEMA] |
| EE-02 | Banco de recursos de escritura | B1-C1 | [GÉNERO], [FUNCIÓN] |
| EE-03 | Tarea con rúbrica | Todos | [TIPO DE TAREA], [NIVEL] |
| EE-04 | Corrección pedagógica | Todos | [TEXTO DEL ALUMNO] |
| EE-05 | Cohesión textual | B1-C1 | [TEXTO BASE], [TIPO DE CONECTOR] |
| EE-06 | Escritura colaborativa | B1-C1 | [TEMA], [N] alumnos |

### Expresión e interacción oral

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| EO-01 | Role-play con tarjetas | A2-C1 | [SITUACIÓN], [FUNCIÓN], [NIVEL] |
| EO-02 | Debate estructurado | B1-C1 | [TEMA], [N] alumnos |
| EO-03 | Tarjetas de conversación | A2-C1 | [TEMA], [NIVEL], [N] tarjetas |
| EO-04 | Exposición oral: guía | B2-C1 | [TEMA], [EXTENSIÓN] |
| EO-05 | Information gap | A1-B1 | [TIPO DE INFORMACIÓN], [TEMA] |
| EO-06 | Simulación de situación real | A2-B2 | [SITUACIÓN], [FUNCIÓN] |

### Gramática comunicativa

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| GR-01 | Contraste gramatical en contexto | Todos | [ESTRUCTURA A], [ESTRUCTURA B] |
| GR-02 | Gramática inductiva | Todos | [ESTRUCTURA], [N] ejemplos |
| GR-03 | Transformación con cambio de significado | B1-C1 | [ESTRUCTURA], [CONTRASTE] |
| GR-04 | Gramática en texto auténtico | B1-C1 | [ESTRUCTURA], [TIPO DE TEXTO] |
| GR-05 | Juego de gramática | Todos | [ESTRUCTURA], [FORMATO LÚDICO] |

### Vocabulario en contexto

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| VO-01 | Campo semántico en narrativa | A2-B2 | [CAMPO], [N] palabras, [NIVEL] |
| VO-02 | Colocaciones léxicas | B1-C1 | [SUSTANTIVO CENTRAL], [NIVEL] |
| VO-03 | Red semántica | B1-C1 | [PALABRA CENTRAL] |
| VO-04 | Vocabulario productivo | A2-B2 | [LISTA DE PALABRAS OBJETIVO] |
| VO-05 | Vocabulario de especialidad | B2-C1 | [CAMPO DE ESPECIALIDAD] |

### Cultura e interculturalidad

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| CU-01 | Texto de choque cultural | B1-C1 | [SITUACIÓN], [CULTURAS] |
| CU-02 | Comparación de prácticas culturales | B1-B2 | [TEMA CULTURAL], [CONTEXTOS] |
| CU-03 | Comunicación no verbal | B1-C1 | [ASPECTO NO VERBAL] |
| CU-04 | Variedades del español | B1-C1 | [VARIEDADES A COMPARAR] |
| CU-05 | Texto literario o cultural auténtico | B2-C1 | [GÉNERO], [TEMA CULTURAL] |

### Evaluación y corrección

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| EV-01 | Rúbrica analítica | Todos | [TIPO DE TAREA], [NIVEL] |
| EV-02 | Feedback escrito | Todos | [TEXTO DEL ALUMNO], [NIVEL] |
| EV-03 | Prueba de evaluación | Todos | [CONTENIDOS DE LA UNIDAD], [NIVEL] |
| EV-04 | Autocorrección guiada | B1-C1 | [ERRORES FRECUENTES DEL NIVEL] |
| EV-05 | Tarea de evaluación auténtica | B1-C1 | [OBJETIVO], [DESTINATARIO REAL] |

---

## PARTE IV — POR GÉNERO TEXTUAL

### Narrativa

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| NA-01 | Texto narrativo modelo | A2-C1 | [NIVEL], [EXTENSIÓN] |
| NA-02 | Andamiaje para escritura narrativa | A2-B2 | [NIVEL], [EXTENSIÓN] |
| NA-03 | Análisis literario accesible | B2-C1 | [CUENTO BASE] |
| NA-04 | Escritura creativa colaborativa | B1-C1 | [NIVEL], [N] alumnos |
| NA-05 | Reescritura con cambio de perspectiva | B2-C1 | [TEXTO BASE], [PERSPECTIVA DESTINO] |

### Diálogo y conversación

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| DI-01 | Diálogo modelo calibrado | Todos | [NIVEL], [SITUACIÓN], [REGISTRO] |
| DI-02 | Reparación comunicativa | B1-C1 | [ESTRATEGIA], [SITUACIÓN] |
| DI-03 | Análisis de conversación auténtica | B2-C1 | [TIPO DE CONVERSACIÓN] |
| DI-04 | Guión de funciones comunicativas | Todos | [NIVEL], [FUNCIONES] |
| DI-05 | Explotación de vídeo auténtico | B1-C1 | [TEMA DEL VÍDEO], [NIVEL] |

### Artículo de opinión

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| AO-01 | Artículo modelo con análisis | B1-C1 | [TEMA], [EXTENSIÓN], [NIVEL] |
| AO-02 | Banco de conectores argumentativos | B2-C1 | [NIVEL] |
| AO-03 | Secuencia de escritura progresiva | B2-C1 | [TEMA], [N] sesiones |
| AO-04 | Contraargumentación y refutación | B2-C1 | [ARGUMENTOS BASE] |
| AO-05 | Rúbrica para artículo de opinión | B2-C1 | [NIVEL] |

### Correo y comunicación escrita

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| CO-01 | Correo formal modelo | A2-C1 | [FUNCIÓN], [SITUACIÓN], [NIVEL] |
| CO-02 | Gradiente de formalidad | B1-B2 | [SITUACIÓN], [REGISTROS] |
| CO-03 | Correo de reclamación | B1-C1 | [SITUACIÓN] |
| CO-04 | Mensajes informales | A2-B1 | [SITUACIONES], [NIVEL] |
| CO-05 | Correo profesional | B2-C1 | [SITUACIÓN PROFESIONAL] |

### Debate y argumentación oral

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| DE-01 | Debate completo (paquete) | B1-C1 | [TEMA], [N] alumnos |
| DE-02 | Posicionamiento rápido | B1-B2 | [AFIRMACIONES], [N] tarjetas |
| DE-03 | Banco de expresiones por nivel | B1-C1 | [FUNCIÓN], [NIVEL] |
| DE-04 | Simulación de mesa redonda | B2-C1 | [TEMA], [N] perfiles |

### Texto expositivo y académico

| Código | Nombre | Nivel | Variables clave |
|--------|--------|-------|----------------|
| EX-01 | Texto expositivo modelo | B1-C1 | [TEMA], [EXTENSIÓN], [NIVEL] |
| EX-02 | Análisis de registro académico | B2-C1 | [RASGO], [EJEMPLOS] |
| EX-03 | Resumen y síntesis | B2-C1 | [TEXTO BASE] |
| EX-04 | Informe profesional | B2-C1 | [TIPO], [DATOS BASE] |
| EX-05 | Ensayo académico | C1-C2 | [PREGUNTA DE INVESTIGACIÓN] |

---

## PARTE V — FLUJOS DE TRABAJO

| Código | Nombre | Pasos | Resultado |
|--------|--------|-------|-----------|
| FL-01 | Unidad didáctica completa | 5 prompts encadenados | Materiales para 4 sesiones + rúbrica |
| FL-02 | Adaptación de materiales | 1 prompt por tipo | Versión adaptada por nivel, grupo, destreza o cultura |
| FL-03 | Preparación de curso | 5 prompts encadenados | Programa completo con evaluación |
| FL-04 | Feedback individualizado | 4 prompts | Sistema de retroalimentación escalable |

---

## VARIABLES MÁS FRECUENTES: GUÍA DE REFERENCIA

| Variable | Qué poner | Ejemplo |
|----------|-----------|---------|
| `[NIVEL]` | Nivel MCER del grupo | A2, B1, B2 |
| `[GRUPO]` | Descripción del grupo | «Adultos universitarios, español de negocios» |
| `[TEMA]` | Tema o campo semántico | «trabajo», «viajes», «tecnología» |
| `[SITUACIÓN]` | Contexto comunicativo concreto | «reclamación en un hotel», «reunión de equipo» |
| `[FUNCIÓN]` | Función comunicativa | «pedir información», «expresar desacuerdo» |
| `[EXTENSIÓN]` | Número de palabras | «200-250 palabras» |
| `[N]` | Número de ítems, tarjetas, etc. | «10 ítems», «3 tarjetas» |
| `[TEXTO BASE]` | El texto que hay que trabajar | Pegar el texto directamente |
| `[TEXTO DEL ALUMNO]` | Producción del alumno | Pegar el texto directamente |
| `[REGISTRO]` | Nivel de formalidad | «formal», «informal», «semiformal» |
| `[ESTRUCTURA]` | Estructura gramatical | «ser vs. estar», «condicional compuesto» |
