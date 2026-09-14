import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useRequests from '../../hooks/useRequests';
import RequestCard from '../../components/requests/RequestCard';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { Search, PlusCircle, Inbox, XCircle, AlertTriangle } from 'lucide-react';

const RequestHistoryPage = () => {
  const navigate = useNavigate();
  const { requests, loading, error, fetchRequests } = useRequests();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchRequests().catch((err) => {
      console.warn('Could not load requests:', err.message);
    });
  }, [fetchRequests]);

  // Client-side filtering and searching on current requests
  const filteredRequests = useMemo(() => {
    if (!requests || requests.length === 0) return [];

    return requests
      .filter((req) => {
        // Status filter with status category groupings
        if (statusFilter !== 'ALL') {
          if (statusFilter === 'IN_PROGRESS') {
            const inProgressStatuses = ['IN_PROGRESS', 'PROCESSING', 'PENDING', 'ROUTED', 'INVESTIGATING', 'SUBMITTED'];
            if (!inProgressStatuses.includes(req.status)) return false;
          } else if (statusFilter === 'COMPLETED') {
            const completedStatuses = ['COMPLETED', 'RESOLVED'];
            if (!completedStatuses.includes(req.status)) return false;
          } else if (statusFilter === 'ACTION_REQUIRED') {
            const actionStatuses = ['ACTION_REQUIRED', 'REJECTED'];
            if (!actionStatuses.includes(req.status)) return false;
          } else if (req.status !== statusFilter) {
            return false;
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = req.title?.toLowerCase().includes(q);
          const matchId = req.id?.toLowerCase().includes(q);
          const matchDesc = (req.description || req.text || '').toLowerCase().includes(q);
          const matchCat = req.category?.toLowerCase().includes(q);
          return matchTitle || matchId || matchDesc || matchCat;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return (b.id || '').localeCompare(a.id || '');
        } else {
          return (a.id || '').localeCompare(b.id || '');
        }
      });
  }, [requests, searchQuery, statusFilter, sortOrder]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSortOrder('newest');
  };

  const hasRequests = requests && requests.length > 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Request History</h1>
          <p className="page-subtitle">
            View, filter, and monitor your submitted academic and administrative requests.
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => navigate('/request/new')}
        >
          New Request
        </Button>
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

      {hasRequests ? (
        <>
          {/* Filter and Search Bar (Active when records exist) */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Search Field */}
              <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="Search by ID, keyword, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search requests"
                />
              </div>

              {/* Status Tabs */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'IN_PROGRESS', label: 'In Progress' },
                  { id: 'COMPLETED', label: 'Completed' },
                  { id: 'ACTION_REQUIRED', label: 'Action Required' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`btn btn-sm ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setStatusFilter(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  Sort:
                </span>
                <select
                  className="form-select"
                  style={{ padding: '0.4rem 0.75rem', width: 'auto', fontSize: '0.8125rem' }}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  aria-label="Sort requests by date"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {(searchQuery || statusFilter !== 'ALL') && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span>
                  Showing {filteredRequests.length} of {requests.length} requests
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  onClick={clearFilters}
                >
                  <XCircle size={14} />
                  <span>Clear filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Requests List */}
          {filteredRequests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredRequests.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          ) : (
            <div className="card">
              <EmptyState
                title="No requests match your filter"
                description="Try adjusting your search keywords or switching status tabs."
                actionLabel="Reset Filters"
                onAction={clearFilters}
              />
            </div>
          )}
        </>
      ) : (
        /* Empty State when no request records exist */
        <div className="card">
          <EmptyState
            icon={Inbox}
            title="No requests yet"
            description="Your submitted requests will appear here."
            actionLabel="Create New Request"
            actionIcon={PlusCircle}
            onAction={() => navigate('/request/new')}
          />
        </div>
      )}
    </div>
  );
};

export default RequestHistoryPage;
