import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRequests from '../../hooks/useRequests';
import { useAuth } from '../../context/AuthContext';
import uploadService from '../../services/uploadService';
import FormField from '../../components/forms/FormField';
import FileUpload from '../../components/forms/FileUpload';
import VoiceInput from '../../components/forms/VoiceInput';
import Button from '../../components/common/Button';
import {
  Send,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Info,
  AlertCircle,
} from 'lucide-react';

const MAX_CHAR_COUNT = 1000;

const REQUEST_CATEGORIES = [
  { id: 'academic', label: 'Academic Records' },
  { id: 'attendance', label: 'Attendance & Condonation' },
  { id: 'fees', label: 'Fees & Accounts' },
  { id: 'examination', label: 'Examinations & Grades' },
  { id: 'grievance', label: 'General Grievance' },
];

const NewRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createRequest } = useRequests();

  const [category, setCategory] = useState('academic');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [attachedFile, setAttachedFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdRequest, setCreatedRequest] = useState(null);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const validate = () => {
    const errs = {};
    if (!description.trim()) {
      errs.description = 'Please describe your request or inquiry.';
    } else if (description.trim().length < 10) {
      errs.description = 'Please provide at least 10 characters to describe your request.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setSubmitError('');
    if (!validate()) return;

    setIsLoading(true);

    try {
      const studentId = user?.studentId || user?.student_id || user?.id;
      if (!studentId) {
        setSubmitError('Unable to identify authenticated student account. Please sign in again.');
        return;
      }

      let document_id = null;
      if (attachedFile) {
        const uploadResult = await uploadService.uploadDocument(attachedFile);
        document_id = uploadResult?.document_id || uploadResult?.file_id || null;
      }

      const payload = {
        student_id: studentId,
        text: description.trim(),
        document_id: document_id || null,
      };

      const result = await createRequest(payload);
      setCreatedRequest(result);
      setSubmittedNotice(true);
    } catch (err) {
      setSubmitError(err?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setDescription('');
    setAttachedFile(null);
    setCreatedRequest(null);
    setSubmittedNotice(false);
    setSubmitError('');
    setErrors({});
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit a New Request</h1>
          <p className="page-subtitle">
            Describe your academic inquiry or administrative request.
          </p>
        </div>
      </div>

      {submittedNotice && createdRequest ? (
        <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'var(--status-completed-bg)',
              color: 'var(--status-completed)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Request Submitted Successfully!</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Your request has been routed to the administration system and assigned tracking reference:
          </p>

          <div
            style={{
              display: 'inline-block',
              padding: '0.6rem 1.25rem',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--color-primary)',
              letterSpacing: '0.05em',
              marginBottom: '1.75rem',
            }}
          >
            {createdRequest.id}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={handleResetForm}
            >
              Submit Another
            </Button>
            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={() => navigate(`/requests/${createdRequest.id}`)}
            >
              View Request Details
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/requests')}
            >
              Request History
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {submitError && (
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
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{submitError}</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.75rem' }}>
            {/* Left Column: Form Inputs */}
            <div className="card">
              {/* Category Selector */}
              <FormField
                id="request-category"
                label="Request Category"
                required
              >
                <select
                  id="request-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {REQUEST_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Priority Selector */}
              <FormField
                id="request-priority"
                label="Priority"
              >
                <select
                  id="request-priority"
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </FormField>

              {/* Description Input */}
              <FormField
                id="request-description"
                label="Request Description"
                error={errors.description}
                required
                helperText={`${description.length} / ${MAX_CHAR_COUNT} characters`}
              >
                <textarea
                  id="request-description"
                  rows={5}
                  className={`form-textarea ${errors.description ? 'has-error' : ''}`}
                  placeholder="Describe your request in detail..."
                  value={description}
                  maxLength={MAX_CHAR_COUNT}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                  }}
                />
              </FormField>

              {/* Voice Input UI */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>
                  Voice Input
                </label>
                <VoiceInput />
              </div>

              {/* Document Upload UI */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>
                  Supporting Document
                </label>
                <FileUpload
                  file={attachedFile}
                  onFileSelect={(file) => setAttachedFile(file)}
                  onFileRemove={() => setAttachedFile(null)}
                />
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Send}
                  loading={isLoading}
                >
                  Submit Request
                </Button>
              </div>
            </div>

            {/* Right Column: Submission Guidelines */}
            <div>
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                  <Info size={20} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Submission Guidelines</h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Follow these guidelines to ensure accurate administrative processing:
                </p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8125rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>&bull;</span>
                    <div>
                      <strong>Clear Description:</strong> State your exact requirement, relevant subject codes, or term.
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>&bull;</span>
                    <div>
                      <strong>Supporting Documents:</strong> Attach clear PDF or image files if your request requires verification.
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>&bull;</span>
                    <div>
                      <strong>Track Status:</strong> You can monitor processing updates under Request History.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="card" style={{ backgroundColor: '#fafbfc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
                  <HelpCircle size={18} />
                  <h4 style={{ fontSize: '0.9125rem', fontWeight: 600 }}>Need Assistance?</h4>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  For urgent inquiries regarding examinations or fee receipts, ensure your request priority is marked appropriately.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default NewRequestPage;
