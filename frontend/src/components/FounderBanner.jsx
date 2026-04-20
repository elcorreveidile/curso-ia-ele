import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCourse } from '../lib/course';

export default function FounderBanner() {
  const { course } = useCourse();
  const location = useLocation();
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    try { setClosed(sessionStorage.getItem('lcd_banner_closed') === '1'); } catch {}
  }, []);

  const hidePaths = ['/inscripcion/', '/dashboard', '/curso/', '/admin', '/certificado/', '/auth/verify', '/login'];
  const hidden = hidePaths.some((p) => location.pathname.startsWith(p));

  const left = course ? Math.max(0, course.founder_seats - course.founder_seats_taken) : 0;
  const active = !!course && course.is_founder_edition && left > 0;
  const visible = active && !closed && !hidden;

  // Toggle body class so sticky nav offsets correctly
  useEffect(() => {
    if (visible) document.body.classList.add('has-founder-strip');
    else document.body.classList.remove('has-founder-strip');
    return () => document.body.classList.remove('has-founder-strip');
  }, [visible]);

  if (!visible) return null;

  const close = () => {
    setClosed(true);
    try { sessionStorage.setItem('lcd_banner_closed', '1'); } catch {}
  };

  return (
    <div className="founder-strip" data-testid="founder-strip">
      <div className="founder-strip__inner">
        <span className="founder-strip__dot" />
        <span className="founder-strip__text">
          <strong>{left}/{course.founder_seats}</strong> plazas fundador · precio{' '}
          <strong>{(course.price_founder_eur / 100).toFixed(0)} €</strong> hasta agotar (después{' '}
          {(course.price_eur / 100).toFixed(0)} €)
        </span>
        <Link
          to="/inscripcion/ia-ele"
          className="founder-strip__cta"
          data-testid="founder-strip-cta"
        >
          Reservar plaza →
        </Link>
        <button
          type="button"
          className="founder-strip__close"
          onClick={close}
          aria-label="Cerrar"
          data-testid="founder-strip-close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
