import React from 'react';
import { GraduationCap } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <GraduationCap size={18} />
            <span>Smart College Administration</span>
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <div className="auth-card">
          {children}
        </div>

        <div className="auth-banner-notice">
          AI-Powered Multi-Agent System &bull; Student Self-Service Portal
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
