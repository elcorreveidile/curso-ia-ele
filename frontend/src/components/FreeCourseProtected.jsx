import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function FreeCourseProtected({ children }) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (authLoading) return;

      // Si no hay usuario autenticado, redirigir a login
      if (!user) {
        // Guardar la URL actual para redirigir después del login
        const currentPath = window.location.pathname;
        navigate(`/login?redirect=${currentPath}`);
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [user, authLoading, navigate]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--canvas-alt)',
          borderTopColor: 'var(--clm-red)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: 'var(--ink-muted)' }}>Verificando inscripción...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
