import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';

const TYPE_EMOJI = {
  lectura: '📖',
  plantilla: '📝',
  rubrica: '✅',
  glosario: '📚',
  encuesta: '💬',
};

export default function CourseResources() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/course/${slug}/resources`).then((r) => setData(r.data)).catch((e) => setErr(e.response?.data?.detail || 'Error'));
  }, [slug]);

  if (err) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem', color: 'var(--clm-red)' }}>{err}</div><Footer /></>;
  if (!data) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando…</div><Footer /></>;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero tag="Materiales" title="Recursos del curso" desc="Lecturas, plantillas y rúbricas organizadas por módulo." />
        <div className="inner-content">
          <Link to={`/curso/${slug}`} style={{ color: 'var(--blue)', fontSize: '.875rem', marginBottom: '1rem', display: 'inline-block' }}>
            ← Volver al curso
          </Link>
          {data.modules.map((m) => (
            <div key={m.module_id} className="dash-section" data-testid={`resources-module-${m.order}`}>
              <h2 className="dash-title">
                <span style={{ color: 'var(--blue)', marginRight: '.5rem' }}>Módulo {m.order}</span>
                {m.title}
              </h2>
              {m.resources.length === 0 ? (
                <p style={{ color: 'var(--ink-muted)', fontSize: '.88rem' }}>Sin materiales asociados.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.75rem' }}>
                  {m.resources.map((r) => (
                    <Link key={r.slug} to={`/recurso/${r.slug}`} className="res-card" data-testid={`resource-card-${r.slug}`}>
                      <span className="res-card__type">{TYPE_EMOJI[r.type] || '📄'} {r.type_label}</span>
                      <span className="res-card__title">{r.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {data.transversal.length > 0 && (
            <div className="dash-section" data-testid="resources-transversal">
              <h2 className="dash-title">Materiales transversales</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.75rem' }}>
                {data.transversal.map((r) => (
                  <Link key={r.slug} to={`/recurso/${r.slug}`} className="res-card">
                    <span className="res-card__type">{TYPE_EMOJI[r.type] || '📄'} {r.type_label}</span>
                    <span className="res-card__title">{r.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
