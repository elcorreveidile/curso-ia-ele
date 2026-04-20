import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { api } from '../../lib/api';

const ASUNTOS = [
  'Información sobre el curso',
  'Inscripción al curso',
  'Propuesta para mi institución',
  'Otro',
];

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true); setError('');
    try {
      await api.post('/contact', {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        asunto: form.asunto || 'Otro',
        mensaje: form.mensaje.trim(),
      });
      setSent(true);
    } catch (ex) {
      setError(ex.response?.data?.detail || 'No se pudo enviar. Inténtalo de nuevo en un momento.');
    }
    setSending(false);
  };

  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Escríbenos"
          title="Contacto"
          desc="Cuéntanos en qué podemos ayudarte. Te responderemos en menos de 48 horas."
        />
        <div className="inner-content" style={{ maxWidth: 720 }}>
          <div className="price-card" data-testid="contact-card">
            {sent ? (
              <div data-testid="contact-sent">
                <p className="section__tag" style={{ color: 'var(--green)' }}>✓ Mensaje enviado</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '.75rem' }}>
                  Gracias, {form.nombre}.
                </h2>
                <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  He recibido tu mensaje sobre <strong>{form.asunto || 'tu consulta'}</strong>. Te
                  escribiré a <strong>{form.email}</strong> en menos de 48 horas.
                </p>
                <button
                  className="btn btn--ghost"
                  onClick={() => { setSent(false); setForm({ nombre: '', email: '', asunto: '', mensaje: '' }); }}
                  data-testid="contact-new"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={submit} data-testid="contact-form">
                <p className="section__tag">Formulario</p>
                <div className="form-group">
                  <label htmlFor="c_nombre">Nombre</label>
                  <input
                    id="c_nombre" type="text" required className="form-input"
                    placeholder="Tu nombre" value={form.nombre} onChange={upd('nombre')}
                    data-testid="contact-nombre"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="c_email">Correo</label>
                  <input
                    id="c_email" type="email" required className="form-input"
                    placeholder="tu@correo.com" value={form.email} onChange={upd('email')}
                    data-testid="contact-email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="c_asunto">Asunto</label>
                  <select
                    id="c_asunto" className="form-input" value={form.asunto} onChange={upd('asunto')}
                    data-testid="contact-asunto"
                  >
                    <option value="">Selecciona…</option>
                    {ASUNTOS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="c_mensaje">Mensaje</label>
                  <textarea
                    id="c_mensaje" required className="form-input" rows={6}
                    placeholder="Cuéntame en qué puedo ayudarte…"
                    value={form.mensaje} onChange={upd('mensaje')}
                    data-testid="contact-mensaje"
                  />
                </div>
                {error && <p style={{ color: 'var(--clm-red)', fontSize: '.88rem', marginBottom: '.75rem' }}>{error}</p>}
                <button
                  className="btn btn--primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={sending}
                  data-testid="contact-submit"
                >
                  {sending ? 'Enviando…' : 'Enviar mensaje'}
                </button>
                <p className="price-note" style={{ textAlign: 'center', marginTop: '1rem' }}>
                  Respetamos tu privacidad. Solo usaremos tu correo para responderte.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
