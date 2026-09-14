import React from 'react';
import Badge from '../common/Badge';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';

const RequestStatusBadge = ({ status = 'PENDING', className = '' }) => {
  const norm = (status || '').toUpperCase();

  if (norm === 'COMPLETED' || norm === 'RESOLVED') {
    return (
      <Badge variant="completed" icon={CheckCircle2} className={className}>
        Completed
      </Badge>
    );
  }

  if (norm === 'IN_PROGRESS' || norm === 'PROCESSING') {
    return (
      <Badge variant="processing" icon={RefreshCw} className={className}>
        In Progress
      </Badge>
    );
  }

  if (norm === 'ACTION_REQUIRED' || norm === 'FAILED' || norm === 'REJECTED') {
    return (
      <Badge variant="action" icon={AlertCircle} className={className}>
        Action Required
      </Badge>
    );
  }

  return (
    <Badge variant="pending" icon={Clock} className={className}>
      Pending
    </Badge>
  );
};

export default RequestStatusBadge;
