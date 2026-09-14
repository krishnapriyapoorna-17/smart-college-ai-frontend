import React from 'react';
import { Link } from 'react-router-dom';
import RequestStatusBadge from './RequestStatusBadge';
import { Bot, Calendar, ChevronRight, Paperclip } from 'lucide-react';

const RequestCard = ({ request }) => {
  if (!request) return null;

  return (
    <Link to={`/requests/${request.id}`} className="request-card">
      <div className="request-card-header">
        <span className="request-id">{request.id}</span>
        <RequestStatusBadge status={request.status} />
      </div>

      <h3 className="request-title">{request.title || request.text}</h3>
      {(request.description || request.text) && (
        <p className="request-desc-snippet">{request.description || request.text}</p>
      )}

      <div className="request-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {request.assignedAgent && (
            <span className="assigned-agent-tag">
              <Bot size={15} />
              <span>{request.assignedAgent}</span>
            </span>
          )}

          {request.createdAt && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} />
              <span>{request.createdAt}</span>
            </span>
          )}

          {request.attachments && request.attachments.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)' }}>
              <Paperclip size={13} />
              <span>{request.attachments.length} file</span>
            </span>
          )}
        </div>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--color-primary)', fontWeight: 500 }}>
          <span>View</span>
          <ChevronRight size={15} />
        </span>
      </div>
    </Link>
  );
};

export default RequestCard;
