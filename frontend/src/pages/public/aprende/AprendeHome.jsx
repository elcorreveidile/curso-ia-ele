import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';

const HERO = {
  tag: 'Curso gratuito · Acceso libre',
  title: 'IA y español',
  subtitle: 'Aprende más, aprende mejor',
  desc: 'Un curso gratuito para cualquier estudiante de español que quiera usar la inteligencia artificial con criterio. Solo aprendizaje.',
  cta_primary: { label: 'Inscribirme y empezar', to: '/login?redirect=/aprende/curso' },
  cta_secondary: { label: 'Ver el programa', to: '/login?redirect=/aprende/curso/programa' },
  cta_secondary: { label: 'Ver el programa', to: '/aprende/programa' },
  badges: ['Gratuito', 'Acceso libre', 'Alineado con el MCER', 'Instituto Cervantes'],
};

const REASONS = [
  {
    icon: '🎯',
    title: 'No trucos. Criterio.',
    text: 'No vamos a hablar de prompts mágicos. Vamos a hablar de cómo pensar con la IA en lugar de dejar que piense por ti.',
  },
  {
    icon: '🌍',
    title: 'Para todos los niveles',
    text: 'Desde A2 hasta C2. Con atención especial a estudiantes de lenguas tipológicamente alejadas del español.',
  },
  {
    icon: '📚',
    title: 'Alineado con el MCER y el PCIC',
    text: 'Todos los contenidos y actividades siguen las directrices del Marco Común Europeo y el Plan Curricular del Instituto Cervantes.',
  },
  {
    icon: '🤝',
    title: 'Con opción de acompañamiento',
    text: 'El curso es gratuito y autónomo. Si quieres feedback real, puedes reservar una sesión individual (45 €) o grupal (15 €).',
  },
];

const REQUIREMENTS = [
  'Acceso a un chatbot de IA gratuito (ChatGPT, Claude, Gemini u otro)',
  'Ganas de experimentar y reflexionar',
  'Nivel de español A2 o superior para seguir las instrucciones',
];

export default function AprendeHome() {
  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag={HERO.tag}
          title={HERO.title}
          desc={HERO.subtitle}
        />
        <div className="inner-content">
          {/* Hero description */}
          <div style={{ maxWidth: '720px', marginBottom: '3rem' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink-soft)', lineHeight: '1.8' }}>
              {HERO.desc}
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              {HERO.badges.map((badge, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    padding: '0.3rem 0.8rem',
                    background: 'var(--clm-red-light)',
                    color: 'var(--clm-red)',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <Link
                to={HERO.cta_primary.to}
                className="btn btn--primary"
                style={{ justifyContent: 'center' }}
              >
                {HERO.cta_primary.label} →
              </Link>
              <Link
                to={HERO.cta_secondary.to}
                className="btn btn--outline"
                style={{ justifyContent: 'center' }}
              >
                {HERO.cta_secondary.label}
              </Link>
            </div>
          </div>

          {/* Por qué este curso */}
          <div style={{ marginBottom: '4rem' }}>
            <p className="section__tag">Por qué este curso</p>
            <h2 className="section__title" style={{ marginBottom: '2rem' }}>
              Lo que vas a construir
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {REASONS.map((reason, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--white)',
                    borderRadius: 'var(--r-lg)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid rgba(14,28,47,.06)',
                  }}
                >
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>
                    {reason.icon}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: 'var(--ink)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {reason.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: '1.6' }}>
                    {reason.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Qué necesitas */}
          <div style={{ marginBottom: '4rem' }}>
            <p className="section__tag">Requisitos</p>
            <h2 className="section__title" style={{ marginBottom: '1.5rem' }}>
              Lo que necesitas para empezar
            </h2>
            <div
              style={{
                background: 'var(--blue)',
                borderRadius: 'var(--r-lg)',
                padding: '2rem',
                color: 'var(--white)',
              }}
            >
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {REQUIREMENTS.map((req, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      marginBottom: i < REQUIREMENTS.length - 1 ? '1rem' : 0,
                      fontSize: '1rem',
                      lineHeight: '1.6',
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--clm-red)',
                        fontWeight: '700',
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Módulo 0 preview */}
          <div style={{ marginBottom: '3rem' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #0A1628, #0F2744)',
                borderRadius: 'var(--r-xl)',
                padding: '2.5rem',
                border: '1.5px solid rgba(245,166,35,.3)',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--clm-red)',
                  marginBottom: '0.5rem',
                }}
              >
                Empieza ahora
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: '800',
                  color: 'var(--white)',
                  marginBottom: '1rem',
                }}
              >
                Módulo 0: Introducción y punto de partida
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,.7)',
                  maxWidth: '560px',
                  margin: '0 auto 1.75rem',
                  lineHeight: '1.7',
                }}
              >
                Descubre cómo usar la IA para aprender español en lugar de dejar que piense por ti.
                Crea tu repositorio GitHub y tienes tu primera interacción con IA orientada al aprendizaje.
              </p>
              <Link
                to="/login?redirect=/aprende/curso/modulo/intro"
                className="btn btn--primary"
                style={{
                  justifyContent: 'center',
                  background: 'var(--clm-red)',
                  color: 'var(--ink)',
                }}
              >
                Empezar el Módulo 0 →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
