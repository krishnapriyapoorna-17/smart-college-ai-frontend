/**
 * Authentication Service
 * 
 * Project: "AI-Powered Multi-Agent System for Smart College Administration"
 * 
 * Official Endpoints:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - GET  /api/auth/me
 */

import { api, setAuthToken } from './api.js';

export const authService = {
  /**
   * Register a new student account
   * @param {object} userData - { fullName, studentId, email, password, confirmPassword }
   * @returns {Promise<object>} Parsed API response
   */
  register: async (userData) => {
    return api.post('/api/auth/register', userData, { skipAuth: true });
  },

  /**
   * Authenticate student credentials
   * @param {object} credentials - { identifier, password }
   * @returns {Promise<object>} Parsed API response (e.g. { access_token, token_type, user })
   */
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials, { skipAuth: true });
    // If backend returns a token property, store it in the API client token store
    const token = response?.access_token || response?.token;
    if (token) {
      setAuthToken(token);
    }
    return response;
  },

  /**
   * Retrieve the profile of the currently authenticated student
   * @returns {Promise<object>} Current student user profile
   */
  getCurrentUser: async () => {
    return api.get('/api/auth/me');
  },

  /**
   * Terminate current student session and clear stored credentials
   */
  logout: () => {
    setAuthToken(null);
  },
};

export default authService;
