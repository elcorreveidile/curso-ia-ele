import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function CheckEmail() {
  const [params] = useSearchParams();
  const email = params.get('email') || 'tu correo';
  const next = params.get('next') || '/dashboard';
  return (
    <>
      <Navbar />
      <div className="inner-page">
        <div className="auth-card" data-testid="check-email-card">
          <h1 className="auth-title">📬 Revisa tu email</h1>
          <p className="auth-desc">
            Hemos enviado un enlace a <strong>{email}</strong>. Haz clic en él para acceder a tu
            área y completar la inscripción.
          </p>
          <p style={{ fontSize: '.85rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>
            ¿No lo recibes? Revisa la carpeta de spam o{' '}
            <Link to="/contacto" style={{ color: 'var(--blue)' }}>escríbenos desde el formulario de contacto</Link>.
          </p>
          <Link to={next} className="btn btn--ghost" data-testid="check-email-back">Volver</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
