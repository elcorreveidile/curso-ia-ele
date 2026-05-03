import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../lib/auth';

const HERO = {
  tag: 'Curso gratuito · Acceso libre',
  title: 'IA y español',
  subtitle: 'Aprende más, aprende mejor',
  desc: 'Un curso gratuito y abierto para cualquier estudiante de español que quiera usar la inteligencia artificial con criterio.',
  cta_primary: { label: 'Empezar el curso', to: '/aprende/modulo/intro' },
  cta_secondary: { label: 'Ver el programa', to: '/aprende/programa' },
  badges: ['Gratuito', 'Alineado con el MCER', 'Instituto Cervantes'],
};

const REASONS = [
  {
    icon: '🎯',
    title: 'No trucos. Criterio.',
    text: 'No vamos a hablar de prompts mágicos. Vamos a hablar de cómo pensar con la IA en lugar de dejar que piense por ti.',
  },
  {
    icon: '🌍',
    title: 'Para todos los niveles',
    text: 'Desde A2 hasta C2. Con atención especial a estudiantes de lenguas tipológicamente alejadas del español.',
  },
  {
    icon: '📚',
    title: 'Alineado con el MCER y el PCIC',
    text: 'Todos los contenidos y actividades siguen las directrices del Marco Común Europeo y el Plan Curricular del Instituto Cervantes.',
  },
  {
    icon: '🤝',
    title: 'Con opción de acompañamiento',
    text: 'El curso es gratuito y autónomo. Si quieres feedback real, puedes reservar una sesión individual (45 €) o grupal (15 €).',
  },
];

const REQUIREMENTS = [
  'Acceso a un chatbot de IA gratuito (ChatGPT, Claude, Gemini u otro)',
  'Ganas de experimentar y reflexionar',
  'Nivel de español A2 o superior para seguir las instrucciones',
];

export default function AprendeCursoHome() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initCourse = async () => {
      // Esperar a que la autenticación cargue
      if (authLoading) return;

      // Si no hay usuario autenticado, redirigir a login
      if (!user) {
        navigate('/login?redirect=/aprende/curso');
        return;
      }

      try {
        // Verificar si ya existe inscripción en Supabase
        const { data: existingEnrollment, error: fetchError } = await supabase
          .from('free_course_enrollments')
          .select('*')
          .eq('student_email', user.email)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // Error real (no es "not found")
          throw fetchError;
        }

        if (!existingEnrollment) {
          // Crear nueva inscripción
          const { error: insertError } = await supabase
            .from('free_course_enrollments')
            .insert({
              student_name: user.name || user.email.split('@')[0],
              student_email: user.email,
              current_module: 'intro',
              modules_completed: [],
            });

          if (insertError) throw insertError;

          setStudentName(user.name || user.email.split('@')[0]);
        } else {
          // Ya existe inscripción
          setStudentName(existingEnrollment.student_name);
        }

        // Actualizar last_accessed
        await supabase
          .from('free_course_enrollments')
          .update({ last_accessed: new Date().toISOString() })
          .eq('student_email', user.email);

      } catch (err) {
        console.error('Error al verificar/crear inscripción:', err);
      } finally {
        setLoading(false);
      }
    };

    initCourse();
  }, [user, authLoading, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="inner-page" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-muted)' }}>Verificando inscripción...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag={HERO.tag}
          title={HERO.title}
          desc={HERO.subtitle}
        />
        <div className="inner-content">
          {/* Welcome message */}
          {studentName && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(74,144,226,0.1) 0%, rgba(52,168,83,0.1) 100%)',
              border: '1px solid rgba(74,144,226,0.2)',
              borderRadius: 'var(--r-md)',
              padding: '1rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <span style={{ fontSize: '1.5rem' }}>👋</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--ink)' }}>
                  <strong>¡Hola de nuevo, {studentName}!</strong>
                </p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                  Continúa donde lo dejaste
                </p>
              </div>
            </div>
          )}

          {/* Hero description */}
          <div style={{ maxWidth: '720px', marginBottom: '3rem' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink-soft)', lineHeight: '1.8' }}>
              {HERO.desc}
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              {HERO.badges.map((badge, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    padding: '0.3rem 0.8rem',
                    background: 'var(--clm-red-light)',
                    color: 'var(--clm-red)',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <Link
                to={HERO.cta_primary.to}
                className="btn btn--primary"
                style={{ justifyContent: 'center' }}
              >
                {HERO.cta_primary.label} →
              </Link>
              <Link
                to={HERO.cta_secondary.to}
                className="btn btn--outline"
                style={{ justifyContent: 'center' }}
              >
                {HERO.cta_secondary.label}
              </Link>
            </div>
          </div>

          {/* Por qué este curso */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--ink)',
              marginBottom: '2rem',
            }}>
              Por qué este curso
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}>
              {REASONS.map((reason, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--canvas)',
                    padding: '1.5rem',
                    borderRadius: 'var(--r-md)',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{reason.icon}</div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: 'var(--ink)',
                    marginBottom: '0.5rem',
                  }}>
                    {reason.title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', lineHeight: '1.6' }}>
                    {reason.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Qué necesitas */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--ink)',
              marginBottom: '1.5rem',
            }}>
              Qué necesitas
            </h2>
            <div style={{
              background: 'var(--canvas)',
              padding: '2rem',
              borderRadius: 'var(--r-md)',
            }}>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                {REQUIREMENTS.map((req, i) => (
                  <li
                    key={i}
                    style={{
                      padding: '0.75rem 0',
                      borderBottom: i < REQUIREMENTS.length - 1 ? '1px solid var(--canvas-alt)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ color: 'var(--clm-red)', fontSize: '1.2rem' }}>✓</span>
                    <span style={{ color: 'var(--ink-soft)' }}>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* CTA Sesiones */}
          <section style={{
            background: 'linear-gradient(135deg, #0F4C81 0%, #1a5a8f 100%)',
            borderRadius: 'var(--r-xl)',
            padding: '3rem',
            textAlign: 'center',
            color: 'white',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
            }}>
              ¿Quieres feedback real?
            </h2>
            <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
              El curso es gratuito, pero si quieres acompañamiento personalizado,
              puedes reservar sesiones individuales o grupales con el formador.
            </p>
            <Link
              to="/sesiones"
              className="btn"
              style={{
                background: 'white',
                color: '#0F4C81',
                display: 'inline-flex',
              }}
            >
              Ver sesiones disponibles →
            </Link>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
