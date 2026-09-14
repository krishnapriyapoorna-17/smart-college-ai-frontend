import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertTriangle } from 'lucide-react';

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const FileUpload = ({ file, onFileSelect, onFileRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndHandleFile = (selectedFile) => {
    setUploadError(null);
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setUploadError('Unsupported file type. Please upload a PDF, JPG, or PNG.');
      return;
    }

    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File exceeds ${MAX_SIZE_MB}MB limit. Please upload a smaller file.`);
      return;
    }

    onFileSelect(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndHandleFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {!file ? (
        <div
          className={`file-upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current && fileInputRef.current.click();
            }
          }}
          aria-label="Upload document area. Click or drag and drop to attach supporting file."
        >
          <div className="file-upload-icon-box">
            <UploadCloud size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9125rem', color: 'var(--color-text-primary)' }}>
              Click to browse or drag and drop document
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              PDF, JPG, or PNG (Max {MAX_SIZE_MB}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="attached-file-chip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
              <FileText size={22} />
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {formatFileSize(file.size)} &bull; Ready for submission
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onFileRemove();
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            aria-label="Remove attached file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {uploadError && (
        <div className="form-error" style={{ marginTop: '0.5rem' }}>
          <AlertTriangle size={14} />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
