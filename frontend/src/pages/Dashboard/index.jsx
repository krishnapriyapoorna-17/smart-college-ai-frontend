import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useRequests from '../../hooks/useRequests';
import { useAuth } from '../../context/AuthContext';
import RequestCard from '../../components/requests/RequestCard';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  ArrowRight,
  FileText,
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { requests, loading, error, fetchRequests } = useRequests();

  useEffect(() => {
    fetchRequests().catch((err) => {
      console.warn('Could not load dashboard requests:', err?.message || err);
    });
  }, [fetchRequests]);

  const inProgressCount = requests.filter((r) =>
    ['PROCESSING', 'PENDING', 'ROUTED', 'INVESTIGATING', 'SUBMITTED', 'IN_PROGRESS'].includes(r?.status)
  ).length;

  const resolvedCount = requests.filter((r) =>
    ['RESOLVED', 'COMPLETED'].includes(r?.status)
  ).length;

  const actionRequiredCount = requests.filter((r) =>
    ['ACTION_REQUIRED', 'REJECTED'].includes(r?.status)
  ).length;

  const studentName = user?.fullName || user?.full_name || user?.name || '';
  const studentId = user?.studentId || user?.student_id || user?.id || '';

  return (
    <div>
      {/* Welcome Section */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {studentName ? `Welcome back, ${studentName}` : 'Welcome to Student Portal'}
          </h1>
          <p className="page-subtitle">
            {studentId ? `Student ID: ${studentId} • ` : ''}Submit and track your academic administration requests.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            icon={Clock}
            onClick={() => navigate('/requests')}
          >
            History
          </Button>
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => navigate('/request/new')}
          >
            New Request
          </Button>
        </div>
      </div>

      {/* Network / Backend Error Alert */}
      {error && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--status-action-bg)',
            border: '1px solid var(--status-action-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--status-action)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => fetchRequests().catch(() => {})}
            style={{ color: 'var(--status-action)', fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics Cards (Dynamically computed from API response) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Requests</span>
            <span className="stat-value">{loading && requests.length === 0 ? '...' : requests.length}</span>
            <span className="stat-subtext">
              {requests.length > 0 ? `${requests.length} recorded requests` : 'No active records'}
            </span>
          </div>
          <div className="stat-icon-wrapper primary">
            <FolderKanban size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{loading && requests.length === 0 ? '...' : inProgressCount}</span>
            <span className="stat-subtext">
              {inProgressCount > 0 ? `${inProgressCount} active in workflow` : 'No active records'}
            </span>
          </div>
          <div className="stat-icon-wrapper processing">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Resolved</span>
            <span className="stat-value">{loading && requests.length === 0 ? '...' : resolvedCount}</span>
            <span className="stat-subtext">
              {resolvedCount > 0 ? `${resolvedCount} completed requests` : 'No active records'}
            </span>
          </div>
          <div className="stat-icon-wrapper completed">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Action Required</span>
            <span className="stat-value">{loading && requests.length === 0 ? '...' : actionRequiredCount}</span>
            <span className="stat-subtext">
              {actionRequiredCount > 0 ? `${actionRequiredCount} requires student action` : 'All clear'}
            </span>
          </div>
          <div className="stat-icon-wrapper action">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Submit Request Hero Section */}
      <div className="ask-ai-hero">
        <div className="ask-ai-header">
          <h2>Submit a Request</h2>
          <p>
            Describe your academic or administrative requirement and submit it for processing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: '0.25rem' }}>
          <Button
            variant="secondary"
            size="md"
            icon={PlusCircle}
            onClick={() => navigate('/request/new')}
            style={{ backgroundColor: '#ffffff', color: 'var(--color-primary)', fontWeight: 600 }}
          >
            New Request
          </Button>
        </div>
      </div>

      {/* Main Grid: Recent Requests & Portal Information */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        {/* Recent Requests Section */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <h2 style={{ fontSize: '1.25rem' }}>Recent Requests</h2>
            {requests.length > 0 && (
              <Link
                to="/requests"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>View all ({requests.length})</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {requests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.slice(0, 3).map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          ) : (
            <div className="card">
              <EmptyState
                icon={FileText}
                title="No requests yet"
                description="Your submitted requests will appear here."
                actionLabel="New Request"
                actionIcon={PlusCircle}
                onAction={() => navigate('/request/new')}
              />
            </div>
          )}
        </div>

        {/* Portal Services & Guidelines */}
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Portal Services</h2>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                Administrative Categories
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Submit inquiries for academic records, attendance records, fee payment receipts, and examination queries.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} color="var(--color-primary)" />
                <span>Bonafide Certificates & Transcripts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} color="var(--color-primary)" />
                <span>Attendance Shortfall & Condonation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} color="var(--color-primary)" />
                <span>Fee Receipts & Challan Clearance</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} color="var(--color-primary)" />
                <span>Examination Hall Tickets & Grades</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem' }}>
              <Link
                to="/requests"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                View Request History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
