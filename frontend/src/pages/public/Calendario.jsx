import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';

const SESSIONS = [
  { n: 1, date: '4 de mayo de 2026', note: 'Presentación del curso, primeras reflexiones éticas e introducción a la ingeniería de prompts.' },
  { n: 2, date: '14 de mayo de 2026', note: 'Revisión de mini asistentes, puesta en común de planes de clase y resolución de dudas.' },
  { n: 3, date: '21 de mayo de 2026', note: 'Presentación de kits de recursos multimodales y cierre del curso.' },
];

export default function Calendario() {
  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Sesiones síncronas"
          title="Calendario de videotutorías"
          desc="Tres sesiones en directo. La asistencia a al menos dos es obligatoria para obtener el certificado."
        />
        <div className="inner-content">
          <div className="calendario-layout">
            <div className="sessions">
              {SESSIONS.map((s) => (
                <div key={s.n} className="session-card" data-testid={`sesion-${s.n}`}>
                  <div className="session-card__num">{s.n}</div>
                  <div className="session-card__info">
                    <p className="session-card__date">{s.date}</p>
                    <p className="session-card__time">⏱ 15:00 – 16:30 h · GMT+2 España peninsular</p>
                    <p className="session-card__note">{s.note}</p>
                  </div>
                  <span className="session-card__badge">Sesión {s.n}</span>
                </div>
              ))}
            </div>
            <div className="info-aside">
              <div className="info-box">
                <p className="info-box__title">Datos del curso</p>
                <div className="info-row"><span className="info-row__label">Duración</span><span className="info-row__value">20 horas</span></div>
                <div className="info-row"><span className="info-row__label">Semanas</span><span className="info-row__value">4 semanas</span></div>
                <div className="info-row"><span className="info-row__label">Plataforma</span><span className="info-row__value">laclasedigital.com</span></div>
                <div className="info-row"><span className="info-row__label">Modalidad</span><span className="info-row__value">Semipresencial</span></div>
                <div className="info-row"><span className="info-row__label">Grabaciones</span><span className="info-row__value">✓ Sí</span></div>
              </div>
              <div className="info-box info-box--alert">
                <p className="info-box__title">⚠️ Requisito de asistencia</p>
                <p className="info-box__text">
                  Para obtener el <strong>certificado de aprovechamiento</strong> es obligatorio
                  asistir a un mínimo de <strong>2 de las 3 videotutorías</strong>. Las sesiones se
                  grabarán para quienes no puedan asistir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
