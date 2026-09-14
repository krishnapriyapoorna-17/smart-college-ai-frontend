import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useRequests from '../../hooks/useRequests';
import RequestStatusBadge from '../../components/requests/RequestStatusBadge';
import RequestTimeline from '../../components/requests/RequestTimeline';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Share2,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRequest, loading, error, fetchRequestById } = useRequests();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequestById(id).catch((err) => {
        console.warn(`Could not load request ${id}:`, err?.message);
      });
    }
  }, [id, fetchRequestById]);

  const handleShare = async () => {
    try {
      if (navigator.clipboard && window.location.href) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // clipboard access fallback
    }
  };

  const handleExport = () => {
    window.print();
  };

  const request = currentRequest;

  if (loading && !request) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
        <Loader2 size={36} className="spinner" style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>Loading request details...</p>
      </div>
    );
  }

  // If request data cannot currently be loaded, show clean unavailable state
  if (!request) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <Link to="/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={16} />
            <span>Back to Request History</span>
          </Link>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{id || 'Request'}</span>
        </div>

        <div className="card" style={{ maxWidth: 580, margin: '2rem auto', padding: '2.5rem 1.5rem' }}>
          <EmptyState
            icon={AlertCircle}
            title={error && error.includes('404') ? 'Request Not Found' : 'Request details unavailable'}
            description={error || "We couldn't load this request record. Please verify the ID or check backend connection."}
            actionLabel="Back to Request History"
            actionIcon={ArrowLeft}
            onAction={() => navigate('/requests')}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
        <Link to="/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-secondary)' }}>
          <ArrowLeft size={16} />
          <span>Back to Request History</span>
        </Link>
        <span style={{ color: 'var(--color-text-muted)' }}>/</span>
        <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{request.id}</span>
      </div>

      {/* Main Request Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="request-id">{request.id}</span>
              <RequestStatusBadge status={request.status} />
              {request.category && <span className="badge badge-neutral">{request.category}</span>}
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {request.title || request.text}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={Share2}
              onClick={handleShare}
            >
              {copied ? 'Link Copied!' : 'Share'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.8125rem',
          }}
        >
          {request.createdAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)' }}>
              <Calendar size={15} color="var(--color-text-muted)" />
              <span>Submitted:</span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{request.createdAt}</strong>
            </div>
          )}

          {request.resolvedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)' }}>
              <Clock size={15} color="var(--color-text-muted)" />
              <span>Resolved:</span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{request.resolvedAt}</strong>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
        {/* Left Column: Request Query & Resolution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Original Request Details */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Original Request</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              {request.description || request.text}
            </p>

            {request.attachments && request.attachments.length > 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  Attached Documents:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {request.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        backgroundColor: 'var(--color-surface-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} color="var(--color-primary)" />
                        <span style={{ fontWeight: 500 }}>{file.name}</span>
                        {file.size && <span style={{ color: 'var(--color-text-muted)' }}>({file.size})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Response card (if response exists) */}
          {request.response && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Resolution</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                {request.response.summary || request.response.result}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Workflow Timeline */}
        {request.timeline && request.timeline.length > 0 && (
          <div>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Processing Timeline</h3>
              <RequestTimeline timeline={request.timeline} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetailsPage;
