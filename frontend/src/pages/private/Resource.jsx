import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';

// ---------- PDF generation ----------
const pdfStyles = StyleSheet.create({
  page: { paddingTop: 60, paddingBottom: 50, paddingHorizontal: 54, fontFamily: 'Helvetica', fontSize: 10.5, color: '#1A2535', lineHeight: 1.55, backgroundColor: '#FFFFFF' },
  header: { position: 'absolute', top: 24, left: 54, right: 54, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8.5, color: '#46476A', paddingBottom: 6, borderBottom: '0.5pt solid #E0E2EA' },
  headerLeft: { fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', bottom: 24, left: 54, right: 54, fontSize: 8, color: '#6B82A0', paddingTop: 6, borderTop: '0.5pt solid #E0E2EA', flexDirection: 'row', justifyContent: 'space-between' },
  pageNum: { textAlign: 'right' },
  titleBlock: { marginTop: 18, marginBottom: 20, borderLeft: '4pt solid #F5A623', paddingLeft: 14 },
  titleLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#F5A623', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1A2535', lineHeight: 1.2 },
  h1: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#0F4C81', marginTop: 16, marginBottom: 8 },
  h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#0F4C81', marginTop: 12, marginBottom: 6 },
  h3: { fontSize: 11.5, fontFamily: 'Helvetica-Bold', color: '#1A2535', marginTop: 10, marginBottom: 4 },
  p: { marginBottom: 6 },
  bold: { fontFamily: 'Helvetica-Bold' },
  italic: { fontFamily: 'Helvetica-Oblique' },
  inlineCode: { fontFamily: 'Courier', backgroundColor: '#F4F7FA', color: '#0F4C81' },
  listItem: { flexDirection: 'row', marginBottom: 3 },
  bullet: { width: 10, color: '#F5A623', fontFamily: 'Helvetica-Bold' },
  listText: { flex: 1 },
  quote: { marginVertical: 8, padding: 10, backgroundColor: '#FEF6DC', borderLeft: '3pt solid #F5A623', fontSize: 10 },
  codeBlock: { marginVertical: 8, padding: 10, backgroundColor: '#0F2744', borderLeft: '3pt solid #F5A623', borderRadius: 2, fontFamily: 'Courier', fontSize: 8.5, color: '#E8EEF5', lineHeight: 1.4 },
  tableRow: { flexDirection: 'row', borderBottom: '0.5pt solid #E0E2EA' },
  tableHeader: { backgroundColor: '#F4F7FA', fontFamily: 'Helvetica-Bold' },
  tableCell: { flex: 1, padding: 4, fontSize: 9, borderRight: '0.5pt solid #E0E2EA' },
  hr: { borderBottom: '0.5pt solid #E0E2EA', marginVertical: 10 },
});

function renderInline(text, keyPrefix = 'i') {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;
  let lastIdx = 0; let m; let idx = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(<Text key={`${keyPrefix}-${idx++}`}>{text.slice(lastIdx, m.index)}</Text>);
    const token = m[0];
    if (token.startsWith('**')) parts.push(<Text key={`${keyPrefix}-${idx++}`} style={pdfStyles.bold}>{token.slice(2, -2)}</Text>);
    else if (token.startsWith('*') || token.startsWith('_')) parts.push(<Text key={`${keyPrefix}-${idx++}`} style={pdfStyles.italic}>{token.slice(1, -1)}</Text>);
    else if (token.startsWith('`')) parts.push(<Text key={`${keyPrefix}-${idx++}`} style={pdfStyles.inlineCode}>{token.slice(1, -1)}</Text>);
    lastIdx = m.index + token.length;
  }
  if (lastIdx < text.length) parts.push(<Text key={`${keyPrefix}-${idx++}`}>{text.slice(lastIdx)}</Text>);
  return parts.length ? parts : [<Text key={`${keyPrefix}-0`}>{text}</Text>];
}

function MarkdownToPDF({ md }) {
  const lines = md.split('\n');
  const elements = [];
  let listBuffer = []; let inCode = false; let codeBuffer = [];
  let tableBuffer = []; let inTable = false;

  const flushList = () => {
    if (listBuffer.length) {
      elements.push(
        <View key={`list-${elements.length}`} style={{ marginVertical: 4 }}>
          {listBuffer.map((t, i) => (
            <View key={i} style={pdfStyles.listItem}>
              <Text style={pdfStyles.bullet}>•</Text>
              <Text style={pdfStyles.listText}>{renderInline(t, `li-${elements.length}-${i}`)}</Text>
            </View>
          ))}
        </View>
      );
      listBuffer = [];
    }
  };
  const flushCode = () => {
    if (codeBuffer.length) {
      elements.push(<View key={`code-${elements.length}`} style={pdfStyles.codeBlock}><Text>{codeBuffer.join('\n')}</Text></View>);
      codeBuffer = [];
    }
  };
  const flushTable = () => {
    if (tableBuffer.length >= 2) {
      const rows = tableBuffer.filter((r) => !/^\s*\|?\s*[-:| ]+\|?\s*$/.test(r));
      elements.push(
        <View key={`tbl-${elements.length}`} style={{ marginVertical: 8 }}>
          {rows.map((row, ri) => {
            const cells = row.split('|').map((c) => c.trim()).filter((c, i, arr) => !(i === 0 && c === '') && !(i === arr.length - 1 && c === ''));
            return (
              <View key={ri} style={[pdfStyles.tableRow, ri === 0 ? pdfStyles.tableHeader : {}]}>
                {cells.map((c, ci) => (<Text key={ci} style={pdfStyles.tableCell}>{renderInline(c, `tc-${ri}-${ci}`)}</Text>))}
              </View>
            );
          })}
        </View>
      );
    }
    tableBuffer = []; inTable = false;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (line.startsWith('```')) {
      if (inCode) { flushCode(); inCode = false; } else { flushList(); flushTable(); inCode = true; }
      return;
    }
    if (inCode) { codeBuffer.push(line); return; }
    if (line.includes('|') && line.trim().startsWith('|')) {
      if (!inTable) { flushList(); inTable = true; }
      tableBuffer.push(line);
      return;
    }
    if (inTable) flushTable();
    if (!line.trim()) { flushList(); return; }
    if (line.startsWith('# ')) { flushList(); elements.push(<Text key={idx} style={pdfStyles.h1}>{renderInline(line.slice(2), `h1-${idx}`)}</Text>); return; }
    if (line.startsWith('## ')) { flushList(); elements.push(<Text key={idx} style={pdfStyles.h2}>{renderInline(line.slice(3), `h2-${idx}`)}</Text>); return; }
    if (line.startsWith('### ')) { flushList(); elements.push(<Text key={idx} style={pdfStyles.h3}>{renderInline(line.slice(4), `h3-${idx}`)}</Text>); return; }
    if (line.startsWith('> ')) { flushList(); elements.push(<View key={idx} style={pdfStyles.quote}><Text>{renderInline(line.slice(2), `q-${idx}`)}</Text></View>); return; }
    if (line === '---' || line === '***') { flushList(); elements.push(<View key={idx} style={pdfStyles.hr} />); return; }
    const bulletMatch = line.match(/^[-*]\s+(.*)/);
    const numMatch = line.match(/^\d+\.\s+(.*)/);
    if (bulletMatch) { listBuffer.push(bulletMatch[1]); return; }
    if (numMatch) { listBuffer.push(numMatch[1]); return; }
    flushList();
    elements.push(<Text key={idx} style={pdfStyles.p}>{renderInline(line, `p-${idx}`)}</Text>);
  });
  flushList(); flushCode(); flushTable();
  return <>{elements}</>;
}

function ResourcePDF({ title, typeLabel, content }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        <View style={pdfStyles.header} fixed>
          <Text style={pdfStyles.headerLeft}>[ | ]  Javier Benítez Láinez</Text>
          <Text>IA para la enseñanza de ELE</Text>
        </View>
        <View style={pdfStyles.titleBlock}>
          <Text style={pdfStyles.titleLabel}>{typeLabel}</Text>
          <Text style={pdfStyles.title}>{title}</Text>
        </View>
        <MarkdownToPDF md={content} />
        <View style={pdfStyles.footer} fixed>
          <Text>La Clase Digital · laclasedigital.com</Text>
          <Text style={pdfStyles.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ---------- Navigation helpers ----------
const TYPE_EMOJI = { lectura: '📖', plantilla: '📝', rubrica: '✅', glosario: '📚', encuesta: '💬' };

function buildFlatList(indexData) {
  if (!indexData) return [];
  const flat = [];
  (indexData.modules || []).forEach((m) => {
    (m.resources || []).forEach((r) => flat.push({ ...r, _module_order: m.order, _module_title: m.title }));
  });
  (indexData.transversal || []).forEach((r) => flat.push({ ...r, _module_order: null, _module_title: 'Transversales' }));
  return flat;
}

function SidebarContent({ indexData, currentSlug, onClickItem }) {
  if (!indexData) return <div style={{ padding: '1rem', color: 'var(--ink-muted)', fontSize: '.85rem' }}>Cargando índice…</div>;
  return (
    <nav className="res-sidebar__nav" data-testid="resource-sidebar-nav">
      {indexData.modules.map((m) => (
        m.resources.length > 0 && (
          <div key={m.module_id} className="res-sidebar__group">
            <div className="res-sidebar__group-title">Módulo {m.order} · {m.title}</div>
            <ul className="res-sidebar__list">
              {m.resources.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/recurso/${r.slug}`}
                    onClick={onClickItem}
                    className={`res-sidebar__item ${r.slug === currentSlug ? 'res-sidebar__item--active' : ''}`}
                    data-testid={`resource-sidebar-item-${r.slug}`}
                  >
                    <span className="res-sidebar__emoji">{TYPE_EMOJI[r.type] || '📄'}</span>
                    <span className="res-sidebar__label">{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      ))}
      {indexData.transversal.length > 0 && (
        <div className="res-sidebar__group">
          <div className="res-sidebar__group-title">Transversales</div>
          <ul className="res-sidebar__list">
            {indexData.transversal.map((r) => (
              <li key={r.slug}>
                <Link
                  to={`/recurso/${r.slug}`}
                  onClick={onClickItem}
                  className={`res-sidebar__item ${r.slug === currentSlug ? 'res-sidebar__item--active' : ''}`}
                  data-testid={`resource-sidebar-item-${r.slug}`}
                >
                  <span className="res-sidebar__emoji">{TYPE_EMOJI[r.type] || '📄'}</span>
                  <span className="res-sidebar__label">{r.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

// ---------- Page ----------
export default function Resource() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [indexData, setIndexData] = useState(null);
  const [err, setErr] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setData(null); setErr(''); setDrawerOpen(false);
    api.get(`/resource/${slug}`)
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.response?.data?.detail || 'Error'));
    // Scroll to top when switching resource
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [slug]);

  // Once we know the course_slug, load the course-wide resource index (only when it changes)
  useEffect(() => {
    if (!data?.course_slug) return;
    if (indexData && indexData._course === data.course_slug) return;
    api.get(`/course/${data.course_slug}/resources`)
      .then((r) => setIndexData({ ...r.data, _course: data.course_slug }))
      .catch(() => {});
  }, [data?.course_slug, indexData]);

  const flat = useMemo(() => buildFlatList(indexData), [indexData]);
  const currentIdx = useMemo(() => flat.findIndex((r) => r.slug === slug), [flat, slug]);
  const prev = currentIdx > 0 ? flat[currentIdx - 1] : null;
  const next = currentIdx >= 0 && currentIdx < flat.length - 1 ? flat[currentIdx + 1] : null;

  const downloadable = useMemo(() => data && ['plantilla', 'rubrica', 'glosario'].includes(data.type), [data]);
  const pdfDocument = useMemo(
    () => data ? <ResourcePDF title={data.title} typeLabel={data.type_label} content={data.content_md} /> : null,
    [data]
  );

  if (err) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem', color: 'var(--clm-red)' }}>{err}</div><Footer /></>;
  if (!data) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando…</div><Footer /></>;

  const courseSlug = data.course_slug || 'ia-ele';

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <div className="res-layout">
          {/* Sidebar (desktop) */}
          <aside className="res-sidebar" data-testid="resource-sidebar-desktop">
            <div className="res-sidebar__header">
              <Link to={`/curso/${courseSlug}/recursos`} className="res-sidebar__back">📚 Todos los materiales</Link>
            </div>
            <SidebarContent indexData={indexData} currentSlug={slug} />
          </aside>

          {/* Main content */}
          <main className="res-main">
            {/* Breadcrumb */}
            <div className="res-breadcrumb" data-testid="resource-breadcrumb">
              <Link to="/dashboard">Mis cursos</Link>
              <span className="res-breadcrumb__sep">›</span>
              <Link to={`/curso/${courseSlug}`}>{data.course_title || 'Curso'}</Link>
              {data.module_order && (
                <>
                  <span className="res-breadcrumb__sep">›</span>
                  <Link to={`/curso/${courseSlug}/modulo/${data.module_id}`}>Módulo {data.module_order}</Link>
                </>
              )}
              <span className="res-breadcrumb__sep">›</span>
              <span className="res-breadcrumb__current">{data.title}</span>
            </div>

            {/* Toolbar: índice móvil + PDF */}
            <div className="res-toolbar">
              <button
                type="button"
                className="res-toolbar__index-btn"
                onClick={() => setDrawerOpen(true)}
                data-testid="resource-open-drawer"
                aria-label="Abrir índice de materiales"
              >
                📚 Índice de materiales
              </button>
              {downloadable && (
                <PDFDownloadLink
                  document={pdfDocument}
                  fileName={`${data.slug}.pdf`}
                  className="btn btn--primary res-toolbar__pdf"
                  data-testid="resource-download-pdf"
                >
                  {({ loading, error }) => {
                    if (error) return 'Error al generar PDF';
                    return loading ? 'Preparando PDF…' : '📄 Descargar PDF';
                  }}
                </PDFDownloadLink>
              )}
            </div>

            {/* Title */}
            <div className="res-title-block">
              <span className="res-title-block__tag">{data.type_label}</span>
              <h1 className="res-title-block__title">{data.title}</h1>
              {data.module_title && <p className="res-title-block__module">Módulo {data.module_order} · {data.module_title}</p>}
            </div>

            {/* Content */}
            <div className="lesson-body" data-testid="resource-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content_md}</ReactMarkdown>
            </div>

            {/* Prev / Next */}
            <div className="res-pager" data-testid="resource-pager">
              {prev ? (
                <Link to={`/recurso/${prev.slug}`} className="res-pager__btn res-pager__btn--prev" data-testid="resource-pager-prev">
                  <span className="res-pager__label">← Anterior</span>
                  <span className="res-pager__title">{prev.title}</span>
                </Link>
              ) : <span className="res-pager__btn res-pager__btn--disabled">Este es el primer material</span>}
              {next ? (
                <Link to={`/recurso/${next.slug}`} className="res-pager__btn res-pager__btn--next" data-testid="resource-pager-next">
                  <span className="res-pager__label">Siguiente →</span>
                  <span className="res-pager__title">{next.title}</span>
                </Link>
              ) : <span className="res-pager__btn res-pager__btn--disabled">Has llegado al final</span>}
            </div>
          </main>
        </div>
      </div>

      {/* Drawer móvil */}
      {drawerOpen && (
        <div className="res-drawer" data-testid="resource-drawer">
          <div className="res-drawer__backdrop" onClick={() => setDrawerOpen(false)} />
          <aside className="res-drawer__panel">
            <div className="res-drawer__header">
              <span className="res-drawer__title">📚 Materiales del curso</span>
              <button
                type="button"
                className="res-drawer__close"
                onClick={() => setDrawerOpen(false)}
                data-testid="resource-close-drawer"
                aria-label="Cerrar índice"
              >
                ✕
              </button>
            </div>
            <SidebarContent indexData={indexData} currentSlug={slug} onClickItem={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <Footer />
    </>
  );
}
