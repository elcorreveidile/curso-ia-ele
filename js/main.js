/* ═══════════════════════════════════════════════════════
   NAV & UTILS
═══════════════════════════════════════════════════════ */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', window.scrollY > 20));

const burger = document.querySelector('.nav__burger');
const navLinks = document.querySelector('.nav__links');
burger?.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav__links a').forEach(a =>
  a.addEventListener('click', () => navLinks?.classList.remove('open'))
);

document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver(([e], obs) => {
    if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); }
  }, { threshold: 0.1 }).observe(el);
});

/* ═══════════════════════════════════════════════════════
   CUESTIONARIO ENGINE
═══════════════════════════════════════════════════════ */
const SECTIONS = ['A','B','C','D','E'];
let currentSection = 0;

const progressFill = document.getElementById('progressFill');
const progressPct  = document.getElementById('progressPct');

function updateProgress() {
  const pct = Math.round((currentSection / SECTIONS.length) * 100);
  if (progressFill) progressFill.style.width = pct + '%';
  if (progressPct)  progressPct.textContent  = pct + '%';
}

function showSection(idx) {
  document.querySelectorAll('.q-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.q-section-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('section-' + SECTIONS[idx])?.classList.add('active');
  document.getElementById('tab-' + SECTIONS[idx])?.classList.add('active');
  currentSection = idx;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextSection() {
  if (currentSection < SECTIONS.length - 1) {
    document.getElementById('tab-' + SECTIONS[currentSection])?.classList.add('done');
    showSection(currentSection + 1);
  }
}
function prevSection() { if (currentSection > 0) showSection(currentSection - 1); }

SECTIONS.forEach((s, i) => {
  document.getElementById('tab-' + s)?.addEventListener('click', () => showSection(i));
});
document.getElementById('btnNext')?.addEventListener('click', nextSection);
document.getElementById('btnPrevB')?.addEventListener('click', prevSection);
document.getElementById('btnNextB')?.addEventListener('click', nextSection);
document.getElementById('btnPrevC')?.addEventListener('click', prevSection);
document.getElementById('btnNextC')?.addEventListener('click', nextSection);
document.getElementById('btnPrevD')?.addEventListener('click', prevSection);
document.getElementById('btnNextD')?.addEventListener('click', nextSection);
document.getElementById('btnPrevE')?.addEventListener('click', prevSection);

/* ═══════════════════════════════════════════════════════
   MOTOR DE DIAGNÓSTICO CLM
   Dimensiones ponderadas:
   · Conocimiento objetivo  (sección C: preguntas correctas/incorrectas) → 50%
   · Competencia digital    (sección B: Likert)                          → 25%
   · Herramientas ELE/área  (sección D: Likert)                          → 25%
   Bonus: frecuencia de uso real de IA (+10 máx)
═══════════════════════════════════════════════════════ */

/* Respuestas correctas sección C */
const CORRECT = {
  p17: 'Aprende de datos',
  p21: 'Instrucción',
  p22: 'Puede errar y sesgar',
  pk1: 'b',  // LLM
  pk2: 'c',  // Alucinación
  pk3: 'b',  // Fine-tuning
  pk4: 'a',  // Generativa vs discriminativa
  pk5: 'c',  // Token
  pk6: 'b',  // Temperatura
  pk7: 'a',  // RAG
  pk8: 'c',  // Sesgo
  pk9: 'b',  // Zero-shot
  pk10: 'a', // API vs web
};

const P18_CORRECT = new Set(['ChatGPT','Claude','Gemini','Copilot','Midjourney','ElevenLabs']);

function scoreP18(vals) {
  if (!vals || vals.length === 0) return 0;
  let hits = 0, errors = 0;
  vals.forEach(v => P18_CORRECT.has(v) ? hits++ : errors++);
  const net = hits - errors;
  if (net <= 0) return 0;
  if (net <= 2) return 1;
  if (net <= 4) return 2;
  return 3;
}

function getFormValues(form) {
  const fd = new FormData(form);
  const vals = {};
  for (const [k, v] of fd.entries()) {
    if (vals[k]) {
      vals[k] = Array.isArray(vals[k]) ? [...vals[k], v] : [vals[k], v];
    } else {
      vals[k] = v;
    }
  }
  return vals;
}

function calcDiagnostico(vals) {
  /* 1. Conocimiento objetivo */
  let knowScore = 0;
  const knowTotal = Object.keys(CORRECT).length + 1;
  Object.entries(CORRECT).forEach(([q, c]) => { if (vals[q] === c) knowScore++; });
  const p18v = Array.isArray(vals.p18) ? vals.p18 : (vals.p18 ? [vals.p18] : []);
  knowScore += scoreP18(p18v) / 3;
  const knowPct = Math.round((knowScore / knowTotal) * 100);

  /* 2. Competencia digital */
  const digKeys = ['p6','p7','p8','p9','p10','p11','p12','p13','p14','p15'];
  let digSum = 0, digCount = 0;
  digKeys.forEach(k => { if (vals[k]) { digSum += parseInt(vals[k]); digCount++; } });
  const p16map = {'Evito usarla':1,'Uso cuando proponen':2,'Uso puntual':3,'Integro habitualmente':4,'Soy referente':5};
  if (vals.p16 && p16map[vals.p16]) { digSum += p16map[vals.p16]; digCount++; }
  const digPct = digCount > 0 ? Math.round(((digSum / digCount) - 1) / 4 * 100) : 0;

  /* 3. Herramientas digitales en el trabajo */
  const eleKeys = ['p24','p25','p26','p27','p28','p29','p30','p31','p32'];
  let eleSum = 0, eleCount = 0;
  eleKeys.forEach(k => { if (vals[k]) { eleSum += parseInt(vals[k]); eleCount++; } });
  const elePct = eleCount > 0 ? Math.round(((eleSum / eleCount) - 1) / 4 * 100) : 0;

  /* 4. Bonus frecuencia */
  const freqMap = {'Nunca':0,'1-2 veces':0.25,'Ocasionalmente':0.5,'Varias veces semana':0.75,'A diario':1};
  const freqBonus = (freqMap[vals.p19] || 0) * 10;

  /* 5. Puntuación final */
  const total = Math.round((knowPct * 0.50) + (digPct * 0.25) + (elePct * 0.25) + freqBonus);

  /* 6. Nivel */
  let nivel = total < 28 ? 1 : total < 52 ? 2 : total < 72 ? 3 : 4;

  /* 7. Área de trabajo */
  const area = vals.area_trabajo || 'general';

  return { nivel, total, knowPct, digPct, elePct, area };
}

/* ═══════════════════════════════════════════════════════
   PERFILES Y RUTAS ADAPTADOS AL CLM
═══════════════════════════════════════════════════════ */

/* Rutas específicas por área */
const RUTAS_AREA = {
  'docente-esp': {
    label: 'Profesorado de Español',
    icono: '🇪🇸',
    contexto: 'Como docente de ELE en el CLM, la IA puede transformar tu forma de preparar clases, crear materiales auténticos y dar feedback personalizado al alumnado internacional.'
  },
  'docente-lm': {
    label: 'Profesorado de Lenguas Modernas',
    icono: '🌍',
    contexto: 'Como docente de lenguas modernas en el CLM, la IA puede ayudarte a generar recursos en tu idioma, adaptar materiales auténticos al nivel de tus estudiantes y agilizar la corrección.'
  },
  'administracion': {
    label: 'Administración',
    icono: '📋',
    contexto: 'En administración del CLM, la IA puede automatizar correos, redactar comunicaciones en varios idiomas, generar informes, gestionar reservas y apoyar el trabajo con alumnado internacional.'
  },
  'informatica': {
    label: 'Informática, Sistemas y Desarrollo',
    icono: '💻',
    contexto: 'En el equipo técnico del CLM, la IA abre posibilidades de automatización avanzada, integración de APIs, desarrollo de herramientas internas y optimización de sistemas.'
  },
  'diseno': {
    label: 'Diseño Gráfico, Web y Audiovisuales',
    icono: '🎨',
    contexto: 'En el área de diseño del CLM, la IA generativa puede acelerar la producción de contenido visual, generar variantes de diseño, crear recursos audiovisuales y automatizar tareas repetitivas.'
  },
  'biblioteca': {
    label: 'Biblioteca',
    icono: '📚',
    contexto: 'En la biblioteca del CLM, la IA puede ayudar a catalogar, generar resúmenes de recursos, responder consultas del alumnado y enriquecer los servicios de información.'
  },
  'conserjeria': {
    label: 'Conserjería y Mantenimiento',
    icono: '🏢',
    contexto: 'En conserjería del CLM, la IA puede ayudarte a redactar comunicaciones, traducir avisos para el alumnado internacional y gestionar incidencias de forma más eficiente.'
  },
  'direccion': {
    label: 'Dirección',
    icono: '🎯',
    contexto: 'Desde la dirección del CLM, la IA puede apoyar la toma de decisiones estratégicas, la redacción de informes, la comunicación institucional y el diseño de políticas de transformación digital.'
  },
  'general': {
    label: 'CLM',
    icono: '🏛️',
    contexto: 'Como miembro del equipo del CLM, la IA puede adaptarse a las necesidades específicas de tu puesto y ayudarte a trabajar de forma más eficiente.'
  }
};

/* Rutas de aprendizaje por nivel y área */
function getRuta(nivel, area) {
  const rutasBase = {
    1: [
      { paso:1, titulo:'Primeros pasos con IA', desc:'Abre ChatGPT o Claude y empieza una conversación sobre algo relacionado con tu trabajo diario en el CLM. No necesitas saber nada: solo escribe lo que necesitas como si le hablaras a un compañero.', tiempo:'Esta semana', icono:'👋' },
      { paso:2, titulo:'Entiende qué puede y qué no puede hacer la IA', desc:'Prueba a pedirle que redacte un correo, que traduzca un aviso, que responda una duda. Observa dónde acierta y dónde falla. La clave es desarrollar criterio propio.', tiempo:'1-2 semanas', icono:'🔍' },
      { paso:3, titulo:'IA en tu día a día', desc:'Elige UNA tarea de tu trabajo habitual que sea repetitiva (redactar, resumir, traducir, responder preguntas frecuentes) y empieza a usar la IA para esa tarea concretamente.', tiempo:'2-3 semanas', icono:'⚙️' },
      { paso:4, titulo:'Ética y uso responsable', desc:'Antes de usar la IA con alumnado o en comunicaciones externas, infórmate sobre qué datos no debes compartir y cómo verificar la información que genera. Módulo I de este curso.', tiempo:'1 semana', icono:'🧭' },
    ],
    2: [
      { paso:1, titulo:'Prompts que funcionan', desc:'Aprende a escribir instrucciones claras: especifica el rol, el contexto, el formato y el tono que quieres. Un buen prompt multiplica la calidad del resultado. Módulo I de este curso.', tiempo:'1-2 semanas', icono:'✍️' },
      { paso:2, titulo:'Construye tu biblioteca de prompts', desc:'Crea un documento con los 5-10 prompts que más uses en tu trabajo. Reutilizarlos te ahorrará tiempo cada semana y mejorarán con el uso.', tiempo:'2-3 semanas', icono:'📂' },
      { paso:3, titulo:'Herramientas específicas para tu área', desc:'Explora las herramientas de IA más útiles para tu puesto en el CLM: generadores de imágenes, transcripción de audio, traducción avanzada, asistentes de código o escritura.', tiempo:'2-3 semanas', icono:'🛠️' },
      { paso:4, titulo:'Ética y sesgos', desc:'Con uso más regular llega la responsabilidad: aprende a detectar alucinaciones, verificar datos y comunicar al alumnado cuándo un contenido ha sido generado con IA.', tiempo:'1 semana', icono:'⚖️' },
    ],
    3: [
      { paso:1, titulo:'Técnicas avanzadas de prompting', desc:'Chain-of-thought, few-shot learning, prompts encadenados, instrucciones con ejemplos. Técnicas para obtener resultados consistentes y de mayor calidad en tus tareas del CLM.', tiempo:'1 semana', icono:'🔬' },
      { paso:2, titulo:'Automatización de flujos de trabajo', desc:'Identifica 2-3 procesos repetitivos en tu área que puedan automatizarse parcialmente con IA: generación de informes, respuestas a consultas frecuentes, creación de recursos en serie.', tiempo:'2-3 semanas', icono:'⚡' },
      { paso:3, titulo:'Crea herramientas propias', desc:'Diseña mini asistentes o plantillas especializadas que tus compañeros del CLM también puedan usar. Módulos II y III de este curso.', tiempo:'3-4 semanas', icono:'🤖' },
      { paso:4, titulo:'Liderazgo interno', desc:'Comparte lo que sabes. Propón una sesión de 1-2 horas para introducir la IA a compañeros de tu área con menos experiencia. Eres ya un recurso valioso para el CLM.', tiempo:'Continuo', icono:'👥' },
    ],
    4: [
      { paso:1, titulo:'Diseña la estrategia IA del CLM', desc:'Con tu nivel, el siguiente paso es pensar en grande: ¿cómo puede la IA transformar los procesos del CLM a nivel institucional? Define prioridades por áreas y colectivos.', tiempo:'2-3 semanas', icono:'📐' },
      { paso:2, titulo:'Forma a tus compañeros', desc:'Diseña un itinerario formativo interno adaptado a los distintos perfiles del CLM (docentes, administración, técnicos, conserjería). Cada grupo necesita un enfoque diferente.', tiempo:'3-4 semanas', icono:'🎓' },
      { paso:3, titulo:'Política de uso ético institucional', desc:'Redacta o propón una política de uso de IA para el CLM: qué datos son confidenciales, cómo comunicar al alumnado el uso de IA, qué herramientas están aprobadas y cuáles no.', tiempo:'2 semanas', icono:'📜' },
      { paso:4, titulo:'Innovación y vanguardia', desc:'Explora aplicaciones emergentes para el CLM: tutores virtuales de idiomas, feedback automático de pronunciación, sistemas de recomendación de recursos, IA para análisis de rendimiento académico.', tiempo:'Continuo', icono:'🔭' },
    ]
  };

  /* Ajustes por área */
  const ajustes = {
    'docente-esp': {
      1: [
        { paso:1, titulo:'IA para preparar tus primeras actividades de ELE', desc:'Pídele a ChatGPT o Claude que genere una actividad de comprensión lectora para nivel B1 sobre un tema cultural español. Evalúa el resultado: ¿es útil? ¿qué falla?', tiempo:'Esta semana', icono:'👋' },
        { paso:2, titulo:'Textos auténticos adaptados', desc:'Usa la IA para adaptar noticias o textos reales al nivel de tus estudiantes. Especifica el nivel MCER, el vocabulario máximo y el tipo de actividad que quieres acompañar.', tiempo:'1-2 semanas', icono:'📰' },
        { paso:3, titulo:'Tu primer plan de clase con IA', desc:'Sigue el prompt plantilla del Módulo III del curso para generar un plan de clase completo. Revísalo críticamente y adáptalo a tu grupo real.', tiempo:'2-3 semanas', icono:'📋' },
        { paso:4, titulo:'Ética en el aula de ELE', desc:'Reflexiona sobre qué contenidos generados por IA son apropiados para tus clases y cuáles pueden reflejar sesgos culturales. Módulo I del curso.', tiempo:'1 semana', icono:'🧭' },
      ],
      2: [
        { paso:1, titulo:'Prompts para ELE', desc:'Aprende a escribir prompts específicos para ELE: especifica nivel MCER, objetivos comunicativos, tipo de actividad y perfil del alumnado. Módulo I del curso.', tiempo:'1-2 semanas', icono:'✍️' },
        { paso:2, titulo:'Mini asistente para tu clase', desc:'Crea un asistente personalizado para un nivel concreto: configúralo con instrucciones de sistema que lo conviertan en un tutor de conversación o corrector de escritura.', tiempo:'2-3 semanas', icono:'🤖' },
        { paso:3, titulo:'Recursos multimodales', desc:'Genera imágenes para activar conocimientos previos, audios con ElevenLabs para trabajar comprensión oral y mapas mentales de vocabulario. Módulo IV del curso.', tiempo:'2-3 semanas', icono:'🎨' },
        { paso:4, titulo:'Alineación con MCER y PCIC', desc:'Aprende a usar la IA para verificar y ajustar que tus materiales están alineados con los descriptores del nivel que enseñas. Módulo III del curso.', tiempo:'1 semana', icono:'📊' },
      ]
    },
    'administracion': {
      1: [
        { paso:1, titulo:'IA para redactar comunicaciones', desc:'Pídele a Claude o ChatGPT que redacte un correo de bienvenida para alumnado internacional en inglés y español. Ajusta el tono y el contenido a la imagen del CLM.', tiempo:'Esta semana', icono:'✉️' },
        { paso:2, titulo:'Traducciones y atención multilingüe', desc:'Usa la IA para traducir avisos, FAQs y comunicaciones al inglés, francés o alemán. El CLM atiende a estudiantes de todo el mundo: la IA puede ser tu intérprete instantáneo.', tiempo:'1-2 semanas', icono:'🌍' },
        { paso:3, titulo:'Automatización de tareas repetitivas', desc:'Identifica qué correos o documentos redactas una y otra vez (confirmaciones, instrucciones, respuestas a dudas frecuentes) y crea plantillas de prompts para generarlos en segundos.', tiempo:'2-3 semanas', icono:'⚙️' },
        { paso:4, titulo:'Datos y privacidad', desc:'Aprende qué información nunca debes compartir con herramientas de IA externas (datos personales del alumnado, información económica confidencial). Fundamental en administración.', tiempo:'1 semana', icono:'🔒' },
      ],
      2: [
        { paso:1, titulo:'Prompts para administración del CLM', desc:'Desarrolla prompts específicos para tu área: informes de matrícula, comunicaciones con socios internacionales, respuestas a consultas de Study Abroad, gestión de eventos y congresos.', tiempo:'1-2 semanas', icono:'📋' },
        { paso:2, titulo:'IA para marketing y comunicación', desc:'Genera contenido para redes sociales, newsletters y campañas del CLM con IA. Aprende a mantener la voz institucional del centro en los textos generados.', tiempo:'2-3 semanas', icono:'📢' },
        { paso:3, titulo:'Automatización de flujos', desc:'Explora cómo conectar herramientas de IA con los sistemas que ya usas: gestión de reservas, programa de gestión integral, comunicaciones masivas.', tiempo:'3-4 semanas', icono:'⚡' },
        { paso:4, titulo:'Documentación y reportes', desc:'Usa la IA para generar borradores de memorias, informes de actividad, actas de reuniones y presentaciones institucionales. Siempre con revisión humana final.', tiempo:'2 semanas', icono:'📊' },
      ]
    },
    'informatica': {
      1: [
        { paso:1, titulo:'Explora las APIs de IA principales', desc:'Crea una cuenta en la API de Anthropic (Claude) u OpenAI. Haz tu primera llamada desde terminal. La curva de aprendizaje es mínima si ya tienes base técnica.', tiempo:'Esta semana', icono:'🔌' },
        { paso:2, titulo:'Automatización básica con IA', desc:'Escribe un script que use la API para procesar texto: resumir tickets de soporte, clasificar incidencias o generar respuestas automáticas a consultas frecuentes del CLM.', tiempo:'1-2 semanas', icono:'⚙️' },
        { paso:3, titulo:'Integración en sistemas existentes', desc:'Identifica qué sistemas del CLM podrían beneficiarse de IA: la web, el sistema de gestión, las herramientas de comunicación interna. Diseña un prototipo.', tiempo:'2-4 semanas', icono:'🔧' },
        { paso:4, titulo:'Seguridad y privacidad en IA', desc:'Revisa los protocolos de privacidad de las herramientas de IA que el CLM va a usar. Define qué datos pueden enviarse a servicios externos y cuáles deben procesarse localmente.', tiempo:'1-2 semanas', icono:'🔒' },
      ],
      2: [
        { paso:1, titulo:'RAG y bases de conocimiento internas', desc:'Implementa un sistema RAG que permita a la IA consultar documentos internos del CLM (guías, FAQs, reglamentos) antes de responder. Herramienta clave para automatizar atención al alumnado.', tiempo:'2-3 semanas', icono:'🧠' },
        { paso:2, titulo:'Fine-tuning y modelos especializados', desc:'Evalúa si merece la pena entrenar un modelo con datos del CLM para tareas muy específicas. Compara costes y beneficios frente a un buen sistema de prompting.', tiempo:'3-4 semanas', icono:'🎯' },
        { paso:3, titulo:'Automatización end-to-end', desc:'Diseña flujos completos: desde la consulta del alumnado hasta la respuesta automática, pasando por clasificación, búsqueda en documentos internos y generación de respuesta supervisada.', tiempo:'4-6 semanas', icono:'⚡' },
        { paso:4, titulo:'Política técnica de IA del CLM', desc:'Redacta las guías técnicas de uso de IA para el centro: qué APIs están aprobadas, cómo anonimizar datos, qué logs hay que mantener y cómo monitorizar el uso.', tiempo:'2 semanas', icono:'📜' },
      ]
    },
    'diseno': {
      1: [
        { paso:1, titulo:'Generadores de imágenes para el CLM', desc:'Prueba Midjourney, DALL-E o Adobe Firefly para generar imágenes institucionales, fondos para presentaciones o ilustraciones para materiales del centro. Empieza con prompts sencillos.', tiempo:'Esta semana', icono:'🖼️' },
        { paso:2, titulo:'IA para redacción de copies', desc:'Usa ChatGPT o Claude para generar textos para la web, redes sociales o folletos del CLM. Aprende a darle el tono institucional correcto.', tiempo:'1-2 semanas', icono:'✍️' },
        { paso:3, titulo:'Audio y vídeo con IA', desc:'Explora ElevenLabs para voiceovers, Runway o Pika para vídeo generativo, y herramientas de transcripción automática para subtitular contenidos del CLM.', tiempo:'2-3 semanas', icono:'🎬' },
        { paso:4, titulo:'Flujo de trabajo asistido por IA', desc:'Integra la IA en tu flujo habitual: generación de conceptos visuales iniciales, variantes de diseño, mockups rápidos. La IA como bocetador, tú como director creativo.', tiempo:'2-3 semanas', icono:'🎨' },
      ],
      2: [
        { paso:1, titulo:'Prompting para diseño y creatividad', desc:'Domina el prompting para imágenes: estilos visuales, paletas de color, composición, referencias. Aprende a describir exactamente lo que necesitas para el CLM.', tiempo:'1-2 semanas', icono:'🖌️' },
        { paso:2, titulo:'Automatización de producción de contenido', desc:'Crea flujos automatizados para producir variantes de materiales (formatos web, redes sociales, impresión) a partir de un único diseño base, usando IA para adaptar textos e imágenes.', tiempo:'2-3 semanas', icono:'⚡' },
        { paso:3, titulo:'IA generativa en producción audiovisual', desc:'Explora aplicaciones avanzadas: doblaje automático de vídeos institucionales, subtitulado multilingüe, generación de recursos audiovisuales para los cursos del CLM.', tiempo:'3-4 semanas', icono:'🎥' },
        { paso:4, titulo:'Guía de estilo + IA para el CLM', desc:'Documenta cómo usar la IA manteniendo la identidad visual del CLM: qué estilos, tonos y referencias usar en los prompts para que los resultados sean coherentes con la marca.', tiempo:'2 semanas', icono:'📐' },
      ]
    },
    'biblioteca': {
      1: [
        { paso:1, titulo:'IA para catalogación y descripción', desc:'Usa la IA para generar descripciones, resúmenes y palabras clave de los recursos de la biblioteca del CLM. Ahorra tiempo en tareas de catalogación repetitiva.', tiempo:'Esta semana', icono:'📖' },
        { paso:2, titulo:'Asistente de recomendación de recursos', desc:'Prueba a usar un chatbot para responder consultas frecuentes del alumnado sobre los fondos disponibles, horarios y servicios de la biblioteca.', tiempo:'1-2 semanas', icono:'💬' },
        { paso:3, titulo:'Resúmenes y traducciones de recursos', desc:'Genera resúmenes ejecutivos de publicaciones en otros idiomas para facilitar el acceso al alumnado internacional del CLM.', tiempo:'2-3 semanas', icono:'🌍' },
        { paso:4, titulo:'Privacidad y uso ético en biblioteca', desc:'Revisa qué datos del préstamo y uso de recursos son confidenciales y no deben compartirse con herramientas de IA externas.', tiempo:'1 semana', icono:'🔒' },
      ]
    },
    'conserjeria': {
      1: [
        { paso:1, titulo:'IA para comunicaciones con el alumnado', desc:'Usa la IA para redactar avisos, carteles y comunicaciones en varios idiomas para el alumnado internacional del CLM. Empieza con algo concreto: un aviso de horario o una norma de uso de instalaciones.', tiempo:'Esta semana', icono:'📢' },
        { paso:2, titulo:'Traducción instantánea', desc:'Cuando un estudiante extranjero tenga una consulta que no entiendes, usa la IA como intérprete en tiempo real. Funciona con cualquier idioma de los que se enseñan en el CLM.', tiempo:'1-2 semanas', icono:'🌍' },
        { paso:3, titulo:'Gestión de incidencias', desc:'Usa la IA para redactar partes de incidencias, informes de mantenimiento o comunicaciones internas de forma más rápida y clara.', tiempo:'2-3 semanas', icono:'🔧' },
        { paso:4, titulo:'Privacidad básica', desc:'Aprende qué información nunca debes introducir en herramientas de IA: datos personales del alumnado, información confidencial del centro.', tiempo:'1 semana', icono:'🔒' },
      ]
    },
    'direccion': {
      1: [
        { paso:1, titulo:'IA para informes y memorias', desc:'Usa la IA para generar borradores de informes de gestión, memorias académicas y presentaciones institucionales. La IA estructura, tú decides y refinas el contenido.', tiempo:'Esta semana', icono:'📊' },
        { paso:2, titulo:'Comunicación estratégica', desc:'Genera comunicaciones institucionales, cartas a socios internacionales y discursos en varios idiomas con apoyo de IA. Mantén siempre la voz directiva y la revisión final.', tiempo:'1-2 semanas', icono:'✉️' },
        { paso:3, titulo:'Análisis y toma de decisiones', desc:'Usa la IA para analizar datos de matriculación, satisfacción del alumnado y tendencias del sector ELE. Pídele que identifique patrones y proponga recomendaciones.', tiempo:'2-3 semanas', icono:'🔍' },
        { paso:4, titulo:'Política institucional de IA para el CLM', desc:'Diseña con apoyo de IA un borrador de política de uso de IA para los 110 trabajadores del CLM: principios, límites, formación obligatoria y responsabilidades.', tiempo:'2-3 semanas', icono:'📜' },
      ]
    }
  };

  /* Devuelve ruta específica del área si existe, si no la base */
  const areaRutas = ajustes[area];
  if (areaRutas && areaRutas[nivel]) return areaRutas[nivel];
  return rutasBase[nivel];
}

/* Perfiles CLM */
const PERFILES = {
  1: {
    nombre: 'Descubridor/a',
    emoji: '🌱',
    color: '#2E7D5E',
    colorLight: '#e8f5f0',
    descripcion: 'Estás en los primeros pasos del mundo de la IA. Tienes potencial enorme porque partes sin hábitos incorrectos y con toda la curva de aprendizaje por delante. En el CLM hay muchas tareas cotidianas donde la IA puede ayudarte desde el primer día.',
    fortalezas: ['Mentalidad abierta al aprendizaje', 'Sin malos hábitos digitales que corregir', 'Máximo potencial de crecimiento'],
    curso: '✅ Este curso está diseñado exactamente para ti. Parte de cero y llega a crear materiales y herramientas propias paso a paso.',
    cursoColor: '#2E7D5E'
  },
  2: {
    nombre: 'Explorador/a activo/a',
    emoji: '🚀',
    color: '#1A4A8A',
    colorLight: '#D6E8F7',
    descripcion: 'Has explorado la IA por tu cuenta y tienes una idea de sus posibilidades, pero tu uso todavía es intuitivo e irregular. Necesitas método y criterio para sacarle partido real en tu trabajo diario en el CLM.',
    fortalezas: ['Familiaridad con herramientas básicas', 'Motivación y curiosidad demostradas', 'Base sólida para sistematizar la práctica'],
    curso: '✅ Este curso te dará el método que te falta para pasar de uso esporádico a integración real en tu práctica profesional.',
    cursoColor: '#1A4A8A'
  },
  3: {
    nombre: 'Practicante',
    emoji: '⚡',
    color: '#E8532B',
    colorLight: '#FBE9E3',
    descripcion: 'Usas la IA con regularidad y criterio. Tu competencia digital es sólida y ya integras herramientas en tu trabajo. El siguiente salto es profundizar en aplicaciones avanzadas y empezar a crear recursos y flujos propios.',
    fortalezas: ['Uso regular y sistemático de IA', 'Competencia digital consolidada', 'Capacidad de evaluar y filtrar resultados'],
    curso: '✅ Este curso te aportará valor especialmente en los módulos III y IV. Considera también el rol de referente en tu área del CLM.',
    cursoColor: '#E8532B'
  },
  4: {
    nombre: 'Referente digital',
    emoji: '🏆',
    color: '#6C3483',
    colorLight: '#f3e8fa',
    descripcion: 'Tienes un dominio sólido de la IA y sus aplicaciones. Eres capaz de evaluar herramientas, crear recursos propios y guiar a otros. Tu siguiente reto es liderar la transformación digital del CLM desde tu posición.',
    fortalezas: ['Dominio técnico y conceptual avanzado', 'Capacidad creativa y crítica desarrollada', 'Potencial de liderazgo e impacto en el CLM'],
    curso: '💡 Ya tienes el nivel para sacar el máximo de este curso. Te recomendamos especialmente el rol de formador/a interno/a para los 110 trabajadores del CLM.',
    cursoColor: '#6C3483'
  }
};

/* ═══════════════════════════════════════════════════════
   RENDER RESULTADOS
═══════════════════════════════════════════════════════ */
function renderResultados({ nivel, total, knowPct, digPct, elePct, area }) {
  const perfil = PERFILES[nivel];
  const areaInfo = RUTAS_AREA[area] || RUTAS_AREA['general'];
  const ruta = getRuta(nivel, area);
  const container = document.getElementById('resultados');
  if (!container) return;

  container.innerHTML = `
    <div class="res-hero" style="background:linear-gradient(135deg,${perfil.color},${perfil.color}cc)">
      <div class="res-hero__inner">
        <div class="res-hero__emoji">${perfil.emoji}</div>
        <div>
          <p class="res-hero__tag">${areaInfo.icono} ${areaInfo.label} · Centro de Lenguas Modernas</p>
          <h2 class="res-hero__nivel">Nivel ${nivel} · ${perfil.nombre}</h2>
          <p class="res-hero__desc">${perfil.descripcion}</p>
          <p class="res-hero__contexto">${areaInfo.contexto}</p>
        </div>
      </div>
    </div>

    <div class="res-scores">
      <div class="res-score-card">
        <div class="res-score-card__label">Conocimiento objetivo</div>
        <div class="res-score-card__bar"><div class="res-score-card__fill" style="width:0%;background:${perfil.color}" data-target="${knowPct}"></div></div>
        <div class="res-score-card__num">${knowPct}<span>/100</span></div>
      </div>
      <div class="res-score-card">
        <div class="res-score-card__label">Competencia digital</div>
        <div class="res-score-card__bar"><div class="res-score-card__fill" style="width:0%;background:${perfil.color}" data-target="${digPct}"></div></div>
        <div class="res-score-card__num">${digPct}<span>/100</span></div>
      </div>
      <div class="res-score-card">
        <div class="res-score-card__label">Herramientas digitales</div>
        <div class="res-score-card__bar"><div class="res-score-card__fill" style="width:0%;background:${perfil.color}" data-target="${elePct}"></div></div>
        <div class="res-score-card__num">${elePct}<span>/100</span></div>
      </div>
      <div class="res-score-card res-score-card--total">
        <div class="res-score-card__label">Puntuación global</div>
        <div class="res-score-card__total" style="color:${perfil.color}">${total}<span style="font-size:1.2rem;font-weight:400;color:#6B7A8D">/100</span></div>
      </div>
    </div>

    <div class="res-fortalezas">
      <h3 class="res-section-title">Tus puntos fuertes</h3>
      <div class="res-fortalezas__list">
        ${perfil.fortalezas.map(f=>`<div class="res-fortaleza"><span style="color:${perfil.color}">✓</span> ${f}</div>`).join('')}
      </div>
    </div>

    <div class="res-ruta">
      <h3 class="res-section-title">Tu ruta de aprendizaje · ${areaInfo.label}</h3>
      <div class="res-ruta__steps">
        ${ruta.map(r=>`
          <div class="res-step">
            <div class="res-step__num" style="background:${perfil.color}">${r.paso}</div>
            <div class="res-step__body">
              <div class="res-step__header">
                <span class="res-step__icon">${r.icono}</span>
                <h4 class="res-step__titulo">${r.titulo}</h4>
                <span class="res-step__tiempo">${r.tiempo}</span>
              </div>
              <p class="res-step__desc">${r.desc}</p>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="res-curso" style="border-left:4px solid ${perfil.cursoColor};background:${perfil.colorLight}">
      <h3 class="res-section-title" style="color:${perfil.cursoColor}">¿Es este curso para ti?</h3>
      <p class="res-curso__text">${perfil.curso}</p>
    </div>

    <div class="res-actions">
      <a href="programa.html" class="btn btn--primary">Ver programa del curso</a>
      <a href="calendario.html" class="btn btn--outline">Ver calendario</a>
      <button onclick="window.print()" class="btn btn--outline">🖨 Imprimir resultados</button>
    </div>
  `;

  /* Animar barras con un pequeño delay */
  setTimeout(() => {
    container.querySelectorAll('.res-score-card__fill').forEach(bar => {
      bar.style.transition = 'width 1.2s ease';
      bar.style.width = bar.dataset.target + '%';
    });
  }, 200);
}

/* ═══════════════════════════════════════════════════════
   FORM SUBMISSION
═══════════════════════════════════════════════════════ */
const form        = document.getElementById('diagnosticoForm');
const thankYou    = document.getElementById('thankYou');
const formWrapper = document.getElementById('formWrapper');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.textContent = 'Analizando…';

  const vals = getFormValues(form);
  const diagnostico = calcDiagnostico(vals);
  const perfil = PERFILES[diagnostico.nivel];
  const areaInfo = RUTAS_AREA[diagnostico.area] || RUTAS_AREA['general'];

  /* Enriquecer FormData con resultados para que lleguen al correo */
  const fd = new FormData(form);
  fd.append('_resultado_nivel', `Nivel ${diagnostico.nivel} · ${perfil.nombre}`);
  fd.append('_resultado_area', areaInfo.label);
  fd.append('_puntuacion_global', diagnostico.total + '/100');
  fd.append('_conocimiento_objetivo', diagnostico.knowPct + '/100');
  fd.append('_competencia_digital', diagnostico.digPct + '/100');
  fd.append('_herramientas_digitales', diagnostico.elePct + '/100');

  try {
    const res = await fetch(form.action, {
      method: 'POST', body: fd,
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) console.warn('Formspree: error de envío, pero mostramos resultados.');
  } catch { console.warn('Error de red, mostramos resultados igualmente.'); }

  /* Mostrar resultados siempre, independientemente del envío */
  if (progressFill) progressFill.style.width = '100%';
  if (progressPct)  progressPct.textContent  = '100%';
  document.querySelectorAll('.q-section-tab').forEach(t => t.classList.add('done'));
  formWrapper.style.display = 'none';
  thankYou.style.display = 'block';
  renderResultados(diagnostico);
  thankYou.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

updateProgress();
