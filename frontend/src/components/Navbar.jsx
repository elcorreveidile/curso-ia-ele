import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useCourse } from '../lib/course';
import ThemeToggle from './ThemeToggle';

const publicLinks = [
  { to: '/descripcion', label: 'El curso' },
  { to: '/programa', label: 'Programa' },
  { to: '/calendario', label: 'Calendario' },
  { to: '/metodologia', label: 'Metodología' },
  { to: '/precios', label: 'Precios' },
  { to: '/sobre-mi', label: 'Sobre mí' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { course } = useCourse();
  const navigate = useNavigate();

  const seatsLeft = course
    ? Math.max(0, course.founder_seats - course.founder_seats_taken)
    : null;
  const founderActive = course?.is_founder_edition && seatsLeft > 0;

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
          to="/precios"
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
        {publicLinks.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={close}
            className={({ isActive }) => (isActive ? 'active' : '')}
            data-testid={`nav-${l.to.slice(1)}`}
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
