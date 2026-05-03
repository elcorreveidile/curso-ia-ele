import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';
import { supabase } from '../../../lib/supabaseClient';

const INDIVIDUAL_SESSION = {
  price: 45,
  duration: 60,
  currency: 'EUR',
  description: 'Sesión personalizada de 60 minutos. Conversación en español, corrección de escritura, preparación de exámenes o revisión de tu portfolio de aprendizaje.',
};

const GROUP_SESSION = {
  price: 15,
  duration: 60,
  currency: 'EUR',
  min_students: 4,
  max_students: 8,
  description: 'Sesión grupal de 60 minutos con un máximo de 8 participantes. Temática publicada con antelación. Si no se alcanzan 4 inscritos 48h antes, la sesión se cancela y se devuelve el pago automáticamente.',
};

export default function Sesiones() {
  const [groupSessions, setGroupSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupSessions();
  }, []);

  async function fetchGroupSessions() {
    try {
      const { data, error } = await supabase
        .from('group_sessions_with_count')
        .select('*')
        .gte('date', new Date().toISOString())
        .eq('status', 'open')
        .order('date', { ascending: true });

      if (error) throw error;
      setGroupSessions(data || []);
    } catch (err) {
      console.error('Error fetching group sessions:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Sesiones de acompañamiento"
          title="IA y español en práctica"
          desc="Sesiones individuales y grupales para profundizar en tu aprendizaje de español con IA. Complemento perfecto del curso gratuito."
        />
        <div className="inner-content">
          {/* Individual sessions */}
          <div
            style={{
              background: 'linear-gradient(160deg, #0A1628 0%, #0F2744 60%, #0A1628 100%)',
              borderRadius: 'var(--r-xl)',
              padding: '3rem',
              marginBottom: '3rem',
              color: 'var(--white)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
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
                Sesiones individuales
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  fontWeight: '800',
                  marginBottom: '1rem',
                }}
              >
                Acompañamiento personalizado
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,.7)',
                  maxWidth: '580px',
                  lineHeight: '1.7',
                  marginBottom: '2rem',
                }}
              >
                {INDIVIDUAL_SESSION.description}
              </p>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.5)', marginBottom: '0.25rem' }}>
                    Precio
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--clm-red)' }}>
                    {INDIVIDUAL_SESSION.price} €
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.5)', marginBottom: '0.25rem' }}>
                    Duración
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--white)' }}>
                    {INDIVIDUAL_SESSION.duration} min
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.5)', marginBottom: '0.25rem' }}>
                    Disponibilidad
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--white)' }}>
                    Lunes-Jueves
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 'var(--r-md)',
                  padding: '1rem 1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,.8)', marginBottom: '0.5rem' }}>
                  <strong>Horarios disponibles:</strong> 16:00 - 20:00 h (hora peninsular española)
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,.6)', margin: 0 }}>
                  Antelación mínima: 48 horas · Máximo 3 sesiones por día
                </p>
              </div>

              <Link
                to="/sesiones/individual"
                className="btn btn--primary"
                style={{
                  justifyContent: 'center',
                  background: 'var(--clm-red)',
                  color: 'var(--ink)',
                }}
              >
                Reservar sesión individual ({INDIVIDUAL_SESSION.price} €) →
              </Link>
            </div>
          </div>

          {/* Group sessions */}
          <div
            style={{
              background: 'var(--canvas)',
              borderRadius: 'var(--r-xl)',
              padding: '3rem',
              marginBottom: '3rem',
            }}
          >
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--blue-mid)',
                marginBottom: '0.5rem',
              }}
            >
              Sesiones grupales
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                fontWeight: '800',
                color: 'var(--ink)',
                marginBottom: '1rem',
              }}
            >
              Aprende con otros estudiantes
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--ink-soft)',
                maxWidth: '580px',
                lineHeight: '1.7',
                marginBottom: '2rem',
              }}
            >
              {GROUP_SESSION.description}
            </p>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                  Precio
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--blue-mid)' }}>
                  {GROUP_SESSION.price} €
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                  Duración
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--ink)' }}>
                  {GROUP_SESSION.duration} min
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                  Participantes
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--ink)' }}>
                  {GROUP_SESSION.min_students}-{GROUP_SESSION.max_students}
                </p>
              </div>
            </div>

            {loading ? (
              <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>Cargando sesiones disponibles...</p>
            ) : groupSessions.length === 0 ? (
              <div
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--canvas-alt)',
                  borderRadius: 'var(--r-md)',
                  padding: '2rem',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '1rem' }}>
                  No hay sesiones grupales disponibles en este momento.
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: 0 }}>
                  Las sesiones se publican quincenalmente. Vuelve pronto para ver las próximas fechas.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {groupSessions.map((session) => (
                  <div
                    key={session.id}
                    style={{
                      background: 'var(--white)',
                      border: '1px solid rgba(14,28,47,.06)',
                      borderRadius: 'var(--r-lg)',
                      padding: '1.5rem',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'transform .25s, box-shadow .25s',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '1.5rem',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: 'var(--ink)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {session.title}
                      </h3>
                      {session.description && (
                        <p
                          style={{
                            fontSize: '0.9rem',
                            color: 'var(--ink-soft)',
                            lineHeight: '1.6',
                            marginBottom: '0.75rem',
                          }}
                        >
                          {session.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                        <span>📅 {new Date(session.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span>⏱ {session.duration_min} min</span>
                        <span>👥 {session.enrolled_count || 0}/{session.max_students} inscritos</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: session.spots_remaining > 0 ? 'var(--green)' : 'var(--clm-red)',
                          fontWeight: '600',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {session.spots_remaining > 0
                          ? `${session.spots_remaining} plazas disponibles`
                          : 'Completo'
                        }
                      </p>
                      {session.spots_remaining > 0 ? (
                        <Link
                          to={`/sesiones/grupal/${session.id}`}
                          className="btn btn--primary"
                          style={{
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            padding: '0.6rem 1.2rem',
                          }}
                        >
                          Reservar plaza ({GROUP_SESSION.price} €) →
                        </Link>
                      ) : (
                        <button
                          disabled
                          style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: 'var(--r-sm)',
                            background: 'var(--canvas-alt)',
                            color: 'var(--ink-muted)',
                            border: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'not-allowed',
                          }}
                        >
                          Completo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info box */}
          <div
            style={{
              background: 'var(--blue-light)',
              borderRadius: 'var(--r-md)',
              padding: '1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</span>
            <div>
              <p style={{ fontWeight: '600', color: 'var(--ink)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                ¿No estás seguro?
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: '1.6', margin: 0 }}>
                Empieza con el <Link to="/aprende" style={{ color: 'var(--blue-mid)', textDecoration: 'underline' }}>curso gratuito</Link> para descubrir cómo la IA puede ayudarte a aprender español. Luego, si quieres feedback personalizado, reserva una sesión.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
