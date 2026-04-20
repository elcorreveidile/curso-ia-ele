import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/dashboard').then((r) => setData(r.data));
  }, []);

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Mi área privada"
          title={`Hola, ${user?.name || user?.email?.split('@')[0] || 'docente'}`}
          desc="Desde aquí puedes acceder a tus cursos, entregar tareas y consultar tu feedback."
        />
        <div className="inner-content">
          {!data ? (
            <p>Cargando…</p>
          ) : data.enrollments.length === 0 ? (
            <div className="info-box" style={{ borderLeft: '4px solid var(--clm-red)' }}>
              <p className="info-box__title">Aún no estás inscrito en ningún curso</p>
              <p style={{ marginBottom: '1rem' }}>
                Inscríbete en <strong>IA para la enseñanza de ELE</strong> para empezar.
              </p>
              <Link to="/inscripcion/ia-ele" className="btn btn--primary" data-testid="dashboard-enroll-cta">
                Inscribirme ahora →
              </Link>
            </div>
          ) : (
            <div className="dash-section">
              <h2 className="dash-title">Mis cursos</h2>
              {data.enrollments.map((e) => {
                const p = e.progress || { percent: 0, lessons_viewed: 0, lessons_total: 0, tasks_submitted: 0, tasks_total: 0, tasks_reviewed: 0 };
                return (
                  <div key={e.enrollment.id} className="course-card" style={{ marginBottom: '1rem' }} data-testid={`dashboard-course-${e.course?.slug}`}>
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--ink)' }}>
                        {e.course?.title}
                      </h3>
                      <p style={{ fontSize: '.9rem', color: 'var(--ink-muted)', marginTop: '.25rem' }}>
                        {e.course?.description?.split('.')[0]}.
                      </p>
                      {e.enrollment.was_founder && (
                        <span className="badge badge--founder" style={{ marginTop: '.5rem', display: 'inline-block' }}>
                          Precio fundador pagado
                        </span>
                      )}
                      <div style={{ marginTop: '1rem' }} data-testid={`dashboard-progress-${e.course?.slug}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: 'var(--ink-muted)', marginBottom: '.3rem' }}>
                          <span>Progreso del curso</span>
                          <span style={{ fontWeight: 600, color: 'var(--blue)' }}>{p.percent}%</span>
                        </div>
                        <div className="course-progress-bar"><div className="course-progress-bar__fill" style={{ width: `${p.percent}%` }} /></div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '.6rem', fontSize: '.8rem', color: 'var(--ink-muted)', flexWrap: 'wrap' }}>
                          <span>📖 {p.lessons_viewed}/{p.lessons_total} lecciones</span>
                          <span>📝 {p.tasks_submitted}/{p.tasks_total} entregas</span>
                          <span>✅ {p.tasks_reviewed} con feedback</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/curso/${e.course?.slug}`}
                      className="btn btn--primary"
                      data-testid={`dashboard-open-${e.course?.slug}`}
                    >
                      {p.percent > 0 ? 'Continuar curso →' : 'Entrar al curso →'}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
