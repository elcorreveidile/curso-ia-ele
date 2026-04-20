import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const t = localStorage.getItem('lcd_token');
    if (!t) { setUser(null); setLoading(false); return; }
    try {
      const r = await api.get('/auth/me');
      setUser(r.data);
    } catch {
      localStorage.removeItem('lcd_token');
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setToken = (token) => {
    if (token) localStorage.setItem('lcd_token', token);
    else localStorage.removeItem('lcd_token');
    load();
  };

  const logout = () => { localStorage.removeItem('lcd_token'); setUser(null); };

  return (
    <AuthCtx.Provider value={{ user, loading, setToken, reload: load, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
