import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function Profile() {
  const { user, reload } = useAuth();
  const [params] = useSearchParams();
  const isOnboarding = params.get('onboarding') === '1';
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSurname(user.surname || '');
    }
  }, [user]);

  useEffect(() => {
    api.get('/dashboard').then((r) => setDashboard(r.data)).catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setErr(''); setOk(false);
    try {
      await api.put('/auth/profile', { name: name.trim(), surname: surname.trim() });
      await reload();
      setOk(true);
      if (isOnboarding) {
        setTimeout(() => navigate('/dashboard'), 700);
      }
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Error al guardar');
    }
    setSaving(false);
  };

  if (!user) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando…</div><Footer /></>;

  const enrollment = dashboard?.enrollments?.[0];
  const amountEur = enrollment?.enrollment?.amount_paid_eur
    ? (enrollment.enrollment.amount_paid_eur / 100).toFixed(2)
    : null;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag={isOnboarding ? 'Bienvenido/a' : 'Mi perfil'}
          title={isOnboarding ? 'Completa tu perfil' : 'Mis datos'}
          desc={isOnboarding
            ? 'Antes de entrar al curso, necesitamos saber tu nombre para personalizar tu experiencia.'
            : 'Gestiona tus datos personales y consulta tu inscripción.'}
        />
        <div className="inner-content" style={{ maxWidth: 820 }}>
          {!isOnboarding && (
            <Link to="/dashboard" style={{ color: 'var(--blue)', fontSize: '.875rem', marginBottom: '1rem', display: 'inline-block' }}>
              ← Volver a mis cursos
            </Link>
          )}

          <div className="dash-section" data-testid="profile-section">
            <h2 className="dash-title">Datos personales</h2>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="profile-name">Nombre</label>
                  <input
                    id="profile-name"
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus={isOnboarding}
                    maxLength={80}
                    data-testid="profile-name-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-surname">Apellidos</label>
                  <input
                    id="profile-surname"
                    type="text"
                    className="form-input"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                    maxLength={120}
                    data-testid="profile-surname-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email (no se puede cambiar)</label>
                <input type="email" className="form-input" value={user.email} readOnly style={{ background: 'var(--canvas)', color: 'var(--ink-muted)' }} data-testid="profile-email-input" />
              </div>
              {err && <p style={{ color: 'var(--clm-red)', marginBottom: '.5rem' }} data-testid="profile-error">{err}</p>}
              {ok && <p style={{ color: '#16A34A', marginBottom: '.5rem' }} data-testid="profile-ok">✓ Guardado correctamente</p>}
              <button className="btn btn--primary" disabled={saving} data-testid="profile-save-btn">
                {saving ? 'Guardando…' : isOnboarding ? 'Guardar y entrar →' : 'Guardar cambios'}
              </button>
            </form>
          </div>

          {!isOnboarding && enrollment && (
            <div className="dash-section" data-testid="profile-enrollment">
              <h2 className="dash-title">Mi inscripción</h2>
              <div className="info-box" style={{ borderLeft: '4px solid var(--amber)' }}>
                <p><strong>Curso:</strong> {enrollment.course?.title}</p>
                <p><strong>Fecha de inscripción:</strong> {enrollment.enrollment?.paid_at ? new Date(enrollment.enrollment.paid_at).toLocaleDateString('es-ES') : '—'}</p>
                {amountEur && <p><strong>Importe pagado:</strong> {amountEur} €</p>}
                {enrollment.enrollment?.was_founder && (
                  <p><span className="badge badge--founder">Plaza fundador</span></p>
                )}
                {enrollment.enrollment?.stripe_payment_id && (
                  <p style={{ fontSize: '.8rem', color: 'var(--ink-muted)' }}>
                    Referencia pago: {enrollment.enrollment.stripe_payment_id}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
