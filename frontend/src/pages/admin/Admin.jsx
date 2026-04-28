import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';

export default function Admin() {
  const [data, setData] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    api.get('/admin/overview').then((r) => setData(r.data));
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleFounder = async (courseId, current) => {
    await api.patch(`/admin/course/${courseId}`, { is_founder_edition: !current });
    load();
  };

  const toggleModule = async (moduleId, unlocked) => {
    await api.patch(`/admin/module/${moduleId}`, { unlocked: !unlocked });
    load();
  };

  const submitFeedback = async (subId) => {
    setErr('');
    try {
      await api.post(`/admin/submission/${subId}/feedback`, {
        feedback_md: feedback,
        grade: grade === '' ? null : Number(grade),
      });
      setEditingSub(null); setFeedback(''); setGrade('');
      load();
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Error');
    }
  };

  const issueCertificate = async (enrollmentId) => {
    try {
      const r = await api.post('/admin/certificate/issue', { enrollment_id: enrollmentId, hours: 20 });
      alert(`Certificado emitido · ID: ${r.data.id.slice(0, 8).toUpperCase()}\nEnlace público: /certificado/${r.data.id}`);
      load();
    } catch (ex) {
      alert(ex.response?.data?.detail || 'Error emitiendo certificado');
    }
  };

  const deleteEnrollment = async (enrollmentId, email) => {
    if (!window.confirm(`¿Eliminar definitivamente la inscripción de ${email}?\n\nSe borrarán también sus entregas, mensajes en foro, progreso y certificado.\nEsta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/admin/enrollment/${enrollmentId}`);
      load();
    } catch (ex) {
      alert(ex.response?.data?.detail || 'Error eliminando inscripción');
    }
  };

  const [reseeding, setReseeding] = useState(false);
  const reseedResources = async () => {
    setReseeding(true);
    try {
      const r = await api.post('/admin/resources/reseed');
      alert(`Reescaneo completado.\nTotal de recursos en la base: ${r.data.total}`);
    } catch (ex) {
      alert(ex.response?.data?.detail || 'Error reescaneando materiales');
    }
    setReseeding(false);
  };

  if (!data) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando…</div><Footer /></>;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero tag="Administración" title="Panel del formador" desc="Gestiona cursos, inscripciones, módulos y entregas." />
        <div className="inner-content">

          <div className="dash-section">
            <h2 className="dash-title">Cursos</h2>
            {data.courses.map((c) => (
              <div key={c.id} className="course-card" style={{ marginBottom: '1rem', flexWrap: 'wrap' }} data-testid={`admin-course-${c.slug}`}>
                <div style={{ flex: '1 1 320px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)' }}>{c.title}</h3>
                  <p style={{ fontSize: '.85rem', color: 'var(--ink-muted)' }}>
                    {c.enrollments_count} inscritos · {c.founder_seats_taken}/{c.founder_seats} plazas fundador · Precio actual:{' '}
                    <strong>
                      {c.is_founder_edition && c.founder_seats_taken < c.founder_seats
                        ? `${(c.price_founder_eur / 100).toFixed(0)} € (fundador)`
                        : `${(c.price_eur / 100).toFixed(0)} €`}
                    </strong>
                  </p>
                  <IntroVideoEditor course={c} onDone={load} />
                </div>
                <button className="btn btn--ghost" onClick={() => toggleFounder(c.id, c.is_founder_edition)} data-testid={`admin-toggle-founder-${c.slug}`}>
                  {c.is_founder_edition ? 'Desactivar fundador' : 'Activar fundador'}
                </button>
              </div>
            ))}
          </div>

          <div className="dash-section">
            <h2 className="dash-title">Matricular manualmente</h2>
            <ManualEnrollForm onDone={load} />
          </div>

          <div className="dash-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
              <h2 className="dash-title" style={{ marginBottom: 0 }}>Inscripciones ({data.enrollments.length})</h2>
              <a
                href={`${process.env.REACT_APP_BACKEND_URL}/api/admin/export/enrollments.csv`}
                download
                className="btn btn--ghost"
                style={{ fontSize: '.82rem', padding: '.45rem 1rem' }}
                onClick={(e) => {
                  const token = localStorage.getItem('lcd_token');
                  if (!token) return;
                  e.preventDefault();
                  fetch(e.currentTarget.href, { headers: { Authorization: `Bearer ${token}` } })
                    .then((r) => r.blob())
                    .then((b) => {
                      const url = URL.createObjectURL(b);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `inscripciones-${new Date().toISOString().slice(0,10)}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    });
                }}
                data-testid="admin-export-csv"
              >
                📥 Exportar a CSV
              </a>
            </div>
            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table className="admin-table" data-testid="admin-enrollments-table">
                <thead>
                  <tr><th>Email</th><th>Curso</th><th>Importe</th><th>Tipo</th><th>Fecha</th><th>Certificado</th><th></th></tr>
                </thead>
                <tbody>
                  {data.enrollments.map((e) => (
                    <tr key={e.enrollment.id}>
                      <td>{e.user?.email}</td>
                      <td>{e.course?.title}</td>
                      <td>{(e.enrollment.amount_paid_eur / 100).toFixed(2)} €</td>
                      <td>
                        <span className={`badge ${e.enrollment.was_founder ? 'badge--founder' : 'badge--standard'}`}>
                          {e.enrollment.was_founder ? 'Fundador' : 'Estándar'}
                        </span>
                      </td>
                      <td>{new Date(e.enrollment.paid_at).toLocaleDateString('es-ES')}</td>
                      <td>
                        <button
                          className="btn btn--ghost"
                          style={{ fontSize: '.78rem', padding: '.4rem .9rem' }}
                          onClick={() => issueCertificate(e.enrollment.id)}
                          data-testid={`admin-cert-${e.enrollment.id}`}
                        >
                          🏅 Emitir
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn--ghost"
                          style={{ fontSize: '.78rem', padding: '.4rem .7rem', color: 'var(--clm-red)', borderColor: 'var(--clm-red-light)' }}
                          onClick={() => deleteEnrollment(e.enrollment.id, e.user?.email || '')}
                          title="Eliminar inscripción"
                          data-testid={`admin-delete-enrollment-${e.enrollment.id}`}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dash-section">
            <UsersControl />
          </div>

          <div className="dash-section">
            <h2 className="dash-title">Entregas pendientes ({data.pending_submissions.length})</h2>
            {data.pending_submissions.length === 0 && <p style={{ color: 'var(--ink-muted)' }}>No hay entregas pendientes.</p>}
            {data.pending_submissions.map((p) => (
              <div key={p.submission.id} className="sub-card" style={{ marginBottom: '1rem' }} data-testid={`admin-submission-${p.submission.id}`}>
                <div className="sub-card__meta">
                  <strong>{p.user?.email}</strong> · {p.task?.title} · {new Date(p.submission.submitted_at).toLocaleString('es-ES')}
                </div>
                <div style={{ fontSize: '.9rem', whiteSpace: 'pre-wrap', marginBottom: '.75rem' }}>{p.submission.content_md}</div>
                {p.submission.file_url && <p style={{ fontSize: '.82rem' }}>📎 <a href={p.submission.file_url} target="_blank" rel="noreferrer">Archivo</a></p>}

                {editingSub === p.submission.id ? (
                  <div style={{ marginTop: '.75rem' }}>
                    <textarea
                      className="form-input"
                      placeholder="Feedback…"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      data-testid="admin-feedback-text"
                    />
                    <input
                      className="form-input"
                      style={{ maxWidth: 140, marginTop: '.5rem' }}
                      type="number" min="0" max="10"
                      placeholder="Nota 0-10"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      data-testid="admin-feedback-grade"
                    />
                    {err && <p style={{ color: 'var(--clm-red)' }}>{err}</p>}
                    <div style={{ marginTop: '.5rem', display: 'flex', gap: '.5rem' }}>
                      <button className="btn btn--primary" onClick={() => submitFeedback(p.submission.id)} data-testid="admin-feedback-save">Guardar y enviar</button>
                      <button className="btn btn--ghost" onClick={() => { setEditingSub(null); setFeedback(''); setGrade(''); }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn--blue"
                    onClick={() => { setEditingSub(p.submission.id); setFeedback(''); setGrade(''); }}
                    data-testid={`admin-feedback-open-${p.submission.id}`}
                  >
                    Dar feedback
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="dash-section">
            <h2 className="dash-title">Control de módulos</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--ink-muted)', marginBottom: '.75rem' }}>
              Los módulos bloqueados no son accesibles para los estudiantes.
            </p>
            {/* Re-fetch modules through course content for display */}
            <ModulesControl />
          </div>

          <div className="dash-section">
            <h2 className="dash-title">Materiales del curso</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--ink-muted)', marginBottom: '.75rem' }}>
              Si añades o modificas archivos <code>.md</code> en <code>/app/legacy/materiales/</code>,
              pulsa este botón para que la plataforma vuelva a leerlos sin reiniciar el servidor.
            </p>
            <button
              className="btn btn--blue"
              onClick={reseedResources}
              disabled={reseeding}
              data-testid="admin-reseed-resources"
            >
              {reseeding ? 'Reescaneando…' : '🔄 Reescanear materiales'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function ModulesControl() {
  const [modules, setModules] = useState([]);
  const [editingVideo, setEditingVideo] = useState(null); // module.id
  const [videoDraft, setVideoDraft] = useState('');
  const [videoErr, setVideoErr] = useState('');
  const load = useCallback(() => {
    api.get('/course/ia-ele/content').then((r) => setModules(r.data.modules || []));
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (id, unlocked) => {
    await api.patch(`/admin/module/${id}`, { unlocked: !unlocked });
    load();
  };

  const reorder = async (moduleId, direction) => {
    await api.post('/admin/modules/reorder', { module_id: moduleId, direction });
    load();
  };

  const saveUnlockAt = async (id, dateStr) => {
    await api.patch(`/admin/module/${id}`, { unlock_at: dateStr || '' });
    load();
  };

  const startEditVideo = (m) => {
    setEditingVideo(m.module.id);
    setVideoDraft(m.module.video_youtube_id || '');
    setVideoErr('');
  };

  const saveVideo = async (id) => {
    setVideoErr('');
    try {
      await api.patch(`/admin/module/${id}`, { video_youtube_id: videoDraft.trim() });
      setEditingVideo(null);
      setVideoDraft('');
      load();
    } catch (e) {
      setVideoErr(e.response?.data?.detail || 'Error al guardar el vídeo');
    }
  };

  return (
    <div>
      {modules.map((m, idx) => (
        <div key={m.module.id} className={`module-row ${m.module.unlocked_at ? 'module-row--unlocked' : 'module-row--locked'}`}>
          <div className="reorder-btns">
            <button className="reorder-btn" onClick={() => reorder(m.module.id, 'up')} disabled={idx === 0} aria-label="Subir" data-testid={`admin-module-up-${m.module.order}`}>▲</button>
            <button className="reorder-btn" onClick={() => reorder(m.module.id, 'down')} disabled={idx === modules.length - 1} aria-label="Bajar" data-testid={`admin-module-down-${m.module.order}`}>▼</button>
          </div>
          <div className="module-row__num">{m.module.order}</div>
          <div style={{ flex: 1 }}>
            <div className="module-row__title">{m.module.title}</div>
            <div className="module-row__desc" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span>{m.module.unlocked_at ? 'Desbloqueado' : 'Bloqueado'}</span>
              <span>·</span>
              {editingVideo === m.module.id ? (
                <span style={{ display: 'flex', gap: '.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '.3rem .5rem', fontSize: '.82rem', minWidth: 240 }}
                    placeholder="ID o URL de YouTube"
                    value={videoDraft}
                    onChange={(e) => setVideoDraft(e.target.value)}
                    data-testid={`admin-module-video-input-${m.module.order}`}
                  />
                  <button className="btn btn--primary" style={{ padding: '.3rem .7rem', fontSize: '.78rem' }} onClick={() => saveVideo(m.module.id)} data-testid={`admin-module-video-save-${m.module.order}`}>Guardar</button>
                  <button className="btn btn--ghost" style={{ padding: '.3rem .6rem', fontSize: '.78rem' }} onClick={() => { setEditingVideo(null); setVideoDraft(''); setVideoErr(''); }}>Cancelar</button>
                  {videoErr && <span style={{ color: 'var(--clm-red)', fontSize: '.78rem' }} data-testid={`admin-module-video-err-${m.module.order}`}>{videoErr}</span>}
                </span>
              ) : (
                <button className="linkish" style={{ color: 'var(--blue)', fontSize: '.82rem' }} onClick={() => startEditVideo(m)} data-testid={`admin-module-video-edit-${m.module.order}`}>
                  🎥 {m.module.video_youtube_id ? `YT: ${m.module.video_youtube_id}` : 'Añadir vídeo YouTube'}
                </button>
              )}
              {!m.module.unlocked_at && (
                <>
                  <span>·</span>
                  <span style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.82rem' }} title="Desbloqueo automático">
                    📅
                    <input
                      type="date"
                      className="form-input"
                      style={{ padding: '.25rem .4rem', fontSize: '.78rem', width: 140 }}
                      defaultValue={m.module.unlock_at ? m.module.unlock_at.slice(0, 10) : ''}
                      onChange={(e) => saveUnlockAt(m.module.id, e.target.value)}
                      data-testid={`admin-module-unlock-date-${m.module.order}`}
                    />
                    {m.module.unlock_at && (
                      <span style={{ color: 'var(--ink-muted)', fontSize: '.72rem' }}>
                        Se desbloquea {new Date(m.module.unlock_at).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
          <button className="btn btn--ghost" onClick={() => toggle(m.module.id, !!m.module.unlocked_at)} data-testid={`admin-toggle-module-${m.module.order}`}>
            {m.module.unlocked_at ? 'Bloquear' : 'Desbloquear'}
          </button>
        </div>
      ))}
    </div>
  );
}

function ManualEnrollForm({ onDone }) {
  const [email, setEmail] = useState('');
  const [asFounder, setAsFounder] = useState(false);
  const [amountEur, setAmountEur] = useState('0');
  const [note, setNote] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(''); setResult(null);
    try {
      const r = await api.post('/admin/enrollment/manual', {
        email: email.trim(),
        course_slug: 'ia-ele',
        as_founder: asFounder,
        amount_eur: Number(amountEur) || 0,
        note: note.trim(),
        send_welcome_email: sendEmail,
      });
      setResult(r.data);
      setEmail(''); setAmountEur('0'); setNote(''); setAsFounder(false);
      onDone && onDone();
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Error al matricular');
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} data-testid="admin-manual-enroll-form">
      <p style={{ fontSize: '.88rem', color: 'var(--ink-muted)', margin: '0 0 1rem' }}>
        Inscribe a alguien sin pasar por Stripe (pago recibido por otra vía, plaza gratuita, reseña, etc.).
        Se crea la cuenta si no existe y se envía el email de bienvenida igual que con pago.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.75rem' }}>
        <div className="form-group">
          <label>Email del alumno</label>
          <input
            type="email" className="form-input" required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="nombre@email.com"
            data-testid="admin-manual-enroll-email"
          />
        </div>
        <div className="form-group">
          <label>Importe pagado (€)</label>
          <input
            type="number" step="0.01" min="0" className="form-input"
            value={amountEur}
            onChange={(ev) => setAmountEur(ev.target.value)}
            data-testid="admin-manual-enroll-amount"
          />
          <small style={{ color: 'var(--ink-muted)', fontSize: '.75rem' }}>0 = plaza gratuita</small>
        </div>
      </div>
      <div className="form-group">
        <label>Nota interna (opcional)</label>
        <input
          type="text" className="form-input" maxLength={200}
          value={note} onChange={(ev) => setNote(ev.target.value)}
          placeholder="Ej. Pago por Bizum · Revisora editorial · Beca"
          data-testid="admin-manual-enroll-note"
        />
      </div>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', margin: '.5rem 0 1rem' }}>
        <label style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.88rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={asFounder} onChange={(e) => setAsFounder(e.target.checked)} data-testid="admin-manual-enroll-founder" />
          ⭐ Asignar plaza fundador
        </label>
        <label style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.88rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} data-testid="admin-manual-enroll-send-email" />
          📧 Enviar email de bienvenida
        </label>
      </div>
      {err && <p style={{ color: 'var(--clm-red)', marginBottom: '.5rem' }} data-testid="admin-manual-enroll-error">{err}</p>}
      {result && (
        <div className="info-box" style={{ borderLeft: '4px solid #16A34A', marginBottom: '.75rem' }} data-testid="admin-manual-enroll-success">
          <p style={{ margin: 0 }}>
            ✓ {result.created ? 'Matriculado' : 'Ya estaba matriculado'} · Referencia <strong>{result.payment_reference}</strong>
          </p>
        </div>
      )}
      <button type="submit" className="btn btn--primary" disabled={busy} data-testid="admin-manual-enroll-submit">
        {busy ? 'Matriculando…' : 'Matricular alumno'}
      </button>
    </form>
  );
}


function IntroVideoEditor({ course, onDone }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(course.intro_video_youtube_id || '');
  const [err, setErr] = useState('');

  const save = async () => {
    setErr('');
    try {
      await api.patch(`/admin/course/${course.id}`, { intro_video_youtube_id: val.trim() });
      setEditing(false);
      onDone && onDone();
    } catch (e) {
      setErr(e.response?.data?.detail || 'Error');
    }
  };

  if (!editing) {
    return (
      <p style={{ fontSize: '.82rem', color: 'var(--ink-muted)', margin: '.25rem 0 0' }}>
        🎬 Vídeo de presentación:{' '}
        <button
          type="button"
          className="linkish"
          style={{ color: 'var(--blue)', background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: 'inherit' }}
          onClick={() => setEditing(true)}
          data-testid={`admin-course-intro-video-edit-${course.slug}`}
        >
          {course.intro_video_youtube_id ? `YT: ${course.intro_video_youtube_id}` : 'Añadir vídeo de introducción'}
        </button>
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '.4rem' }}>
      <input
        type="text" className="form-input"
        style={{ padding: '.3rem .5rem', fontSize: '.82rem', minWidth: 260 }}
        placeholder="URL o ID de YouTube"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        data-testid={`admin-course-intro-video-input-${course.slug}`}
      />
      <button className="btn btn--primary" style={{ padding: '.3rem .7rem', fontSize: '.78rem' }} onClick={save} data-testid={`admin-course-intro-video-save-${course.slug}`}>Guardar</button>
      <button className="btn btn--ghost" style={{ padding: '.3rem .6rem', fontSize: '.78rem' }} onClick={() => { setEditing(false); setVal(course.intro_video_youtube_id || ''); setErr(''); }}>Cancelar</button>
      {err && <span style={{ color: 'var(--clm-red)', fontSize: '.78rem' }}>{err}</span>}
    </div>
  );
}


function UsersControl() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');
  const [filter, setFilter] = useState(''); // search box
  const [selected, setSelected] = useState({}); // userId -> bool
  const [showBroadcast, setShowBroadcast] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setLoadErr('');
    api.get('/admin/users')
      .then((r) => {
        setUsers(r.data.users || []);
        setLoading(false);
      })
      .catch((ex) => {
        const msg = ex.response?.data?.detail
          || ex.response?.statusText
          || ex.message
          || 'Error desconocido';
        setLoadErr(`No se pudieron cargar los usuarios (HTTP ${ex.response?.status || '?'}): ${msg}`);
        setLoading(false);
      });
  }, []);
  useEffect(() => { load(); }, [load]);

  const removeUser = async (u) => {
    if (u.role === 'admin') return;
    const msg = `¿Eliminar definitivamente a ${u.email}?\n\nSe borrarán también:\n- ${u.enrollments_count} inscripción(es)\n- entregas, foros, progreso y certificados\n\nEsta acción no se puede deshacer.`;
    if (!window.confirm(msg)) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
      load();
    } catch (ex) {
      alert(ex.response?.data?.detail || 'Error al eliminar usuario');
    }
  };

  const bulkDelete = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) return;
    const msg = `¿Eliminar definitivamente a ${ids.length} usuario(s) seleccionados?\n\nSe borrarán también todas sus inscripciones, entregas, foros, progreso y certificados.\n\nEsta acción no se puede deshacer.`;
    if (!window.confirm(msg)) return;
    try {
      const r = await api.post('/admin/users/bulk-delete', { user_ids: ids });
      const parts = [`✓ ${r.data.deleted} usuario(s) eliminado(s)`];
      if (r.data.skipped_admin) parts.push(`${r.data.skipped_admin} admin(s) omitido(s)`);
      if (r.data.skipped_self) parts.push(`tu propio usuario omitido`);
      if (r.data.not_found) parts.push(`${r.data.not_found} no encontrado(s)`);
      alert(parts.join(' · '));
      setSelected({});
      load();
    } catch (ex) {
      alert(ex.response?.data?.detail || 'Error al eliminar usuarios');
    }
  };

  const filtered = users.filter((u) => {
    if (!filter) return true;
    const f = filter.toLowerCase();
    return (
      (u.email || '').toLowerCase().includes(f) ||
      (u.name || '').toLowerCase().includes(f) ||
      (u.surname || '').toLowerCase().includes(f)
    );
  });
  const selectedIds = Object.keys(selected).filter((k) => selected[k]);

  const toggleAll = (check) => {
    if (check) {
      const next = {};
      filtered.forEach((u) => { if (u.role !== 'admin') next[u.id] = true; });
      setSelected(next);
    } else {
      setSelected({});
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
        <h2 className="dash-title" style={{ marginBottom: 0 }}>
          Usuarios registrados ({users.length})
        </h2>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <input
            type="search"
            className="form-input"
            style={{ padding: '.4rem .7rem', fontSize: '.85rem', minWidth: 220 }}
            placeholder="Buscar por email o nombre…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            data-testid="admin-users-search"
          />
          <button
            className="btn btn--blue"
            style={{ fontSize: '.82rem', padding: '.45rem 1rem' }}
            onClick={() => setShowBroadcast(true)}
            data-testid="admin-users-broadcast-open"
          >
            ✉️ Enviar email{selectedIds.length > 0 ? ` (${selectedIds.length} seleccionados)` : ''}
          </button>
          {selectedIds.length > 0 && (
            <button
              className="btn btn--ghost"
              style={{ fontSize: '.82rem', padding: '.45rem 1rem', color: 'var(--clm-red)', borderColor: 'var(--clm-red-light)' }}
              onClick={bulkDelete}
              data-testid="admin-users-bulk-delete"
            >
              🗑 Eliminar {selectedIds.length} seleccionado{selectedIds.length === 1 ? '' : 's'}
            </button>
          )}
        </div>
      </div>
      <p style={{ fontSize: '.85rem', color: 'var(--ink-muted)', margin: '.5rem 0 1rem' }}>
        Lista completa de usuarios, hayan o no comprado el curso. Puedes
        eliminarlos o seleccionarlos para enviarles un email de marketing.
      </p>
      {loading ? (
        <p>Cargando…</p>
      ) : loadErr ? (
        <div className="info-box" style={{ borderLeft: '4px solid var(--clm-red)' }} data-testid="admin-users-load-error">
          <p style={{ margin: 0 }}>⚠️ {loadErr}</p>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ marginTop: '.5rem', fontSize: '.82rem' }}
            onClick={load}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" data-testid="admin-users-table">
            <thead>
              <tr>
                <th style={{ width: 30 }}>
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos"
                    onChange={(e) => toggleAll(e.target.checked)}
                    checked={
                      filtered.filter((u) => u.role !== 'admin').length > 0 &&
                      filtered.filter((u) => u.role !== 'admin').every((u) => selected[u.id])
                    }
                    data-testid="admin-users-select-all"
                  />
                </th>
                <th>Email</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Inscripciones</th>
                <th>Registro</th>
                <th>Marketing</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} data-testid={`admin-user-row-${u.id}`}>
                  <td>
                    {u.role !== 'admin' && (
                      <input
                        type="checkbox"
                        checked={!!selected[u.id]}
                        onChange={(e) => setSelected({ ...selected, [u.id]: e.target.checked })}
                        aria-label={`Seleccionar ${u.email}`}
                        data-testid={`admin-user-select-${u.id}`}
                      />
                    )}
                  </td>
                  <td style={{ wordBreak: 'break-all' }}>{u.email}</td>
                  <td>{[u.name, u.surname].filter(Boolean).join(' ') || <span style={{ color: 'var(--ink-muted)' }}>—</span>}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge--founder' : 'badge--standard'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Estudiante'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{u.enrollments_count}</td>
                  <td style={{ fontSize: '.82rem' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '—'}
                  </td>
                  <td style={{ fontSize: '.82rem' }}>
                    {u.marketing_consent === false
                      ? <span style={{ color: 'var(--clm-red)' }}>❌ Baja</span>
                      : <span style={{ color: '#16A34A' }}>✓ Activo</span>}
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        className="btn btn--ghost"
                        style={{ fontSize: '.78rem', padding: '.4rem .7rem', color: 'var(--clm-red)', borderColor: 'var(--clm-red-light)' }}
                        onClick={() => removeUser(u)}
                        title={`Eliminar ${u.email}`}
                        data-testid={`admin-delete-user-${u.id}`}
                      >
                        🗑
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ink-muted)', padding: '1.25rem' }}>Sin resultados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showBroadcast && (
        <BroadcastModal
          selectedIds={selectedIds}
          onClose={() => setShowBroadcast(false)}
          onSent={() => { setShowBroadcast(false); setSelected({}); }}
        />
      )}
    </>
  );
}

function BroadcastModal({ selectedIds, onClose, onSent }) {
  const [target, setTarget] = useState(selectedIds.length > 0 ? 'selected' : 'not_enrolled');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const send = async (e) => {
    e.preventDefault();
    setErr(''); setResult(null);
    if (!subject.trim() || !body.trim()) {
      setErr('Asunto y mensaje son obligatorios');
      return;
    }
    setBusy(true);
    try {
      const payload = { subject: subject.trim(), body_md: body.trim(), target };
      if (target === 'selected') payload.user_ids = selectedIds;
      const r = await api.post('/admin/users/broadcast', payload);
      setResult(r.data);
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Error al enviar');
    }
    setBusy(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="admin-broadcast-modal"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,22,40,.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div
        style={{
          background: 'var(--canvas, #FFFCF4)', borderRadius: 14, padding: '1.75rem',
          maxWidth: 620, width: '100%', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(15,76,129,.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>✉️ Email a usuarios</h3>
          <button
            type="button"
            className="linkish"
            style={{ background: 'none', border: 0, fontSize: '1.4rem', cursor: 'pointer', color: 'var(--ink-muted)' }}
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {result ? (
          <div data-testid="admin-broadcast-result">
            <div className="info-box" style={{ borderLeft: '4px solid #16A34A', marginBottom: '1rem' }}>
              <p style={{ margin: 0 }}>
                ✓ <strong>{result.sent}</strong> emails enviados.
                {result.skipped_audience > 0 && ` · ${result.skipped_audience} fuera del público objetivo.`}
                {result.skipped_optout > 0 && ` · ${result.skipped_optout} dados de baja.`}
                {result.skipped_admin > 0 && ` · ${result.skipped_admin} admin(s) excluido(s).`}
                {result.failed > 0 && ` · ${result.failed} fallidos.`}
              </p>
            </div>
            <button className="btn btn--primary" onClick={onSent} data-testid="admin-broadcast-close">Cerrar</button>
          </div>
        ) : (
          <form onSubmit={send}>
            <div className="form-group">
              <label>Destinatarios</label>
              <select
                className="form-input"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                data-testid="admin-broadcast-target"
              >
                {selectedIds.length > 0 && (
                  <option value="selected">Seleccionados ({selectedIds.length})</option>
                )}
                <option value="all">Todos los usuarios</option>
                <option value="not_enrolled">Solo NO matriculados (leads)</option>
                <option value="enrolled">Solo matriculados</option>
              </select>
              <small style={{ color: 'var(--ink-muted)', fontSize: '.78rem' }}>
                Se excluyen administradores y usuarios dados de baja del marketing automáticamente.
              </small>
            </div>
            <div className="form-group">
              <label>Asunto</label>
              <input
                type="text"
                className="form-input"
                maxLength={200}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej. Últimos días para la plaza fundador"
                data-testid="admin-broadcast-subject"
              />
            </div>
            <div className="form-group">
              <label>Mensaje (admite **negrita**, *cursiva* y [enlaces](https://…))</label>
              <textarea
                className="form-input"
                rows={9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={'Hola,\n\nTe escribo porque…\n\nUn abrazo,\nJavier'}
                data-testid="admin-broadcast-body"
              />
              <small style={{ color: 'var(--ink-muted)', fontSize: '.78rem' }}>
                Cada email incluye automáticamente un enlace de baja (RGPD).
              </small>
            </div>
            {err && <p style={{ color: 'var(--clm-red)' }} data-testid="admin-broadcast-error">{err}</p>}
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={busy}
                data-testid="admin-broadcast-send"
              >
                {busy ? 'Enviando…' : 'Enviar email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
