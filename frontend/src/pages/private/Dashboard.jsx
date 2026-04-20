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
              {data.enrollments.map((e) => (
                <div key={e.enrollment.id} className="course-card" style={{ marginBottom: '1rem' }} data-testid={`dashboard-course-${e.course?.slug}`}>
                  <div style={{ flex: 1, minWidth: 240 }}>
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
                  </div>
                  <Link
                    to={`/curso/${e.course?.slug}`}
                    className="btn btn--primary"
                    data-testid={`dashboard-open-${e.course?.slug}`}
                  >
                    Entrar al curso →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
