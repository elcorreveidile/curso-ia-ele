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
            ✅ 1ª edición finalizada · 2ª edición · Septiembre 2026 · 20 horas · Plazas con descuento aún disponibles
          </p>

          <div className="test-card reveal reveal--delay-3" data-testid="home-cta-card">
            <span className="test-card__badge">⭐ Plazas con descuento aún disponibles · 149 €</span>
            <h2 className="test-card__title">Segunda edición · Septiembre 2026</h2>
            <p className="test-card__desc">
              La 1ª edición se cerró con todo el grupo certificado. Para la 2ª edición mantenemos
              las plazas fundador que quedaron sin cubrir: mismo precio (149 €), mismo formato y
              feedback personalizado del formador.
            </p>
            <div className="test-card__gift" data-testid="home-ebook-gift">
              <span className="test-card__gift-icon">📘</span>
              <span><strong>Incluye de regalo</strong> el libro <em>«Prompts que funcionan»</em> · 31 capítulos de ingeniería de prompts para docentes de ELE.</span>
            </div>
            <Link to="/precios" className="test-card__btn" data-testid="home-cta-precios">
              Reservar mi plaza →
            </Link>
          </div>

          <a
            href="https://claude.laclasedigital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="claude-card reveal reveal--delay-3"
            data-testid="home-claude-card"
          >
            <span className="claude-card__badge">✨ NUEVO CURSO</span>
            <h2 className="claude-card__title">
              Claude para la enseñanza<br />
              <span className="claude-card__sub">Domina la herramienta · 20 h · 149 €</span>
            </h2>
            <p className="claude-card__desc">
              Formación intensiva sobre Claude para docentes de cualquier materia.
              De los prompts a Projects, artefactos HTML, evaluación formativa y Claude Code.
              3 videotutorías en directo · Certificado de aprovechamiento.
            </p>
            <span className="claude-card__cta">
              Ir al curso de Claude →
            </span>
          </a>

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
