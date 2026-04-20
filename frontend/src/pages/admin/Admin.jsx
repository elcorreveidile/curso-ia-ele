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
              <div key={c.id} className="course-card" style={{ marginBottom: '1rem' }} data-testid={`admin-course-${c.slug}`}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)' }}>{c.title}</h3>
                  <p style={{ fontSize: '.85rem', color: 'var(--ink-muted)' }}>
                    {c.enrollments_count} inscritos · {c.founder_seats_taken}/{c.founder_seats} plazas fundador · Precio actual:{' '}
                    <strong>
                      {c.is_founder_edition && c.founder_seats_taken < c.founder_seats
                        ? `${(c.price_founder_eur / 100).toFixed(0)} € (fundador)`
                        : `${(c.price_eur / 100).toFixed(0)} €`}
                    </strong>
                  </p>
                </div>
                <button className="btn btn--ghost" onClick={() => toggleFounder(c.id, c.is_founder_edition)} data-testid={`admin-toggle-founder-${c.slug}`}>
                  {c.is_founder_edition ? 'Desactivar fundador' : 'Activar fundador'}
                </button>
              </div>
            ))}
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

  return (
    <div>
      {modules.map((m, idx) => (
        <div key={m.module.id} className={`module-row ${m.module.unlocked_at ? 'module-row--unlocked' : 'module-row--locked'}`}>
          <div className="reorder-btns">
            <button
              className="reorder-btn"
              onClick={() => reorder(m.module.id, 'up')}
              disabled={idx === 0}
              aria-label="Subir"
              data-testid={`admin-module-up-${m.module.order}`}
            >▲</button>
            <button
              className="reorder-btn"
              onClick={() => reorder(m.module.id, 'down')}
              disabled={idx === modules.length - 1}
              aria-label="Bajar"
              data-testid={`admin-module-down-${m.module.order}`}
            >▼</button>
          </div>
          <div className="module-row__num">{m.module.order}</div>
          <div style={{ flex: 1 }}>
            <div className="module-row__title">{m.module.title}</div>
            <div className="module-row__desc">
              {m.module.unlocked_at ? 'Desbloqueado' : 'Bloqueado'}
            </div>
          </div>
          <button
            className="btn btn--ghost"
            onClick={() => toggle(m.module.id, !!m.module.unlocked_at)}
            data-testid={`admin-toggle-module-${m.module.order}`}
          >
            {m.module.unlocked_at ? 'Bloquear' : 'Desbloquear'}
          </button>
        </div>
      ))}
    </div>
  );
}
