import React from 'react';
import { Check, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

const RequestTimeline = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="timeline-stepper">
      {timeline.map((step, idx) => {
        let nodeClass = 'pending';
        let IconComponent = Clock;

        if (step.status === 'completed') {
          nodeClass = 'completed';
          IconComponent = Check;
        } else if (step.status === 'active') {
          nodeClass = 'active';
          IconComponent = RefreshCw;
        } else if (step.status === 'failed') {
          nodeClass = 'failed';
          IconComponent = AlertTriangle;
        }

        return (
          <div key={idx} className={`timeline-step ${nodeClass}`}>
            <div className={`timeline-icon-node ${nodeClass}`}>
              <IconComponent size={16} />
            </div>

            <div className="timeline-step-content">
              <div className="timeline-step-header">
                <span className="timeline-step-title">{step.step}</span>
                <span className="timeline-step-time">{step.time}</span>
              </div>
              <p className="timeline-step-note">{step.note}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RequestTimeline;
