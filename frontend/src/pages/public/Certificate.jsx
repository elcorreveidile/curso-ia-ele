import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink, Font } from '@react-pdf/renderer';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api } from '../../lib/api';

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: '#F4F7FA',
    fontFamily: 'Helvetica',
  },
  inner: {
    margin: 24,
    border: '2px solid #0F4C81',
    padding: 48,
    backgroundColor: '#FFFFFF',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
  },
  stripe: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    backgroundColor: '#F5A623',
  },
  pipe: {
    fontSize: 18, color: '#F5A623', fontFamily: 'Times-Roman',
    textAlign: 'center', marginBottom: 12,
  },
  brand: {
    fontSize: 11, letterSpacing: 3, color: '#6B82A0',
    textTransform: 'uppercase', textAlign: 'center', marginBottom: 40,
  },
  tag: {
    fontSize: 10, letterSpacing: 3, color: '#F5A623',
    textTransform: 'uppercase', textAlign: 'center', marginBottom: 16,
  },
  h1: {
    fontSize: 28, fontFamily: 'Helvetica-Bold',
    color: '#1A2535', textAlign: 'center', marginBottom: 8,
  },
  h2: {
    fontSize: 14, color: '#6B82A0', textAlign: 'center', marginBottom: 40,
  },
  name: {
    fontSize: 32, fontFamily: 'Helvetica-Bold',
    color: '#0F4C81', textAlign: 'center', marginBottom: 8,
    borderBottom: '1px solid #E8EEF5', paddingBottom: 12,
  },
  body: {
    fontSize: 12, color: '#2E4260', textAlign: 'center',
    lineHeight: 1.6, marginBottom: 12,
  },
  courseTitle: {
    fontSize: 16, fontFamily: 'Helvetica-Bold',
    color: '#1A2535', textAlign: 'center', marginBottom: 24,
  },
  footerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 40, paddingTop: 20, borderTop: '1px solid #E8EEF5',
  },
  footerCol: { flex: 1 },
  footerLabel: {
    fontSize: 8, letterSpacing: 2, color: '#6B82A0',
    textTransform: 'uppercase', marginBottom: 4,
  },
  footerVal: { fontSize: 10, color: '#1A2535', fontFamily: 'Helvetica-Bold' },
  verify: {
    fontSize: 8, color: '#6B82A0', textAlign: 'center',
    marginTop: 12,
  },
});

function CertificateDoc({ name, email, course, hours, issuedAt, certId, origin }) {
  const date = new Date(issuedAt).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.inner}>
          <View style={styles.stripe} />
          <View>
            <Text style={styles.pipe}>[ | ]</Text>
            <Text style={styles.brand}>La Clase Digital · Formación Docente ELE</Text>
            <Text style={styles.tag}>Certificado de aprovechamiento</Text>
            <Text style={styles.h1}>Se certifica que</Text>
            <Text style={styles.h2}>{email}</Text>
            <Text style={styles.name}>{name || email}</Text>
            <Text style={styles.body}>
              ha completado satisfactoriamente el curso de formación docente
            </Text>
            <Text style={styles.courseTitle}>«{course}»</Text>
            <Text style={styles.body}>
              con una duración total de {hours} horas, incluyendo módulos teóricos,
              actividades prácticas y sesiones síncronas de videotutoría.
            </Text>
          </View>
          <View>
            <View style={styles.footerRow}>
              <View style={styles.footerCol}>
                <Text style={styles.footerLabel}>Fecha de emisión</Text>
                <Text style={styles.footerVal}>{date}</Text>
              </View>
              <View style={[styles.footerCol, { alignItems: 'center' }]}>
                <Text style={styles.footerLabel}>Formador</Text>
                <Text style={styles.footerVal}>Javier Benítez Láinez</Text>
              </View>
              <View style={[styles.footerCol, { alignItems: 'flex-end' }]}>
                <Text style={styles.footerLabel}>ID del certificado</Text>
                <Text style={styles.footerVal}>{certId.slice(0, 8).toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.verify}>
              Certificado verificable en {origin}/certificado/{certId}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ── Page ────────────────────────────────────────────────────────
export default function Certificate() {
  const { certId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    api.get(`/certificate/${certId}`).then((r) => setData(r.data)).catch((e) => {
      setErr(e.response?.data?.detail || 'Certificado no encontrado.');
    });
  }, [certId]);

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <div className="inner-content" style={{ maxWidth: 1100 }}>
          {err && (
            <div className="auth-card" data-testid="cert-error">
              <h1 className="auth-title">Certificado no encontrado</h1>
              <p className="auth-desc">{err}</p>
              <Link to="/" className="btn btn--ghost">Volver al inicio</Link>
            </div>
          )}
          {!err && !data && <p>Cargando certificado…</p>}
          {data && (
            <>
              <div className="cert-header" data-testid="cert-header">
                <div>
                  <p className="section__tag">Certificado verificable</p>
                  <h1 className="section__title" style={{ fontSize: '1.8rem' }}>
                    {data.user.name || data.user.email}
                  </h1>
                  <p style={{ color: 'var(--ink-muted)', marginBottom: '.5rem' }}>
                    {data.course.title} · {data.certificate.hours} horas · Emitido el{' '}
                    {new Date(data.certificate.issued_at).toLocaleDateString('es-ES')}
                  </p>
                  <p style={{ fontSize: '.85rem', color: 'var(--ink-muted)' }}>
                    ID: <code>{data.certificate.id}</code>
                  </p>
                </div>
                <PDFDownloadLink
                  document={
                    <CertificateDoc
                      name={data.user.name}
                      email={data.user.email}
                      course={data.course.title}
                      hours={data.certificate.hours}
                      issuedAt={data.certificate.issued_at}
                      certId={data.certificate.id}
                      origin={origin}
                    />
                  }
                  fileName={`certificado-${data.certificate.id.slice(0, 8)}.pdf`}
                  className="btn btn--primary"
                  data-testid="cert-download"
                >
                  {({ loading }) => (loading ? 'Preparando PDF…' : 'Descargar PDF')}
                </PDFDownloadLink>
              </div>
              <div className="cert-viewer" data-testid="cert-viewer">
                <PDFViewer width="100%" height="600" style={{ border: 'none', borderRadius: 'var(--r-md)' }}>
                  <CertificateDoc
                    name={data.user.name}
                    email={data.user.email}
                    course={data.course.title}
                    hours={data.certificate.hours}
                    issuedAt={data.certificate.issued_at}
                    certId={data.certificate.id}
                    origin={origin}
                  />
                </PDFViewer>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
