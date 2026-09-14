import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Global React Error Boundary
 * 
 * Catches unhandled JavaScript runtime exceptions in the component tree,
 * logs the exception, and renders a recoverable user-visible interface
 * preventing the screen from ever going completely blank.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 520,
              width: '100%',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: 'var(--status-action-bg)',
                color: 'var(--status-action)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <AlertTriangle size={26} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
              Portal Display Notice
            </h2>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              An unexpected error occurred while rendering this view. Your session and data remain intact.
            </p>

            {this.state.error && (
              <div
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={this.handleReload}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RefreshCw size={15} />
                <span>Reload Portal</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={this.handleReset}
              >
                Dismiss Notice
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
