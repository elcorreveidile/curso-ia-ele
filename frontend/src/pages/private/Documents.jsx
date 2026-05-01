import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';

/**
 * Course documents area: lists static course documents (welcome letter,
 * recording-consent, …) and lets the student download each one as PDF
 * (rendered on the fly with the brand styling) or as the original DOCX.
 */
export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [downloading, setDownloading] = useState(null); // `${slug}:${format}`

  useEffect(() => {
    api
      .get('/documents')
      .then((r) => { setDocs(r.data.documents || []); setLoading(false); })
      .catch((ex) => { setErr(ex.response?.data?.detail || 'No se pudo cargar'); setLoading(false); });
  }, []);

  const downloadDoc = async (slug, format) => {
    const key = `${slug}:${format}`;
    setDownloading(key);
    try {
      const r = await api.get(`/documents/${slug}/download?format=${format}`, {
        responseType: 'blob',
      });
      // Pull the filename out of the Content-Disposition header when present.
      const disp = r.headers['content-disposition'] || '';
      const match = disp.match(/filename="?([^";]+)"?/i);
      const filename = match ? match[1] : `${slug}.${format}`;
      const blobUrl = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'No se pudo descargar el documento');
      // As a fallback, try opening in a new tab via the public-style URL
      // (the backend will still authenticate via cookie/JWT-bearing fetch fails,
      // so we don't auto-redirect to avoid leaking the token).
    }
    setDownloading(null);
  };

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Mi área"
          title="Documentos del curso"
          desc="Aquí encontrarás los documentos clave del curso: cartas, formularios y consentimientos. Puedes descargarlos en PDF (recomendado) o en formato Word editable."
        />
        <div className="inner-content">
          <Link
            to="/dashboard"
            style={{ color: 'var(--blue)', fontSize: '.875rem', display: 'inline-block', marginBottom: '1rem' }}
            data-testid="documents-back"
          >
            ← Volver a mi área
          </Link>

          {loading && <p style={{ color: 'var(--ink-muted)' }}>Cargando documentos…</p>}
          {err && !loading && (
            <p style={{ color: 'var(--clm-red)' }} data-testid="documents-error">{err}</p>
          )}
          {!loading && !err && docs.length === 0 && (
            <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              Aún no hay documentos disponibles.
            </p>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
              marginTop: '1rem',
            }}
            data-testid="documents-grid"
          >
            {docs.map((d) => (
              <div
                key={d.slug}
                className="doc-card"
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-md)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '1.25rem 1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '.6rem',
                  borderLeft: d.requires_signature
                    ? '4px solid var(--clm-red)'
                    : '4px solid var(--blue)',
                }}
                data-testid={`document-card-${d.slug}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{d.icon || '📄'}</span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.05rem',
                      color: 'var(--ink)',
                      margin: 0,
                      lineHeight: 1.25,
                    }}
                  >
                    {d.title}
                  </h3>
                </div>
                <p style={{ fontSize: '.88rem', color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>
                  {d.description}
                </p>
                {d.requires_signature && (
                  <p
                    style={{
                      fontSize: '.78rem',
                      color: 'var(--clm-red-dark)',
                      background: 'var(--clm-red-light)',
                      padding: '.35rem .65rem',
                      borderRadius: 'var(--r-sm)',
                      margin: '.1rem 0 0',
                      fontWeight: 600,
                    }}
                  >
                    ✍️ Requiere firma · devuélvelo a benitezl@go.ugr.es
                  </p>
                )}
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.4rem' }}>
                  <button
                    type="button"
                    onClick={() => downloadDoc(d.slug, 'pdf')}
                    className="btn btn--primary"
                    style={{ fontSize: '.85rem', padding: '.5rem 1rem' }}
                    disabled={downloading === `${d.slug}:pdf`}
                    data-testid={`document-download-pdf-${d.slug}`}
                  >
                    {downloading === `${d.slug}:pdf` ? 'Descargando…' : '📄 Descargar PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadDoc(d.slug, 'docx')}
                    className="btn btn--ghost"
                    style={{ fontSize: '.85rem', padding: '.5rem 1rem' }}
                    disabled={downloading === `${d.slug}:docx`}
                    data-testid={`document-download-docx-${d.slug}`}
                  >
                    {downloading === `${d.slug}:docx` ? 'Descargando…' : 'Word (.docx)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
