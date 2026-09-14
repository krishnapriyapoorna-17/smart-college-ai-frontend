import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Pages
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
import DashboardPage from '../pages/Dashboard';
import NewRequestPage from '../pages/NewRequest';
import RequestHistoryPage from '../pages/RequestHistory';
import RequestDetailsPage from '../pages/RequestDetails';
import NotFoundPage from '../pages/NotFound';

import { AlertTriangle } from 'lucide-react';

/**
 * Intelligent Root Route Redirect
 * Resolves dynamically based on authentication state:
 * - Fresh unauthenticated visitor -> /login
 * - Authenticated session -> /dashboard
 * - While restoring session -> clean loading placeholder
 * - If backend unavailable during session restore -> visible notice
 */
const RootRedirect = () => {
  const { isAuthenticated, isLoading, sessionError, refreshUser, logout } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner" style={{ width: 28, height: 28, borderColor: 'var(--color-primary)', borderTopColor: 'transparent', display: 'inline-block' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Loading portal...
          </p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1.5rem' }}>
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

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root route resolves dynamically based on authentication */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public / Authentication routes with dedicated centered layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student Portal authenticated routes wrapped with portal Layout (Navbar + Sidebar) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/request/new"
        element={
          <ProtectedRoute>
            <Layout>
              <NewRequestPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/new-request" element={<Navigate to="/request/new" replace />} />

      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <Layout>
              <RequestHistoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/history" element={<Navigate to="/requests" replace />} />

      <Route
        path="/requests/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <RequestDetailsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback route */}
      <Route
        path="*"
        element={
          <Layout>
            <NotFoundPage />
          </Layout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
