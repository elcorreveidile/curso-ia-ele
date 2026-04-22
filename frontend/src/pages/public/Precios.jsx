import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';
import { useScrollReveal } from '../../lib/useScrollReveal';

export default function Precios() {
  useScrollReveal();
  const [course, setCourse] = useState(null);
  useEffect(() => {
    api.get('/courses/ia-ele').then((r) => setCourse(r.data)).catch(() => {});
  }, []);

  const seatsLeft = course
    ? Math.max(0, course.founder_seats - course.founder_seats_taken)
    : 20;
  const founderActive = course?.is_founder_edition && seatsLeft > 0;
  const founderPrice = course ? (course.price_founder_eur / 100).toFixed(0) : 149;
  const standardPrice = course ? (course.price_eur / 100).toFixed(0) : 250;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Inscripción"
          title="Precio e inscripción"
          desc={`Primera edición · Mayo 2026 · Precio fundador para los primeros ${course?.founder_seats || 20} inscritos.`}
        />
        <div className="inner-content">
          <div className="founder-banner" data-testid="founder-banner">
            <div>
              <p className="founder-banner__tag">🚀 Primera edición · Mayo 2026</p>
              <h2 className="founder-banner__title">
                Sé parte de la<br /><em>primera edición</em>
              </h2>
              <p className="founder-banner__text">
                Buscamos 20 docentes que quieran ser los primeros en integrar la IA en su práctica de
                ELE. A cambio: el precio más bajo que existirá para este curso, acceso directo al
                formador y la posibilidad de influir en los contenidos de las próximas ediciones.
              </p>
              <div className="founder-perks">
                <span className="founder-perk">Precio exclusivo {founderPrice} €</span>
                <span className="founder-perk">Solo {course?.founder_seats || 20} plazas</span>
                <span className="founder-perk">Acceso directo al formador</span>
                <span className="founder-perk">A partir de la 2ª edición: {standardPrice} €</span>
              </div>
            </div>
            <div className="founder-counter" data-testid="founder-counter">
              <div className="founder-counter__num">{seatsLeft}</div>
              <div className="founder-counter__label">plazas<br />disponibles</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }} className="price-grid">
            <div className="price-card reveal" data-testid="price-card-individual">
              <p className="price-card__label">⭐ Precio fundador · Primera edición</p>
              <p className="price-card__original">Precio a partir de la 2ª edición: {standardPrice} €</p>
              <div className="price-card__amount">
                {founderActive ? founderPrice : standardPrice}
                <span style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--ink-muted)' }}> €</span>
              </div>
              <p className="price-card__period">por participante · pago único</p>
              {founderActive && (
                <span className="price-card__savings">
                  — {Math.round((1 - Number(founderPrice) / Number(standardPrice)) * 100)} % de descuento · {seatsLeft} plazas fundador restantes
                </span>
              )}
              <ul className="price-includes">
                <li>20 horas de formación en 4 semanas</li>
                <li>4 módulos con actividades prácticas</li>
                <li>3 videotutorías en directo (90 min c/u)</li>
                <li>Materiales, guías y plantillas de elaboración propia</li>
                <li>Feedback personalizado en cada tarea</li>
                <li>Acceso a las grabaciones de las sesiones</li>
                <li>Certificado de aprovechamiento</li>
                <li><strong>📘 De regalo:</strong> libro <em>«Prompts que funcionan»</em> (31 capítulos · PDF)</li>
              </ul>
              <Link
                to="/inscripcion/ia-ele"
                className="btn btn--primary"
                style={{ justifyContent: 'center' }}
                data-testid="precios-btn-inscripcion"
              >
                Inscribirme ahora →
              </Link>
              <p className="price-note">
                El pago se procesa de forma segura con Stripe. Recibirás acceso inmediato tras
                completar la inscripción.
              </p>
            </div>

            <div className="price-card price-card--featured reveal reveal--delay-2">
              <span className="price-card__badge">Instituciones</span>
              <p className="price-card__label">Para centros y organizaciones</p>
              <p className="price-card__original">Precio público: {standardPrice} € / participante</p>
              <div className="price-card__amount" style={{ fontSize: '2rem', marginTop: '.5rem' }}>
                Precio<br />negociable
              </div>
              <p className="price-card__period">según número de participantes</p>
              <span className="price-card__savings">Descuentos desde el 30 %</span>
              <ul className="price-includes">
                <li>Todo lo incluido en el precio individual</li>
                <li>Descuento por volumen desde 10 participantes</li>
                <li>Adaptación de ejemplos al contexto del centro</li>
                <li>Facturación centralizada a la institución</li>
                <li>Posibilidad de edición cerrada para tu equipo</li>
              </ul>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.location.href = '/contacto'; }}
                className="btn btn--primary"
                style={{ justifyContent: 'center', background: 'var(--clm-red)', color: 'var(--ink)' }}
                data-testid="precios-btn-institucional"
              >
                Solicitar propuesta
              </a>
              <p className="price-note">
                Indicado para centros de idiomas, departamentos universitarios y equipos de formación
                empresarial.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '4rem' }}>
            <div className="quiz-teaser" data-testid="precios-quiz-teaser">
              <div className="quiz-teaser__body">
                <p className="quiz-teaser__tag">🎯 Diagnóstico gratuito · 5 minutos</p>
                <h3 className="quiz-teaser__title">¿No estás seguro/a de si este curso es para ti?</h3>
                <p className="quiz-teaser__text">
                  Responde un cuestionario breve sobre tu práctica docente y tu relación con la IA.
                  Te devuelvo un diagnóstico personalizado con el perfil docente que mejor te describe
                  y qué módulos te aportarán más valor.
                </p>
              </div>
              <Link to="/cuestionario" className="btn btn--primary" data-testid="precios-quiz-cta">
                Hacer el cuestionario →
              </Link>
            </div>
          </div>

          <div style={{ marginBottom: '4rem' }}>
            <p className="section__tag">Preguntas frecuentes</p>
            <h2 className="section__title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              Dudas sobre la inscripción
            </h2>
            <div style={{ maxWidth: 720 }}>
              {[
                { q: '¿Cuándo empieza el curso?', a: `La primera edición comienza el **4 de mayo de 2026**. Las videotutorías son los días 4, 14 y 21 de mayo a las 15:00 h (GMT+2).` },
                { q: `¿El precio de ${founderPrice} € estará disponible siempre?`, a: `No. Es el **precio fundador**, exclusivo para los primeros 20 inscritos de la primera edición. A partir de la segunda edición el precio será **${standardPrice} €**.` },
                { q: '¿Necesito conocimientos previos de IA?', a: 'No. El curso está diseñado para docentes sin experiencia previa con herramientas de IA.' },
                { q: '¿Cómo se realiza el pago?', a: 'El pago se procesa con Stripe al pulsar "Inscribirme ahora". Tras el pago recibirás un enlace de acceso por email.' },
                { q: '¿Qué pasa si no puedo asistir a alguna videotutoría?', a: 'Las sesiones se graban y quedan disponibles en la plataforma. Para el certificado es obligatorio asistir a 2 de las 3 sesiones.' },
              ].map((f, i) => (
                <div key={i} className="faq-item">
                  <p className="faq-item__q">{f.q}</p>
                  <p className="faq-item__a" dangerouslySetInnerHTML={{ __html: f.a.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
