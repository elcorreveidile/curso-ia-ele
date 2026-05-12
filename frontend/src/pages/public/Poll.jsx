import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

/**
 * Public-facing poll page reached from the email link `/encuesta/:pollId?t=<magic>`.
 *
 * Flow:
 *   1. If a `?t=...` token comes in the URL we use it to log the user in
 *      (magic-link style) before anything else, then strip it from the URL.
 *   2. Fetch the poll. Show the options with checkbox/radio depending on
 *      `multi_choice`.
 *   3. Persist the vote with one click. The vote can be changed any time
 *      until the admin closes the poll.
 */
export default function Poll() {
  const { pollId } = useParams();
  const [sp, setSp] = useSearchParams();
  const { user, setToken, loading: authLoading } = useAuth();
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [bootstrapping, setBootstrapping] = useState(true);

  // 1. Magic token consumption (auto-login from email link).
  useEffect(() => {
    const t = sp.get('t');
    if (!t) { setBootstrapping(false); return; }
    api.post('/auth/verify', { token: t })
      .then((r) => {
        setToken(r.data.token);
        const next = new URLSearchParams(sp);
        next.delete('t');
        setSp(next, { replace: true });
      })
      .catch(() => {
        setErr('El enlace de acceso ha caducado. Inicia sesión y vuelve a abrir la encuesta.');
      })
      .finally(() => setBootstrapping(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Load the poll (re-runs when auth state becomes ready).
  useEffect(() => {
    if (bootstrapping || authLoading) return;
    api.get(`/poll/${pollId}`)
      .then((r) => {
        setPoll(r.data);
        setSelected(r.data.my_vote || []);
      })
      .catch((ex) => setErr(ex.response?.data?.detail || 'No se pudo cargar la encuesta'));
  }, [pollId, bootstrapping, authLoading, user?.id]);

  const toggle = (optId) => {
    if (!poll) return;
    if (poll.multi_choice) {
      setSelected((prev) =>
        prev.includes(optId) ? prev.filter((x) => x !== optId) : [...prev, optId],
      );
    } else {
      setSelected([optId]);
    }
  };

  const submit = async () => {
    if (!selected.length) return;
    setBusy(true); setErr('');
    try {
      await api.post(`/poll/${pollId}/vote`, { option_ids: selected });
      setDone(true);
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'No se pudo registrar tu voto');
    }
    setBusy(false);
  };

  return (
    <>
      <Navbar />
      <PageHero tag="Encuesta" title={poll?.question || 'Encuesta'} desc="Tu opinión cuenta. Marca la opción (o las opciones) que te vienen bien y pulsa enviar." />
      <div className="inner-page" data-testid="poll-page">
        {bootstrapping && <p style={{ color: 'var(--ink-muted)' }}>Conectando…</p>}
        {!bootstrapping && err && (
          <p style={{ color: 'var(--clm-red)' }} data-testid="poll-error">{err}</p>
        )}
        {!bootstrapping && !user && !err && (
          <p style={{ color: 'var(--ink-soft)' }}>
            Para votar tienes que iniciar sesión.{' '}
            <Link to="/login" style={{ color: 'var(--blue)' }}>Iniciar sesión</Link>
          </p>
        )}
        {poll && user && (
          <div style={{ maxWidth: 720 }}>
            {poll.intro_md && (
              <div
                style={{
                  background: 'var(--surface)', padding: '1rem 1.25rem',
                  borderRadius: 'var(--r-md)', marginBottom: '1.25rem',
                  boxShadow: 'var(--shadow-sm)', whiteSpace: 'pre-wrap',
                  fontSize: '.95rem', color: 'var(--ink-soft)', lineHeight: 1.6,
                }}
                data-testid="poll-intro"
              >
                {poll.intro_md}
              </div>
            )}
            {!poll.is_open && (
              <p
                style={{
                  background: 'var(--clm-red-light, #FFE9EB)', color: 'var(--clm-red)',
                  padding: '.55rem .9rem', borderRadius: 6, fontWeight: 600,
                }}
                data-testid="poll-closed"
              >
                🔒 Esta encuesta está cerrada. Ya no se aceptan votos.
              </p>
            )}
            {done && (
              <div
                style={{
                  background: 'var(--blue-light, #D6E8F7)', color: 'var(--blue)',
                  padding: '.9rem 1rem', borderRadius: 8, marginBottom: '1.25rem',
                  fontWeight: 600,
                }}
                data-testid="poll-saved"
              >
                ✅ Voto registrado. Si cambias de opinión, puedes volver a esta
                página y modificarlo mientras la encuesta esté abierta.
              </div>
            )}
            <p style={{ color: 'var(--ink-muted)', fontSize: '.82rem', marginBottom: '.5rem' }}>
              {poll.multi_choice
                ? 'Puedes marcar todas las opciones que te vengan bien.'
                : 'Selecciona una sola opción.'}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {poll.options.map((opt) => {
                const isSelected = selected.includes(opt.id);
                return (
                  <li key={opt.id} style={{ marginBottom: '.5rem' }}>
                    <label
                      style={{
                        display: 'flex', alignItems: 'center', gap: '.85rem',
                        padding: '.85rem 1rem',
                        background: isSelected ? 'var(--blue-light, #D6E8F7)' : 'var(--surface)',
                        borderRadius: 10,
                        border: isSelected ? '2px solid var(--blue)' : '2px solid transparent',
                        boxShadow: 'var(--shadow-sm)',
                        cursor: poll.is_open ? 'pointer' : 'not-allowed',
                        opacity: poll.is_open ? 1 : 0.7,
                        transition: 'all .15s',
                      }}
                      data-testid={`poll-option-${opt.id}`}
                    >
                      <input
                        type={poll.multi_choice ? 'checkbox' : 'radio'}
                        name={`poll-${poll.id}`}
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => toggle(opt.id)}
                        disabled={!poll.is_open || busy}
                        style={{ width: 18, height: 18 }}
                      />
                      <span style={{ flex: 1, fontSize: '.95rem', color: 'var(--ink)' }}>
                        {opt.label}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={submit}
              disabled={!selected.length || busy || !poll.is_open}
              className="btn btn--primary"
              style={{ marginTop: '1rem' }}
              data-testid="poll-submit"
            >
              {busy ? 'Guardando…' : (poll.my_vote?.length ? 'Actualizar mi voto' : 'Enviar mi voto')}
            </button>
            {poll.voted_at && !done && (
              <p style={{ fontSize: '.82rem', color: 'var(--ink-muted)', marginTop: '.65rem' }}>
                Último voto registrado: {new Date(poll.voted_at).toLocaleString('es-ES')}
              </p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
