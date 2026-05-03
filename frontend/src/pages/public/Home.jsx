import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="home-hero">
        <div className="home-body">
          <img
            src="/logo_iaele.svg"
            alt="IA·ELE"
            className="home-logo-img"
            data-testid="home-logo"
          />
          <p className="home-eyebrow">Formación Docente ELE · laclasedigital.com</p>
          <h1 className="home-title">
            <em>Inteligencia Artificial</em><br />para la enseñanza de ELE
          </h1>
          <p className="home-subtitle">
            Curso de formación docente · Mayo 2026 · 20 horas · Precio fundador 149 €
          </p>

          <div className="home-courses-grid">
            {/* Curso para profesores */}
            <div className="test-card test-card--profesores" data-testid="home-cta-card">
              <span className="test-card__badge test-card__badge--profesores">⭐ Precio fundador · 149 € · Solo 20 plazas</span>
              <h2 className="test-card__title">Primera edición · mayo 2026</h2>
              <p className="test-card__desc">
                Formación práctica para integrar IA en tu práctica docente de ELE con criterio ético y
                pedagógico. 4 módulos, 3 videotutorías en directo y feedback personalizado del formador.
              </p>
              <Link to="/precios" className="test-card__btn test-card__btn--profesores" data-testid="home-cta-precios">
                Ver precios e inscribirme →
              </Link>
            </div>

            {/* Curso gratuito para estudiantes */}
            <div className="test-card test-card--estudiantes">
              <span className="test-card__badge test-card__badge--estudiantes">🎓 Gratuito · Inscripción requerida · Para estudiantes</span>
              <h2 className="test-card__title">IA y español: aprende más, aprende mejor</h2>
              <p className="test-card__desc">
                Descubre cómo usar la inteligencia artificial para mejorar tu aprendizaje de español.
                6 módulos prácticos, alineados con MCER y PCIC. Totalmente gratuito.
              </p>
              <Link to="/login?redirect=/aprende/curso" className="test-card__btn test-card__btn--estudiantes">
                Inscribirme gratis →
              </Link>
            </div>
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
