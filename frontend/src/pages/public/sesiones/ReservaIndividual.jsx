import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';
import { supabase } from '../../../lib/supabaseClient';

const INDIVIDUAL_SESSION = {
  price: 45,
  priceCents: 4500,
  duration: 60,
  currency: 'EUR',
  availableDays: [1, 2, 3, 4], // lunes=1, martes=2, miércoles=3, jueves=4
  availableHours: ['16:00', '17:00', '18:00', '19:00'],
  minAdvanceHours: 48,
  maxPerDay: 3,
};

export default function ReservaIndividual() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingSessions, setExistingSessions] = useState([]);

  // Generate available dates for the next 30 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today.getTime() + INDIVIDUAL_SESSION.minAdvanceHours * 60 * 60 * 1000);

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      if (INDIVIDUAL_SESSION.availableDays.includes(date.getDay())) {
        dates.push(date);
      }
    }

    return dates;
  };

  const availableDates = getAvailableDates();

  // Fetch existing sessions for a selected date
  useEffect(() => {
    if (selectedDate) {
      fetchExistingSessions(selectedDate);
    }
  }, [selectedDate]);

  async function fetchExistingSessions(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('individual_sessions')
        .select('time')
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString())
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;
      setExistingSessions(data?.map(s => s.time) || []);
    } catch (err) {
      console.error('Error fetching existing sessions:', err);
    }
  }

  const getAvailableHours = () => {
    if (!selectedDate) return [];

    const sessionsCount = {};
    existingSessions.forEach(time => {
      sessionsCount[time] = (sessionsCount[time] || 0) + 1;
    });

    return INDIVIDUAL_SESSION.availableHours.filter(hour => {
      return (sessionsCount[hour] || 0) < INDIVIDUAL_SESSION.maxPerDay;
    });
  };

  const availableHours = getAvailableHours();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !name || !email) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);

    try {
      // Call Supabase Edge Function to create Stripe checkout
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          session_type: 'individual',
          student_name: name,
          student_email: email,
          date: selectedDate.toISOString(),
          time: selectedTime,
          notes: notes,
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
      alert('Hubo un error al procesar tu reserva. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const isDateDisabled = (date) => {
    const now = new Date();
    const minDate = new Date(now.getTime() + INDIVIDUAL_SESSION.minAdvanceHours * 60 * 60 * 1000);
    return date < minDate;
  };

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Sesiones individuales"
          title="Reserva tu sesión personalizada"
          desc={`60 minutos de acompañamiento individualizado · ${INDIVIDUAL_SESSION.price} €`}
        />
        <div className="inner-content">
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            {/* Info box */}
            <div
              style={{
                background: 'var(--canvas)',
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
                  marginBottom: '0.75rem',
                }}
              >
                Cómo funciona
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                <li style={{ marginBottom: '0.5rem' }}>📅 Selecciona una fecha disponible (lunes a jueves)</li>
                <li style={{ marginBottom: '0.5rem' }}>⏰ Elige una hora (16:00 - 20:00 h)</li>
                <li style={{ marginBottom: '0.5rem' }}>📝 Rellena tus datos y añade notas si quieres</li>
                <li style={{ marginBottom: '0.5rem' }}>💳 Paga de forma segura con Stripe ({INDIVIDUAL_SESSION.price} €)</li>
                <li>✅ Recibirás confirmación inmediata con detalles de la sesión</li>
              </ul>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Date selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                  Fecha *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {availableDates.map((date, idx) => {
                    const disabled = isDateDisabled(date);
                    const selected = selectedDate && date.toDateString() === selectedDate.toDateString();

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--r-sm)',
                          background: selected ? 'var(--blue)' : disabled ? 'var(--canvas-alt)' : 'var(--white)',
                          color: selected ? 'var(--white)' : disabled ? 'var(--ink-muted)' : 'var(--ink)',
                          border: selected ? '2px solid var(--blue)' : disabled ? '1px solid var(--canvas-alt)' : '1px solid var(--canvas-alt)',
                          fontSize: '0.9rem',
                          fontWeight: selected ? '600' : '400',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          transition: 'all .2s',
                          opacity: disabled ? 0.5 : 1,
                        }}
                      >
                        {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time selection */}
              {selectedDate && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                    Hora *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {availableHours.map((hour) => {
                      const selected = selectedTime === hour;

                      return (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => setSelectedTime(hour)}
                          style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--r-sm)',
                            background: selected ? 'var(--blue)' : 'var(--white)',
                            color: selected ? 'var(--white)' : 'var(--ink)',
                            border: selected ? '2px solid var(--blue)' : '1px solid var(--canvas-alt)',
                            fontSize: '0.9rem',
                            fontWeight: selected ? '600' : '400',
                            cursor: 'pointer',
                            transition: 'all .2s',
                          }}
                        >
                          {hour}
                        </button>
                      );
                    })}
                  </div>
                  {availableHours.length === 0 && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.5rem' }}>
                      No hay horas disponibles para esta fecha.
                    </p>
                  )}
                </div>
              )}

              {/* Name */}
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

              {/* Email */}
              <div style={{ marginBottom: '1rem' }}>
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

              {/* Notes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  Notas (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input"
                  placeholder="¿Qué quieres trabajar en la sesión? (tema, nivel, objetivos...)"
                  rows={4}
                  style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--canvas-alt)', borderRadius: 'var(--r-sm)', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              {/* Summary */}
              {selectedDate && selectedTime && (
                <div
                  style={{
                    background: 'var(--blue-light)',
                    borderRadius: 'var(--r-md)',
                    padding: '1rem 1.5rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                    Resumen de tu reserva
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', margin: 0 }}>
                    📅 {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    &nbsp;·&nbsp;⏰ {selectedTime}
                    &nbsp;·&nbsp;💳 {INDIVIDUAL_SESSION.price} €
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={loading || !selectedDate || !selectedTime || !name || !email}
                  className="btn btn--primary"
                  style={{
                    justifyContent: 'center',
                    opacity: (loading || !selectedDate || !selectedTime || !name || !email) ? 0.5 : 1,
                    cursor: (loading || !selectedDate || !selectedTime || !name || !email) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Procesando...' : `Pagar ${INDIVIDUAL_SESSION.price} € y reservar →`}
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

            {/* Help text */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--canvas-alt)', borderRadius: 'var(--r-sm)', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>¿Necesitas un horario diferente?</strong>
              </p>
              <p style={{ margin: 0 }}>
                Si no encuentras un hueco que te funcione, <Link to="/contacto" style={{ color: 'var(--blue-mid)', textDecoration: 'underline' }}>escríbeme</Link> y lo acordamos.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
