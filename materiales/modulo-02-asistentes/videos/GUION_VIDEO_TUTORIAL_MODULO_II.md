# GUION VÍDEO TUTORIAL - MÓDULO II
### Título: "Crea tu primer asistente de ELE con ChatGPT y Claude"
### Duración: 10-15 minutos
### Módulo II del curso "IA para la enseñanza de ELE"

---

## 🎬 FICHA TÉCNICA

| Campo | Información |
|-------|-------------|
| **Duración objetivo** | 10:00 - 15:00 minutos |
| **Formato** | Demostración en pantalla con voz en off |
| **Estilo** | Paso a paso, práctico, con capturas de pantalla |
| **Nivel** | Principiante-intermedio |

---

## 📋 GUION COMPLETO

### INTRODUCCIÓN

### 0:00 - 1:30 | Parte 1: ¿Qué es un mini asistente ELE?

**Visual:**
- Pantalla dividida: izquierda ChatGPT genérico, derecha "Asistente ELE B2"
- Captura de pantalla de ChatGPT con prompt genérico
- Captura de pantalla de resultado genérico
- Luego captura de asistente configurado con resultado específico

**Audio:**

> "Bienvenidos al Módulo II. Hoy vamos a hacer algo muy emocionante: vamos a crear tu primer mini asistente de ELE.
>
> Pero primero, ¿qué es un mini asistente? Es diferente a usar ChatGPT de forma genérica.
>
> **ChatGPT genérico:** Tú le pides algo, responde basándose en su entrenamiento general. No conoce tu contexto, tu alumnado, tus necesidades específicas.
>
> **Mini asistente ELE:** Es como si entrenaras a ChatGPT para que sea un profesor de ELE especializado en tu nivel, tu tipo de alumnado, tu contexto. Respuestas consistentes, siempre al nivel adecuado, siempre con el estilo que tú prefieres.
>
> La diferencia es como entre ir a un médico general y un especialista. El general puede ayudarte, pero el especialista conoce profundamente tu situación específica.
>
> En este tutorial, verás dos formas de crear un mini asistente:
> - Opción A: Crear un GPT personalizado en ChatGPT Plus
> - Opción B: Usar un system prompt en Claude (gratuito)
>
> Al final, tendrás un asistente funcionando y listo para usar."

**Visual:**
- Icono de dos caminos: Opción A y Opción B

---

### 1:30 - 5:30 | Parte 2: Crear un GPT Personalizado en ChatGPT

**Visual:**
- Capturas de pantalla de la interfaz de ChatGPT
- Círculos y flechas señalando botones importantes
- Capturas de pantalla de cada paso

**Audio:**

> "Vamos a empezar con la Opción A: Crear un GPT personalizado en ChatGPT.
>
> **Paso 1: Acceder a Create**
> Entra en ChatGPT, verás a la izquierda el menú. Busca 'Explore GPTs'. Haz clic. Luego verás un botón 'Create' arriba a la derecha. Haz clic ahí.
>
> **Paso 2: Nombre del GPT**
> Te pedirá un nombre. Sé específico. No 'Asistente ELE', sino algo como 'Asistente de Gramática B2 - Estudiantes Universitarios'. Esto te ayudará a identificarlo después.
>
> **Paso 3: Descripción**
> Aquí describe qué hace tu GPT. Por ejemplo: 'Genera ejercicios de gramática para nivel B2, alumnado universitario estadounidense, con énfasis en comunicación auténtica'.
>
> **Paso 4: Instrucciones (LO MÁS IMPORTANTE)**
> Aquí es donde configuras el comportamiento de tu GPT. Aquí es donde defines su 'personalidad', su rol, sus límites.
>
> Te voy a mostrar un ejemplo de system prompt para un asistente de nivel B2:"

**Visual:**
- Captura de pantalla del campo "Instructions"
- Texto del system prompt aparece gradualmente
- System prompt ejemplo:
```
Eres un asistente de español ELE nivel B2.

ALUMNADO: Estudiantes universitarios (18-25 años), programas internacionales en España.

TU ROL: Ayudar al profesor a crear materiales didácticos para nivel B2.

CAPACIDADES:
- Generar ejercicios de gramática y vocabulario B2
- Crear textos adaptados (150-200 palabras)
- Proponer actividades comunicativas

LIMITACIONES:
- Siempre especificar nivel MCER
- Instrucciones claras para alumnado
- No generar vocabulario C1/C2 sin explicación
- Si no estás seguro, indícalo

FORMATO DE RESPUESTA:
[Material]
[Nivel B2 objetivo]
[Instrucciones para alumnado]
```

**Audio:**

> "¿Ves? Este system prompt define claramente:
> - Quién es el asistente
> - Para quién trabaja
> - Qué puede hacer
> - Qué NO puede hacer
> - Cómo debe responder
>
> **Paso 5: Probar tu GPT**
> Ahora, en el panel de la derecha, verás un área de chat. Aquí puedes probar tu GPT.
>
> Pruébalo con: 'Genera 5 ejercicios de pretérito imperfecto vs indefinido para B2'.
>
> Verás que la respuesta es específica, al nivel, con instrucciones claras.
>
> **Paso 6: Iterar si es necesario**
> Si no te gusta el resultado, puedes modificar el system prompt y probar de nuevo.
>
> **Paso 7: Guardar y compartir**
> Cuando estés satisfecho, haz clic en 'Save'. Tu GPT estará disponible en tu panel de GPTs. Si tienes ChatGPT Plus, también puedes compartir el enlace con otros docentes."

**Visual:**
- Animación de cada paso con números
- Capturas de pantalla reales de la interfaz

---

### 5:30 - 9:30 | Parte 3: System Prompt para Claude (Opción Gratuita)

**Visual:**
- Capturas de pantalla de Claude
- Comparación: ChatGPT Plus (de pago) vs Claude (gratuito)

**Audio:**

> "¿No tienes ChatGPT Plus? No hay problema. Puedes crear un asistente similar usando Claude, que es gratuito.
>
> La diferencia es que Claude no tiene una interfaz visual de 'GPTs'. En su lugar, usarás lo que llamamos un 'system prompt' en tu primera interacción.
>
> **Paso 1: Abrir Claude**
> Entra en claude.ai. Verás un área de chat simple.
>
> **Paso 2: Enviar el system prompt**
> En tu primer mensaje, enviarás el system prompt completo que define tu asistente.
>
> **Paso 3: Guardar el system prompt**
> IMPORTANTE: Como Claude no guarda configuraciones, necesitarás guardar este system prompt en un documento de texto para reutilizarlo. Copiar y pegar cada vez.
>
> Voy a mostrarte el mismo system prompt que vimos antes, pero adaptado para Claude:"

**Visual:**
- Captura de pantalla de Claude
- System prompt aparece gradualmente
- Nota sobre guardarlo en documento

**Audio:**

> "Es prácticamente el mismo system prompt, con una pequeña diferencia: Claude responde bien a instrucciones estructuradas, así que lo he organizado por secciones.
>
> **Paso 4: Probar**
> Envía el system prompt. Claude responderá algo como: 'Entendido. Soy tu asistente de español ELE nivel B2. ¿En qué puedo ayudarte hoy?'
>
> **Paso 5: Usar tu asistente**
> Ahora puedes pedirle lo mismo que le pedirías a tu GPT: 'Genera 5 ejercicios de pretérito imperfecto vs indefinido para B2'.
>
> **Limitación:** Cada vez que abras un nuevo chat en Claude, necesitarás volver a enviar el system prompt. Por eso es importante guardarlo en un documento para copiar y pegar."

**Visual:**
- Comparación lado a lado: ChatGPT (configuración guardada) vs Claude (copiar/pegar cada vez)

---

### 9:30 - 11:30 | Parte 4: Ejemplo Práctico en Vivo

**Visual:**
- Grabación de pantalla en tiempo real
- Crear un asistente desde cero

**Audio:**

> "Ahora voy a crear un asistente en tiempo real frente a ti.
>
> Voy a crear un 'Asistente de Conversación A2 - Vida Cotidiana en España'.
>
> **System prompt que usaré:**"

**Visual:**
- System prompt aparece:
```
Eres un asistente de español ELE nivel A2.

ESPECIALIZACIÓN: Conversaciones y situaciones cotidianas para adultos viviendo en España.

ALUMNADO: Adultos (25-45 años), primer mes en España, necesidades prácticas inmediatas.

TIPOS DE MATERIAL QUE GENERAS:
- Diálogos para role-plays (máx. 10 intervenciones)
- Frases útiles para situaciones específicas
- Ejercicios de escucha (guiones)

CONTEXTOS:
- Tiendas (comida, ropa, farmacia)
- Transporte (autobús, taxi, metro)
- Restaurante (pedir, pagar, quejar)
- Citas médicas básicas
- Trámites (banco, correos)

REGLAS:
- Vocabulario A2 del MCER
- Frases cortas (máx. 12 palabras)
- Español de España (peninsular)
- Incluir fórmulas de cortesía básicas

FORMATO:
[Diálogo/Actividad]
[Instrucciones en español claro]
[Vocabulario clave con traducciones al inglés]
```

**Audio:**

> "Voy a enviar este system prompt a Claude... [pausa]... Ahora voy a pedirle que genere un diálogo para pedir en un restaurante.
>
> [Pausa mientras Claude genera]
>
> Aquí está el resultado. ¿Ves? Es perfecto: nivel A2, contexto claro (restaurante en España), vocabulario adecuado, incluso incluye traducciones al inglés.
>
> Ahora voy a pedirle que haga una segunda versión pero para una tienda de ropa. [Pausa]... Listo. Mismo nivel, mismo estilo, diferente contexto.
>
> Esto es la belleza de un asistente especializado: respuestas consistentes, siempre al nivel que necesitas."

**Visual:**
- Captura de pantalla del prompt
- Captura de pantalla del diálogo generado
- Captura de pantalla del segundo diálogo

---

### 11:30 - 13:00 | Parte 5: Buenas Prácticas

**Visual:**
- Lista de buenas prácticas con iconos
- Ejemplos visuales de cada práctica

**Audio:**

> "Antes de terminar, quiero compartir 5 buenas prácticas para crear asistentes ELE:
>
> **Práctica 1: Incluir siempre nivel MCER**
> Nunca asumas que el asistente 'adivinará' el nivel. Sé explícito: Nivel A2, B1, B2.
>
> **Práctica 2: Especificar tipo de actividades**
> ¿Tu asistente genera ejercicios? ¿Diálogos? ¿Textos? ¿Sé específico.
>
> **Práctica 3: Indicar límites claros**
> Qué NO debe hacer. Ejemplo: 'No generar vocabulario C1 sin explicación'.
>
> **Práctica 4: Probar con al menos 5 tareas**
> No asumas que funciona con una prueba. Prueba 5 tareas diferentes antes de usarlo con tu alumnado.
>
> **Práctica 5: Guardar el system prompt**
> Si usas Claude, guarda el prompt en un documento. Si usas ChatGPT Plus, el GPT se guarda automáticamente."

**Visual:**
- Iconos de checklist ✅
- Números del 1 al 5

---

### 13:00 - 14:00 | Parte 6: Tu Turno

**Visual:**
- Pantalla con pasos para el alumnado
- Checklist de tareas

**Audio:**

> "Ahora es tu turno. Tu tarea de este módulo es crear tu propio mini asistente ELE.
>
> **Pasos:**
> 1. Elige el nivel (A1, A2, B1, B2, C1, C2)
> 2. Define el tipo de alumnado (edad, contexto, objetivos)
> 3. Decide qué tipo de materiales generará
> 4. Escribe el system prompt (puedes usar las plantillas de las lecturas)
> 5. Prueba con al menos 5 tareas diferentes
> 6. Itera y refine según sea necesario
> 7. Comparte en el foro: describe tu asistente, muestra ejemplos, recibe feedback
>
> No te preocupes si el primer intento no es perfecto. La IA se mejora con la iteración. Lo importante es empezar."

**Visual:**
- Checklist animado
- Icono de foro 💬

---

### 14:00 - 15:00 | Cierre y Recursos

**Visual:**
- Resumen visual de lo aprendido
- Enlaces a recursos

**Audio:**

> "Para cerrar, recuerda:
>
> - Un **mini asistente ELE** es diferente a ChatGPT genérico
> - Con **ChatGPT Plus** puedes crear un GPT personalizado
> - Con **Claude gratuito** puedes usar un system prompt
> - Siempre **incluye nivel MCER** en tu system prompt
> - **Prueba antes de usar** con tu alumnado
>
> En las lecturas de este módulo, encontrarás plantillas de system prompt para todos los niveles (A1-C2) y diferentes tipos de asistentes. Úsalas como punto de partida y adáptalas a tu contexto.
>
> Nos vemos en el foro. ¡Allá vamos!"

**Visual:**
- Música motivadora de fondo
- Pantalla final con recursos:
  - 📄 Plantillas system prompt (lectura 2)
  - 💬 Foro de compartir asistentes
  - ⭐ Rúbrica de evaluación
- Logo del curso

---

## 🎨 ELEMENTOS VISUALES

### Capturas de pantalla necesarias

**ChatGPT:**
1. Pantalla principal con menú lateral
2. "Explore GPTs"
3. Botón "Create"
4. Campos: Name, Description, Instructions
5. Panel de chat de prueba
6. Botón "Save"
7. Panel de GPTs guardados

**Claude:**
1. Pantalla principal
2. Área de chat
3. Envío de system prompt
4. Respuesta de Claude

**Comparaciones:**
- ChatGPT Plus vs Claude (tabla)
- Respuesta genérica vs respuesta con asistente

### Iconos y elementos visuales

- 🤖 Robot/asistente
- ✅ Checklists
- ⚡ Rayo (rápido)
- 🎯 Objetivo
- 💬 Chat/burbujas
- 📋 Documentos
- 🔧 Configuración

---

## 📐 INSTRUCCIONES DE PRODUCCIÓN

### Software recomendado
- **Loom** o **OBS Studio** para grabación de pantalla
- **QuickTime** (Mac) o **Game Bar** (Windows) alternativas gratuitas
- **iMovie** o **DaVinci Resolve** para edición

### Estilo de capturas
- **Zoom:** Suficientemente cerca para leer texto
- **Resalte:** Usar círculos/flechas para señalar botones
- **Animación:** Elementos appearing gradualmente
- **Tempo:** Pausado, con pausas en puntos clave

### Voz en off
- **Tono:** Práctico, paso a paso, animado
- **Ritmo:** Pausado, con pausas después de cada instrucción
- **Claridad:** Explicar cada paso antes de mostrarlo
- **Longitud:** 10-15 minutos objetivo

---

## ✅ CHECKLIST ANTES DE PUBLICAR

**Contenido:**
- [ ] Explicación clara de qué es un mini asistente
- [ ] Paso a paso para crear GPT en ChatGPT
- [ ] Paso a paso para usar system prompt en Claude
- [ ] Ejemplo práctico en tiempo real
- [ ] Buenas prácticas
- [ ] Próximos pasos para el alumnado

**Visual:**
- [ ] Capturas de pantalla claras y legibles
- [ ] Botones y elementos señalados
- [ ] Animaciones suaves
- [ ] Comparaciones visuales efectivas

**Audio:**
- [ ] Voz clara sin ruido
- [ ] Ritmo adecuado (ni muy rápido ni muy lento)
- [ ] Pausas en momentos clave
- [ ] Duración 10-15 minutos
- [ ] Explicaciones prácticas (no teóricas)

---

## 🎯 OBJETIVOS DE APRENDIZAJE

Al ver este vídeo, el alumnado debería:

1. **Comprender** la diferencia entre ChatGPT genérico y un mini asistente
2. **Saber** cómo crear un GPT personalizado en ChatGPT Plus
3. **Saber** cómo usar un system prompt en Claude (gratuito)
4. **Conocer** las buenas prácticas para crear asistentes
5. **Sentirse listo/a** para crear su propio asistente

---

**Guion creado para el curso "IA para la enseñanza de ELE" - CLM UGR 2026**
**Versión:** 1.0 | **Fecha:** Marzo 2026
