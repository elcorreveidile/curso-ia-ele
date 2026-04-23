import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';

const CREDS = [
  { icon: '🎓', title: 'Licenciado en Filología Hispánica · Universidad de Granada', desc: 'Formación académica en lingüística, literatura y lengua española.' },
  { icon: '🖥️', title: 'Estudios de posgrado en Computer Science por la New York University, 2002', desc: 'Formación en ciencias de la computación que fundamenta mi comprensión técnica de los sistemas de inteligencia artificial desde sus bases.' },
  { icon: '🌐', title: 'Formador de Formadores · Instituto Cervantes', desc: 'Titulación del Instituto Cervantes en formación de profesores de ELE.' },
  { icon: '📱', title: 'Experto en e-Learning · Cámara de Comercio de Granada, 2006', desc: 'Más de veinte años trabajando con entornos virtuales de aprendizaje.' },
  { icon: '💻', title: 'Digitalización Aplicada al Sector Productivo · Ministerio de Educación y FP', desc: 'Titulación oficial que conecta transformación digital con contextos productivos reales.' },
  { icon: '🏛️', title: 'Docente de ELE · Centro de Lenguas Modernas · UGR', desc: 'Más de veinte años impartiendo ELE en programas CEH, CLCE, CILE, CELE y Study Abroad.' },
];

const PUBS = [
  'Versos sencillos para despistar a la poesía (2025)',
  'Baile de disfraces (2023)',
  'Todas las mentiras (2008)',
  'Día del espectador (1998)',
  'Un guiño, un cómplice, un deseo (1991)',
];

export default function SobreMi() {
  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="El formador"
          title="Javier Benítez Láinez"
          desc="Docente de ELE · Formador de Formadores Instituto Cervantes · Granada"
        />
        <div className="inner-content">
          <div className="bio-grid">
            <aside className="bio-sidebar">
              <img className="bio-avatar" src="/javier-benitez.jpg" alt="Javier Benítez Láinez" data-testid="sobre-mi-photo" />
              <p className="bio-name">Javier Benítez Láinez</p>
              <p className="bio-role">Docente de ELE · Filólogo Hispánico<br />Especialista en Digitalización Aplicada</p>
              <div className="bio-tags">
                <span className="bio-tag">ELE</span>
                <span className="bio-tag">IA aplicada</span>
                <span className="bio-tag">Formación docente</span>
                <span className="bio-tag--amber bio-tag">Poeta</span>
                <span className="bio-tag--amber bio-tag">Editor</span>
              </div>
              <div>
                <div className="bio-stat"><span className="bio-stat__num">30+</span><span>años de experiencia docente en ELE</span></div>
                <div className="bio-stat"><span className="bio-stat__num">NYU</span><span>Computer Science · Estudios de posgrado 2002</span></div>
                <div className="bio-stat"><span className="bio-stat__num">4</span><span>poemarios publicados</span></div>
                <div className="bio-stat"><span className="bio-stat__num">20+</span><span>años con e-learning</span></div>
              </div>
            </aside>

            <main>
              <div className="bio-section">
                <h2 className="bio-section__title">Quién soy</h2>
                <p className="bio-text">
                  Nací en Estepona en 1969 y desde 1987 vivo en Granada, ciudad que me ha formado y a
                  la que pertenezco. Soy licenciado en Filología Hispánica por la Universidad de
                  Granada y llevo más de treinta años enseñando español a personas de todo el mundo.
                </p>
                <p className="bio-text">
                  Durante todo ese tiempo he tenido una certeza: la enseñanza de idiomas es un acto
                  humano que no puede reducirse a técnica. Pero también he aprendido que la técnica,
                  cuando está bien usada, libera tiempo para lo que de verdad importa en el aula.
                </p>
                <p className="bio-text">
                  Hace algo más de un año empecé a investigar en serio cómo integrar la inteligencia
                  artificial en mi práctica docente. No como usuario curioso, sino con criterio
                  pedagógico: qué funciona, qué no, dónde la IA ayuda al docente y dónde lo sustituye
                  de una manera que no nos conviene. Este curso es el resultado de ese año de trabajo.
                </p>
              </div>

              <div className="bio-section">
                <h2 className="bio-section__title">Formación y titulaciones</h2>
                <div className="cred-list">
                  {CREDS.map((c, i) => (
                    <div key={i} className="cred-item">
                      <div className="cred-item__icon">{c.icon}</div>
                      <div>
                        <p className="cred-item__title">{c.title}</p>
                        <p className="cred-item__desc">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bio-section">
                <h2 className="bio-section__title">Más allá del aula</h2>
                <p className="bio-text">
                  Soy poeta. He publicado cuatro poemarios y varios cuadernillos. La escritura y la
                  lengua no son para mí herramientas de trabajo: son la manera en que entiendo el mundo.
                </p>
                <p className="bio-text">
                  Soy editor de <em>Olvidos de Granada</em>, revista de acciones culturales, y fundador de
                  <em> Letra Clara</em> y la Asociación Cultural del Diente de Oro. Estas actividades no son
                  anecdóticas en mi perfil como formador: me han enseñado a pensar críticamente sobre el
                  lenguaje, la cultura y la tecnología.
                </p>
              </div>

              <div className="bio-section">
                <h2 className="bio-section__title">Publicaciones</h2>
                <div className="pub-list">
                  {PUBS.map((p, i) => (
                    <div key={i} className="pub-item"><em>{p}</em></div>
                  ))}
                </div>
              </div>

              <div className="bio-section">
                <h2 className="bio-section__title">Por qué este curso</h2>
                <p className="bio-text">
                  La IA ya está en las aulas — en los teléfonos del alumnado, en las búsquedas de
                  información, en las traducciones automáticas. La pregunta no es si usarla, sino cómo
                  hacerlo de manera que sirva al aprendizaje real y no lo sabotee.
                </p>
                <p className="bio-text">
                  Este curso no es una guía de herramientas. Es una propuesta pedagógica para integrar
                  la IA en la enseñanza de ELE con criterio, con ética y con la experiencia docente
                  como eje.
                </p>
              </div>

              <div className="cta-box">
                <h3 className="cta-box__title">¿Empezamos juntos?</h3>
                <p className="cta-box__text">
                  Primera edición · Mayo 2026 · 20 plazas al precio fundador de 149 €. A partir de la
                  segunda edición el precio será 250 €.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/precios" className="btn btn--primary" data-testid="sobre-cta-precios">
                    Ver precios e inscripción
                  </Link>
                  <Link to="/contacto" className="btn" style={{ background: 'rgba(255,255,255,.1)', color: 'var(--white)', border: '1.5px solid rgba(255,255,255,.25)' }} data-testid="sobre-cta-contacto">
                    ✉ Escríbeme
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
