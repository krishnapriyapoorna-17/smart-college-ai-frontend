import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import FormField from '../../components/forms/FormField';
import PasswordInput from '../../components/forms/PasswordInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [forgotNotice, setForgotNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!identifier.trim()) {
      errs.identifier = 'Student ID or College Email is required.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setGeneralError('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      setGeneralError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your student administration account"
    >
      {generalError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--status-action-bg)',
            border: '1px solid var(--status-action-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--status-action)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="student-identifier"
          label="Student ID or Email"
          error={errors.identifier}
          required
          helperText="Enter your student roll number or institutional email"
        >
          <input
            id="student-identifier"
            type="text"
            className={`form-input ${errors.identifier ? 'has-error' : ''}`}
            placeholder="Enter your student roll number or email"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: '' }));
            }}
            autoComplete="username"
          />
        </FormField>

        <FormField
          id="student-password"
          label="Password"
          error={errors.password}
          required
        >
          <PasswordInput
            id="student-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            hasError={Boolean(errors.password)}
            placeholder="Enter your password"
          />
        </FormField>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            fontSize: '0.8125rem',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--color-primary)' }}
            />
            <span>Remember this device</span>
          </label>

          <button
            type="button"
            className="btn-link"
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.8125rem', padding: 0 }}
            onClick={() => setForgotNotice((prev) => !prev)}
          >
            Forgot password?
          </button>
        </div>

        {forgotNotice && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              lineHeight: 1.45,
              marginBottom: '1.25rem',
            }}
          >
            Please contact your College Department Coordinator or IT Admin desk with your student enrollment ID to reset portal credentials.
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          icon={LogIn}
          style={{ width: '100%' }}
        >
          Sign In
        </Button>
      </form>

      <div className="auth-footer">
        Don't have an account?{' '}
        <Link to="/register" style={{ fontWeight: 600 }}>
          Register here
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
