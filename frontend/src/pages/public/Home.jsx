import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useScrollReveal } from '../../lib/useScrollReveal';

const COURSES = [
  {
    slug: 'ele',
    accentColor: 'var(--blue)',
    accentLight: 'var(--blue-light)',
    badge: '📚 Docentes de ELE',
    title: 'IA para la enseñanza de ELE',
    subtitle: 'Formación docente · Mayo 2026 · 20 h',
    description:
      'Integra la inteligencia artificial en tu práctica docente con criterio ético y pedagógico. Planifica clases, crea materiales y diseña asistentes a tu medida.',
    modules: [
      'Ética y prompts eficaces',
      'Chatbots a tu medida',
      'Planificación con el MCER',
      'Recursos multimodales con IA',
    ],
    price: '149 €',
    priceNote: 'precio fundador · solo 20 plazas',
    gift: '📘 Incluye el libro «Prompts que funcionan»',
    cta: 'Ver el curso ELE →',
    ctaLink: '/curso-ele',
    enrollLink: '/inscripcion/ia-ele',
    testId: 'hub-card-ele',
  },
  {
    slug: 'ia',
    accentColor: 'var(--orange)',
    accentLight: 'var(--orange-light)',
    badge: '🤖 Cualquier perfil',
    title: 'IA Práctica: de los fundamentos a la automatización',
    subtitle: 'Para profesionales y pequeñas empresas · 20 h',
    description:
      'Sin conocimientos previos. Aprende qué es la IA, construye tus primeras aplicaciones y automatiza tareas repetitivas de tu negocio.',
    modules: [
      'Introducción general a la IA',
      'Diseño de aplicaciones con IA',
      'Automatización para la pequeña empresa',
    ],
    price: '250 €',
    priceNote: '149 € para alumnos del curso ELE',
    gift: null,
    cta: 'Ver el curso IA →',
    ctaLink: '/curso-ia',
    enrollLink: '/inscripcion/ia-practica',
    testId: 'hub-card-ia',
  },
];

const FAQS = [
  {
    q: '¿Qué curso me conviene?',
    a: 'Si eres docente de ELE, el primer curso está diseñado específicamente para ti: materiales, planificación y herramientas con enfoque pedagógico. Si tu perfil es profesional o de pequeña empresa —sin experiencia docente—, el segundo curso es tu opción.',
  },
  {
    q: '¿Puedo hacer los dos cursos?',
    a: 'Sí, y además obtienes un precio especial: el segundo curso cuesta 149 € para alumnos del primero. El código de descuento te llega por email al terminar el curso ELE.',
  },
  {
    q: '¿Necesito conocimientos previos de IA?',
    a: 'No. Los dos cursos parten de cero y están diseñados para que cualquier persona sin experiencia técnica pueda seguirlos desde el primer día.',
  },
  {
    q: '¿Cómo funciona el pago?',
    a: 'Los pagos se procesan con Stripe. Recibirás acceso inmediato a la plataforma tras completar el pago. Aceptamos tarjetas de crédito y débito.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="hub-faq-item">
      <button className="hub-faq-item__q" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <span className="hub-faq-item__arrow">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="hub-faq-item__a">{a}</p>}
    </div>
  );
}

export default function Home() {
  useScrollReveal();

  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="hub-hero">
        <div className="hub-hero__inner">
          <p className="hub-hero__eyebrow reveal">Formación en Inteligencia Artificial · laclasedigital.com</p>
          <h1 className="hub-hero__title reveal reveal--delay-1">
            Aprende a trabajar con IA.<br />
            <em>De verdad.</em>
          </h1>
          <p className="hub-hero__subtitle reveal reveal--delay-2">
            Dos cursos prácticos para dos perfiles distintos. Sin relleno, sin tecnicismos innecesarios.
            Solo lo que necesitas para integrar la IA en tu trabajo desde el primer día.
          </p>
          <a href="#cursos" className="hub-hero__cta reveal reveal--delay-3">
            Ver los cursos ↓
          </a>
        </div>
      </section>

      {/* ── Course cards ── */}
      <section className="hub-courses" id="cursos">
        <div className="hub-section-inner">
          <p className="section__tag" style={{ textAlign: 'center' }}>Nuestros cursos</p>
          <h2 className="section__title" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            Elige el que encaja contigo
          </h2>
          <div className="hub-cards">
            {COURSES.map((c) => (
              <div
                key={c.slug}
                className="hub-card reveal"
                style={{ '--accent': c.accentColor, '--accent-light': c.accentLight }}
                data-testid={c.testId}
              >
                <div className="hub-card__top">
                  <span className="hub-card__badge">{c.badge}</span>
                  <h3 className="hub-card__title">{c.title}</h3>
                  <p className="hub-card__subtitle">{c.subtitle}</p>
                  <p className="hub-card__desc">{c.description}</p>
                </div>
                <div className="hub-card__modules">
                  {c.modules.map((m, i) => (
                    <div key={i} className="hub-card__module">
                      <span className="hub-card__module-num">{String(i + 1).padStart(2, '0')}</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
                {c.gift && (
                  <div className="hub-card__gift">
                    <span>{c.gift}</span>
                  </div>
                )}
                <div className="hub-card__pricing">
                  <span className="hub-card__price">{c.price}</span>
                  <span className="hub-card__price-note">{c.priceNote}</span>
                </div>
                <Link to={c.ctaLink} className="hub-card__cta" data-testid={`${c.testId}-cta`}>
                  {c.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof placeholder ── */}
      <section className="hub-proof">
        <div className="hub-section-inner">
          <div className="hub-proof__stats">
            <div className="hub-proof__stat reveal">
              <span className="hub-proof__num">2</span>
              <span className="hub-proof__label">cursos especializados</span>
            </div>
            <div className="hub-proof__stat reveal reveal--delay-1">
              <span className="hub-proof__num">20 h</span>
              <span className="hub-proof__label">de formación práctica por curso</span>
            </div>
            <div className="hub-proof__stat reveal reveal--delay-2">
              <span className="hub-proof__num">100%</span>
              <span className="hub-proof__label">orientado a casos reales</span>
            </div>
          </div>

          {/* Testimonials placeholder — to be filled after first edition */}
          <div className="hub-testimonials-placeholder reveal">
            <p className="hub-testimonials-placeholder__text">
              Los testimonios de los primeros alumnos estarán disponibles
              al finalizar la primera edición del curso ELE en mayo de 2026.
            </p>
          </div>
        </div>
      </section>

      {/* ── About instructor ── */}
      <section className="hub-about">
        <div className="hub-section-inner hub-about__inner">
          <div className="hub-about__img-wrap reveal">
            <img
              src="/javier-benitez.jpg"
              alt="Javier Benítez Láinez"
              className="hub-about__img"
            />
          </div>
          <div className="hub-about__text reveal reveal--delay-1">
            <p className="section__tag">El formador</p>
            <h2 className="hub-about__name">Javier Benítez Láinez</h2>
            <p className="hub-about__bio">
              Lingüista, docente de ELE y especialista en tecnología educativa. Lleva más de una
              década trabajando en la intersección entre la enseñanza de lenguas y las herramientas
              digitales. Diseña formaciones en las que la tecnología sirve al aprendizaje, no al revés.
            </p>
            <p className="hub-about__bio">
              Su enfoque combina rigor pedagógico con aplicabilidad inmediata: todo lo que enseña
              puede llevarse al aula o al negocio al día siguiente.
            </p>
            <Link to="/curso-ele/sobre-mi" className="hub-about__link">
              Más sobre Javier →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="hub-faq">
        <div className="hub-section-inner" style={{ maxWidth: 780 }}>
          <p className="section__tag" style={{ textAlign: 'center' }}>Preguntas frecuentes</p>
          <h2 className="section__title" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Dudas habituales
          </h2>
          <div className="hub-faq-list">
            {FAQS.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/contacto" className="btn btn--primary">
              ¿Más preguntas? Escríbenos →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
