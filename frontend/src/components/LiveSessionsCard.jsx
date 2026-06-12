import React from 'react';

/**
 * Live videotutoría card shown inside a course page (`/curso/:slug`).
 *
 * Each course defines its own Zoom room and session schedule under
 * SESSIONS_BY_COURSE keyed by course slug. When you launch a new edition
 * (or a new course entirely), add an entry there — the dashboard / course
 * page picks it up automatically.
 *
 * The component renders the *next* upcoming session prominently with a
 * one-click "Entrar al Zoom" button, plus the full calendar below. Past
 * sessions show as "Finalizada", live ones as "🔴 En directo", future
 * ones as the formatted date, and unscheduled ones as "Fecha por confirmar".
 */

const SESSIONS_BY_COURSE = {
  'ia-ele': {
    label_short: 'Sala Zoom del curso',
    zoom_url: 'https://us06web.zoom.us/j/88207551531?pwd=hXoWzDCi2wdN01dP4a5BGhkgQ6Xe30.1',
    zoom_id: '882 0755 1531',
    sessions: [
      {
        label: 'Videotutoría 1 · Bienvenida + Módulo 0 (GitHub)',
        iso: '2026-05-04T14:00:00Z', // 16:00 Madrid (CEST = UTC+2)
        duration_min: 90,
      },
      {
        label: 'Videotutoría 2 · Módulos 1-2',
        iso: '2026-05-13T14:00:00Z',
        duration_min: 90,
      },
      {
        label: 'Videotutoría 3 · Módulos 3-4',
        iso: '2026-05-21T14:00:00Z',
        duration_min: 90,
      },
    ],
  },
};

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  });
};

export default function LiveSessionsCard({ courseSlug }) {
  const config = SESSIONS_BY_COURSE[courseSlug];
  if (!config) return null; // Other courses without sessions defined yet.

  const { zoom_url, zoom_id, sessions } = config;
  const now = Date.now();
  const sessionsWithStatus = sessions.map((s) => {
    const ts = s.iso ? Date.parse(s.iso) : null;
    let status = 'tba';
    if (ts) {
      const ends = ts + (s.duration_min || 60) * 60_000;
      if (now < ts) status = 'upcoming';
      else if (now < ends) status = 'live';
      else status = 'past';
    }
    return { ...s, ts, status };
  });

  const next = sessionsWithStatus.find((s) => s.status === 'live')
    || sessionsWithStatus.find((s) => s.status === 'upcoming')
    || sessionsWithStatus.find((s) => s.status === 'tba');

  return (
    <div
      className="course-zoom-card"
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--r-md)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        borderLeft: '4px solid var(--blue)',
        marginBottom: '1.5rem',
      }}
      data-testid="course-live-sessions"
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          color: 'var(--ink)',
          margin: '0 0 .9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '.4rem',
        }}
      >
        🎥 Sala Zoom del curso
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) auto',
          gap: '1rem',
          alignItems: 'center',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--canvas-alt)',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '.78rem',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: 'var(--clm-red)',
              fontWeight: 700,
              margin: 0,
            }}
          >
            {next?.status === 'live' ? '🔴 Sesión en directo ahora' : 'Próxima sesión'}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              color: 'var(--ink)',
              margin: '.25rem 0 .35rem',
              lineHeight: 1.3,
            }}
            data-testid="course-next-session-label"
          >
            {next?.label || 'Sin sesiones programadas'}
          </p>
          <p style={{ fontSize: '.85rem', color: 'var(--ink-soft)', margin: 0 }}>
            {next?.ts
              ? formatDate(next.iso) + ' (Madrid)'
              : 'Fecha por confirmar — te avisaré por email.'}
          </p>
          <p
            style={{
              fontSize: '.78rem',
              color: 'var(--ink-muted)',
              margin: '.5rem 0 0',
            }}
          >
            ID de reunión: <strong>{zoom_id}</strong>
          </p>
        </div>
        <a
          href={zoom_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
          style={{ whiteSpace: 'nowrap' }}
          data-testid="course-zoom-link"
        >
          Entrar al Zoom →
        </a>
      </div>

      <div style={{ marginTop: '.85rem' }}>
        <p
          style={{
            fontSize: '.78rem',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
            color: 'var(--ink-muted)',
            fontWeight: 700,
            margin: '0 0 .4rem',
          }}
        >
          Calendario completo
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '.85rem',
            color: 'var(--ink-soft)',
            lineHeight: 1.6,
          }}
          data-testid="course-sessions-list"
        >
          {sessionsWithStatus.map((s, i) => (
            <li
              key={s.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '.75rem',
                padding: '.4rem 0',
                borderBottom:
                  i < sessionsWithStatus.length - 1
                    ? '1px solid var(--canvas-alt)'
                    : 'none',
                opacity: s.status === 'past' ? 0.5 : 1,
              }}
            >
              <span>{s.label}</span>
              <span style={{ color: 'var(--ink-muted)', fontSize: '.82rem', textAlign: 'right' }}>
                {s.status === 'past' && '✅ Finalizada'}
                {s.status === 'live' && '🔴 En directo'}
                {s.status === 'upcoming' && (formatDate(s.iso) || 'Próxima')}
                {s.status === 'tba' && 'Fecha por confirmar'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
