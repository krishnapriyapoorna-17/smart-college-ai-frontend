import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Strictly guards authenticated student portal routes.
 * If authentication state is still loading, renders a centered loading indicator.
 * If backend is unavailable during session verification, renders connection notice.
 * If unauthenticated, immediately redirects to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, sessionError, refreshUser, logout } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner" style={{ width: 28, height: 28, borderColor: 'var(--color-primary)', borderTopColor: 'transparent', display: 'inline-block' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '1.5rem' }}>
        <div className="card" style={{ maxWidth: 460, width: '100%', textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--status-action-bg)', color: 'var(--status-action)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <AlertTriangle size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
            Backend Connection Notice
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {sessionError}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-md"
              onClick={() => refreshUser()}
            >
              Retry Connection
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-md"
              onClick={() => logout()}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
