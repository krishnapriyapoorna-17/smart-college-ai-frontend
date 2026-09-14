/**
 * Student Service
 * 
 * Project: "AI-Powered Multi-Agent System for Smart College Administration"
 * 
 * Official Endpoints:
 * - GET /api/students/{id}
 */

import { api } from './api.js';

export const studentService = {
  /**
   * Retrieve student profile by ID
   * @param {string} studentId - Student identifier (e.g., 'STU001')
   * @returns {Promise<object>} Student profile and academic information
   */
  getStudentById: async (studentId) => {
    if (!studentId) {
      throw new Error('studentId is required to fetch student profile');
    }
    return api.get(`/api/students/${encodeURIComponent(studentId)}`);
  },
};

export default studentService;
