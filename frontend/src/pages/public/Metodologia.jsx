import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';

export default function Metodologia() {
  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Cómo trabajamos"
          title="Metodología y evaluación"
          desc="Un enfoque práctico y centrado en la acción que combina autonomía, colaboración y reflexión crítica."
        />
        <div className="inner-content">
          <div className="meto-grid">
            <div className="meto-card">
              <div className="meto-card__icon">🎬</div>
              <h3 className="meto-card__title">Videotutorías colaborativas</h3>
              <p className="meto-card__text">
                Tres sesiones síncronas donde se trabaja en grupo, se comparten producciones y se
                construye conocimiento de forma conjunta.
              </p>
            </div>
            <div className="meto-card">
              <div className="meto-card__icon">🧩</div>
              <h3 className="meto-card__title">Tareas asincrónicas</h3>
              <p className="meto-card__text">
                Actividades prácticas en plataforma que culminan en producciones reales: declaraciones
                éticas, asistentes, planes de clase y kits de recursos.
              </p>
            </div>
            <div className="meto-card">
              <div className="meto-card__icon">💬</div>
              <h3 className="meto-card__title">Foros de reflexión</h3>
              <p className="meto-card__text">
                Espacios de debate donde compartir avances, dudas y reflexiones con el resto del grupo,
                fomentando el aprendizaje entre iguales.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <p className="section__tag">Evaluación</p>
            <h2 className="section__title" style={{ fontSize: '1.8rem' }}>¿Cómo se evalúa el curso?</h2>
          </div>
          <div className="eval-grid">
            <div className="eval-card eval-card--1">
              <span className="eval-card__num">01</span>
              <h4 className="eval-card__title">Asistencia</h4>
              <p className="eval-card__text">
                Participación activa en un mínimo de 2 de las 3 sesiones de videotutoría. Requisito
                obligatorio para el certificado.
              </p>
            </div>
            <div className="eval-card eval-card--2">
              <span className="eval-card__num">02</span>
              <h4 className="eval-card__title">Seguimiento en plataforma</h4>
              <p className="eval-card__text">
                Participación reflexiva en los foros de cada módulo y seguimiento continuado.
              </p>
            </div>
            <div className="eval-card eval-card--3">
              <span className="eval-card__num">03</span>
              <h4 className="eval-card__title">Tareas por módulo</h4>
              <p className="eval-card__text">
                Resolución de actividades prácticas al final de cada módulo: autoevaluaciones,
                resúmenes y entregas con feedback del formador.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
