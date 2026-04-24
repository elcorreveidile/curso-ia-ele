import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';

function buildFlat(toc) {
  if (!toc) return [];
  const flat = [];
  (toc.parts || []).forEach((p) => {
    (p.chapters || []).forEach((ch) => flat.push({ ...ch, part_label: p.part_label, part_order: p.part_order }));
  });
  return flat;
}

function SidebarContent({ toc, currentSlug, onClick }) {
  if (!toc) return <div style={{ padding: '1rem', color: 'var(--ink-muted)', fontSize: '.85rem' }}>Cargando…</div>;
  return (
    <nav className="res-sidebar__nav" data-testid="ebook-sidebar-nav">
      {toc.parts.map((p) => (
        <div key={p.part_order} className="res-sidebar__group">
          <div className="res-sidebar__group-title">{p.part_label}</div>
          <ul className="res-sidebar__list">
            {p.chapters.map((ch) => (
              <li key={ch.slug}>
                <Link
                  to={`/libro/${ch.slug}`}
                  onClick={onClick}
                  className={`res-sidebar__item ${ch.slug === currentSlug ? 'res-sidebar__item--active' : ''}`}
                  data-testid={`ebook-sidebar-item-${ch.slug}`}
                >
                  <span className="res-sidebar__emoji">📄</span>
                  <span className="res-sidebar__label">{ch.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default function EbookChapter() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [toc, setToc] = useState(null);
  const [err, setErr] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setData(null); setErr(''); setDrawerOpen(false);
    api.get(`/ebook/${slug}`).then((r) => setData(r.data)).catch((e) => setErr(e.response?.data?.detail || 'Error'));
    window.scrollTo({ top: 0 });
  }, [slug]);

  useEffect(() => {
    if (toc) return;
    api.get('/ebook').then((r) => setToc(r.data)).catch(() => {});
  }, [toc]);

  const flat = useMemo(() => buildFlat(toc), [toc]);
  const idx = useMemo(() => flat.findIndex((c) => c.slug === slug), [flat, slug]);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  if (err) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem', color: 'var(--clm-red)' }}>{err}</div><Footer /></>;
  if (!data) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando…</div><Footer /></>;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <div className="res-layout">
          <aside className="res-sidebar" data-testid="ebook-sidebar-desktop">
            <div className="res-sidebar__header">
              <Link to="/libro" className="res-sidebar__back">📘 Volver al índice</Link>
            </div>
            <SidebarContent toc={toc} currentSlug={slug} />
          </aside>

          <main className="res-main">
            <div className="res-breadcrumb" data-testid="ebook-breadcrumb">
              <Link to="/dashboard">Mi área</Link>
              <span className="res-breadcrumb__sep">›</span>
              <Link to="/libro">Prompts que funcionan</Link>
              <span className="res-breadcrumb__sep">›</span>
              <span className="res-breadcrumb__current">{data.title}</span>
            </div>

            <div className="res-toolbar">
              <button type="button" className="res-toolbar__index-btn" onClick={() => setDrawerOpen(true)} data-testid="ebook-open-drawer">
                📚 Índice del libro
              </button>
            </div>

            <div className="res-title-block">
              <span className="res-title-block__tag">{data.part_label}</span>
              <h1 className="res-title-block__title">{data.title}</h1>
            </div>

            <div className="lesson-body" data-testid="ebook-chapter-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content_md}</ReactMarkdown>
            </div>

            <div className="res-pager" data-testid="ebook-pager">
              {prev ? (
                <Link to={`/libro/${prev.slug}`} className="res-pager__btn res-pager__btn--prev" data-testid="ebook-pager-prev">
                  <span className="res-pager__label">← Anterior</span>
                  <span className="res-pager__title">{prev.title}</span>
                </Link>
              ) : <span className="res-pager__btn res-pager__btn--disabled">Inicio del libro</span>}
              {next ? (
                <Link to={`/libro/${next.slug}`} className="res-pager__btn res-pager__btn--next" data-testid="ebook-pager-next">
                  <span className="res-pager__label">Siguiente →</span>
                  <span className="res-pager__title">{next.title}</span>
                </Link>
              ) : <span className="res-pager__btn res-pager__btn--disabled">Final del libro</span>}
            </div>
          </main>
        </div>
      </div>

      {drawerOpen && (
        <div className="res-drawer" data-testid="ebook-drawer">
          <div className="res-drawer__backdrop" onClick={() => setDrawerOpen(false)} />
          <aside className="res-drawer__panel">
            <div className="res-drawer__header">
              <span className="res-drawer__title">📘 Índice del libro</span>
              <button type="button" className="res-drawer__close" onClick={() => setDrawerOpen(false)} data-testid="ebook-close-drawer" aria-label="Cerrar">✕</button>
            </div>
            <SidebarContent toc={toc} currentSlug={slug} onClick={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <Footer />
    </>
  );
}
