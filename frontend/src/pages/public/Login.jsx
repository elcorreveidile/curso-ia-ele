import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/request-link', { email });
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
