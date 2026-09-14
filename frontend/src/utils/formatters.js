/**
 * UI & Data Formatting Utilities
 */

/**
 * Format a date string into a user-friendly format
 * @param {string|Date} dateValue
 * @returns {string}
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  try {
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? String(dateValue) : d.toLocaleDateString();
  } catch {
    return String(dateValue);
  }
};

/**
 * Capitalize first letter of words
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
