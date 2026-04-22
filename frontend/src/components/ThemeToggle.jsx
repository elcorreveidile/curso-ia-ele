import React, { useEffect, useState } from 'react';

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('lcd_theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* noop */ }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export default function ThemeToggle() {
  // Synchronously mirror the theme the inline script in index.html already set.
  // This avoids a flash of light theme for dark-mode users.
  const [theme, setTheme] = useState(() => {
    if (typeof document !== 'undefined') {
      const t = document.documentElement.getAttribute('data-theme');
      if (t === 'dark' || t === 'light') return t;
    }
    return getInitialTheme();
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const flip = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('lcd_theme', next); } catch { /* noop */ }
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={flip}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      data-testid="theme-toggle"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
