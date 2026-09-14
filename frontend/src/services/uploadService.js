/**
 * Document Upload Service
 * 
 * Project: "AI-Powered Multi-Agent System for Smart College Administration"
 * 
 * Official Endpoint:
 * - POST /api/upload
 */

import { api } from './api.js';

export const uploadService = {
  /**
   * Upload a supporting document (PDF, JPG, PNG) to the college document repository
   * @param {File} file - Browser File object
   * @param {object} [additionalMetadata] - Optional metadata (e.g., { document_type: 'medical_cert' })
   * @returns {Promise<object>} Upload response containing document identifier (e.g. { document_id: 'DOC-1029', filename: '...' })
   */
  uploadDocument: async (file, additionalMetadata = {}) => {
    if (!file) {
      throw new Error('A valid File object is required for document upload');
    }

    // Build FormData payload
    // Note: Do NOT manually set Content-Type header; the browser generates the multipart boundary.
    const formData = new FormData();
    formData.append('file', file);

    if (additionalMetadata && typeof additionalMetadata === 'object') {
      Object.entries(additionalMetadata).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, String(val));
        }
      });
    }

    return api.post('/api/upload', formData);
  },
};

export default uploadService;
