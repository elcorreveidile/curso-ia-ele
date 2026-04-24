import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';
import { api } from '../../../lib/api';
import { useScrollReveal } from '../../../lib/useScrollReveal';

export default function IaPrecios() {
  useScrollReveal();
  const [course, setCourse] = useState(null);
  useEffect(() => {
    api.get('/courses/ia-practica').then((r) => setCourse(r.data)).catch(() => {});
  }, []);

  const standardPrice = course ? (course.price_eur / 100).toFixed(0) : 250;
  const alumniPrice = course ? (course.price_alumni_eur / 100).toFixed(0) : 149;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Inscripción"
          title="Precio e inscripción"
          desc="Formación práctica en IA para cualquier perfil profesional · Sin conocimientos previos."
        />
        <div className="inner-content">

          <div className="founder-banner" data-testid="ia-precio-banner">
            <div>
              <p className="founder-banner__tag">🤖 Curso de IA para todos los perfiles</p>
              <h2 className="founder-banner__title">
                Sin código.<br /><em>Sin límites.</em>
              </h2>
              <p className="founder-banner__text">
                Diseñado para que cualquier persona —independientemente de su perfil técnico—
                pueda entender la IA, construir sus propias herramientas y automatizar tareas
                desde el primer día.
              </p>
              <div className="founder-perks">
                <span className="founder-perk">3 módulos prácticos</span>
                <span className="founder-perk">Sin conocimientos previos</span>
                <span className="founder-perk">Aplicable desde el día 1</span>
                <span className="founder-perk">Precio alumni ELE: {alumniPrice} €</span>
              </div>
            </div>
            <div className="founder-counter" data-testid="ia-price-display">
              <div className="founder-counter__num">{standardPrice}</div>
              <div className="founder-counter__label">euros<br />por participante</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }} className="price-grid">
            <div className="price-card reveal" data-testid="ia-price-card-individual">
              <p className="price-card__label">💼 Precio individual</p>
              <div className="price-card__amount">
                {standardPrice}
                <span style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--ink-muted)' }}> €</span>
              </div>
              <p className="price-card__period">por participante · pago único</p>
              <div className="price-card__alumni-note" data-testid="ia-alumni-note">
                <span>🎓 ¿Alumno del curso ELE?</span>
                <strong>{alumniPrice} € con el código ALUMNIELE</strong>
              </div>
              <ul className="price-includes">
                <li>20 horas de formación en 3 módulos</li>
                <li>Actividades prácticas en cada módulo</li>
                <li>Feedback personalizado en cada tarea</li>
                <li>Materiales y plantillas de uso inmediato</li>
                <li>Acceso a la plataforma y recursos</li>
                <li>Certificado de aprovechamiento</li>
              </ul>
              <Link
                to="/inscripcion/ia-practica"
                className="btn btn--primary"
                style={{ justifyContent: 'center' }}
                data-testid="ia-precios-btn-inscripcion"
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
              <p className="price-card__label">Para empresas y organizaciones</p>
              <p className="price-card__original">Precio público: {standardPrice} € / participante</p>
              <div className="price-card__amount" style={{ fontSize: '2rem', marginTop: '.5rem' }}>
                Precio<br />negociable
              </div>
              <p className="price-card__period">según número de participantes</p>
              <span className="price-card__savings">Descuentos desde el 30 %</span>
              <ul className="price-includes">
                <li>Todo lo incluido en el precio individual</li>
                <li>Descuento por volumen desde 5 participantes</li>
                <li>Adaptación de ejemplos al sector de la empresa</li>
                <li>Facturación centralizada</li>
                <li>Posibilidad de formación interna cerrada</li>
              </ul>
              <a
                href="/contacto"
                className="btn btn--primary"
                style={{ justifyContent: 'center', background: 'var(--clm-red)', color: 'var(--ink)' }}
                data-testid="ia-precios-btn-institucional"
              >
                Solicitar propuesta
              </a>
              <p className="price-note">
                Indicado para equipos, departamentos y empresas que quieren formar a su personal
                en el uso práctico de la IA.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '4rem' }}>
            <p className="section__tag">Preguntas frecuentes</p>
            <h2 className="section__title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              Dudas sobre la inscripción
            </h2>
            <div style={{ maxWidth: 720 }}>
              {[
                { q: '¿Necesito conocimientos de programación o IA?', a: 'No. El curso parte de cero y no requiere ningún conocimiento técnico previo. Si sabes usar el email y buscar en internet, puedes seguir este curso.' },
                { q: `¿Qué diferencia hay entre ${standardPrice} € y ${alumniPrice} €?`, a: `El precio de ${alumniPrice} € es exclusivo para alumnos que ya completaron el curso de IA para la enseñanza de ELE. Al finalizar ese curso recibirás por email el código ALUMNIELE para aplicar el descuento.` },
                { q: '¿Cuándo empieza el curso?', a: 'Las fechas de la primera edición se anunciarán próximamente. Si te inscribes antes del anuncio, te avisaremos por email con la fecha de inicio.' },
                { q: '¿Cómo se realiza el pago?', a: 'El pago se procesa con Stripe al pulsar "Inscribirme ahora". Si eres alumno del curso ELE, introduce el código ALUMNIELE en el campo de cupón para obtener el precio especial.' },
                { q: '¿Obtendré un certificado?', a: 'Sí. Al completar los tres módulos y sus actividades recibirás un certificado digital de aprovechamiento.' },
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
