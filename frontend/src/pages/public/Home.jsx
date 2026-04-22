import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useScrollReveal } from '../../lib/useScrollReveal';

export default function Home() {
  useScrollReveal();
  return (
    <>
      <Navbar />
      <div className="home-hero">
        <div className="home-body">
          <img
            src="/logo_iaele.svg"
            alt="IA·ELE"
            className="home-logo-img reveal"
            data-testid="home-logo"
          />
          <p className="home-eyebrow reveal reveal--delay-1">Formación Docente ELE · laclasedigital.com</p>
          <h1 className="home-title reveal reveal--delay-1">
            <em>Inteligencia Artificial</em><br />para la enseñanza de ELE
          </h1>
          <p className="home-subtitle reveal reveal--delay-2">
            Curso de formación docente · Mayo 2026 · 20 horas · Precio fundador 149 €
          </p>

          <div className="test-card reveal reveal--delay-3" data-testid="home-cta-card">
            <span className="test-card__badge">⭐ Precio fundador · 149 € · Solo 20 plazas</span>
            <h2 className="test-card__title">Primera edición · mayo 2026</h2>
            <p className="test-card__desc">
              Formación práctica para integrar IA en tu práctica docente de ELE con criterio ético y
              pedagógico. 4 módulos, 3 videotutorías en directo y feedback personalizado del formador.
            </p>
            <div className="test-card__gift" data-testid="home-ebook-gift">
              <span className="test-card__gift-icon">📘</span>
              <span><strong>Incluye de regalo</strong> el libro <em>«Prompts que funcionan»</em> · 31 capítulos de ingeniería de prompts para docentes de ELE.</span>
            </div>
            <Link to="/precios" className="test-card__btn" data-testid="home-cta-precios">
              Ver precios e inscribirme →
            </Link>
          </div>

          <div className="home-divider">
            <div className="home-divider__line" />
            <span className="home-divider__text">Más información sobre el curso</span>
            <div className="home-divider__line" />
          </div>

          <div className="home-links">
            <Link to="/descripcion">Descripción y objetivos</Link>
            <Link to="/programa">Programa por módulos</Link>
            <Link to="/calendario">Calendario de videotutorías</Link>
            <Link to="/metodologia">Metodología y evaluación</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
