import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/request-link', { email, marketing_consent: marketingConsent });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al solicitar el enlace');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <div className="auth-card" data-testid="login-card">
          {sent ? (
            <>
              <h1 className="auth-title">Revisa tu correo</h1>
              <p className="auth-desc">
                Hemos enviado un enlace de acceso a <strong>{email}</strong>. Haz clic en él para
                entrar. El enlace caduca en 30 minutos.
              </p>
              <button
                className="btn btn--ghost"
                onClick={() => { setSent(false); setEmail(''); }}
                data-testid="login-again"
              >
                Usar otro email
              </button>
            </>
          ) : (
            <>
              <h1 className="auth-title">Acceder a mi área</h1>
              <p className="auth-desc">
                Introduce tu email de inscripción. Te enviaremos un enlace de acceso — sin contraseñas.
              </p>
              <form onSubmit={submit}>
                <input
                  type="email"
                  required
                  className="auth-input"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="login-email"
                />
                <label
                  style={{
                    display: 'flex',
                    gap: '.6rem',
                    alignItems: 'flex-start',
                    fontSize: '.82rem',
                    color: 'var(--ink-muted)',
                    margin: '.4rem 0 .9rem',
                    cursor: 'pointer',
                    lineHeight: 1.45,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    data-testid="login-marketing-consent"
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    Acepto recibir emails ocasionales con novedades, recursos y
                    promociones de La Clase Digital. Puedo darme de baja en
                    cualquier momento (RGPD).
                  </span>
                </label>
                {error && <p style={{ color: 'var(--clm-red)', fontSize: '.85rem', marginBottom: '.75rem' }}>{error}</p>}
                <button
                  className="btn btn--primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={loading}
                  data-testid="login-submit"
                >
                  {loading ? 'Enviando…' : 'Enviarme enlace de acceso'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
