import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';

export default function ModuleDetail() {
  const { slug, moduleId } = useParams();
  const [data, setData] = useState(null);
  const [resources, setResources] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/course/${slug}/content`)
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.response?.data?.detail || 'Error'));
    api.get(`/course/${slug}/resources`).then((r) => {
      const m = (r.data.modules || []).find((x) => x.module_id === moduleId);
      setResources(m?.resources || []);
    }).catch(() => {});
  }, [slug, moduleId]);

  // Mark lessons as viewed when they appear on screen
  useEffect(() => {
    if (!data) return;
    const entry = data.modules.find((m) => m.module.id === moduleId);
    if (!entry || !entry.unlocked) return;
    entry.lessons.forEach((l) => {
      api.post(`/course/${slug}/lesson/view`, { lesson_id: l.id }).catch(() => {});
    });
  }, [data, moduleId, slug]);

  if (err) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem', color: 'var(--clm-red)' }}>{err}</div><Footer /></>;
  if (!data) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando…</div><Footer /></>;

  const entry = data.modules.find((m) => m.module.id === moduleId);
  if (!entry) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Módulo no encontrado.</div><Footer /></>;
  if (!entry.unlocked) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>🔒 Este módulo aún está bloqueado.</div><Footer /></>;

  const moduleResources = resources;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag={`Módulo ${entry.module.order}`}
          title={entry.module.title}
          desc={entry.module.description}
        />
        <div className="inner-content">
          <Link to={`/curso/${slug}`} style={{ color: 'var(--blue)', fontSize: '.875rem', marginBottom: '1rem', display: 'inline-block' }}>
            ← Volver al curso
          </Link>

          {entry.module.video_youtube_id && (
            <div className="module-video" data-testid="module-video">
              <iframe
                src={`https://www.youtube.com/embed/${entry.module.video_youtube_id}?rel=0&modestbranding=1`}
                title={`Vídeo del módulo ${entry.module.order}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {entry.lessons.map((l) => (
            <div key={l.id} className="lesson-body" data-testid={`module-lesson-${l.order}`}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{l.title}</h2>
              {l.video_url && (
                <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: 'var(--r-md)', marginBottom: '1rem' }}>
                  <iframe src={l.video_url} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'var(--r-md)' }} title={l.title} allow="fullscreen" />
                </div>
              )}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{l.content_md || ''}</ReactMarkdown>
            </div>
          ))}

          {entry.task && (
            <div className="lesson-body" style={{ borderLeft: '4px solid var(--clm-red)' }}>
              <p className="section__tag">📝 Tarea de este módulo</p>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '.5rem' }}>{entry.task.title}</h3>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.task.instructions_md || ''}</ReactMarkdown>
              <Link
                to={`/curso/${slug}/tarea/${entry.task.id}`}
                className="btn btn--primary"
                style={{ marginTop: '1rem' }}
                data-testid="module-go-task"
              >
                Abrir tarea →
              </Link>
            </div>
          )}

          {moduleResources.length > 0 && (
            <div className="dash-section" style={{ marginTop: '2rem' }} data-testid="module-resources">
              <h2 className="dash-title">📚 Materiales de este módulo</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.75rem' }}>
                {moduleResources.map((r) => (
                  <Link key={r.slug} to={`/recurso/${r.slug}`} className="res-card" data-testid={`module-resource-${r.slug}`}>
                    <span className="res-card__type">
                      {r.type === 'lectura' ? '📖' : r.type === 'plantilla' ? '📝' : r.type === 'rubrica' ? '✅' : '📄'} {r.type_label}
                    </span>
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
