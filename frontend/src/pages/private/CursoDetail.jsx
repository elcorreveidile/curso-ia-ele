import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';

export default function CursoDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/course/${slug}/content`)
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.response?.data?.detail || 'Error'));
  }, [slug]);

  if (err) return (
    <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>
      <p style={{ color: 'var(--clm-red)' }}>{err}</p>
    </div><Footer /></>
  );
  if (!data) return (
    <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando…</div><Footer /></>
  );

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Curso"
          title={data.course.title}
          desc={data.course.description}
        />
        <div className="inner-content">
          <div style={{ marginBottom: '1rem' }}>
            <Link
              to={`/curso/${slug}/recursos`}
              className="btn btn--ghost"
              style={{ fontSize: '.85rem' }}
              data-testid="curso-link-resources"
            >
              📚 Ver todos los materiales del curso
            </Link>
          </div>
          <div className="dash-section">
            <h2 className="dash-title">Módulos</h2>
            {data.modules.map((m) => (
              <div
                key={m.module.id}
                className={`module-row ${m.unlocked ? 'module-row--unlocked' : 'module-row--locked'}`}
                data-testid={`curso-module-${m.module.order}`}
              >
                <div className="module-row__num">{m.module.order}</div>
                <div style={{ flex: 1 }}>
                  <div className="module-row__title">{m.module.title}</div>
                  <div className="module-row__desc">{m.module.description}</div>
                </div>
                {m.unlocked ? (
                  <Link
                    to={`/curso/${slug}/modulo/${m.module.id}`}
                    className="btn btn--blue"
                    data-testid={`curso-open-module-${m.module.order}`}
                  >
                    Abrir →
                  </Link>
                ) : (
                  <span className="badge badge--pending">🔒 Bloqueado</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
