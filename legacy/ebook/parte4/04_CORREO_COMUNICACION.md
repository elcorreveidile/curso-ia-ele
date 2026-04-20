# Correo y comunicación escrita
### Prompts para trabajar la escritura funcional en el aula de ELE

\newpage

## LA COMUNICACIÓN ESCRITA FUNCIONAL EN ELE

El correo electrónico es hoy uno de los géneros más relevantes para el alumno de ELE adulto: lo necesita para trabajar, estudiar, gestionar trámites y relacionarse en entornos profesionales en español. Al mismo tiempo, es un género lleno de convenciones implícitas que el alumno rara vez conoce: qué fórmulas de apertura usar según el grado de formalidad, cómo estructurar una solicitud, cómo redactar una queja sin ofender, cómo cerrar un correo con el tono correcto. La IA genera modelos calibrados, bancos de fórmulas y materiales de análisis con una exhaustividad que sería muy costosa de producir manualmente. Los prompts de esta sección cubren el correo formal, el informal, la comunicación profesional y las cartas y mensajes con función social.

---

\newpage

### PROMPT CO-01 — Correo formal modelo con análisis

**Objetivo:** Crear un correo formal calibrado por nivel y función comunicativa que sirva como modelo analizable.

```
Actúa como profesor de ELE especializado en escritura
funcional para nivel [NIVEL].

FORMATO: Correo formal de [función: solicitud /
reclamación / agradecimiento / presentación /
cancelación] con análisis de sus partes.

AUDIENCIA: [Grupo]

META: El alumnado reconocerá la estructura y las
convenciones del correo formal en español y
dispondrá de un modelo que podrá imitar y adaptar.

ESPECIFICACIONES:
- Situación concreta y realista: [describir]
- El correo incluye: asunto claro, saludo formal,
  presentación del propósito, desarrollo, petición
  o acción esperada, despedida formal
- Después del correo: tabla de análisis con las
  partes identificadas + lista de fórmulas usadas
  clasificadas por función (apertura, desarrollo,
  cierre)
- Nivel de formalidad: [alto / medio]
- Ejercicio: el alumno escribe un correo similar
  con una situación nueva
```

**Output real (Claude) — Solicitud de información, B1:**

> **Asunto:** Solicitud de información sobre el programa de máster en Traducción
>
> Estimada señora García:
>
> Me dirijo a usted para solicitar información sobre el programa de Máster en Traducción e Interpretación que ofrece su institución para el próximo curso académico.
>
> Soy licenciada en Filología Inglesa y actualmente trabajo como traductora freelance. Estoy interesada especialmente en el módulo de traducción especializada (jurídica y económica) y en las posibilidades de prácticas en empresa que ofrece el programa.
>
> Le agradecería que me indicara: los plazos de matriculación, los requisitos de acceso y si es posible asistir al programa en modalidad semipresencial.
>
> Quedo a su disposición para cualquier consulta adicional. Muchas gracias por su atención.
>
> Atentamente,
> Laura Moreno
>
> **Análisis:**
> | Parte | Función | Fórmula usada |
> |-------|---------|---------------|
> | Asunto | Informar del tema con claridad | Sustantivo + de + tema |
> | Saludo | Apertura formal | «Estimada señora / Estimado señor» |
> | Presentación | Explicar quién escribe y por qué | «Me dirijo a usted para...» |
> | Cuerpo | Dar el contexto y hacer la petición | «Estoy interesada en... / Le agradecería que...» |
> | Cierre | Disponibilidad + agradecimiento | «Quedo a su disposición / Muchas gracias» |
> | Despedida | Cierre formal | «Atentamente» |
>
> **Tu turno:** escribe un correo al departamento de recursos humanos de una empresa solicitando información sobre una oferta de trabajo que has visto en internet.

---

### PROMPT CO-02 — Gradiente de formalidad en correos

**Objetivo:** Crear un material que muestre cómo varía el registro en la comunicación escrita según el destinatario y el contexto.

```
Actúa como profesor de ELE especializado en registro
y escritura funcional para nivel [B1/B2].

FORMATO: 3 versiones del mismo correo en 3
registros distintos, con análisis comparativo.

AUDIENCIA: [Grupo]

META: El alumnado comprenderá cómo el registro
cambia el léxico, las fórmulas, la estructura y
el tono de un correo, y sabrá adaptar su escritura
al destinatario adecuado.

ESPECIFICACIONES:
- Misma situación comunicativa (mismo propósito
  y contenido) resuelta en 3 versiones:
  muy formal (institución, autoridad), semiformal
  (colega de trabajo conocido), informal (amigo)
- Tabla comparativa: diferencias en saludo, léxico,
  estructura, despedida, extensión y tono
- Errores típicos de registro: 3 casos reales donde
  el alumno usa registro inadecuado y la versión
  correcta
```

**Output real (Claude) — Pedir un favor / solicitar información:**

> **Situación:** necesitas que alguien te envíe un documento importante que tienen ellos y tú no.
>
> **Versión 1 — Muy formal (a un jefe desconocido):**
> *Estimado señor Fernández:*
> *Le escribo para solicitarle, si fuera posible, que me hiciera llegar el informe de ventas del trimestre anterior. Lo necesito para preparar la presentación del lunes. Le agradezco de antemano su colaboración.*
> *Atentamente, Ana Ruiz*
>
> **Versión 2 — Semiformal (a un colega conocido):**
> *Hola, Carlos:*
> *¿Podrías enviarme el informe de ventas del último trimestre? Lo necesito para la presentación del lunes. Muchas gracias.*
> *Un saludo, Ana*
>
> **Versión 3 — Informal (a un amigo de trabajo):**
> *Oye, Rafa,*
> *¿Me mandas el informe de ventas del trimestre? Es para el lunes. Gracias, eres el mejor.*
> *Ana*
>
> **Tabla comparativa:**
> | Elemento | Muy formal | Semiformal | Informal |
> |----------|-----------|-----------|---------|
> | Saludo | «Estimado señor» | «Hola, [nombre]:» | «Oye, [nombre],» |
> | Petición | «Le solicito que...» | «¿Podrías...?» | «¿Me mandas...?» |
> | Agradecimiento | «Le agradezco de antemano» | «Muchas gracias» | «Gracias, eres el mejor» |
> | Despedida | «Atentamente» | «Un saludo» | Sin fórmula |
> | Tono | Distante, protocolar | Cordial, directo | Cercano, informal |
>
> **Errores típicos de registro:**
> - ❌ «Estimado señor: te escribo para pedirte...» → mezcla formal (estimado) con informal (tuteo)
> - ❌ «Hola buenas, ¿me podría enviar el documento?» → saludo informal + tratamiento formal = inconsistencia
> - ❌ En un correo a un cliente: «Oye, ¿qué tal? Oye, es que necesito el contrato.» → registro demasiado coloquial para el contexto profesional

---

### PROMPT CO-03 — Correo de reclamación

**Objetivo:** Crear materiales específicos para trabajar el correo de reclamación, uno de los géneros más frecuentes y más difíciles de calibrar en una L2.

```
Actúa como profesor de ELE especializado en
escritura formal funcional para nivel [B1/B2].

FORMATO: Modelo de correo de reclamación +
análisis + ejercicio de producción.

AUDIENCIA: [Grupo]

META: El alumnado será capaz de redactar un
correo de reclamación en español con el tono
adecuado: firme pero educado, directo pero
sin agresividad.

ESPECIFICACIONES:
- Situación: [pedido incorrecto / servicio deficiente /
  producto defectuoso / retraso injustificado, etc.]
- El modelo muestra cómo: describir el problema
  con precisión, citar el acuerdo previo,
  expresar la insatisfacción sin insultos,
  pedir una solución concreta con un plazo
- Análisis: «el arte de quejarse bien» —
  5 principios del correo de reclamación eficaz
- Ejercicio: 3 situaciones para que el alumno
  redacte su propia reclamación
```

**Output real (Claude) — Pedido incorrecto, B2:**

> **Asunto:** Incidencia con el pedido n.º 47821 — Solicitud de resolución
>
> Estimados señores:
>
> Me pongo en contacto con ustedes en relación con el pedido n.º 47821, realizado el pasado 3 de marzo y recibido el 10 de marzo.
>
> Lamentablemente, el paquete recibido no corresponde a lo solicitado: pedí tres unidades del modelo BX-40 en color negro (talla M), y he recibido dos unidades en color azul (talla L) y una en color negro (talla S). Adjunto la confirmación del pedido original y fotografías del contenido del paquete.
>
> Les agradecería que procedieran al envío de los artículos correctos en un plazo máximo de cinco días hábiles, así como a la recogida de los artículos incorrectos recibidos. En caso de no ser posible, les solicito el reembolso íntegro del importe abonado.
>
> Quedo a la espera de su respuesta. Muchas gracias.
>
> Atentamente, Marcos Solís
>
> **Los 5 principios del correo de reclamación eficaz:**
> 1. **Sé específico:** número de pedido, fecha, producto exacto. Los detalles dan credibilidad.
> 2. **Describe el problema sin valorarlo:** «he recibido X en lugar de Y», no «me han enviado una cosa horrible».
> 3. **Cita el acuerdo previo:** lo que pediste, lo que pagaste, lo que te prometieron.
> 4. **Pide una solución concreta con plazo:** «solicito X en un plazo de Y días». Sin plazo, no hay urgencia.
> 5. **Tono firme pero cortés:** no te disculpes por reclamar. Tampoco amenaces en el primer correo.

---

### PROMPT CO-04 — Mensajes y comunicación informal escrita

**Objetivo:** Crear materiales para trabajar la comunicación informal escrita: mensajes de texto, notas, correos informales.

```
Actúa como profesor de ELE especializado en
comunicación escrita informal para nivel [A2/B1].

FORMATO: Ficha de trabajo sobre comunicación
informal escrita con modelos y ejercicios.

AUDIENCIA: [Grupo]

META: El alumnado producirá mensajes escritos
informales (WhatsApp, notas, correos a amigos)
con el registro, la longitud y las convenciones
adecuadas al contexto.

ESPECIFICACIONES:
- 4 situaciones comunicativas informales escritas:
  quedar con un amigo, cancelar un plan, felicitar
  a alguien, pedir un favor pequeño a un conocido
- Para cada situación: modelo del mensaje (con
  longitud realista), rasgos del español informal
  escrito (abreviaciones frecuentes, emojis como
  marcadores de tono, elisión de sujeto, etc.)
- Ejercicio: 4 situaciones para que el alumno
  escriba el mensaje
- Reflexión: diferencias en la comunicación escrita
  informal entre generaciones y países
```

**Output real (Claude) — Nivel A2/B1:**

> **Situación 1 — Quedar con un amigo:**
>
> *Mensaje:* «Oye, ¿quedamos el sábado para tomar algo? Tengo ganas de verte. ¿A las 7 en el bar de siempre? Avísame»
>
> *Rasgos del español informal escrito:*
> - Sin mayúscula inicial en «oye» (apertura informal directa)
> - Pregunta sin signo de apertura ¿ (frecuente en mensajes rápidos)
> - Elipsis del sujeto («tengo», «avísame»)
> - «el bar de siempre» presupone conocimiento compartido
>
> **Situación 2 — Cancelar un plan:**
>
> *Mensaje:* «Hola!! Lo siento mucho pero hoy no puedo ir, se me ha complicado el trabajo. ¿Quedamos otro día? Mil perdones»
>
> *Rasgos:*
> - «!!» para expresar énfasis emocional
> - «se me ha complicado» → estructura de dativo ético (involuntariedad implícita)
> - «Mil perdones» → fórmula de disculpa informal hiperbólica
>
> **Para ti — Escribe estos mensajes:**
> 1. Le escribes a un amigo para felicitarle por un nuevo trabajo.
> 2. Llegas tarde a una cita y avisas por mensaje.
> 3. Le pides a un compañero que te explique algo de clase que no entendiste.
> 4. Propones a un amigo ver una película en casa este fin de semana.

---

### PROMPT CO-05 — Escritura de correos en contexto profesional

**Objetivo:** Crear una secuencia completa de materiales para el correo electrónico en contextos laborales.

```
Actúa como especialista en comunicación profesional
en español para ELE nivel [B2/C1].

FORMATO: Banco de 6 situaciones de comunicación
profesional escrita con modelos y análisis.

AUDIENCIA: Adultos nivel [B2/C1] con necesidades
de español para el trabajo.

META: El alumnado producirá correos y comunicaciones
escritas eficaces en contextos profesionales reales,
con el registro, la estructura y el tono apropiados
para el mundo laboral en español.

ESPECIFICACIONES:
- 6 situaciones profesionales: presentarse a un
  nuevo equipo, confirmar una reunión, enviar un
  informe con resumen ejecutivo, disculparse por
  un error, rechazar una propuesta con tacto,
  pedir una prórroga de plazo
- Para cada situación: modelo de correo (150-200
  palabras) + 3 expresiones clave de esa situación
- Nota cultural: diferencias en comunicación
  profesional entre España y Latinoamérica
  (distancia de poder, tuteo vs. usted, etc.)
```

**Output real (Claude) — Disculparse por un error, C1:**

> **Situación: Has enviado un informe con datos incorrectos a un cliente importante.**
>
> *Asunto:* Corrección del informe enviado el [fecha] — Disculpas
>
> Estimado señor Vargas:
>
> Le escribo para disculparme por el error que aparece en el informe que le remití el pasado martes. Al revisar el documento, hemos detectado que las cifras de ventas del segundo trimestre presentan una discrepancia debida a un error en el proceso de extracción de datos.
>
> Adjunto a este correo la versión corregida del informe. Los datos revisados se encuentran en la tabla de la página 4 (las cifras anteriores eran incorrectas; las actuales reflejan los datos reales).
>
> Lamento los inconvenientes que esto haya podido ocasionarle y le aseguro que hemos revisado nuestro proceso interno para evitar que vuelva a ocurrir. Quedo a su disposición si necesita cualquier aclaración adicional.
>
> Reciba un cordial saludo,
> Patricia Ros
>
> **Expresiones clave para disculparse en un contexto profesional:**
> - «Le escribo para disculparme por...» *(directo, no dilata la disculpa)*
> - «Lamento los inconvenientes que esto haya podido ocasionarle» *(formal, condicional de cortesía)*
> - «Le aseguro que hemos tomado medidas para que no vuelva a ocurrir» *(credibilidad + acción correctiva)*
>
> **Nota cultural:** en muchos contextos latinoamericanos, el tratamiento de usted en comunicaciones profesionales es más extendido y duradero que en España, donde el tuteo profesional se extiende con mayor rapidez. En España, tutear a un cliente en el primer contacto puede percibirse como excesivamente informal en algunos sectores, pero completamente normal en otros (tecnología, publicidad, startup). La regla: sigue el registro del interlocutor.
