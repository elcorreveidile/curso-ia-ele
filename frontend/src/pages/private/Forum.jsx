import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import ForumPost, { MarkdownHelp } from '../../components/ForumPost';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function Forum() {
  const { slug, taskId } = useParams();
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [parent, setParent] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    api.get(`/course/${slug}/task/${taskId}/threads`).then((r) => setPosts(r.data.posts));
  }, [slug, taskId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setErr('');
    try {
      await api.post(`/course/${slug}/task/${taskId}/threads`, { body_md: text, parent_id: parent });
      setText(''); setParent(null);
      load();
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Error');
    }
  };

  const handleReply = (postId) => {
    setParent(postId);
    document.getElementById('forum-textarea')?.focus();
  };

  const roots = posts.filter((p) => !p.parent_id);
  const children = (pid) => posts.filter((p) => p.parent_id === pid);

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero tag="Foro" title="Conversación de la tarea" desc="Comparte avances, dudas y reflexiones con tus compañeros/as." />
        <div className="inner-content" style={{ maxWidth: 800 }}>
          <Link to={`/curso/${slug}/tarea/${taskId}`} style={{ color: 'var(--blue)', fontSize: '.875rem', marginBottom: '1rem', display: 'inline-block' }}>
            ← Volver a la tarea
          </Link>

          {roots.length === 0 && <p style={{ color: 'var(--ink-muted)' }}>Aún no hay mensajes. ¡Empieza tú el debate!</p>}

          {roots.map((p) => (
            <div key={p.id}>
              <ForumPost
                post={p}
                currentUser={currentUser}
                onChange={load}
                onReply={handleReply}
              />
              {children(p.id).map((c) => (
                <ForumPost
                  key={c.id}
                  post={c}
                  currentUser={currentUser}
                  onChange={load}
                  childPost
                />
              ))}
            </div>
          ))}

          <form onSubmit={submit} style={{ marginTop: '2rem', background: 'var(--white)', padding: '1.25rem', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-sm)' }} data-testid="forum-form">
            {parent && (
              <div style={{ background: 'var(--blue-light)', padding: '.5rem .75rem', borderRadius: 'var(--r-sm)', marginBottom: '.75rem', fontSize: '.85rem' }}>
                Respondiendo a un comentario · <button type="button" onClick={() => setParent(null)} style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer' }}>cancelar</button>
              </div>
            )}
            <textarea
              id="forum-textarea"
              className="form-input"
              placeholder="Escribe tu mensaje…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              data-testid="forum-textarea"
            />
            <MarkdownHelp />
            {err && <p style={{ color: 'var(--clm-red)' }}>{err}</p>}
            <button className="btn btn--primary" style={{ marginTop: '.75rem' }} data-testid="forum-submit">
              Publicar mensaje
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
