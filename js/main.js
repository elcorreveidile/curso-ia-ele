/* ── Nav scroll effect ── */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Mobile burger ── */
const burger = document.querySelector('.nav__burger');
const navLinks = document.querySelector('.nav__links');
burger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav__links a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ── Reveal on scroll ── */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));

/* ══════════════════════════════════════════════════
   CUESTIONARIO ENGINE
═══════════════════════════════════════════════════ */
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

  // scroll to form top
  document.getElementById('cuestionario')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function nextSection() {
  if (currentSection < SECTIONS.length - 1) {
    // mark current tab as done
    const tab = document.getElementById('tab-' + SECTIONS[currentSection]);
    tab?.classList.add('done');
    showSection(currentSection + 1);
  }
}

function prevSection() {
  if (currentSection > 0) showSection(currentSection - 1);
}

// Tab clicks
SECTIONS.forEach((s, i) => {
  document.getElementById('tab-' + s)?.addEventListener('click', () => showSection(i));
});

// Button wiring
document.getElementById('btnNext')?.addEventListener('click', nextSection);
document.getElementById('btnPrev')?.addEventListener('click', prevSection);
document.getElementById('btnNextB')?.addEventListener('click', nextSection);
document.getElementById('btnPrevB')?.addEventListener('click', prevSection);
document.getElementById('btnNextC')?.addEventListener('click', nextSection);
document.getElementById('btnPrevC')?.addEventListener('click', prevSection);
document.getElementById('btnNextD')?.addEventListener('click', nextSection);
document.getElementById('btnPrevD')?.addEventListener('click', prevSection);

/* ── Form submission via Formspree ── */
const form = document.getElementById('diagnosticoForm');
const thankYou = document.getElementById('thankYou');
const formWrapper = document.getElementById('formWrapper');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.textContent = 'Enviando…';

  const data = new FormData(form);

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      formWrapper.style.display = 'none';
      thankYou.style.display = 'block';
      thankYou.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // final progress
      if (progressFill) progressFill.style.width = '100%';
      if (progressPct)  progressPct.textContent  = '100%';
      document.querySelectorAll('.q-section-tab').forEach(t => t.classList.add('done'));
    } else {
      btn.disabled = false;
      btn.textContent = 'Enviar cuestionario';
      alert('Ha habido un problema al enviar. Por favor, inténtalo de nuevo.');
    }
  } catch {
    btn.disabled = false;
    btn.textContent = 'Enviar cuestionario';
    alert('Error de conexión. Comprueba tu internet e inténtalo de nuevo.');
  }
});

// Init
updateProgress();
