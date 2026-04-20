import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';

// PDF stylesheet inspired by the "Plantilla" template the user provided
// (yellow cream highlights #FEF6DC, blue/purple accent #46476A, sans-serif)
const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 60, paddingBottom: 50, paddingHorizontal: 54,
    fontFamily: 'Helvetica', fontSize: 10.5, color: '#1A2535', lineHeight: 1.55,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute', top: 24, left: 54, right: 54,
    flexDirection: 'row', justifyContent: 'space-between',
    fontSize: 8.5, color: '#46476A',
    paddingBottom: 6, borderBottom: '0.5pt solid #E0E2EA',
  },
  headerLeft: { fontFamily: 'Helvetica-Bold' },
  footer: {
    position: 'absolute', bottom: 24, left: 54, right: 54,
    fontSize: 8, color: '#6B82A0',
    paddingTop: 6, borderTop: '0.5pt solid #E0E2EA',
    flexDirection: 'row', justifyContent: 'space-between',
  },
  pageNum: { textAlign: 'right' },
  titleBlock: {
    marginTop: 18, marginBottom: 20,
    borderLeft: '4pt solid #F5A623', paddingLeft: 14,
  },
  titleLabel: {
    fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#F5A623',
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4,
  },
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
  quote: {
    marginVertical: 8, padding: 10,
    backgroundColor: '#FEF6DC', borderLeft: '3pt solid #F5A623',
    fontSize: 10,
  },
  codeBlock: {
    marginVertical: 8, padding: 10,
    backgroundColor: '#0F2744', borderLeft: '3pt solid #F5A623',
    borderRadius: 2,
    fontFamily: 'Courier', fontSize: 8.5, color: '#E8EEF5', lineHeight: 1.4,
  },
  tableRow: { flexDirection: 'row', borderBottom: '0.5pt solid #E0E2EA' },
  tableHeader: { backgroundColor: '#F4F7FA', fontFamily: 'Helvetica-Bold' },
  tableCell: { flex: 1, padding: 4, fontSize: 9, borderRight: '0.5pt solid #E0E2EA' },
  hr: { borderBottom: '0.5pt solid #E0E2EA', marginVertical: 10 },
});

// Render inline formatting: **bold**, *italic*, `code` → <Text> spans
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
  let listBuffer = [];
  let inCode = false;
  let codeBuffer = [];
  let tableBuffer = [];
  let inTable = false;

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
      elements.push(
        <View key={`code-${elements.length}`} style={pdfStyles.codeBlock}>
          <Text>{codeBuffer.join('\n')}</Text>
        </View>
      );
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
                {cells.map((c, ci) => (
                  <Text key={ci} style={pdfStyles.tableCell}>{renderInline(c, `tc-${ri}-${ci}`)}</Text>
                ))}
              </View>
            );
          })}
        </View>
      );
    }
    tableBuffer = [];
    inTable = false;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();

    if (line.startsWith('```')) {
      if (inCode) { flushCode(); inCode = false; }
      else { flushList(); flushTable(); inCode = true; }
      return;
    }
    if (inCode) { codeBuffer.push(line); return; }

    // Detect table
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
  flushList();
  flushCode();
  flushTable();
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
          <Text
            style={pdfStyles.pageNum}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

// Page
export default function Resource() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/resource/${slug}`).then((r) => setData(r.data)).catch((e) => setErr(e.response?.data?.detail || 'Error'));
  }, [slug]);

  const downloadable = useMemo(() => data && ['plantilla', 'rubrica', 'glosario'].includes(data.type), [data]);

  if (err) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem', color: 'var(--clm-red)' }}>{err}</div><Footer /></>;
  if (!data) return <><Navbar /><div className="inner-page" style={{ padding: '6rem 2rem' }}>Cargando…</div><Footer /></>;

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag={data.type_label}
          title={data.title}
          desc={data.module_id ? `Material del curso · ${data.module_id.replace('mod-ia-', 'Módulo ').replace('01','I').replace('02','II').replace('03','III').replace('04','IV')}` : 'Material transversal del curso'}
        />
        <div className="inner-content" style={{ maxWidth: 960 }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={{ color: 'var(--blue)', fontSize: '.875rem' }}>← Volver a mis cursos</Link>
            {downloadable && (
              <PDFDownloadLink
                document={<ResourcePDF title={data.title} typeLabel={data.type_label} content={data.content_md} />}
                fileName={`${data.slug}.pdf`}
                className="btn btn--primary"
                style={{ fontSize: '.88rem', padding: '.55rem 1.2rem' }}
                data-testid="resource-download-pdf"
              >
                {({ loading, error }) => {
                  if (error) return 'Error al generar PDF';
                  return loading ? 'Preparando PDF…' : '📄 Descargar PDF';
                }}
              </PDFDownloadLink>
            )}
          </div>
          <div className="lesson-body" data-testid="resource-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content_md}</ReactMarkdown>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
