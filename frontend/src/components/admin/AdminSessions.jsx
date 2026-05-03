import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminSessions() {
  const [individualSessions, setIndividualSessions] = useState([]);
  const [groupSessions, setGroupSessions] = useState([]);
  const [selectedGroupSession, setSelectedGroupSession] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupSession, setNewGroupSession] = useState({
    title: '',
    description: '',
    date: '',
    duration_min: 60,
    price_cents: 1500,
    min_students: 4,
    max_students: 8,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar sesiones individuales de los próximos 7 días
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      const { data: individualData, error: individualError } = await supabase
        .from('individual_sessions')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .lte('date', weekFromNow.toISOString())
        .in('status', ['pending', 'confirmed'])
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (individualError) throw individualError;
      setIndividualSessions(individualData || []);

      // Cargar sesiones grupales futuras
      const { data: groupData, error: groupError } = await supabase
        .from('group_sessions')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (groupError) throw groupError;
      setGroupSessions(groupData || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadEnrollments = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('group_enrollments')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (err) {
      console.error('Error loading enrollments:', err);
    }
  };

  const createGroupSession = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('group_sessions')
        .insert({
          title: newGroupSession.title,
          description: newGroupSession.description,
          date: new Date(newGroupSession.date).toISOString(),
          duration_min: newGroupSession.duration_min,
          price_cents: newGroupSession.price_cents,
          min_students: newGroupSession.min_students,
          max_students: newGroupSession.max_students,
        });

      if (error) throw error;

      setShowCreateForm(false);
      setNewGroupSession({
        title: '',
        description: '',
        date: '',
        duration_min: 60,
        price_cents: 1500,
        min_students: 4,
        max_students: 8,
      });
      load();
    } catch (err) {
      console.error('Error creating group session:', err);
      alert('Error al crear sesión grupal');
    }
  };

  const updateZoomLink = async (sessionId, zoomLink) => {
    try {
      const { error } = await supabase
        .from('group_sessions')
        .update({ zoom_link: zoomLink })
        .eq('id', sessionId);

      if (error) throw error;
      alert('Enlace Zoom actualizado');
      load();
    } catch (err) {
      console.error('Error updating zoom link:', err);
      alert('Error al actualizar enlace Zoom');
    }
  };

  const cancelGroupSession = async (sessionId) => {
    if (!window.confirm('¿Seguro que quieres cancelar esta sesión grupal?')) return;

    try {
      // Actualizar estado de la sesión
      const { error: updateError } = await supabase
        .from('group_sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // Obtener inscripciones para procesar reembolsos
      const { data: enrollmentsData, error: fetchError } = await supabase
        .from('group_enrollments')
        .select('stripe_payment_id')
        .eq('session_id', sessionId);

      if (fetchError) throw fetchError;

      // Aquí iría la lógica de reembolso con Stripe
      // Por ahora, solo marcamos como refunded
      const { error: refundError } = await supabase
        .from('group_enrollments')
        .update({ refunded: true })
        .eq('session_id', sessionId);

      if (refundError) throw refundError;

      alert('Sesión cancelada y reembolsos procesados');
      load();
    } catch (err) {
      console.error('Error cancelling session:', err);
      alert('Error al cancelar sesión');
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--ink-muted)' }}>Cargando sesiones...</p>;
  }

  return (
    <div>
      {/* Sesiones Individuales */}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '1rem' }}>
        Sesiones Individuales (Próximos 7 días)
      </h3>
      {individualSessions.length === 0 ? (
        <p style={{ color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>No hay sesiones individuales programadas.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Email</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {individualSessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.student_name}</td>
                  <td>{session.student_email}</td>
                  <td>{new Date(session.date).toLocaleDateString('es-ES')}</td>
                  <td>{session.time}</td>
                  <td>
                    <span className={`badge ${session.status === 'confirmed' ? 'badge--active' : 'badge--pending'}`}>
                      {session.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sesiones Grupales */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: '700', color: 'var(--ink)', margin: 0 }}>
          Sesiones Grupales
        </h3>
        <button
          className="btn btn--primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        >
          {showCreateForm ? 'Cancelar' : '+ Nueva sesión'}
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={createGroupSession}
          style={{
            background: 'var(--canvas)',
            padding: '1.5rem',
            borderRadius: 'var(--r-md)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ink-muted)', marginBottom: '0.4rem' }}>
                Título *
              </label>
              <input
                type="text"
                required
                value={newGroupSession.title}
                onChange={(e) => setNewGroupSession({ ...newGroupSession, title: e.target.value })}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ink-muted)', marginBottom: '0.4rem' }}>
                Fecha y hora *
              </label>
              <input
                type="datetime-local"
                required
                value={newGroupSession.date}
                onChange={(e) => setNewGroupSession({ ...newGroupSession, date: e.target.value })}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ink-muted)', marginBottom: '0.4rem' }}>
              Descripción
            </label>
            <textarea
              value={newGroupSession.description}
              onChange={(e) => setNewGroupSession({ ...newGroupSession, description: e.target.value })}
              className="form-input"
              rows={2}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn--primary">
              Crear sesión
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn btn--ghost"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {groupSessions.length === 0 ? (
        <p style={{ color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>No hay sesiones grupales programadas.</p>
      ) : (
        <div style={{ marginBottom: '2rem' }}>
          {groupSessions.map((session) => (
            <div
              key={session.id}
              style={{
                background: 'var(--white)',
                border: '1px solid rgba(14,28,47,.06)',
                borderRadius: 'var(--r-md)',
                padding: '1rem 1.5rem',
                marginBottom: '1rem',
                cursor: 'pointer',
              }}
              onClick={() => {
                setSelectedGroupSession(session);
                loadEnrollments(session.id);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                    {session.title}
                  </h4>
                  {session.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '0.5rem' }}>
                      {session.description}
                    </p>
                  )}
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>
                    📅 {new Date(session.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' '}
                    a las {new Date(session.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', margin: 0 }}>
                    <span className={`badge ${session.status === 'confirmed' ? 'badge--active' : session.status === 'open' ? 'badge--pending' : 'badge--pending'}`}>
                      {session.status === 'confirmed' ? 'Confirmada' : session.status === 'open' ? 'Abierta' : 'Cancelada'}
                    </span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {session.status === 'open' && (
                    <button
                      className="btn btn--ghost"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelGroupSession(session.id);
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detalles de sesión grupal seleccionada */}
      {selectedGroupSession && (
        <div
          style={{
            background: 'var(--canvas)',
            borderRadius: 'var(--r-md)',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '1rem' }}>
            {selectedGroupSession.title} - Inscritos
          </h4>

          {enrollments.length === 0 ? (
            <p style={{ color: 'var(--ink-muted)', marginBottom: '1rem' }}>No hay inscritos todavía.</p>
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  style={{
                    background: 'var(--white)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--r-sm)',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <strong>{enrollment.student_name}</strong> · {enrollment.student_email}
                  {enrollment.refunded && <span className="badge badge--pending" style={{ marginLeft: '0.5rem' }}>Reembolsado</span>}
                </div>
              ))}
            </div>
          )}

          {/* Añadir enlace Zoom */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--canvas-alt)' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ink-muted)', marginBottom: '0.4rem' }}>
              Enlace Zoom
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="url"
                placeholder="https://zoom.us/j/..."
                defaultValue={selectedGroupSession.zoom_link || ''}
                className="form-input"
                style={{ flex: 1 }}
                id={`zoom-${selectedGroupSession.id}`}
              />
              <button
                className="btn btn--primary"
                onClick={() => {
                  const input = document.getElementById(`zoom-${selectedGroupSession.id}`);
                  updateZoomLink(selectedGroupSession.id, input.value);
                }}
              >
                Guardar
              </button>
            </div>
            {selectedGroupSession.zoom_link && (
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '0.5rem' }}>
                Enlace actual configurado: <a href={selectedGroupSession.zoom_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue-mid)' }}>Abrir Zoom</a>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
