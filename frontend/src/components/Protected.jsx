import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
