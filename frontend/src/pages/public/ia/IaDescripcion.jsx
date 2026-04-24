import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';

export default function IaDescripcion() {
  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Sobre el curso"
          title="IA Práctica: de los fundamentos a la automatización"
          desc="Para profesionales y pequeñas empresas · Sin conocimientos previos · 20 horas"
        />
        <div className="inner-content">
          <div className="desc-grid">
            <div>
              <p className="section__tag">Descripción</p>
              <h2 className="section__title" style={{ fontSize: '1.8rem' }}>
                ¿De qué trata este curso?
              </h2>
              <p className="desc__text">
                Un curso diseñado para que cualquier persona —sin conocimientos técnicos previos—
                pueda entender qué es la inteligencia artificial, construir sus primeras aplicaciones
                prácticas y automatizar tareas repetitivas en su trabajo o negocio.
              </p>
              <p className="desc__text">
                El enfoque es 100% práctico: cada módulo termina con una actividad real que puedes
                aplicar inmediatamente. No hay teoría por la teoría. Todo lo que se enseña tiene un
                uso concreto.
              </p>
              <div style={{ marginTop: '2.5rem' }}>
                <p className="section__tag">Finalidad</p>
                <div className="info-box" style={{ marginTop: '.75rem', borderLeft: '4px solid var(--orange)' }}>
                  <p style={{ fontSize: '.95rem', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                    Que al terminar el curso seas capaz de identificar oportunidades de uso de IA
                    en tu trabajo, construir tus propias herramientas y automatizar procesos que
                    hoy te roban tiempo, sin necesidad de saber programar.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '2rem' }}>
                <p className="section__tag">Destinatarios</p>
                <div className="info-box" style={{ marginTop: '.75rem' }}>
                  <p style={{ fontSize: '.95rem', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                    Profesionales de cualquier sector, autónomos y propietarios de pequeñas
                    empresas que quieren sacar partido a la IA sin necesidad de formación técnica
                    previa.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="competencias">
                <p className="competencias__title">Lo que desarrollarás</p>
                <div className="competencia-item">
                  <span className="competencia-item__icon">🧠</span>
                  <span>Comprender qué es la IA y cómo funciona en la práctica</span>
                </div>
                <div className="competencia-item">
                  <span className="competencia-item__icon">🛠️</span>
                  <span>Construir aplicaciones y asistentes de IA sin programar</span>
                </div>
                <div className="competencia-item">
                  <span className="competencia-item__icon">⚙️</span>
                  <span>Automatizar tareas repetitivas con herramientas accesibles</span>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <p className="section__tag">Objetivos del curso</p>
                <div className="objetivos-list" style={{ marginTop: '.75rem' }}>
                  {[
                    'Entender los fundamentos de la IA y el ecosistema de herramientas disponibles hoy.',
                    'Diseñar prompts efectivos y construir asistentes de IA adaptados a tu trabajo.',
                    'Crear flujos de automatización que reduzcan el trabajo manual en tu negocio.',
                    'Evaluar críticamente qué tareas merece la pena automatizar y cuáles no.',
                  ].map((t, i) => (
                    <div key={i} className="objetivo-item">
                      <span className="objetivo-item__num">{String(i + 1).padStart(2, '0')}</span>
                      <p className="objetivo-item__text">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '3.5rem' }}>
            <p className="section__tag">Perfil de entrada</p>
            <h2 className="section__title" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>
              ¿Para quién es este curso?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="desc-grid">
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', borderTop: '3px solid var(--green)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--green)', marginBottom: '1rem' }}>
                  ✓ Es para ti si…
                </p>
                {[
                  'Trabajas en cualquier sector y quieres entender cómo la IA puede ayudarte.',
                  'No tienes experiencia técnica y buscas una formación práctica, sin código.',
                  'Tienes un pequeño negocio y quieres automatizar tareas que te roban tiempo.',
                  'Has oído hablar de ChatGPT pero no sabes cómo integrarlo en tu trabajo real.',
                  'Quieres resultados aplicables desde el primer módulo.',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start', fontSize: '.9rem', color: 'var(--ink-soft)', lineHeight: 1.5, padding: '.4rem 0' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>›</span>{t}
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', borderTop: '3px solid var(--clm-red)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--clm-red)', marginBottom: '1rem' }}>
                  ✕ No es para ti si…
                </p>
                {[
                  'Buscas formación técnica avanzada: programación, machine learning o APIs.',
                  'Ya tienes experiencia sólida con herramientas de IA y buscas nivel avanzado.',
                  'Esperas resultados automáticos sin dedicar tiempo a aprender y experimentar.',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start', fontSize: '.9rem', color: 'var(--ink-soft)', lineHeight: 1.5, padding: '.4rem 0' }}>
                    <span style={{ color: 'var(--clm-red)', fontWeight: 700 }}>›</span>{t}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <Link to="/curso-ia/precios" className="btn btn--primary" data-testid="ia-desc-cta-precios">
                Ver precios e inscripción →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
