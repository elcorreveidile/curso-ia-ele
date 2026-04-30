import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function Verify() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const { setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { setStatus('error'); setError('Token no proporcionado.'); return; }
    (async () => {
      try {
        const r = await api.post('/auth/verify', { token });
        setToken(r.data.token);
        setStatus('ok');
        setTimeout(async () => {
          try {
            const me = await api.get('/auth/me');
            if (!me.data?.name || !me.data?.surname) {
              navigate('/mi-area/perfil?onboarding=1');
              return;
            }
          } catch { /* noop */ }
          navigate('/dashboard');
        }, 800);
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.detail || 'Enlace no válido.');
      }
    })();
    // eslint-disable-next-line
  }, [token]);

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <div className="auth-card" data-testid="verify-card">
          {status === 'verifying' && <><h1 className="auth-title">Verificando…</h1><p className="auth-desc">Un momento.</p></>}
          {status === 'ok' && <><h1 className="auth-title">¡Listo! 🎉</h1><p className="auth-desc">Redirigiendo a tu área privada…</p></>}
          {status === 'error' && (
            <>
              <h1 className="auth-title">Enlace no válido</h1>
              <p className="auth-desc">{error}</p>
              <button className="btn btn--primary" onClick={() => navigate('/login')} data-testid="verify-retry">
                Solicitar un enlace nuevo
              </button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
