/**
 * Student Administrative Request Service
 * 
 * Project: "AI-Powered Multi-Agent System for Smart College Administration"
 * 
 * Official Endpoints:
 * - POST  /api/requests
 * - GET   /api/requests
 * - GET   /api/requests/{id}
 * - PATCH /api/requests/{id}/status
 */

import { api, ApiError } from './api.js';

export const requestService = {
  /**
   * Submit a new administrative request according to the project's request contract
   * @param {object} payload - { student_id, text, document_id }
   * @returns {Promise<object>} Created request record with assigned ID and initial status
   */
  createRequest: async (payload) => {
    const { student_id, text, document_id = null } = payload || {};

    if (!student_id) {
      throw new Error('student_id is required to create an administrative request');
    }
    if (!text || !text.trim()) {
      throw new Error('text is required to describe the student request');
    }

    const requestBody = {
      student_id,
      text: text.trim(),
      document_id: document_id || null,
    };

    const response = await api.post('/api/requests', requestBody);
    if (response && typeof response === 'object') {
      if (response.request && typeof response.request === 'object') {
        return response.request;
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data;
      }
    }
    return response;
  },

  /**
   * Retrieve student requests, optionally filtered by status, agent, or pagination
   * @param {object} [params] - Query parameters (e.g., { status, limit, offset })
   * @returns {Promise<Array>} List of requests
   */
  getRequests: async (params = {}) => {
    const response = await api.get('/api/requests', { params });

    // 1. Direct array response (Standard specification contract: GET /api/requests -> [...])
    if (Array.isArray(response)) {
      return response;
    }

    // 2. Common API envelope response ({ requests: [...] }, { data: [...] }, { items: [...] })
    if (response && typeof response === 'object') {
      if (Array.isArray(response.requests)) {
        return response.requests;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response.items)) {
        return response.items;
      }
    }

    // 3. If response is neither an array nor an envelope containing an array,
    // it violates the request contract. Do NOT silently convert to []; throw ApiError.
    throw new ApiError(
      'Invalid response shape from /api/requests: Expected an array of student requests',
      0,
      response
    );
  },

  /**
   * Retrieve detailed status, multi-agent trace logs, and resolution for a single request
   * @param {string|number} id - Request ID (e.g. 'REQ001')
   * @returns {Promise<object>} Detailed request record
   */
  getRequestById: async (id) => {
    if (!id) {
      throw new Error('id is required to retrieve request details');
    }
    const response = await api.get(`/api/requests/${encodeURIComponent(id)}`);
    if (response && typeof response === 'object') {
      if (response.request && typeof response.request === 'object') {
        return response.request;
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data;
      }
      return response;
    }
    throw new ApiError(`Invalid response received for request ${id}`, 0, response);
  },

  /**
   * Update the status of an existing request
   * @param {string|number} id - Request ID
   * @param {object} statusData - Status update payload (e.g., { status: 'COMPLETED', remarks: '...' })
   * @returns {Promise<object>} Updated request record
   */
  updateRequestStatus: async (id, statusData) => {
    if (!id) {
      throw new Error('id is required to update request status');
    }
    const response = await api.patch(`/api/requests/${encodeURIComponent(id)}/status`, statusData);
    if (response && typeof response === 'object') {
      if (response.request && typeof response.request === 'object') {
        return response.request;
      }
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data;
      }
    }
    return response;
  },
};

export default requestService;
