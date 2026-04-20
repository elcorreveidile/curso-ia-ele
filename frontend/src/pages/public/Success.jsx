import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';

export default function Success() {
  const [params] = useSearchParams();
  const session_id = params.get('session_id');
  const [status, setStatus] = useState('checking');
  const [info, setInfo] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!session_id) { setStatus('error'); return; }
    let cancelled = false;

    const poll = async (n = 0) => {
      if (cancelled) return;
      if (n >= 7) { setStatus('timeout'); return; }
      try {
        const r = await api.get(`/checkout/status/${session_id}`);
        setInfo(r.data);
        if (r.data.payment_status === 'paid') { setStatus('paid'); return; }
        if (r.data.status === 'expired') { setStatus('expired'); return; }
        setAttempts(n + 1);
        setTimeout(() => poll(n + 1), 2000);
      } catch {
        setTimeout(() => poll(n + 1), 2000);
      }
    };
    poll(0);
    return () => { cancelled = true; };
  }, [session_id]);

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <div className="auth-card" data-testid="success-card">
          {status === 'checking' && (
            <>
              <h1 className="auth-title">⏳ Procesando tu pago…</h1>
              <p className="auth-desc">Intento {attempts + 1} · Un momento, por favor.</p>
            </>
          )}
          {status === 'paid' && (
            <>
              <h1 className="auth-title">🎉 ¡Inscripción confirmada!</h1>
              <p className="auth-desc">
                Te hemos enviado un email de confirmación a <strong>{info?.user_email}</strong>.
                Ya puedes acceder a tu área privada.
              </p>
              <Link to="/login" className="btn btn--primary" data-testid="success-login" style={{ justifyContent: 'center' }}>
                Acceder con magic link →
              </Link>
            </>
          )}
          {status === 'timeout' && (
            <>
              <h1 className="auth-title">⏱ Estamos procesando el pago</h1>
              <p className="auth-desc">
                Recibirás un email de confirmación en cuanto se complete. Si no lo ves en unos
                minutos, <Link to="/contacto" style={{ color: 'var(--blue)' }}>escríbenos desde el formulario de contacto</Link>.
              </p>
            </>
          )}
          {(status === 'error' || status === 'expired') && (
            <>
              <h1 className="auth-title">No hemos podido confirmar el pago</h1>
              <p className="auth-desc"><Link to="/contacto" style={{ color: 'var(--blue)' }}>Escríbenos por el formulario</Link> y lo resolvemos.</p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
