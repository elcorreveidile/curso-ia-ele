import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';

export default function SesionCancelada() {
  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Sesión cancelada"
          title="Esta sesión no ha podido realizarse"
          desc="Se ha procesado la devolución automática a todos los inscritos."
        />
        <div className="inner-content">
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            {/* Cancelation notice */}
            <div
              style={{
                background: 'var(--orange-light)',
                borderRadius: 'var(--r-lg)',
                padding: '2rem',
                marginBottom: '2rem',
                border: '2px solid var(--clm-red)',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', flexShrink: 0 }}>⚠️</span>
                <div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.4rem',
                      fontWeight: '800',
                      color: 'var(--ink)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Sesión grupal cancelada
                  </h2>
                  <p style={{ fontSize: '1rem', color: 'var(--ink-soft)', lineHeight: '1.6', margin: 0 }}>
                    Esta sesión no ha alcanzado el mínimo de 4 participantes necesario para confirmarse.
                  </p>
                </div>
              </div>
            </div>

            {/* Refund info */}
            <div
              style={{
                background: 'var(--white)',
                borderRadius: 'var(--r-lg)',
                padding: '2rem',
                marginBottom: '2rem',
                border: '1px solid rgba(14,28,47,.06)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: 'var(--ink)',
                  marginBottom: '1.5rem',
                }}
              >
                Sobre la devolución
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: '1.7', marginBottom: '0.5rem' }}>
                  <strong>✅ Devolución procesada automáticamente</strong>
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: '1.7', margin: 0 }}>
                  Se ha iniciado la devolución del importe completo a tu tarjeta. El proceso puede tardar entre 3 y 5 días hábiles en aparecer en tu estado de cuenta, según tu banco.
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--canvas)', borderRadius: 'var(--r-sm)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                  <strong>💡 ¿Por qué se cancela?</strong>
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: '1.6', margin: 0 }}>
                  Las sesiones grupales necesitan un mínimo de 4 inscritos para garantizar una experiencia de calidad. Si no se alcanza este mínimo 48 horas antes de la sesión, se cancela automáticamente y se devuelve el pago a todos los participantes.
                </p>
              </div>
            </div>

            {/* Next steps */}
            <div
              style={{
                background: 'var(--blue-light)',
                borderRadius: 'var(--r-md)',
                padding: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: 'var(--ink)',
                  marginBottom: '1rem',
                }}
              >
                ¿Qué puedes hacer ahora?
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                  📅 Revisa las <Link to="/sesiones" style={{ color: 'var(--blue-mid)', textDecoration: 'underline', fontWeight: '600' }}>próximas sesiones grupales</Link> disponibles
                </li>
                <li style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                  👤 Considera reservar una <Link to="/sesiones/individual" style={{ color: 'var(--blue-mid)', textDecoration: 'underline', fontWeight: '600' }}>sesión individual</Link> si necesitas atención personalizada
                </li>
                <li style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                  📚 Continúa con el <Link to="/aprende" style={{ color: 'var(--blue-mid)', textDecoration: 'underline', fontWeight: '600' }}>curso gratuito</Link> mientras tanto
                </li>
              </ul>
            </div>

            {/* Contact info */}
            <div
              style={{
                background: 'var(--canvas)',
                borderRadius: 'var(--r-md)',
                padding: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '0.5rem' }}>
                <strong>¿Tienes dudas?</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: 0 }}>
                Si tienes alguna pregunta sobre la devolución o quieres reservar otra sesión, <Link to="/contacto" style={{ color: 'var(--blue-mid)', textDecoration: 'underline' }}>contáctame</Link>.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/sesiones"
                className="btn btn--primary"
                style={{ justifyContent: 'center' }}
              >
                Ver sesiones disponibles →
              </Link>
              <Link
                to="/aprende"
                className="btn btn--outline"
                style={{ justifyContent: 'center' }}
              >
                Volver al curso gratuito
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
