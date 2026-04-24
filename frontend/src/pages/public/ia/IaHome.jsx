import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useScrollReveal } from '../../../lib/useScrollReveal';

export default function IaHome() {
  useScrollReveal();
  return (
    <>
      <Navbar />
      <div className="home-hero home-hero--ia">
        <div className="home-body">
          <p className="home-eyebrow reveal reveal--delay-1">Formación profesional · laclasedigital.com</p>
          <h1 className="home-title reveal reveal--delay-1">
            <em>IA Práctica:</em><br />de los fundamentos<br />a la automatización
          </h1>
          <p className="home-subtitle reveal reveal--delay-2">
            Para cualquier perfil · Sin conocimientos previos · 20 horas · 250 €
          </p>

          <div className="test-card reveal reveal--delay-3" data-testid="ia-home-cta-card">
            <span className="test-card__badge">🤖 Formación práctica · Cualquier perfil</span>
            <h2 className="test-card__title">3 módulos · aplicable desde el primer día</h2>
            <p className="test-card__desc">
              Aprende qué es la IA y cómo funciona, construye tus primeras aplicaciones sin
              programar y automatiza tareas repetitivas en tu negocio. Sin tecnicismos, con
              casos reales.
            </p>
            <div className="test-card__gift" data-testid="ia-home-alumni-note">
              <span className="test-card__gift-icon">🎓</span>
              <span><strong>¿Alumno del curso ELE?</strong> Precio especial de <strong>149 €</strong> con el código que recibirás al finalizar.</span>
            </div>
            <Link to="/curso-ia/precios" className="test-card__btn" data-testid="ia-home-cta-precios">
              Ver precios e inscribirme →
            </Link>
          </div>

          <div className="home-divider">
            <div className="home-divider__line" />
            <span className="home-divider__text">Más información sobre el curso</span>
            <div className="home-divider__line" />
          </div>

          <div className="home-links">
            <Link to="/curso-ia/descripcion">Descripción y objetivos</Link>
            <Link to="/curso-ia/programa">Programa por módulos</Link>
            <Link to="/curso-ia/precios">Precios e inscripción</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
