import React, { useState, useRef } from 'react';
import { api } from '../lib/api';

export default function FileUpload({ onUploaded, testid = 'file-upload' }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const upload = async (f) => {
    if (!f) return;
    setUploading(true); setError(''); setProgress(0); setFile(f);
    const form = new FormData();
    form.append('file', f);
    try {
      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      onUploaded?.(res.data);
    } catch (ex) {
      setError(ex.response?.data?.detail || 'Error subiendo archivo');
      setFile(null);
    }
    setUploading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  };

  return (
    <div
      className="file-upload"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      data-testid={testid}
    >
      <input
        type="file"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={(e) => upload(e.target.files?.[0])}
        data-testid={`${testid}-input`}
      />
      {!file && !uploading && (
        <>
          <p className="file-upload__title">Arrastra un archivo aquí</p>
          <p className="file-upload__hint">o haz clic para seleccionar · máx. 20 MB · PDF, imágenes, audios</p>
          <button type="button" className="btn btn--ghost" onClick={() => inputRef.current?.click()} data-testid={`${testid}-btn`}>
            Elegir archivo
          </button>
        </>
      )}
      {uploading && (
        <>
          <p className="file-upload__title">Subiendo… {progress}%</p>
          <div className="course-progress-bar"><div className="course-progress-bar__fill" style={{ width: `${progress}%` }} /></div>
          <p className="file-upload__hint">{file?.name}</p>
        </>
      )}
      {!uploading && file && (
        <>
          <p className="file-upload__title">✓ {file.name}</p>
          <button type="button" className="btn btn--ghost" onClick={() => { setFile(null); onUploaded?.(null); }} data-testid={`${testid}-remove`}>
            Cambiar archivo
          </button>
        </>
      )}
      {error && <p style={{ color: 'var(--clm-red)', marginTop: '.5rem', fontSize: '.85rem' }}>{error}</p>}
    </div>
  );
}
