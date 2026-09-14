import { useState, useCallback } from 'react';
import requestService from '../services/requestService.js';

/**
 * Custom Hook: useRequests
 * 
 * Project: "AI-Powered Multi-Agent System for Smart College Administration"
 * 
 * Coordinates request state, operations, and caching for student UI views.
 * Dispatches operations to requestService.
 */
export const useRequests = () => {
  const [requests, setRequests] = useState([]);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all requests for the student
   * Calls GET /api/requests via requestService
   */
  const fetchRequests = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestService.getRequests(params);
      setRequests(data);
      return data;
    } catch (err) {
      const message = err?.message || 'Unable to load requests.';
      setError(message);
      setRequests([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch single request details by ID
   * Calls GET /api/requests/:id via requestService
   */
  const fetchRequestById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestService.getRequestById(id);
      setCurrentRequest(data);
      return data;
    } catch (err) {
      const message = err?.message || `Failed to fetch request ${id}`;
      setError(message);
      setCurrentRequest(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit new administrative request
   * Calls POST /api/requests via requestService
   * Payload: { student_id, text, document_id }
   */
  const createRequest = useCallback(async (requestData) => {
    setLoading(true);
    setError(null);
    try {
      const created = await requestService.createRequest(requestData);
      setRequests((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = err?.message || 'Failed to submit request';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update request status
   * Calls PATCH /api/requests/:id/status via requestService
   */
  const updateStatus = useCallback(async (id, statusData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await requestService.updateRequestStatus(id, statusData);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setCurrentRequest((prev) => (prev && prev.id === id ? updated : prev));
      return updated;
    } catch (err) {
      const message = err?.message || `Failed to update status for ${id}`;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    requests,
    currentRequest,
    loading,
    error,
    fetchRequests,
    fetchRequestById,
    createRequest,
    updateStatus,
    refresh: fetchRequests,
  };
};

export default useRequests;
