import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useCourse } from '../lib/course';
import ThemeToggle from './ThemeToggle';

const ELE_LINKS = [
  { to: '/curso-ele/descripcion', label: 'El curso' },
  { to: '/curso-ele/programa', label: 'Programa' },
  { to: '/curso-ele/calendario', label: 'Calendario' },
  { to: '/curso-ele/metodologia', label: 'Metodología' },
  { to: '/curso-ele/precios', label: 'Precios' },
  { to: '/curso-ele/sobre-mi', label: 'Sobre mí' },
  { to: '/contacto', label: 'Contacto' },
];

const IA_LINKS = [
  { to: '/curso-ia/descripcion', label: 'El curso' },
  { to: '/curso-ia/programa', label: 'Programa' },
  { to: '/curso-ia/precios', label: 'Precios' },
  { to: '/contacto', label: 'Contacto' },
];

const HUB_LINKS = [
  { to: '/contacto', label: 'Contacto' },
];

function useNavLinks(pathname) {
  if (pathname.startsWith('/curso-ele') || pathname.startsWith('/descripcion') || pathname.startsWith('/programa') || pathname.startsWith('/precios') || pathname.startsWith('/sobre-mi') || pathname.startsWith('/calendario') || pathname.startsWith('/metodologia')) {
    return { links: ELE_LINKS, context: 'ele' };
  }
  if (pathname.startsWith('/curso-ia')) {
    return { links: IA_LINKS, context: 'ia' };
  }
  return { links: HUB_LINKS, context: 'hub' };
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { course } = useCourse();
  const navigate = useNavigate();
  const location = useLocation();

  const { links, context } = useNavLinks(location.pathname);

  const seatsLeft = course
    ? Math.max(0, course.founder_seats - course.founder_seats_taken)
    : null;
  const founderActive = context === 'ele' && course?.is_founder_edition && seatsLeft > 0;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', on);
    return () => window.removeEventListener('scroll', on);
  }, []);

  const close = () => setOpen(false);

  return (
    <nav className={`inner-nav${scrolled ? ' scrolled' : ''}`}>
      <NavLink to="/" className="inner-nav__logo" onClick={close} data-testid="nav-logo">
        <span className="pipe">[|]</span>La Clase<span className="brand-chip">Digital</span>
      </NavLink>

      {founderActive && (
        <NavLink
          to="/curso-ele/precios"
          className="nav-seats-chip"
          onClick={close}
          data-testid="nav-seats-chip"
          title={`Precio fundador ${(course.price_founder_eur / 100).toFixed(0)} €`}
        >
          <span className="nav-seats-chip__dot" />
          <span className="nav-seats-chip__num">{seatsLeft}</span>
          <span className="nav-seats-chip__label">/ {course.founder_seats} plazas fundador</span>
        </NavLink>
      )}

      <div className={`inner-nav__links${open ? ' open' : ''}`}>
        {context !== 'hub' && (
          <NavLink
            to={context === 'ele' ? '/curso-ele' : '/curso-ia'}
            onClick={close}
            className="inner-nav__back"
            data-testid="nav-course-home"
          >
            ← Inicio del curso
          </NavLink>
        )}
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={close}
            className={({ isActive }) => (isActive ? 'active' : '')}
            data-testid={`nav-${l.to.replace(/\//g, '-').slice(1)}`}
          >
            {l.label}
          </NavLink>
        ))}
        {user ? (
          <>
            <NavLink to="/dashboard" onClick={close} data-testid="nav-dashboard">Mi área</NavLink>
            {user.role === 'admin' && (
              <NavLink to="/admin" onClick={close} data-testid="nav-admin">Admin</NavLink>
            )}
            <button
              className="linkish"
              onClick={() => { close(); logout(); navigate('/'); }}
              data-testid="nav-logout"
            >
              Salir
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            onClick={close}
            className="inner-nav__cta"
            data-testid="nav-login"
          >
            Acceder
          </NavLink>
        )}
        <ThemeToggle />
      </div>
      <button
        className={`inner-nav__burger${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Menú"
        data-testid="nav-burger"
      >
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
}
