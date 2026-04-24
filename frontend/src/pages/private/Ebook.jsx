import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api, API_BASE } from '../../lib/api';

export default function Ebook() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get('/ebook').then((r) => setData(r.data)).catch((e) => setErr(e.response?.data?.detail || 'Error'));
  }, []);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('lcd_token');
      const resp = await fetch(`${API_BASE}/ebook.pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${txt.slice(0, 120)}`);
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'prompts-que-funcionan.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (ex) {
      alert('No se pudo generar el PDF: ' + (ex.message || 'Error'));
    }
    setDownloading(false);
  };

  if (err) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem', color: 'var(--clm-red)' }}>{err}</div><Footer /></>;
  if (!data) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando libro…</div><Footer /></>;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero tag="Mi libro" title={data.title} desc={data.subtitle} />
        <div className="inner-content" style={{ maxWidth: 1040 }}>
          <Link to="/dashboard" style={{ color: 'var(--blue)', fontSize: '.875rem', marginBottom: '1rem', display: 'inline-block' }}>
            ← Volver a mi área
          </Link>

          <div className="ebook-banner" data-testid="ebook-banner">
            <div className="ebook-banner__left">
              <div className="ebook-banner__mark">[ | ]</div>
              <div>
                <p className="ebook-banner__kicker">Libro incluido en tu curso</p>
                <h2 className="ebook-banner__title">{data.title}</h2>
                <p className="ebook-banner__author">Por <strong>{data.author}</strong> · {data.total_chapters} capítulos</p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn--primary"
              onClick={downloadPdf}
              disabled={downloading}
              data-testid="ebook-download-pdf"
            >
              {downloading ? 'Preparando PDF…' : '📥 Descargar libro en PDF'}
            </button>
          </div>

          {data.parts.map((p) => (
            <div key={p.part_order} className="dash-section" data-testid={`ebook-part-${p.part_order}`}>
              <h2 className="dash-title">{p.part_label}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '.75rem' }}>
                {p.chapters.map((ch, idx) => (
                  <Link key={ch.slug} to={`/libro/${ch.slug}`} className="res-card" data-testid={`ebook-chapter-${ch.slug}`}>
                    <span className="res-card__type">Cap. {idx + 1}</span>
                    <span className="res-card__title">{ch.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
