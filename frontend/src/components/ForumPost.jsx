import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../lib/api';

/**
 * Reusable forum post card.
 *
 * Renders the body as Markdown (incl. clickable links and GFM autolinks),
 * shows an "edited" badge when applicable, and exposes inline edit/delete
 * controls for the author and for any admin.
 *
 * Props:
 *   - post: the thread document
 *   - currentUser: { id, email, role }
 *   - onChange: () => void to refresh parent list after edit/delete
 *   - onReply?: (postId) => void  (only on root posts)
 *   - childPost?: bool, applies the indented styling
 *   - testidPrefix?: string for data-testids (defaults to 'thread')
 */
export default function ForumPost({
  post,
  currentUser,
  onChange,
  onReply,
  childPost = false,
  testidPrefix = 'thread',
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.body_md || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = currentUser?.id && post.user_id === currentUser.id;
  const canEdit = isAdmin || isOwner;

  const startEdit = () => {
    setDraft(post.body_md || '');
    setErr('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(post.body_md || '');
    setErr('');
  };

  const saveEdit = async () => {
    if (!draft.trim()) return;
    setBusy(true); setErr('');
    try {
      await api.patch(`/forum/thread/${post.id}`, { body_md: draft });
      setEditing(false);
      if (onChange) onChange();
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Error al guardar');
    }
    setBusy(false);
  };

  const remove = async () => {
    const isRoot = !post.parent_id;
    const confirmMsg = isRoot
      ? '¿Borrar este mensaje y todas sus respuestas? Esta acción no se puede deshacer.'
      : '¿Borrar esta respuesta? Esta acción no se puede deshacer.';
    if (!window.confirm(confirmMsg)) return;
    setBusy(true); setErr('');
    try {
      await api.delete(`/forum/thread/${post.id}`);
      if (onChange) onChange();
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Error al borrar');
      setBusy(false);
    }
  };

  return (
    <div
      className={`thread-post ${childPost ? 'thread-post--child' : ''}`}
      data-testid={`${testidPrefix}-${post.id}`}
    >
      <div className="thread-post__meta">
        <strong>{post.user_email}</strong>{' '}
        · <span>{new Date(post.created_at).toLocaleString('es-ES')}</span>
        {post.edited_at && (
          <span
            style={{ marginLeft: '.5rem', fontStyle: 'italic', color: 'var(--ink-muted)' }}
            title={`Editado el ${new Date(post.edited_at).toLocaleString('es-ES')}${
              post.edited_by_email && post.edited_by_email !== post.user_email
                ? ` por ${post.edited_by_email}`
                : ''
            }`}
            data-testid={`${testidPrefix}-edited-${post.id}`}
          >
            · editado
          </span>
        )}
      </div>

      {editing ? (
        <div style={{ marginTop: '.5rem' }}>
          <textarea
            className="form-input"
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            data-testid={`${testidPrefix}-edit-textarea-${post.id}`}
          />
          {err && <p style={{ color: 'var(--clm-red)', fontSize: '.85rem', marginTop: '.4rem' }}>{err}</p>}
          <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={saveEdit}
              disabled={busy || !draft.trim()}
              data-testid={`${testidPrefix}-edit-save-${post.id}`}
            >
              {busy ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={cancelEdit}
              disabled={busy}
              data-testid={`${testidPrefix}-edit-cancel-${post.id}`}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="thread-post__body markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
              ),
            }}
          >
            {post.body_md || ''}
          </ReactMarkdown>
        </div>
      )}

      {!editing && (
        <div
          style={{
            display: 'flex', gap: '.85rem', marginTop: '.5rem', flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {onReply && !post.parent_id && (
            <button
              type="button"
              onClick={() => onReply(post.id)}
              className="linkish"
              data-testid={`${testidPrefix}-reply-${post.id}`}
            >
              Responder
            </button>
          )}
          {canEdit && (
            <>
              <button
                type="button"
                onClick={startEdit}
                className="linkish"
                data-testid={`${testidPrefix}-edit-${post.id}`}
                style={{ color: 'var(--blue)' }}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={remove}
                className="linkish"
                disabled={busy}
                data-testid={`${testidPrefix}-delete-${post.id}`}
                style={{ color: 'var(--clm-red)' }}
              >
                Borrar
              </button>
            </>
          )}
          {err && !editing && (
            <span style={{ color: 'var(--clm-red)', fontSize: '.82rem' }}>{err}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function MarkdownHelp() {
  return (
    <p
      style={{
        fontSize: '.78rem',
        color: 'var(--ink-muted)',
        marginTop: '.4rem',
        lineHeight: 1.5,
      }}
      data-testid="forum-markdown-help"
    >
      Puedes dar formato con Markdown: <code>**negrita**</code>,{' '}
      <code>*cursiva*</code>, <code>[texto](https://…)</code> para enlaces,{' '}
      <code>- elemento</code> para listas. Las URLs sueltas se convierten en
      enlaces clicables automáticamente.
    </p>
  );
}
