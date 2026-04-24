import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { BLOCKS, QUESTIONS, calcProfile } from '../../lib/quiz';
import { api } from '../../lib/api';

export default function Cuestionario() {
  const [blockIdx, setBlockIdx] = useState(0);
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const block = BLOCKS[blockIdx];
  const blockQs = useMemo(() => QUESTIONS.filter((q) => q.block === block.id), [block.id]);

  const update = (qid, v) => setValues((vals) => ({ ...vals, [qid]: v }));
  const toggleCheck = (qid, v) => setValues((vals) => {
    const cur = Array.isArray(vals[qid]) ? vals[qid] : [];
    return { ...vals, [qid]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] };
  });

  const canProceed = blockQs.every((q) => {
    if (!q.required) return true;
    const v = values[q.id];
    if (q.type === 'checkbox') return Array.isArray(v) && v.length > 0;
    return !!v;
  });

  const next = () => {
    setError('');
    if (!canProceed) { setError('Completa los campos obligatorios antes de continuar.'); return; }
    if (blockIdx < BLOCKS.length - 1) setBlockIdx(blockIdx + 1);
    else submit();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    setSending(true); setError('');
    const profile = calcProfile(values);
    try {
      await api.post('/quiz/submit', {
        nombre: values.nombre || '',
        email: values.email || '',
        answers: values,
        profile_key: profile.key,
        total_score: profile.total,
      });
    } catch (ex) {
      // Non-blocking: still show results
      console.warn('Quiz submit error', ex);
    }
    setResult(profile);
    setSending(false);
  };

  if (result) {
    const dims = [
      { label: 'Práctica docente', v: Math.round(result.dimensions.practice), icon: '🎓', color: '#0F4C81' },
      { label: 'Actitud ante IA', v: Math.round(result.dimensions.attitude), icon: '🧭', color: '#F5A623' },
      { label: 'Uso real de IA', v: Math.round(result.dimensions.usage), icon: '🤖', color: '#16A34A' },
    ];
    return (
      <>
        <Navbar />
        <div className="inner-page">
          <div className="page-hero" style={{ background: `linear-gradient(160deg, ${result.profile.color} 0%, #0A1628 100%)` }}>
            <div className="page-hero__inner">
              <p className="page-hero__tag">Tu perfil docente</p>
              <h1 className="page-hero__title">
                <span style={{ fontSize: '1.2em', marginRight: '.5rem' }}>{result.profile.emoji}</span>
                {result.profile.name}
              </h1>
              <p className="page-hero__desc">
                Puntuación global <strong style={{ color: '#F5A623' }}>{result.total}/100</strong> · Gracias por tu tiempo
              </p>
            </div>
          </div>
          <div className="inner-content" style={{ maxWidth: 820 }}>
            <div className="quiz-result-card" data-testid="quiz-result">
              <div className="quiz-result-card__header">
                <span className="quiz-result-card__emoji">{result.profile.emoji}</span>
                <div>
                  <p className="section__tag" style={{ margin: 0 }}>Diagnóstico personalizado</p>
                  <h2 className="quiz-result-card__title">{result.profile.name}</h2>
                </div>
              </div>
              <p className="quiz-result-card__desc">{result.profile.desc}</p>

              <h3 className="quiz-result-card__section-title">Tu puntuación por dimensión</h3>
              <div className="quiz-dims">
                {dims.map((d, i) => (
                  <div key={i} className="quiz-dim" data-testid={`quiz-dim-${i}`}>
                    <div className="quiz-dim__label">
                      <span className="quiz-dim__icon">{d.icon}</span>
                      <span>{d.label}</span>
                      <span className="quiz-dim__val" style={{ color: d.color }}>{d.v}<small>/100</small></span>
                    </div>
                    <div className="quiz-dim__track">
                      <div className="quiz-dim__fill" style={{ width: `${d.v}%`, background: d.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="quiz-result-card__section-title">📚 Módulos clave para ti</h3>
              <ul className="quiz-modules">
                {result.profile.modules.map((m, i) => (
                  <li key={i} className="quiz-modules__item"><span className="quiz-modules__bullet">✓</span>{m}</li>
                ))}
              </ul>

              <div className="quiz-next-steps" data-testid="quiz-next-steps">
                <p className="section__tag" style={{ marginBottom: '.5rem' }}>Próximos pasos</p>
                <p style={{ margin: 0, fontSize: '.92rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                  He recibido tus respuestas y las tendré en cuenta para adaptar los contenidos.
                  Si te interesa, reserva plaza con el <strong>precio fundador</strong> antes de que se agoten.
                  Incluye el libro <em>«Prompts que funcionan»</em> de regalo.
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <Link to="/curso-ele/precios" className="btn btn--primary" data-testid="quiz-go-precios">Reservar plaza →</Link>
                <Link to="/curso-ele/programa" className="btn btn--ghost">Ver programa completo</Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const progress = ((blockIdx + 1) / BLOCKS.length) * 100;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Diagnóstico docente"
          title="Cuestionario de inicio"
          desc="Unos minutos para conocer tu punto de partida como docente y adaptar los contenidos del curso a las necesidades reales del grupo."
        />
        <div className="inner-content" style={{ maxWidth: 780 }}>
          <div style={{ marginBottom: '1.5rem' }} data-testid="quiz-progress">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
              <span style={{ fontSize: '.85rem', color: 'var(--ink-muted)' }}>
                Bloque {blockIdx + 1}/{BLOCKS.length} · {block.icon} {block.title}
              </span>
              <span style={{ fontSize: '.85rem', color: 'var(--blue)', fontWeight: 600 }}>{Math.round(progress)}%</span>
            </div>
            <div className="course-progress-bar"><div className="course-progress-bar__fill" style={{ width: `${progress}%` }} /></div>
          </div>

          <div className="price-card" data-testid={`quiz-block-${block.id}`}>
            {blockQs.map((q) => (
              <div key={q.id} className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '.92rem', textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontWeight: 600, marginBottom: '.6rem' }}>
                  {q.text} {q.required && <span style={{ color: 'var(--clm-red)' }}>*</span>}
                </label>
                {q.type === 'text' || q.type === 'email' ? (
                  <input
                    type={q.type} className="form-input" value={values[q.id] || ''}
                    onChange={(e) => update(q.id, e.target.value)}
                    data-testid={`quiz-q-${q.id}`}
                  />
                ) : q.type === 'textarea' ? (
                  <textarea
                    className="form-input" rows={3} value={values[q.id] || ''}
                    onChange={(e) => update(q.id, e.target.value)}
                    data-testid={`quiz-q-${q.id}`}
                  />
                ) : q.type === 'likert' ? (
                  <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.8rem' }}>
                    <span style={{ color: 'var(--ink-muted)', minWidth: 80 }}>Nada</span>
                    {[1,2,3,4,5].map((n) => (
                      <label key={n} style={{ flex: 1, cursor: 'pointer' }}>
                        <input
                          type="radio" name={q.id} value={n}
                          checked={String(values[q.id]) === String(n)}
                          onChange={() => update(q.id, n)}
                          style={{ display: 'none' }}
                          data-testid={`quiz-q-${q.id}-${n}`}
                        />
                        <div style={{
                          padding: '.5rem', textAlign: 'center',
                          background: String(values[q.id]) === String(n) ? 'var(--blue)' : 'var(--canvas)',
                          color: String(values[q.id]) === String(n) ? '#fff' : 'var(--ink-soft)',
                          borderRadius: 'var(--r-sm)', fontWeight: 600,
                          transition: 'background .15s',
                        }}>{n}</div>
                      </label>
                    ))}
                    <span style={{ color: 'var(--ink-muted)', minWidth: 80, textAlign: 'right' }}>Mucho</span>
                  </div>
                ) : q.type === 'radio' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                    {q.options.map((opt) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.55rem .75rem', background: values[q.id] === opt ? 'var(--blue-light)' : 'var(--canvas)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '.9rem', transition: 'background .15s', textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontWeight: 500 }}>
                        <input type="radio" name={q.id} checked={values[q.id] === opt} onChange={() => update(q.id, opt)} data-testid={`quiz-q-${q.id}-opt`} />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : q.type === 'checkbox' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                    {q.options.map((opt) => {
                      const cur = Array.isArray(values[q.id]) ? values[q.id] : [];
                      const on = cur.includes(opt);
                      return (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.55rem .75rem', background: on ? 'var(--blue-light)' : 'var(--canvas)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '.9rem', transition: 'background .15s', textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontWeight: 500 }}>
                          <input type="checkbox" checked={on} onChange={() => toggleCheck(q.id, opt)} data-testid={`quiz-q-${q.id}-check`} />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}

            {error && <p style={{ color: 'var(--clm-red)', fontSize: '.9rem', marginBottom: '.75rem' }}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', marginTop: '1.5rem' }}>
              <button
                className="btn btn--ghost"
                onClick={() => { setBlockIdx(Math.max(0, blockIdx - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={blockIdx === 0}
                data-testid="quiz-prev"
              >
                ← Anterior
              </button>
              <button
                className="btn btn--primary"
                onClick={next}
                disabled={sending}
                data-testid="quiz-next"
              >
                {sending ? 'Enviando…' : blockIdx === BLOCKS.length - 1 ? 'Ver mi diagnóstico →' : 'Continuar →'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
