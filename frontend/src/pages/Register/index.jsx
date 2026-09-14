import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import FormField from '../../components/forms/FormField';
import PasswordInput from '../../components/forms/PasswordInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    }

    if (!formData.studentId.trim()) {
      errs.studentId = 'Student ID / Roll Number is required.';
    }

    if (!formData.email.trim()) {
      errs.email = 'College Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (formData.confirmPassword !== formData.password) {
      errs.confirmPassword = 'Passwords do not match.';
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
      await register({
        student_id: formData.studentId,
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setGeneralError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register your student credentials to access college AI services"
    >
      {isSuccess ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: 'var(--status-completed-bg)',
              color: 'var(--status-completed)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle2 size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>Registration Successful!</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Account verified. Redirecting you to the sign-in page...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
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
          <FormField
            id="register-fullName"
            label="Full Name"
            error={errors.fullName}
            required
          >
            <input
              id="register-fullName"
              name="fullName"
              type="text"
              className={`form-input ${errors.fullName ? 'has-error' : ''}`}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            id="register-studentId"
            label="Student Roll Number"
            error={errors.studentId}
            required
            helperText="Your official college enrollment ID"
          >
            <input
              id="register-studentId"
              name="studentId"
              type="text"
              className={`form-input ${errors.studentId ? 'has-error' : ''}`}
              placeholder="e.g. STU12345"
              value={formData.studentId}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            id="register-email"
            label="College Email Address"
            error={errors.email}
            required
          >
            <input
              id="register-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              placeholder="student@college.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            id="register-password"
            label="Create Password"
            error={errors.password}
            required
            helperText="Minimum 6 characters with mixed characters"
          >
            <PasswordInput
              id="register-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              hasError={Boolean(errors.password)}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
          </FormField>

          <FormField
            id="register-confirmPassword"
            label="Confirm Password"
            error={errors.confirmPassword}
            required
          >
            <PasswordInput
              id="register-confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              hasError={Boolean(errors.confirmPassword)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </FormField>

          <div style={{ marginTop: '1.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              icon={UserPlus}
              style={{ width: '100%' }}
            >
              Register Account
            </Button>
          </div>
        </form>
      )}

      <div className="auth-footer">
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 600 }}>
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
