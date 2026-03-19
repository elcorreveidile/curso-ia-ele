/* ═══════════════════════════════════════════════════════
   NAV & UTILS
═══════════════════════════════════════════════════════ */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 20);
});

const burger = document.querySelector('.nav__burger');
const navLinks = document.querySelector('.nav__links');
burger?.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav__links a').forEach(a =>
  a.addEventListener('click', () => navLinks?.classList.remove('open'))
);

const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => revealObs.observe(el));


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
  const sec = document.getElementById('section-' + SECTIONS[idx]);
  const tab = document.getElementById('tab-' + SECTIONS[idx]);
  if (sec) sec.classList.add('active');
  if (tab) tab.classList.add('active');
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
function prevSection() {
  if (currentSection > 0) showSection(currentSection - 1);
}

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
   MOTOR DE DIAGNÓSTICO
   Tres dimensiones ponderadas:
   - Conocimiento objetivo  (preguntas C con respuesta correcta) → 50%
   - Competencia digital    (Likert sección B)                   → 25%
   - Uso herramientas ELE   (Likert sección D)                   → 25%
═══════════════════════════════════════════════════════ */

// Respuestas correctas sección C (preguntas de conocimiento)
const CORRECT = {
  p17: 'Aprende de datos',        // Tecnología que aprende de datos
  p21: 'Instrucción',             // Prompt = instrucción
  p22: 'Puede errar y sesgar',    // IA puede cometer errores
  // Preguntas nuevas de conocimiento objetivo
  pk1: 'b',   // Qué es un LLM
  pk2: 'c',   // Alucinación en IA
  pk3: 'b',   // Fine-tuning
  pk4: 'a',   // Diferencia IA generativa vs IA discriminativa
  pk5: 'c',   // Token en contexto de LLM
  pk6: 'b',   // Temperatura en modelos de lenguaje
  pk7: 'a',   // RAG (Retrieval Augmented Generation)
  pk8: 'c',   // Sesgo en IA, origen principal
  pk9: 'b',   // Zero-shot prompting
  pk10: 'a',  // Diferencia ChatGPT vs API de OpenAI
};

// Preguntas p18 (múltiple): respuestas correctas (IA generativa real)
const P18_CORRECT = new Set(['ChatGPT','Claude','Gemini','Copilot','Midjourney','ElevenLabs']);

function scoreP18(vals) {
  // vals = array de strings marcados
  if (!vals || vals.length === 0) return 0;
  let hits = 0, errors = 0;
  vals.forEach(v => {
    if (P18_CORRECT.has(v)) hits++;
    else errors++; // Google Translate o "No lo sé" restan
  });
  // Puntuación 0-3: 0 aciertos=0, 1-2=1, 3-4=2, 5-6=3
  const net = hits - errors;
  if (net <= 0) return 0;
  if (net <= 2) return 1;
  if (net <= 4) return 2;
  return 3;
}

function getFormValues(form) {
  const fd = new FormData(form);
  const vals = {};
  // checkboxes: agrupar en arrays
  for (const [k, v] of fd.entries()) {
    if (vals[k]) {
      if (Array.isArray(vals[k])) vals[k].push(v);
      else vals[k] = [vals[k], v];
    } else {
      vals[k] = v;
    }
  }
  return vals;
}

function calcDiagnostico(vals) {
  /* ── 1. Conocimiento objetivo (0-100) ── */
  let knowScore = 0;
  const knowTotal = Object.keys(CORRECT).length + 1; // +1 por p18

  // Preguntas simples
  Object.entries(CORRECT).forEach(([q, correct]) => {
    if (vals[q] === correct) knowScore++;
  });
  // p18 múltiple (máx 3 puntos equivalentes a 3 preguntas)
  const p18vals = Array.isArray(vals.p18) ? vals.p18 : (vals.p18 ? [vals.p18] : []);
  knowScore += scoreP18(p18vals) / 3; // normalizado a 1 punto

  const knowPct = (knowScore / knowTotal) * 100;

  /* ── 2. Competencia digital (0-100) ── */
  const digitalKeys = ['p6','p7','p8','p9','p10','p11','p12','p13','p14','p15'];
  let digitalSum = 0, digitalCount = 0;
  digitalKeys.forEach(k => {
    if (vals[k]) { digitalSum += parseInt(vals[k]); digitalCount++; }
  });
  // p16: actitud tecnológica (0-4 → 1-5)
  const p16map = {'Evito usarla':1,'Uso cuando proponen':2,'Uso puntual':3,'Integro habitualmente':4,'Soy referente':5};
  if (vals.p16 && p16map[vals.p16]) { digitalSum += p16map[vals.p16]; digitalCount++; }
  const digitalPct = digitalCount > 0 ? ((digitalSum / digitalCount) - 1) / 4 * 100 : 0;

  /* ── 3. Herramientas ELE digitales (0-100) ── */
  const eleKeys = ['p24','p25','p26','p27','p28','p29','p30','p31','p32'];
  let eleSum = 0, eleCount = 0;
  eleKeys.forEach(k => {
    if (vals[k]) { eleSum += parseInt(vals[k]); eleCount++; }
  });
  const elePct = eleCount > 0 ? ((eleSum / eleCount) - 1) / 4 * 100 : 0;

  /* ── 4. Uso real de IA (bonus) ── */
  const freqMap = {'Nunca':0,'1-2 veces':0.25,'Ocasionalmente':0.5,'Varias veces semana':0.75,'A diario':1};
  const freqBonus = freqMap[vals.p19] || 0;

  /* ── 5. Puntuación final ponderada ── */
  const total = (knowPct * 0.50) + (digitalPct * 0.25) + (elePct * 0.25) + (freqBonus * 10);

  /* ── 6. Nivel ── */
  let nivel;
  if (total < 28)      nivel = 1;
  else if (total < 52) nivel = 2;
  else if (total < 72) nivel = 3;
  else                 nivel = 4;

  return { nivel, total: Math.round(total), knowPct: Math.round(knowPct),
           digitalPct: Math.round(digitalPct), elePct: Math.round(elePct) };
}

/* ── Perfiles y rutas ── */
const PERFILES = {
  1: {
    nombre: 'Explorador/a',
    emoji: '🌱',
    color: '#2E7D5E',
    colorLight: '#e8f5f0',
    descripcion: 'Estás en los primeros pasos del mundo de la IA. Tienes curiosidad pero todavía no has tenido la oportunidad de explorar estas herramientas en profundidad. Este es el momento perfecto para empezar con bases sólidas.',
    fortalezas: ['Mentalidad abierta al aprendizaje', 'Sin hábitos incorrectos que corregir', 'Potencial de crecimiento máximo'],
    ruta: [
      { paso: 1, titulo: 'Fundamentos de IA', desc: 'Entiende qué es la IA, cómo funcionan los modelos de lenguaje y qué puedes esperar de ellos. Empieza con ChatGPT o Claude en modo conversacional libre.', tiempo: '1-2 semanas', icono: '📖' },
      { paso: 2, titulo: 'Prompts básicos', desc: 'Aprende a escribir instrucciones claras. Practica con tareas simples: resumir textos, generar ideas, responder preguntas. Este curso cubre esto en el Módulo I.', tiempo: '2-3 semanas', icono: '✍️' },
      { paso: 3, titulo: 'IA aplicada a ELE', desc: 'Empieza a usar la IA para preparar actividades sencillas: vocabulario, ejercicios de gramática, textos de comprensión. Módulos II y III de este curso.', tiempo: '3-4 semanas', icono: '🎯' },
      { paso: 4, titulo: 'Recursos multimodales', desc: 'Explora generadores de imágenes y audio para enriquecer tus clases. Módulo IV de este curso.', tiempo: '2 semanas', icono: '🎨' },
    ],
    curso: '✅ Este curso es ideal para ti. Está diseñado precisamente para docentes que quieren empezar desde cero con bases sólidas y aplicación práctica inmediata.',
    cursoColor: '#2E7D5E'
  },
  2: {
    nombre: 'Iniciado/a',
    emoji: '🚀',
    color: '#1A4A8A',
    colorLight: '#D6E8F7',
    descripcion: 'Has explorado la IA por tu cuenta y tienes una idea general de sus posibilidades. Sin embargo, tu uso todavía es irregular o intuitivo. Necesitas método, criterio y práctica estructurada para sacarle partido real.',
    fortalezas: ['Familiaridad con las herramientas básicas', 'Motivación demostrada', 'Base para construir práctica sistemática'],
    ruta: [
      { paso: 1, titulo: 'Ingeniería de prompts', desc: 'Deja de improvisar. Aprende las técnicas de prompting estructurado: rol, contexto, formato, ejemplos. Módulo I de este curso.', tiempo: '1-2 semanas', icono: '⚙️' },
      { paso: 2, titulo: 'Mini asistentes especializados', desc: 'Crea tus propios GPTs o asistentes configurados para tareas concretas de ELE. Cambia de usuario ocasional a creador de herramientas.', tiempo: '2-3 semanas', icono: '🤖' },
      { paso: 3, titulo: 'Planificación sistemática', desc: 'Integra la IA en tu flujo de trabajo habitual de planificación. Diseña plantillas de prompts reutilizables alineadas con el MCER.', tiempo: '3-4 semanas', icono: '📋' },
      { paso: 4, titulo: 'Ética y pensamiento crítico', desc: 'Desarrolla criterio para evaluar y filtrar el contenido generado por IA. Fundamental antes de usarla con el alumnado.', tiempo: '1 semana', icono: '🧭' },
    ],
    curso: '✅ Este curso es muy recomendable para ti. Te dará el método y la estructura que necesitas para pasar de uso esporádico a integración real en tu práctica docente.',
    cursoColor: '#1A4A8A'
  },
  3: {
    nombre: 'Practicante',
    emoji: '⚡',
    color: '#E8532B',
    colorLight: '#FBE9E3',
    descripcion: 'Usas la IA con regularidad y tienes criterio propio. Tu competencia digital es sólida y ya integras herramientas en tu práctica. El siguiente salto es profundizar en aplicaciones avanzadas y empezar a crear recursos propios y compartirlos.',
    fortalezas: ['Uso regular y sistemático de IA', 'Competencia digital consolidada', 'Capacidad de evaluar resultados'],
    ruta: [
      { paso: 1, titulo: 'Prompting avanzado', desc: 'Chain-of-thought, few-shot learning, prompts encadenados. Técnicas para obtener resultados de mayor calidad y consistencia.', tiempo: '1 semana', icono: '🔬' },
      { paso: 2, titulo: 'Creación de mini-apps', desc: 'Construye herramientas propias que otros docentes puedan usar. Generadores de actividades, correctores automáticos, asistentes de nivel. Módulo III.', tiempo: '2-3 semanas', icono: '🛠️' },
      { paso: 3, titulo: 'Recursos multimodales avanzados', desc: 'Combina texto, imagen, audio y mapas mentales en secuencias didácticas coherentes y enriquecidas. Módulo IV.', tiempo: '2 semanas', icono: '🎬' },
      { paso: 4, titulo: 'Liderazgo y formación interna', desc: 'Comparte tu conocimiento con el equipo. Diseña un taller interno de 2-3 horas para introducir la IA a compañeros/as con menos experiencia.', tiempo: '2-3 semanas', icono: '👥' },
    ],
    curso: '✅ Este curso te aportará valor en los módulos III y IV especialmente. Considera también el rol de referente interno para tu organización una vez completado.',
    cursoColor: '#E8532B'
  },
  4: {
    nombre: 'Avanzado/a',
    emoji: '🏆',
    color: '#6C3483',
    colorLight: '#f3e8fa',
    descripcion: 'Tienes un dominio sólido de la IA y sus aplicaciones en educación. Eres capaz de evaluar herramientas, crear recursos propios y guiar a otros. Tu siguiente reto es liderar la transformación digital en tu organización.',
    fortalezas: ['Dominio técnico y conceptual', 'Capacidad creativa y crítica desarrollada', 'Potencial de liderazgo e impacto organizacional'],
    ruta: [
      { paso: 1, titulo: 'Diseño de formación interna', desc: 'Diseña el plan de formación en IA para los 110 trabajadores de tu organización. Segmenta por perfiles y necesidades.', tiempo: '2-3 semanas', icono: '📐' },
      { paso: 2, titulo: 'Automatización de procesos', desc: 'Identifica qué procesos administrativos, pedagógicos o de comunicación pueden automatizarse parcialmente con IA en tu centro.', tiempo: '3-4 semanas', icono: '⚙️' },
      { paso: 3, titulo: 'Evaluación y política de uso', desc: 'Redacta una política de uso ético de la IA para tu organización. Define criterios, límites y buenas prácticas para todo el equipo.', tiempo: '1-2 semanas', icono: '📜' },
      { paso: 4, titulo: 'Innovación pedagógica', desc: 'Explora aplicaciones emergentes: IA para feedback personalizado, sistemas adaptativos, tutores virtuales. Mantente en la frontera del conocimiento.', tiempo: 'Continuo', icono: '🔭' },
    ],
    curso: '💡 Ya tienes el nivel para aprovechar este curso como actualización y para conectar con otros docentes. Te recomendamos especialmente el rol de mentor/a dentro de tu organización.',
    cursoColor: '#6C3483'
  }
};

function renderResultados(diagnostico) {
  const { nivel, total, knowPct, digitalPct, elePct } = diagnostico;
  const perfil = PERFILES[nivel];

  const container = document.getElementById('resultados');
  if (!container) return;

  container.innerHTML = `
    <div class="res-hero" style="background: linear-gradient(135deg, ${perfil.color}, ${perfil.color}cc)">
      <div class="res-hero__inner">
        <div class="res-hero__emoji">${perfil.emoji}</div>
        <div>
          <p class="res-hero__tag">Tu nivel de conocimiento en IA</p>
          <h2 class="res-hero__nivel">Nivel ${nivel} · ${perfil.nombre}</h2>
          <p class="res-hero__desc">${perfil.descripcion}</p>
        </div>
      </div>
    </div>

    <div class="res-scores">
      <div class="res-score-card">
        <div class="res-score-card__label">Conocimiento objetivo</div>
        <div class="res-score-card__bar"><div class="res-score-card__fill" style="width:${knowPct}%; background:${perfil.color}"></div></div>
        <div class="res-score-card__num">${knowPct}<span>/100</span></div>
      </div>
      <div class="res-score-card">
        <div class="res-score-card__label">Competencia digital</div>
        <div class="res-score-card__bar"><div class="res-score-card__fill" style="width:${digitalPct}%; background:${perfil.color}"></div></div>
        <div class="res-score-card__num">${digitalPct}<span>/100</span></div>
      </div>
      <div class="res-score-card">
        <div class="res-score-card__label">Herramientas ELE</div>
        <div class="res-score-card__bar"><div class="res-score-card__fill" style="width:${elePct}%; background:${perfil.color}"></div></div>
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
        ${perfil.fortalezas.map(f => `<div class="res-fortaleza"><span style="color:${perfil.color}">✓</span> ${f}</div>`).join('')}
      </div>
    </div>

    <div class="res-ruta">
      <h3 class="res-section-title">Tu ruta de aprendizaje recomendada</h3>
      <div class="res-ruta__steps">
        ${perfil.ruta.map(r => `
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
          </div>
        `).join('')}
      </div>
    </div>

    <div class="res-curso" style="border-left: 4px solid ${perfil.cursoColor}; background: ${perfil.colorLight}">
      <h3 class="res-section-title" style="color:${perfil.cursoColor}">¿Es este curso para ti?</h3>
      <p class="res-curso__text">${perfil.curso}</p>
    </div>

    <div class="res-actions">
      <a href="programa.html" class="btn btn--primary">Ver programa del curso</a>
      <a href="calendario.html" class="btn btn--outline">Ver calendario</a>
      <button onclick="window.print()" class="btn btn--outline">🖨 Imprimir resultados</button>
    </div>
  `;

  // Animación barras
  setTimeout(() => {
    container.querySelectorAll('.res-score-card__fill').forEach(bar => {
      bar.style.transition = 'width 1s ease';
    });
  }, 100);
}


/* ── Form submission ── */
const form = document.getElementById('diagnosticoForm');
const thankYou = document.getElementById('thankYou');
const formWrapper = document.getElementById('formWrapper');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.textContent = 'Analizando…';

  const vals = getFormValues(form);
  const diagnostico = calcDiagnostico(vals);

  // Añadir resultado al FormData para que llegue por email
  const fd = new FormData(form);
  fd.append('_nivel', `Nivel ${diagnostico.nivel} · ${PERFILES[diagnostico.nivel].nombre}`);
  fd.append('_puntuacion_global', diagnostico.total + '/100');
  fd.append('_conocimiento_objetivo', diagnostico.knowPct + '/100');
  fd.append('_competencia_digital', diagnostico.digitalPct + '/100');
  fd.append('_herramientas_ele', diagnostico.elePct + '/100');

  try {
    const res = await fetch(form.action, {
      method: 'POST', body: fd,
      headers: { 'Accept': 'application/json' }
    });

    if (progressFill) progressFill.style.width = '100%';
    if (progressPct)  progressPct.textContent  = '100%';
    document.querySelectorAll('.q-section-tab').forEach(t => t.classList.add('done'));

    formWrapper.style.display = 'none';
    thankYou.style.display = 'block';
    renderResultados(diagnostico);
    thankYou.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (!res.ok) console.warn('Formspree: error al enviar, pero mostramos resultados igualmente.');
  } catch {
    // Mostramos resultados aunque falle el envío
    formWrapper.style.display = 'none';
    thankYou.style.display = 'block';
    renderResultados(diagnostico);
    thankYou.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

updateProgress();
