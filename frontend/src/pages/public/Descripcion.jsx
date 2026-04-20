import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';

export default function Descripcion() {
  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Sobre el curso"
          title="IA para la enseñanza de ELE"
          desc="Planificación de clases y creación de materiales didácticos con Inteligencia Artificial · Mayo 2026"
        />
        <div className="inner-content">
          <div className="desc-grid">
            <div>
              <p className="section__tag">Descripción</p>
              <h2 className="section__title" style={{ fontSize: '1.8rem' }}>
                ¿De qué trata este curso?
              </h2>
              <p className="desc__text">
                Este curso está diseñado para capacitar a docentes de ELE en el uso ético y eficaz de
                herramientas de Inteligencia Artificial, con el objetivo de optimizar la planificación de
                clases y la creación de materiales didácticos.
              </p>
              <p className="desc__text">
                A través de un enfoque práctico, aprenderás a integrar la IA para ahorrar tiempo, mejorar
                la calidad de los recursos y alinear tu práctica con los estándares del MCER. El curso
                combina sesiones de videoconferencia en directo con trabajo autónomo en plataforma.
              </p>
              <div style={{ marginTop: '2.5rem' }}>
                <p className="section__tag">Finalidad</p>
                <div className="info-box" style={{ marginTop: '.75rem', borderLeft: '4px solid var(--orange)' }}>
                  <p style={{ fontSize: '.95rem', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                    Ampliar las competencias docentes y especializarse en aprendizaje digital,
                    integrando la Inteligencia Artificial como herramienta al servicio de una
                    enseñanza de ELE más eficaz, creativa y crítica.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '2rem' }}>
                <p className="section__tag">Destinatarios</p>
                <div className="info-box" style={{ marginTop: '.75rem' }}>
                  <p style={{ fontSize: '.95rem', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                    Docentes de ELE, coordinadores y responsables académicos de centros de lenguas que
                    deseen integrar herramientas de IA en su práctica de manera ética y eficaz.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="competencias">
                <p className="competencias__title">Competencias docentes que desarrolla</p>
                <div className="competencia-item">
                  <span className="competencia-item__icon">🎯</span>
                  <span>Organizar situaciones de aprendizaje</span>
                </div>
                <div className="competencia-item">
                  <span className="competencia-item__icon">💻</span>
                  <span>Servirse de las TIC para el desempeño del trabajo docente</span>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <p className="section__tag">Objetivos del curso</p>
                <div className="objetivos-list" style={{ marginTop: '.75rem' }}>
                  {[
                    'Reflexionar críticamente sobre el uso ético de la IA en la educación, identificando sesgos y promoviendo la equidad.',
                    'Identificar y aplicar los principios de la ingeniería de prompts para generar contenido relevante para el aula de ELE.',
                    'Crear planes de clase estructurados y coherentes con los objetivos del MCER usando herramientas de IA.',
                    'Generar recursos didácticos variados —textos, imágenes, audios y mapas mentales— con IA generativa.',
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
              <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', borderTop: '3px solid var(--green)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--green)', marginBottom: '1rem' }}>
                  ✓ Es para ti si…
                </p>
                {[
                  'Tienes experiencia docente en ELE y conoces los fundamentos del MCER.',
                  'Usas herramientas digitales básicas (correo, Moodle, videoconferencias) con soltura.',
                  'Nunca has usado herramientas de IA o las has probado puntualmente sin método.',
                  'Quieres ahorrar tiempo en la preparación de clases sin sacrificar calidad didáctica.',
                  'Estás dispuesto/a a experimentar y a evaluar críticamente lo que genera la IA.',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start', fontSize: '.9rem', color: 'var(--ink-soft)', lineHeight: 1.5, padding: '.4rem 0' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>›</span>{t}
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', borderTop: '3px solid var(--clm-red)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--clm-red)', marginBottom: '1rem' }}>
                  ✕ No es para ti si…
                </p>
                {[
                  'Buscas formación técnica avanzada en IA: programación, APIs o machine learning.',
                  'No tienes experiencia docente en ELE: el curso asume conocimiento pedagógico previo.',
                  'Esperas soluciones automáticas sin revisión docente: la IA es una herramienta, no un sustituto.',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start', fontSize: '.9rem', color: 'var(--ink-soft)', lineHeight: 1.5, padding: '.4rem 0' }}>
                    <span style={{ color: 'var(--clm-red)', fontWeight: 700 }}>›</span>{t}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <Link to="/precios" className="btn btn--primary" data-testid="desc-cta-precios">
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
