import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

/**
 * "Grabaciones de las sesiones" block shown inside `/curso/:slug`.
 *
 * Lists every YouTube-hosted recording uploaded by the admin for the course,
 * ordered by session number. Each entry is rendered as an embedded YouTube
 * iframe (private/unlisted videos work the same as public ones, so the admin
 * uploads videos as "unlisted" on YouTube and pastes the URL).
 *
 * Hidden until at least one recording exists, so it doesn't clutter the
 * course page during the first weeks of the cohort.
 */
export default function SessionRecordings({ courseSlug }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let abort = false;
    api.get(`/course/${courseSlug}/recordings`)
      .then((r) => { if (!abort) { setItems(r.data.recordings || []); setLoading(false); } })
      .catch(() => { if (!abort) setLoading(false); });
    return () => { abort = true; };
  }, [courseSlug]);

  if (loading || items.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--r-md)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        borderLeft: '4px solid var(--clm-red)',
        marginBottom: '1.5rem',
      }}
      data-testid="course-recordings"
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          color: 'var(--ink)',
          margin: '0 0 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '.4rem',
        }}
      >
        📹 Grabaciones de las videotutorías
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {items.map((rec) => (
          <article
            key={rec.id}
            style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}
            data-testid={`course-recording-${rec.id}`}
          >
            <div
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
                borderRadius: 8,
                background: '#000',
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${rec.youtube_id}?rel=0`}
                title={rec.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', border: 0,
                }}
              />
            </div>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '.95rem',
                color: 'var(--ink)',
                margin: 0,
                fontWeight: 600,
              }}
            >
              Sesión {rec.session_n} · {rec.title}
            </p>
            {rec.recorded_at && (
              <p style={{ fontSize: '.8rem', color: 'var(--ink-muted)', margin: 0 }}>
                Grabada el{' '}
                {new Date(rec.recorded_at).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            )}
            {rec.description_md && (
              <p style={{ fontSize: '.85rem', color: 'var(--ink-soft)', margin: '.2rem 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                {rec.description_md}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
