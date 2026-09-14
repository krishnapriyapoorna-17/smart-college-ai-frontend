import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { FileQuestion, LayoutDashboard } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <FileQuestion size={42} />
      </div>

      <span
        style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text-primary)',
          lineHeight: 1,
          marginBottom: '0.5rem',
        }}
      >
        404
      </span>

      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
        Page Not Found
      </h1>

      <p
        style={{
          maxWidth: 460,
          color: 'var(--color-text-secondary)',
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}
      >
        The student portal view you requested does not exist or may have been moved.
        Please check the URL or return to your student dashboard.
      </p>

      <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <LayoutDashboard size={18} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
