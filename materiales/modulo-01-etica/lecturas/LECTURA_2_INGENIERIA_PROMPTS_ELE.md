# ÍNDICE


1. Introducción: ¿Qué es prompt engineering?
2. Marco FRAME para prompts ELE
3. Prompts plantilla por género textual
4. Iteración y refinamiento
5. Checklist de calidad


\newpage

# LECTURA 2: GUÍA DE INGENIERÍA DE PROMPTS PARA ELE
### Cómo obtener resultados excelentes de IA en la enseñanza de Español como Lengua Extranjera

---


## 1. INTRODUCCIÓN: ¿QUÉ ES LA INGENIERÍA DE PROMPTS?

La **ingeniería de prompts** (*prompt engineering*) es el arte y la ciencia de diseñar instrucciones efectivas para obtener los mejores resultados posibles de modelos de lenguaje como ChatGPT, Claude o Gemini.

### Por qué importa en ELE

Un buen prompt = resultado útil en 1-2 intentos
Un mal prompt = 5-10 intentos frustrantes + resultados mediocres

### La diferencia

**Prompt malo:** "Crea un ejercicio de gramática"
**Prompt bueno:** "Actúa como profesor de español B2. Crea un ejercicio de 10 frases para completar con pretérito imperfecto vs indefinido. Alumnado: universitarios estadounidenses en Granada. Tema: viajes pasados. Incluye instrucciones y solucionario."

La diferencia es evidente. El segundo prompt produce exactamente lo que necesitas; el primero, un resultado genérico e impredecible.

---

## 2. MARCO FRAME PARA PROMPTS ELE

FRAME es una herramienta nemotécnica con 6 componentes esenciales para construir prompts efectivos en ELE. Las dos últimas letras comparten la inicial E: Especificaciones y Ejemplo.

### F - FORMATO
¿Qué tipo de material quieres generar?

**Ejemplos:**
- Ejercicio de completar
- Texto narrativo de 200 palabras
- Diálogo de 10 intervenciones
- Ensayo argumentativo
- Plan de clase de 90 minutos

**Error común:** No especificar formato → Resultado genérico

### R - ROL
¿Qué rol debe adoptar la IA?

**Ejemplos:**
- "Actúa como profesor de español B2 especializado en gramática"
- "Eres editor de textos ELE nivel A2"
- "Actúa como experto en MCER/PCIC"
- "Eres corrector de textos para alumnado internacional"

**Error común:** No definir rol → Respuesta demasiado general

### A - AUDIENCIA
¿Para quién es el material?

**Especifica:**
- Nivel MCER (A1-C2)
- Edad
- Contexto (alumnado, adultos, profesionales)
- Nacionalidad u origen cultural
- Objetivos de aprendizaje

**Error común:** «Para alumnado» → Demasiado vago

### M - META
¿Cuál es el objetivo de aprendizaje?

**Formula así:**
"El alumnado será capaz de [acción] usando [contenido lingüístico] en [contexto]"

**Ejemplos:**
- "Será capaz de narrar experiencias pasadas usando pretérito imperfecto vs indefinido en contextos de viajes"
- "Será capaz de expresar opiniones justificadas sobre redes sociales usando conectores argumentativos"

**Error común:** "Aprender gramática" → No es un objetivo comunicativo

### E - ESPECIFICACIONES
¿Qué elementos específicos debe incluir?

**Lista:**
- Longitud (número de palabras/frases)
- Elementos requeridos (instrucciones, solucionario, vocabulario)
- Estilo (formal/informal)
- Variedad de español (peninsular, latinoamericano)
- Formato de respuesta

**Error común:** No dar especificaciones → Resultado no usable

### E - EJEMPLO
¿Puedes incluir un modelo del resultado esperado?

**Por qué ayuda:**
- Muestra exactamente qué quieres
- Elimina ambigüedad
- La IA puede imitar tu estilo

**Ejemplo:**
"El ejercicio debe ser así:
1. [Instrucción clara]
2. [Espacio para respuesta]
3. [Ejemplo: 'Ayer ___ (ir) al cine']"

---

## 3. PROMPTS PLANTILLA POR GÉNERO TEXTUAL

### GÉNERO 1: TEXTO NARRATIVO (B1-B2)

```
Actúa como profesor de español ELE nivel [B1/B2].

FORMATO: Texto narrativo de 150-200 palabras

ROL: Generar textos narrativos auténticos para alumnado [especificar contexto]

AUDIENCIA: Estudiantes [edad, nacionalidad, contexto]

META: El alumnado será capaz de leer y comprender narraciones personales usando [tiempos verbales] en contextos de [temática]

ESPECIFICACIONES:
- Título atractivo
- Entre 150 y 200 palabras
- Vocabulario [nivel] (no más C1/C2 sin explicación)
- Usar [tiempos verbales específicos]
- Incluir 3-4 expresiones idiomáticas o culturales
- Tema: [tema específico]
- Narración en primera persona
- Tono personal y cercano

EJEMPLO DE ESTILO:
"El verano pasado, mi amiga Laura y yo decidimos hacer algo especial: un viaje por Portugal. Diez días, una mochila, y mucho sol por delante. Lo que no sabíamos era que aquel viaje cambiaría nuestra amistad para siempre..." [estilo personal, emotivo, con tiempos verbales correctos]

FORMATO DE RESPUESTA:
[Título]
[Texto narrativo 150-200 palabras]
[Vocabulario destacado: 8-10 palabras con traducción al inglés]
[3-4 preguntas de comprensión lectora]
[1 pregunta de opinión para debate]
```

---

### GÉNERO 2: DIÁLOGO (A2-B1)

```
Actúa como profesor de español ELE nivel [A2/B1].

FORMATO: Diálogo de [8-12] intervenciones

ROL: Generar diálogos auténticos para alumnado [contexto]

AUDIENCIA: Estudiantes [edad, nacionalidad, objetivos]

META: El alumnado será capaz de realizar [transacción específica] usando [funciones comunicativas] en [lugar]

ESPECIFICACIONES:
- 8-12 intervenciones totales
- 2 interlocutores
- Situación: [describir situación específica]
- Vocabulario [nivel]
- Incluir fórmulas de cortesía (por favor, gracias, etc.)
- Incluir 1 expresión coloquial española explicada
- Registro: [formal/informal]

EJEMPLO DE FORMATO:
A: [interlocutor 1]
B: [interlocutor 2]
A: [continuar diálogo]

FORMATO DE RESPUESTA:
[Diálogo completo]
[Vocabulario clave: 6-8 palabras]
[Nota cultural: 1 expresión explicada]
[Instrucciones para role-play en clase]
```

---

### GÉNERO 3: EJERCICIO DE GRAMÁTICA (A2-B2)

```
Actúa como profesor de español ELE nivel [A2/B1/B2].

FORMATO: Ejercicio de [tipo: completar/emparejar/seleccionar]

ROL: Generar ejercicios gramaticales comunicativos

AUDIENCIA: Estudiantes [edad, contexto]

META: El alumnado será capaz de practicar [estructura gramatical] en contextos de [temática]

ESPECIFICACIONES:
- [Número] ítems exactos
- Tipo de ejercicio: [completar/emparejar/seleccionar]
- Estructura gramatical: [especificar]
- Tema: [temática específica]
- Incluir instrucciones claras en español
- Incluir solucionario
- Nivel: [A2/B1/B2]

EJEMPLO DE FORMATO:
1. Instrucción: "Completa las frases con pretérito indefinido o imperfecto"
2. Ítems:
   a. Ayer ___ (ir) al cine con mis amigos.
   b. Mientras ___ (caminar), vi a mi profesor.
   [...]

FORMATO DE RESPUESTA:
[Título del ejercicio]
[Instrucciones claras en español]
[Ejercicio con [número] ítems]
[Solucionario]
[Vocabulario clave si es relevante]
```

---

### GÉNERO 4: TEXTO PERIODÍSTICO/ARTÍCULO (B2)

```
Actúa como profesor de español ELE nivel B2.

FORMATO: Artículo de opinión periodístico de 250-300 palabras

ROL: Generar textos periodísticos auténticos

AUDIENCIA: Estudiantes universitarios B2

META: El alumnado será capaz de leer y analizar artículos de opinión usando [vocabulario, conectores] sobre [temática contemporánea]

ESPECIFICACIONES:
- 250-300 palabras
- Título llamativo
- Estructura periodística (lead, cuerpo, conclusión)
- Vocabulario B2+
- Conectores argumentativos (sin embargo, no obstante, por otro lado)
- Tema: [tema contemporáneo]
- Punto de vista claro pero balanceado

FORMATO DE RESPUESTA:
[Título]
[Artículo 250-300 palabras]
[Vocabulario B2+ destacado: 10-12 palabras]
[Conectores argumentativos usados]
[3-4 preguntas de análisis]
[Tarea de escritura: cartas al editor, réplica, etc.]
```

---

## 4. ITERACIÓN Y REFINAMIENTO

### El proceso iterativo

Rara vez el primer prompt produce el resultado perfecto. Necesitas iterar.

**Proceso:**
1. **Prompt inicial** → Resultado
2. **Revisión** → Identificar fortalezas/debilidades
3. **Prompt de refinamiento** → Resultado mejorado
4. **(Repetir si es necesario)** → Resultado óptimo

### Ejemplo de iteración

**Prompt 1:**
"Crea un diálogo en restaurante, nivel A2"

**Resultado 1:** Diálogo de 15 intervenciones, demasiado largo para A2

**Revisión:** "Demasiado largo. Diálogos A2 deben ser 8-10 intervenciones máximo"

**Prompt 2:**
"Acorta el diálogo a 8 intervenciones máximo. Mantén nivel A2, vocabulario simple, contexto restaurante"

**Resultado 2:** Diálogo de 8 intervenciones, mucho mejor

### Prompts de refinamiento comunes

| Si el resultado es... | Usa este prompt de refinamiento |
|----------------------|--------------------------------|
| Demasiado largo | "Acorta a [número] [palabras/intervenciones/párrafos] máximo" |
| Demasiado difícil | "Simplifica vocabulario a nivel [nivel]. Explica términos complejos" |
| Demasiado fácil | "Añade complejidad: [especificar qué añadir]" |
| Falta algo | "Añade [elemento específico que falta]" |
| Demasiado genérico | "Sé más específico sobre [tema/contexto]" |
| Formato incorrecto | "Usa este formato: [especificar formato deseado]" |

---

## 5. CHECKLIST DE CALIDAD

Antes de usar el resultado de IA, verifica:

**Contenido:**
- [ ] Gramática correcta
- [ ] Nivel MCER apropiado
- [ ] Vocabulario adecuado al nivel
- [ ] Culturalmente auténtico (no estereotipado)
- [ ] Sin errores fácticos

**Formato:**
- [ ] Incluye instrucciones claras
- [ ] Longitud apropiada
- [ ] Estructura lógica
- [ ] Fácil de usar en clase

**Aplicabilidad:**
- [ ] Relevante para tu alumnado
- [ ] Listo para usar (o con mínimas modificaciones)
- [ ] Puede reutilizarse para otras unidades

**Ética:**
- [ ] Representa diversidad hispanohablante
- [ ] Sin sesgos culturales ofensivos
- [ ] Respetuoso con diferentes grupos

---

## 🎯 TU TURNO

Ahora que has leído sobre FRAME y prompts plantilla, practica:

1. **Elige un género textual** (narrativa, diálogo, ejercicio, artículo)
2. **Elige un nivel** (A1-C2)
3. **Escribe un prompt FRAME** para ese género/nivel
4. **Prueba con IA** (ChatGPT, Claude, o Gemini)
5. **Itera si es necesario**
6. **Guarda tu prompt exitoso** para reutilizar

---

**Lectura creada para el curso "IA para la enseñanza de ELE" - CLM UGR 2026**
**Versión:** 1.0 | **Fecha:** Marzo 2026
