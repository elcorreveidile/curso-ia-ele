# TUTORIAL: MINI APP GENERADOR DE PLANES DE CLASE
### Cómo crear tu propia herramienta para generar planes de clase con IA

---

## 📋 INTRODUCCIÓN

Una "mini app" es básicamente un sistema optimizado para generar planes de clase de forma consistente. En este tutorial, verás dos formas de crearla:

**Opción A:** GPT personalizado en ChatGPT Plus (de pago, con interfaz)
**Opción B:** Flujo de trabajo con Claude (gratuito, sin interfaz)

Ambas funcionan. La diferencia es costo vs. comodidad.

---

## OPCIÓN A: GPT PERSONALIZADO EN CHATGPT PLUS

### Paso 1: Acceder a Create

1. Entra en [chat.openai.com](https://chat.openai.com)
2. Asegúrate de tener ChatGPT Plus ($20/mes)
3. En el menú izquierdo, haz clic en **"Explore GPTs"**
4. Arriba a la derecha, haz clic en **"Create"**

### Paso 2: Configurar tu GPT

**Nombre:**
```
Generador de Planes de Clase ELE [Nivel]
```
Ejemplo: "Generador de Planes de Clase ELE B2"

**Descripción:**
```
Genera planes de clase completos para nivel [NIVEL] alineados con MCER/PCIC.
Incluye: 5 fases, intervenciones del profesor, evaluación formativa.
Optimizado para [tipo de alumnado].
```

**Instructions (lo más importante):**

```
Eres un generador experto de planes de clase para español ELE nivel [A1/A2/B1/B2/C1/C2].

TU FUNCIÓN:
Generar planes de clase completos de 50-120 minutos según se especifique.

ALUMNADO TÍPICO:
- Nivel: [A1/A2/B1/B2/C1/C2]
- Edad: [especificar]
- Contexto: [estudios, trabajo, inmersión, etc.]
- Nacionalidad: [especificar si es relevante]

ESTRUCTURA DEL PLAN:
1. CABECERA: Nivel, duración, tema
2. OBJETIVO MCER: 1 objetivo comunicativo alineado con MCER/PCIC
3. CONTENIDOS: Gramática, vocabulario, funciones comunicativas
4. SECUENCIA (5 fases):
   - Fase 1: Caldeamiento (10-15 min)
   - Fase 2: Presentación/Focalización (15-20 min)
   - Fase 3: Práctica guiada (20-25 min)
   - Fase 4: Práctica autónoma (20-25 min)
   - Fase 5: Cierre (10 min)
   Cada fase incluye: objetivo, actividad, intervención profesor, materiales, adaptaciones
5. EVALUACIÓN: 3 indicadores de logro + estrategias
6. TAREA PARA CASA (opcional)

PARA CADA FASE INCLUIR:
- Objetivo específico
- Descripción detallada de la actividad
- Ejemplos de intervención del profesor (entre comillas)
- Intercambio esperado alumnado-profesor
- Materiales necesarios
- Adaptaciones para alumnado rápido/lento

LIMITACIONES:
- Nivel MCER coherente en todo el plan
- Actividades comunicativas (no solo ejercicios mecánicos)
- Timing realista
- Incluir diferenciación para diferentes ritmos
- Culturalmente auténtico y diverso

FORMATO DE RESPUESTA:
# PLAN DE CLASE: [TÍTULO]
## Nivel: [NIVEL] | Duración: [MINUTOS] minutos

### 1. Objetivo de aprendizaje MCER
[Objetivo]

### 2. Contenidos lingüísticos
- Gramática: [...]
- Vocabulario: [...]
- Funciones: [...]

### 3. Secuencia de la sesión
#### FASE 1: Caldeamiento (___ min)
[Detalles completos]

[Repetir para cada fase]

### 4. Evaluación formativa
[Indicadores + estrategias]

### 5. Tarea para casa (opcional)
[Si aplica]

ANTES DE GENERAR:
Si el usuario no proporciona información suficiente, haz 2-3 preguntas de aclaración sobre:
- Nivel MCER específico
- Perfil del alumnado
- Temática/objetivo
- Duración de la clase

NO GENERAR un plan si faltan estos datos críticos.
```

### Paso 3: Configurar el GPT

**Logo:** Sube una imagen (opcional)

**Preguntas de inicio (Starters):**
Añade 2-3 preguntas que tu GPT hará cuando alguien lo use:

1. "¿Qué nivel MCER (A1-C2)?"
2. "¿Cuántos minutos durará la clase?"
3. "¿Cuál es el tema u objetivo comunicativo?"
4. "¿Quién es tu alumnado? (edad, contexto, nacionalidad)"

### Paso 4: Probar tu GPT

**Prueba 1:**
```
Genera un plan de clase de 90 minutos para nivel B2.
Alumnado: 15 estudiantes universitarios estadounidenses en Granada.
Tema: Narrar experiencias de viajes usando pretérito imperfecto vs indefinido.
```

**Evalúa:**
- ¿Es el nivel B2 coherente?
- ¿Las actividades son comunicativas?
- ¿El timing es realista?
- ¿Hay intervenciones del profesor específicas?

**Prueba 2-3:**
Prueba con otros temas y niveles para verificar consistencia.

### Paso 5: Guardar y compartir

**Guardar:**
- Haz clic en "Save" (arriba derecha)
- Tu GPT aparecerá en tu panel de GPTs

**Compartir (opcional):**
- Haz clic en "Share"
- Copia el enlace
- Compártelo con colegas

---

## OPCIÓN B: FLUJO DE TRABAJO CON CLAUDE (GRATUITO)

Claude no tiene interfaz de "GPTs", pero puedes crear un sistema similar con un flujo de trabajo simple.

### Paso 1: Crear documento de plantilla

Crea un documento en Google Docs, Word, o Notion con este contenido:

```
=== SYSTEM PROMPT PARA GENERADOR DE PLANES ELE ===

Eres un generador experto de planes de clase para español ELE nivel [A1/A2/B1/B2/C1/C2].

[COPIAR AQUÍ EL SYSTEM PROMPT COMPLETO DE LA OPCIÓN A]

=== FIN DEL SYSTEM PROMPT ===

=== PROMPT DE EJEMPLO ===

Genera un plan de clase de [DURACIÓN] minutos para nivel [NIVEL MCER].

Alumnado: [DESCRIPCIÓN DETALLADA]

Tema: [TEMA/OBJETIVO]

=== FIN DEL PROMPT DE EJEMPLO ===
```

### Paso 2: Usar el sistema

**Cada vez que quieras generar un plan:**

1. Abre una nueva conversación en Claude
2. Pega el SYSTEM PROMPT completo
3. Envía
4. Claude responderá: "Entendido. Soy tu generador de planes de clase para nivel [NIVEL]. ¿Qué necesitas?"
5. Pega tu PROMPT DE EJEMPLO (o escribe uno nuevo)
6. Claude generará el plan

### Paso 3: Crear library de prompts

Crea una colección de prompts de ejemplo para diferentes situaciones:

**Ejemplo 1: Narrativa B2**
```
Genera un plan de clase de 90 minutos para nivel B2.
Alumnado: 12 estudiantes universitarios estadounidenses en Study Abroad, Granada.
Tema: Narrar experiencias de viajes usando pretérito imperfecto vs indefinido.
Objetivo: El alumnado será capaz de narrar viajes pasados diferenciando pretérito imperfecto de indefinido en contextos de conversación informal.
```

**Ejemplo 2: Transacciones A2**
```
Genera un plan de clase de 60 minutos para nivel A2.
Alumnado: 10 adultos europeos recién llegados a España.
Tema: Realizar transacciones en tiendas de ropa.
Objetivo: El alumnado será capaz de pedir, probarse y comprar ropa usando fórmulas de cortesía y vocabulario A2.
```

**Ejemplo 3: Debate B2**
```
Genera un plan de clase de 90 minutos para nivel B2.
Alumnado: 15 estudiantes universitarios internacionales mixtos.
Tema: Expresar opiniones sobre redes sociales y bienestar.
Objetivo: El alumnado será capaz de expresar opiniones justificadas sobre redes sociales usando conectores argumentativos básicos.
```

### Paso 4: Guardar planes favoritos

Cuando la IA genere un plan excelente:

1. Cópialo completo
2. Guárdalo en una carpeta organizada por nivel/tema
3. Nómbralo así: `PLAN_B2_Narracion_Viajes_20240315`
4. Reutilízalo o adáptalo en el futuro

---

## 🎯 EJEMPLO COMPLETO DE USO

### Con GPT Personalizado (ChatGPT Plus)

**Usuario:** "Genera un plan de 90 min para B2. Alumnado: universitarios estadounidenses en Granada. Tema: Pedir disculpas y excusas."

**GPT:** Genera plan completo con:
- Objetivo MCER
- 5 fases detalladas
- Intervenciones del profesor
- Evaluación formativa
- Todo listo para usar

### Con Claude (Gratuito)

**Usuario:** [Pega system prompt completo]

**Claude:** "Entendido. Soy tu generador de planes de clase para nivel B2. ¿Qué necesitas?"

**Usuario:** "Genera un plan de 90 min para B2. Alumnado: universitarios estadounidenses en Granada. Tema: Pedir disculpas y excusas."

**Claude:** Genera plan completo (similar al GPT)

---

## 💡 CONSEJOS Y MEJORES PRÁCTICAS

### Para Opción A (ChatGPT Plus):

✅ **Ventajas:**
- Interfaz visual agradable
- Configuración guardada
- Fácil de compartir
- Preguntas de inicio automáticas

❌ **Limitaciones:**
- $20/mes
- Requiere conexión constante
- Menos control sobre el sistema

### Para Opción B (Claude):

✅ **Ventajas:**
- Totalmente gratuito
- Límites más generosos
- Más control sobre prompts

❌ **Limitaciones:**
- Debes copiar/pegar system prompt cada vez
- Sin interfaz visual
- Menos compartible

### Recomendación:

**Si puedes pagar $20/mes:** Usa Opción A (más cómoda)
**Si tu presupuesto es $0:** Usa Opción B (igualmente efectiva, requiere más disciplina)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Para Opción A (ChatGPT Plus):

- [ ] Tener suscripción ChatGPT Plus
- [ ] Acceder a "Explore GPTs" → "Create"
- [ ] Configurar nombre, descripción, instructions
- [ ] Añadir 3-4 preguntas de inicio
- [ ] Probar con al menos 3 planes diferentes
- [ ] Verificar consistencia de calidad
- [ ] Guardar y opcionalmente compartir

### Para Opción B (Claude):

- [ ] Crear documento con system prompt
- [ ] Crear library de prompts de ejemplo
- [ ] Crear carpeta para guardar planes generados
- [ ] Probar sistema al menos 5 veces
- [ ] Verificar que produces planes consistentes
- [ ] Documentar tus mejores prompts

---

## 🚀 PRÓXIMOS PASOS

1. **Elige tu opción** (A si puedes pagar, B si prefieres gratis)
2. **Configura tu sistema** siguiendo el tutorial
3. **Prueba intensamente** durante 1 semana
4. **Refina el system prompt** según resultados
5. **Guarda tus mejores planes** para reutilizar
6. **Comparte con colegas** si es útil

---

**Tutorial creado para el curso "IA para la enseñanza de ELE" - CLM UGR 2027**
**Versión:** 1.0 | **Fecha:** Marzo 2026
