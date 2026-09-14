import React from 'react';
import { AlertCircle } from 'lucide-react';

const FormField = ({
  label,
  error,
  required = false,
  children,
  helperText,
  id,
  className = '',
}) => {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          <span>
            {label} {required && <span style={{ color: 'var(--status-action)' }}>*</span>}
          </span>
        </label>
      )}

      {children}

      {error ? (
        <div className="form-error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <div className="form-helper">{helperText}</div>
      ) : null}
    </div>
  );
};

export default FormField;
