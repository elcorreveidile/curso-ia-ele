import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';
import { supabase } from '../../../lib/supabaseClient';

export default function SesionConfirmada() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  async function fetchSessionDetails() {
    try {
      // Try to fetch from individual_sessions first
      let { data, error } = await supabase
        .from('individual_sessions')
        .select('*')
        .eq('stripe_payment_id', sessionId)
        .single();

      if (!error && data) {
        setSession({ ...data, type: 'individual' });
        return;
      }

      // If not found, try group_enrollments
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('group_enrollments')
        .select('*, group_sessions(*)')
        .eq('stripe_payment_id', sessionId)
        .single();

      if (enrollmentError) throw enrollmentError;

      if (enrollment) {
        setSession({
          ...enrollment,
          type: 'group',
          groupSession: enrollment.group_sessions,
        });
      } else {
        setError('No se encontró información de la sesión');
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError('Error al cargar los detalles de la sesión');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="inner-page">
          <div className="inner-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: 'var(--ink-muted)' }}>Cargando detalles de tu reserva...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="¡Reserva confirmada!"
          title="Tu sesión está reservada"
          desc="Recibirás un email de confirmación con todos los detalles."
        />
        <div className="inner-content">
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            {/* Success message */}
            <div
              style={{
                background: 'var(--green)',
                borderRadius: 'var(--r-lg)',
                padding: '2rem',
                marginBottom: '2rem',
                textAlign: 'center',
                color: 'var(--white)',
              }}
            >
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>✅</span>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: '800',
                  marginBottom: '0.5rem',
                }}
              >
                ¡Todo listo!
              </h2>
              <p style={{ fontSize: '1rem', opacity: 0.9, margin: 0 }}>
                Tu reserva se ha procesado correctamente.
              </p>
            </div>

            {/* Session details */}
            {session && session.type === 'individual' && (
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
                  Detalles de tu sesión individual
                </h3>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                    📅 Fecha
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--ink)' }}>
                    {new Date(session.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                    ⏰ Hora
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--ink)' }}>
                    {session.time} h
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                    💳 Pagado
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--blue-mid)' }}>
                    {(session.amount_paid / 100).toFixed(0)} €
                  </p>
                </div>

                {session.notes && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                      📝 Tus notas
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', fontStyle: 'italic' }}>
                      {session.notes}
                    </p>
                  </div>
                )}

                {/* Zoom placeholder */}
                <div
                  style={{
                    background: 'var(--canvas)',
                    borderRadius: 'var(--r-md)',
                    padding: '1rem 1.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                    🔗 Enlace de conexión
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', margin: 0 }}>
                    Recibirás el enlace de Zoom por email antes de la sesión.
                  </p>
                </div>

                {/* GitHub reminder */}
                <div
                  style={{
                    background: 'var(--blue-light)',
                    borderRadius: 'var(--r-md)',
                    padding: '1rem 1.5rem',
                  }}
                >
                  <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', margin: 0 }}>
                    <strong>💡 Consejo:</strong> Si vas a trabajar con el curso gratuito, no olvides tener tu repositorio GitHub actualizado con las actividades realizadas.
                  </p>
                </div>
              </div>
            )}

            {session && session.type === 'group' && session.groupSession && (
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
                  Detalles de tu inscripción
                </h3>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                    Sesión
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--ink)' }}>
                    {session.groupSession.title}
                  </p>
                </div>

                {session.groupSession.description && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                      Descripción
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                      {session.groupSession.description}
                    </p>
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                    📅 Fecha y hora
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--ink)' }}>
                    {new Date(session.groupSession.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {' '}
                    a las{' '}
                    {new Date(session.groupSession.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                    💳 Pagado
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--blue-mid)' }}>
                    {(session.groupSession.price_cents / 100).toFixed(0)} €
                  </p>
                </div>

                {/* Zoom placeholder */}
                <div
                  style={{
                    background: 'var(--canvas)',
                    borderRadius: 'var(--r-md)',
                    padding: '1rem 1.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                    🔗 Enlace de conexión
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', margin: 0 }}>
                    Recibirás el enlace de Zoom por email cuando la sesión se confirme.
                  </p>
                </div>

                {/* Minimum participants reminder */}
                <div
                  style={{
                    background: 'var(--orange-light)',
                    borderLeft: '3px solid var(--clm-red)',
                    borderRadius: 'var(--r-sm)',
                    padding: '0.75rem 1rem',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', margin: 0 }}>
                    <strong>Recordatorio:</strong> Esta sesión necesita mínimo 4 participantes. Si no se alcanza el mínimo 48h antes, se cancelará y recibirás la devolución automáticamente.
                  </p>
                </div>
              </div>
            )}

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
                ¿Qué hacer ahora?
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                  ✅ Revisa tu email - hemos enviado los detalles de la reserva
                </li>
                <li style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                  📚 Continúa con el <Link to="/aprende" style={{ color: 'var(--blue-mid)', textDecoration: 'underline', fontWeight: '600' }}>curso gratuito</Link> si aún no lo has terminado
                </li>
                <li style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                  📝 Prepara tu repositorio GitHub con las actividades del curso
                </li>
                <li style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                  🔗 El enlace de Zoom te llegará por email antes de la sesión
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/aprende"
                className="btn btn--primary"
                style={{ justifyContent: 'center' }}
              >
                Continuar con el curso →
              </Link>
              <Link
                to="/sesiones"
                className="btn btn--outline"
                style={{ justifyContent: 'center' }}
              >
                Ver más sesiones
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
