import React from 'react';

const Card = ({ children, className = '', title, subtitle, ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || subtitle) && (
        <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          {title && <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
