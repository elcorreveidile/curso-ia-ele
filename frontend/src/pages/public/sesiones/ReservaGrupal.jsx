import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';
import { supabase } from '../../../lib/supabaseClient';

const GROUP_SESSION = {
  price: 15,
  priceCents: 1500,
  minStudents: 4,
  maxStudents: 8,
};

export default function ReservaGrupal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSession();
  }, [id]);

  async function fetchSession() {
    try {
      const { data, error } = await supabase
        .from('group_sessions_with_count')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Sesión no encontrada');
        return;
      }

      if (data.status !== 'open') {
        setError('Esta sesión ya no está disponible');
        return;
      }

      if (data.spots_remaining <= 0) {
        setError('Esta sesión está completa');
        return;
      }

      setSession(data);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Error al cargar la sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setSubmitting(true);

    try {
      // Call Supabase Edge Function to create Stripe checkout
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          session_type: 'group',
          session_id: id,
          student_name: name,
          student_email: email,
        },
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      alert('Hubo un error al procesar tu inscripción. Por favor, inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="inner-page">
          <div className="inner-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: 'var(--ink-muted)' }}>Cargando información de la sesión...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !session) {
    return (
      <>
        <Navbar />
        <div className="inner-page">
          <div className="inner-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '1rem' }}>{error || 'Sesión no encontrada'}</p>
            <Link to="/sesiones" className="btn btn--primary">
              Volver a sesiones
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const sessionDate = new Date(session.date);
  const spotsRemaining = session.spots_remaining || 0;
  const enrolledCount = session.enrolled_count || 0;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Sesión grupal"
          title={session.title}
          desc={`Inscríbete a esta sesión grupal de ${session.duration_min} minutos`}
        />
        <div className="inner-content">
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            {/* Session details */}
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
              {session.description && (
                <p
                  style={{
                    fontSize: '1rem',
                    color: 'var(--ink-soft)',
                    lineHeight: '1.7',
                    marginBottom: '1.5rem',
                  }}
                >
                  {session.description}
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                    📅 Fecha
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--ink)' }}>
                    {sessionDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                    ⏰ Hora
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--ink)' }}>
                    {sessionDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                    ⏱ Duración
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--ink)' }}>
                    {session.duration_min} minutos
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                    💳 Precio
                  </p>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--blue-mid)' }}>
                    {GROUP_SESSION.price} €
                  </p>
                </div>
              </div>

              {/* Participants counter */}
              <div
                style={{
                  background: spotsRemaining >= GROUP_SESSION.minStudents - enrolledCount ? 'var(--canvas)' : 'var(--orange-light)',
                  borderRadius: 'var(--r-md)',
                  padding: '1rem 1.5rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ink)', margin: 0 }}>
                    Participantes inscritos
                  </p>
                  <p style={{ fontSize: '1.2rem', fontWeight: '700', color: spotsRemaining >= GROUP_SESSION.minStudents - enrolledCount ? 'var(--green)' : 'var(--clm-red)', margin: 0 }}>
                    {enrolledCount} / {session.max_students}
                  </p>
                </div>
                <div style={{ height: '8px', background: 'var(--canvas-alt)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(enrolledCount / session.max_students) * 100}%`,
                      background: spotsRemaining >= GROUP_SESSION.minStudents - enrolledCount ? 'var(--green)' : 'var(--clm-red)',
                      transition: 'width .4s',
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                  {spotsRemaining === 1 ? '¡Solo queda 1 plaza!' : `${spotsRemaining} plazas disponibles`}
                </p>
              </div>

              {/* Warning about minimum */}
              {enrolledCount < GROUP_SESSION.minStudents && (
                <div
                  style={{
                    background: 'var(--orange-light)',
                    borderLeft: '3px solid var(--clm-red)',
                    borderRadius: 'var(--r-sm)',
                    padding: '0.75rem 1rem',
                    marginBottom: '0',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', margin: 0 }}>
                    <strong>Importante:</strong> Esta sesión necesita mínimo {GROUP_SESSION.minStudents} participantes.
                    Si no se alcanza el mínimo 48h antes, se cancelará y se devolverá el pago automáticamente.
                  </p>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Tu nombre"
                  style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--canvas-alt)', borderRadius: 'var(--r-sm)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder="tu@email.com"
                  style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--canvas-alt)', borderRadius: 'var(--r-sm)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                />
              </div>

              {/* Summary */}
              <div
                style={{
                  background: 'var(--blue-light)',
                  borderRadius: 'var(--r-md)',
                  padding: '1rem 1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                  Resumen de tu inscripción
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', margin: 0 }}>
                  📅 {sessionDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  &nbsp;·&nbsp;⏰ {sessionDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h
                  &nbsp;·&nbsp;💳 {GROUP_SESSION.price} €
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={submitting || !name || !email}
                  className="btn btn--primary"
                  style={{
                    justifyContent: 'center',
                    opacity: (submitting || !name || !email) ? 0.5 : 1,
                    cursor: (submitting || !name || !email) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Procesando...' : `Inscribirse (${GROUP_SESSION.price} €) →`}
                </button>
                <Link
                  to="/sesiones"
                  className="btn btn--outline"
                  style={{ justifyContent: 'center' }}
                >
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
