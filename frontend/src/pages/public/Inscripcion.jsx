import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function Inscripcion() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [email, setEmail] = useState('');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/courses/${slug}`).then((r) => setCourse(r.data)).catch(() => {});
    if (user) setEmail(user.email);
  }, [slug, user]);

  if (!course) return (
    <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando curso…</div><Footer /></>
  );

  const seatsLeft = Math.max(0, course.founder_seats - course.founder_seats_taken);
  const founderActive = course.is_founder_edition && seatsLeft > 0;
  const amount = founderActive ? course.price_founder_eur / 100 : course.price_eur / 100;
  const hasAlumniPricing = course.has_alumni_pricing;

  const checkout = async (e) => {
    e.preventDefault();
    if (!email) { setError('Introduce tu email'); return; }
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('lcd_token');
      const body = {
        course_slug: slug,
        origin_url: window.location.origin,
        ...(hasAlumniPricing && coupon ? { coupon_code: coupon } : {}),
      };
      const r = await api.post('/checkout/create', body, {
        headers: token ? { Authorization: `Bearer ${token}` } : {
          'X-Buyer-Email': email,
        },
      });
      window.location.href = r.data.url;
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar el pago.');
      setLoading(false);
    }
  };

  const requestLinkAndRedirect = async () => {
    if (!email) { setError('Introduce tu email'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/request-link', { email });
      navigate('/inscripcion/check-email?next=' + encodeURIComponent(`/inscripcion/${slug}`) + '&email=' + encodeURIComponent(email));
    } catch (err) {
      setError(err.response?.data?.detail || 'Error solicitando acceso');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Inscripción"
          title={course.title}
          desc={founderActive
            ? `Precio fundador · ${amount.toFixed(0)} € · ${seatsLeft} plazas disponibles`
            : `Precio estándar · ${amount.toFixed(0)} €`}
        />
        <div className="inner-content" style={{ maxWidth: 720 }}>
          <div className="price-card" style={{ marginBottom: '2rem' }} data-testid="inscripcion-summary">
            {founderActive && <span className="badge badge--founder" style={{ marginBottom: '1rem' }}>Precio fundador</span>}
            <p className="price-card__label">Resumen</p>
            <div className="price-card__amount">{amount.toFixed(0)}<span style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--ink-muted)' }}> €</span></div>
            <p className="price-card__period">pago único · {course.hours || 20} horas</p>
            {hasAlumniPricing && (
              <p className="price-card__alumni-note" style={{ marginTop: '.75rem' }}>
                🎓 ¿Alumno del curso ELE? El precio final será <strong>{course.price_alumni_eur ? (course.price_alumni_eur / 100).toFixed(0) : '—'} €</strong> con el código de descuento.
              </p>
            )}
            <ul className="price-includes">
              <li>{course.hours || 20} horas de formación práctica</li>
              <li>Actividades prácticas por módulo</li>
              <li>Feedback personalizado en cada tarea</li>
              <li>Certificado de aprovechamiento</li>
              {founderActive && <li>Acceso directo al formador · Solo primera edición</li>}
            </ul>
          </div>

          <div className="price-card">
            <p className="price-card__label">Tus datos</p>
            <form onSubmit={user ? checkout : (e) => { e.preventDefault(); checkout(e); }} data-testid="inscripcion-form">
              <div className="form-group">
                <label htmlFor="email">Email de inscripción</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!user}
                  data-testid="inscripcion-email"
                />
              </div>

              {hasAlumniPricing && (
                <div className="form-group" data-testid="inscripcion-coupon-group">
                  <label htmlFor="coupon">Código de descuento alumni (opcional)</label>
                  <input
                    id="coupon"
                    type="text"
                    className="form-input"
                    placeholder="Ej: ALUMNIELE"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    data-testid="inscripcion-coupon"
                  />
                  <p style={{ fontSize: '.78rem', color: 'var(--ink-muted)', marginTop: '.35rem' }}>
                    Si eres alumno del curso de IA para ELE, introduce el código que recibiste al finalizar para obtener el precio de {course.price_alumni_eur ? (course.price_alumni_eur / 100).toFixed(0) : '—'} €.
                  </p>
                </div>
              )}

              {error && <p style={{ color: 'var(--clm-red)', fontSize: '.85rem', marginBottom: '1rem' }}>{error}</p>}

              {user ? (
                <button
                  type="submit"
                  className="btn btn--primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={loading}
                  data-testid="inscripcion-pay"
                >
                  {loading ? 'Redirigiendo…' : `Pagar con Stripe →`}
                </button>
              ) : (
                <>
                  <p style={{ fontSize: '.85rem', color: 'var(--ink-muted)', marginBottom: '.75rem' }}>
                    Para procesar tu inscripción necesitamos verificar tu email primero. Te
                    enviaremos un enlace de acceso y al volver podrás completar el pago.
                  </p>
                  <button
                    type="button"
                    onClick={requestLinkAndRedirect}
                    className="btn btn--primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={loading}
                    data-testid="inscripcion-verify-email"
                  >
                    {loading ? 'Enviando…' : 'Verificar email y continuar →'}
                  </button>
                </>
              )}
              <p className="price-note">
                Pago seguro procesado por Stripe. Aceptamos tarjetas de crédito y débito.
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
