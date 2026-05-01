import React from 'react';

/**
 * Live videotutoría card shown on the student dashboard.
 *
 * Pulls the Zoom join link, meeting ID and password from the session list and
 * surfaces the *next* upcoming session on top with a one-click "Entrar al
 * Zoom" button. Past sessions get a "Finalizada" pill. Future sessions
 * without a confirmed date show as "Fecha por confirmar".
 *
 * The data is currently a hard-coded module-level constant (single Zoom
 * recurring meeting + 3 dates for this edition). When the admin needs to
 * change a date, edit the SESSIONS array — no DB migration required.
 */

// ⚠️  Zoom recurring meeting for the IA-ELE 2026 edition.
const ZOOM_JOIN_URL = 'https://us06web.zoom.us/j/88207551531?pwd=hXoWzDCi2wdN01dP4a5BGhkgQ6Xe30.1';
const ZOOM_MEETING_ID = '882 0755 1531';

// All confirmed sessions for the current edition. Each session uses the same
// Zoom room above unless ``join_url`` overrides it.
const SESSIONS = [
  {
    label: 'Videotutoría 1 · Bienvenida + Módulo 0 (GitHub)',
    iso: '2026-05-04T14:00:00Z', // 16:00 Madrid (UTC+2 en mayo)
    duration_min: 90,
  },
  {
    label: 'Videotutoría 2 · Módulos 1-2',
    iso: '2026-05-14T14:00:00Z',
    duration_min: 90,
  },
  {
    label: 'Videotutoría 3 · Módulos 3-4',
    iso: '2026-05-21T14:00:00Z',
    duration_min: 90,
  },
];

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

export default function LiveSessionsCard() {
  const now = Date.now();
  const sessionsWithStatus = SESSIONS.map((s) => {
    const ts = s.iso ? Date.parse(s.iso) : null;
    let status = 'tba';
    if (ts) {
      // Treat the session as "live now" while it's running; "past" once it ended.
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
      className="dash-section"
      style={{ marginBottom: '1.5rem' }}
      data-testid="dashboard-live-sessions"
    >
      <h2 className="dash-title">🎥 Sala Zoom del curso</h2>

      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-md)',
          padding: '1.25rem 1.5rem',
          boxShadow: 'var(--shadow-sm)',
          borderLeft: '4px solid var(--blue)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) auto',
          gap: '1rem',
          alignItems: 'center',
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
            data-testid="dashboard-next-session-label"
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
            ID de reunión: <strong>{ZOOM_MEETING_ID}</strong>
          </p>
        </div>
        <a
          href={ZOOM_JOIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
          style={{ whiteSpace: 'nowrap' }}
          data-testid="dashboard-zoom-link"
        >
          Entrar al Zoom →
        </a>
      </div>

      {/* Full session list */}
      <div style={{ marginTop: '1rem' }}>
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
          data-testid="dashboard-sessions-list"
        >
          {sessionsWithStatus.map((s, i) => (
            <li
              key={i}
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
