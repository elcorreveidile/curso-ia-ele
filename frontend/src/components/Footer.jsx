import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer data-testid="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand__logo">
            <span className="pipe">[|]</span>La Clase<span className="brand-chip">Digital</span>
          </div>
          <p className="footer-brand__desc">
            Formación docente en Inteligencia Artificial para la enseñanza de
            Español como Lengua Extranjera.<br />Curso de mayo 2026.
          </p>
        </div>
        <div>
          <p className="footer-col__title">El curso</p>
          <div className="footer-col__links">
            <Link to="/descripcion">Descripción y objetivos</Link>
            <Link to="/programa">Programa por módulos</Link>
            <Link to="/calendario">Calendario</Link>
            <Link to="/metodologia">Metodología</Link>
            <Link to="/precios">Precios e inscripción</Link>
            <Link to="/sobre-mi">Sobre el formador</Link>
          </div>
        </div>
        <div>
          <p className="footer-col__title">Contacto</p>
          <p className="footer-contact">
            <strong>Javier Benítez Láinez</strong><br />
            Docente de ELE · Granada (España)
          </p>
          <div className="footer-col__links" style={{ marginTop: '.75rem' }}>
            <Link to="/contacto" data-testid="footer-contact-link">✉ Escribir un mensaje</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Javier Benítez Láinez · Formación Docente ELE</span>
        <a href="https://laclasedigital.com" target="_blank" rel="noopener noreferrer">
          laclasedigital.com
        </a>
      </div>
    </footer>
  );
}
