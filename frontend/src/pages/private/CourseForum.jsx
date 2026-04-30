import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';

/**
 * Course forum with three levels:
 *   - General course forum (default)
 *   - One forum per module (tabs)
 *   - (Task forums continue to live on the task page — unchanged.)
 *
 * URL:  /curso/:slug/foro?scope=general|module&key=<moduleId>
 */
export default function CourseForum() {
  const { slug } = useParams();
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const scope = sp.get('scope') || 'general';
  const scopeKey = scope === 'general' ? slug : sp.get('key') || '';

  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [parent, setParent] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/course/${slug}/content`)
      .then((r) => {
        setCourse(r.data.course);
        setModules(r.data.modules || []);
      })
      .catch((ex) => setErr(ex.response?.data?.detail || 'No se pudo cargar el curso'));
  }, [slug]);

  const load = useCallback(() => {
    if (!scopeKey) return;
    setLoading(true);
    api.get(`/course/${slug}/forum/${scope}/${scopeKey}/threads`)
      .then((r) => { setPosts(r.data.posts || []); setLoading(false); })
      .catch((ex) => {
        setErr(ex.response?.data?.detail || 'No se pudo cargar el foro');
        setLoading(false);
      });
  }, [slug, scope, scopeKey]);

  useEffect(() => { load(); }, [load]);

  const selectTab = (newScope, key) => {
    if (newScope === 'general') setSp({ scope: 'general' });
    else setSp({ scope: newScope, key });
    setParent(null); setText(''); setErr('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setErr('');
    try {
      await api.post(`/course/${slug}/forum/${scope}/${scopeKey}/threads`,
        { body_md: text, parent_id: parent });
      setText(''); setParent(null);
      load();
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Error al publicar');
    }
  };

  const roots = useMemo(() => posts.filter((p) => !p.parent_id), [posts]);
  const children = (pid) => posts.filter((p) => p.parent_id === pid);

  const tabTitle = useMemo(() => {
    if (scope === 'general') return 'Foro general del curso';
    const m = modules.find((x) => x.module.id === scopeKey);
    if (m) return `Módulo ${m.module.order} · ${m.module.title}`;
    return 'Foro del módulo';
  }, [scope, scopeKey, modules]);

  return (
    <>
      <Navbar />
      <PageHero
        tag="Foro"
        title={tabTitle}
        desc="Comparte dudas, descubrimientos y ejemplos con el resto de docentes. El foro es para toda la comunidad del curso."
      />
      <div className="inner-page" data-testid="course-forum">
        {/* Tabs */}
        <div
          style={{
            display: 'flex', gap: '.5rem', flexWrap: 'wrap',
            borderBottom: '1px solid var(--line)', paddingBottom: '.75rem', marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => selectTab('general', slug)}
            className="btn btn--ghost"
            style={{
              fontSize: '.85rem', padding: '.4rem .9rem',
              borderColor: scope === 'general' ? 'var(--blue)' : 'var(--line)',
              background: scope === 'general' ? 'var(--blue)' : 'transparent',
              color: scope === 'general' ? '#fff' : 'var(--ink-soft)',
              fontWeight: scope === 'general' ? 700 : 500,
            }}
            data-testid="forum-tab-general"
          >
            💬 General
          </button>
          {modules.map((m) => (
            <button
              key={m.module.id}
              type="button"
              onClick={() => selectTab('module', m.module.id)}
              className="btn btn--ghost"
              style={{
                fontSize: '.85rem', padding: '.4rem .9rem',
                borderColor: (scope === 'module' && scopeKey === m.module.id) ? 'var(--blue)' : 'var(--line)',
                background: (scope === 'module' && scopeKey === m.module.id) ? 'var(--blue)' : 'transparent',
                color: (scope === 'module' && scopeKey === m.module.id) ? '#fff' : 'var(--ink-soft)',
                fontWeight: (scope === 'module' && scopeKey === m.module.id) ? 700 : 500,
              }}
              data-testid={`forum-tab-module-${m.module.order}`}
            >
              Módulo {m.module.order}
            </button>
          ))}
          {course && (
            <button
              type="button"
              className="btn btn--ghost"
              style={{ fontSize: '.85rem', padding: '.4rem .9rem', marginLeft: 'auto' }}
              onClick={() => navigate(`/curso/${slug}`)}
              data-testid="forum-back-course"
            >
              ← Volver al curso
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ color: 'var(--ink-muted)' }}>Cargando…</p>
        ) : roots.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>
            Aún no hay mensajes en este foro. ¡Anímate a abrir el primero!
          </p>
        ) : (
          <div>
            {roots.map((p) => (
              <div key={p.id} className="thread-post" data-testid={`thread-${p.id}`}>
                <div className="thread-post__meta">
                  <strong>{p.user_email}</strong> ·{' '}
                  <span>{new Date(p.created_at).toLocaleString('es-ES')}</span>
                </div>
                <div className="thread-post__body">{p.body_md}</div>
                <button
                  type="button"
                  onClick={() => { setParent(p.id); document.getElementById('forum-textarea')?.focus(); }}
                  className="linkish"
                  data-testid={`thread-reply-${p.id}`}
                >
                  Responder
                </button>
                {children(p.id).map((c) => (
                  <div key={c.id} className="thread-post thread-post--child" data-testid={`thread-${c.id}`}>
                    <div className="thread-post__meta">
                      <strong>{c.user_email}</strong> ·{' '}
                      <span>{new Date(c.created_at).toLocaleString('es-ES')}</span>
                    </div>
                    <div className="thread-post__body">{c.body_md}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={submit}
          style={{
            marginTop: '2rem', background: 'var(--white)', padding: '1.25rem',
            borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-sm)',
          }}
          data-testid="forum-form"
        >
          {parent && (
            <p style={{ fontSize: '.85rem', color: 'var(--ink-muted)' }}>
              Respondiendo al mensaje seleccionado ·{' '}
              <button type="button" onClick={() => setParent(null)} className="linkish">
                cancelar
              </button>
            </p>
          )}
          <textarea
            id="forum-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe tu mensaje…"
            rows={4}
            className="form-input"
            data-testid="forum-textarea"
          />
          {err && <p style={{ color: 'var(--clm-red)' }}>{err}</p>}
          <button
            type="submit"
            className="btn btn--primary"
            style={{ marginTop: '.75rem' }}
            data-testid="forum-submit"
          >
            Publicar
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
