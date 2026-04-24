import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import FileUpload from '../../components/FileUpload';
import { api } from '../../lib/api';

export default function TaskDetail() {
  const { slug, taskId } = useParams();
  const [data, setData] = useState(null);
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    api.get(`/course/${slug}/task/${taskId}`).then((r) => setData(r.data)).catch((e) => setErr(e.response?.data?.detail || 'Error'));
  }, [slug, taskId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true); setErr('');
    try {
      await api.post(`/course/${slug}/task/${taskId}/submit`, { content_md: content, file_url: fileUrl || null });
      setContent(''); setFileUrl('');
      load();
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Error');
    }
    setSending(false);
  };

  if (err && !data) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem', color: 'var(--clm-red)' }}>{err}</div><Footer /></>;
  if (!data) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando…</div><Footer /></>;

  const pending = data.pending_resources || [];
  const canSubmit = data.can_submit !== false;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero tag="Tarea" title={data.task.title} desc={`Módulo ${data.module?.order}: ${data.module?.title}`} />
        <div className="inner-content">
          <Link to={`/curso/${slug}/modulo/${data.module.id}`} style={{ color: 'var(--blue)', fontSize: '.875rem', marginBottom: '1rem', display: 'inline-block' }}>
            ← Volver al módulo
          </Link>

          <div className="lesson-body" data-testid="task-instructions">
            <p className="section__tag">Instrucciones</p>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.task.instructions_md || ''}</ReactMarkdown>
          </div>

          {!canSubmit && pending.length > 0 && (
            <div className="info-box" style={{ borderLeft: '4px solid var(--clm-red)', marginBottom: '1.25rem' }} data-testid="task-gate-banner">
              <p className="info-box__title">📖 Antes de entregar, lee los materiales del módulo</p>
              <p style={{ marginBottom: '.75rem' }}>
                Te quedan <strong>{pending.length}</strong> {pending.length === 1 ? 'material por leer' : 'materiales por leer'} de este módulo.
                Una vez los leas, podrás enviar tu entrega.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }} data-testid="task-gate-list">
                {pending.map((r) => (
                  <li key={r.slug} style={{ marginBottom: '.35rem' }}>
                    <Link to={`/recurso/${r.slug}`} style={{ color: 'var(--blue)' }} data-testid={`task-gate-item-${r.slug}`}>
                      {r.title}
                    </Link>
                    <span style={{ fontSize: '.78rem', color: 'var(--ink-muted)', marginLeft: '.4rem' }}>· {r.type_label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {canSubmit && pending.length === 0 && (data.module_resources || []).length > 0 && (
            <div className="info-box" style={{ borderLeft: '4px solid #16A34A', marginBottom: '1.25rem' }} data-testid="task-gate-ok">
              <p style={{ margin: 0 }}>✓ Has leído todos los materiales del módulo. ¡Puedes entregar la tarea!</p>
            </div>
          )}

          <div className="lesson-body">
            <p className="section__tag">Entregar</p>
            <form onSubmit={submit} data-testid="task-submit-form">
              <div className="form-group">
                <label>Contenido de tu entrega (Markdown)</label>
                <textarea className="form-input" value={content} onChange={(e) => setContent(e.target.value)} required disabled={!canSubmit} data-testid="task-submit-content" />
              </div>
              <div className="form-group">
                <label>Archivo adjunto (opcional)</label>
                <FileUpload
                  testid="task-file-upload"
                  onUploaded={(info) => setFileUrl(info?.url || '')}
                />
                {fileUrl && (
                  <p style={{ fontSize: '.82rem', marginTop: '.4rem' }}>
                    📎 <a href={fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>Ver archivo subido</a>
                  </p>
                )}
              </div>
              {err && <p style={{ color: 'var(--clm-red)' }}>{err}</p>}
              <button className="btn btn--primary" disabled={sending || !canSubmit} data-testid="task-submit-btn">
                {sending ? 'Enviando…' : canSubmit ? 'Enviar entrega' : 'Lee primero los materiales'}
              </button>
            </form>
          </div>

          <div className="dash-section">
            <h2 className="dash-title">Mis entregas ({data.submissions.length})</h2>
            {data.submissions.length === 0 && <p style={{ color: 'var(--ink-muted)' }}>Aún no has enviado ninguna.</p>}
            {data.submissions.map((s) => (
              <div key={s.id} className={`sub-card ${s.status === 'reviewed' ? 'sub-card--reviewed' : ''}`} data-testid={`task-submission-${s.id}`}>
                <div className="sub-card__meta">
                  {new Date(s.submitted_at).toLocaleString('es-ES')} ·{' '}
                  {s.status === 'reviewed' ? (
                    <>
                      <span className="badge badge--reviewed">Revisada</span>
                      {s.grade != null && <span className="sub-card__grade" style={{ marginLeft: '.5rem' }}>Nota: {s.grade}/10</span>}
                    </>
                  ) : (
                    <span className="badge badge--pending">Pendiente</span>
                  )}
                </div>
                <div style={{ fontSize: '.9rem', whiteSpace: 'pre-wrap', marginBottom: '.5rem' }}>{s.content_md}</div>
                {s.file_url && <p style={{ fontSize: '.82rem' }}>📎 <a href={s.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>Archivo adjunto</a></p>}
                {s.feedback_md && (
                  <div style={{ background: 'var(--canvas)', padding: '.75rem 1rem', borderRadius: 'var(--r-sm)', marginTop: '.75rem', borderLeft: '3px solid var(--green)' }}>
                    <p className="section__tag" style={{ color: 'var(--green)' }}>Feedback del formador</p>
                    <div style={{ fontSize: '.88rem', color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>{s.feedback_md}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link to={`/curso/${slug}/tarea/${taskId}/foro`} className="btn btn--ghost" data-testid="task-open-forum">
              💬 Ir al foro de esta tarea
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
