/**
 * Central API Client Configuration
 * 
 * Project: "AI-Powered Multi-Agent System for Smart College Administration"
 * 
 * Central HTTP client module for communicating with the FastAPI backend.
 * Encapsulates base URL, authentication headers, JSON/multipart serialization,
 * response parsing, and standardized error handling.
 * 
 * Production Client: Communicates directly via native HTTP fetch with FastAPI.
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';

/**
 * Standardized API Error Representation
 */
export class ApiError extends Error {
  constructor(message, status = 0, data = null, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * In-memory / storage token accessor
 */
let authTokenGetter = () => {
  try {
    return localStorage.getItem('smart_college_token') || null;
  } catch {
    return null;
  }
};

let onUnauthorizedHandler = null;

/**
 * Register a callback when any request returns 401 Unauthorized
 * @param {Function} handler
 */
export const setOnUnauthorized = (handler) => {
  if (typeof handler === 'function' || handler === null) {
    onUnauthorizedHandler = handler;
  }
};

/**
 * Allows AuthContext or other modules to provide a custom token getter
 * @param {Function} getter - Function returning the current token string or null
 */
export const setTokenGetter = (getter) => {
  if (typeof getter === 'function') {
    authTokenGetter = getter;
  }
};

/**
 * Set token directly in local storage for session persistence
 * @param {string|null} token
 */
export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('smart_college_token', token);
    } else {
      localStorage.removeItem('smart_college_token');
    }
  } catch (e) {
    console.warn('[API Client] Storage access failed:', e);
  }
};

/**
 * Get the currently configured base URL
 */
export const getApiBaseUrl = () => API_BASE_URL;

/**
 * Core Request Dispatcher
 * @param {string} endpoint - API route (e.g., '/api/requests')
 * @param {object} options - Request configuration (method, headers, body, params, skipAuth)
 */
export const request = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    headers = {},
    body = null,
    params = null,
    skipAuth = false,
    ...restOptions
  } = options;

  // Build full target URL cleanly without duplicate slashes
  const cleanBase = (API_BASE_URL || '').replace(/\/+$/, '');
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = cleanBase ? `${cleanBase}${cleanPath}` : cleanPath;

  if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Compose request headers
  const requestHeaders = { ...headers };

  // Attach Authorization header if a token exists and auth is not skipped
  if (!skipAuth) {
    const token = authTokenGetter();
    if (token && !requestHeaders['Authorization']) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Handle body formatting:
  // If body is FormData (e.g. file upload), do NOT set Content-Type header.
  // The browser will automatically generate the multipart boundary.
  let requestBody = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (body && !isFormData && typeof body === 'object') {
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
    requestBody = JSON.stringify(body);
  }

  const fetchConfig = {
    method,
    headers: requestHeaders,
    body: requestBody,
    ...restOptions,
  };

  let response;
  try {
    response = await fetch(url, fetchConfig);
  } catch (err) {
    // Network failure / DNS / Connection refused
    throw new ApiError(
      err?.message || 'Network connection failed. Please ensure the backend server is running.',
      0,
      null,
      true
    );
  }

  // Parse response payload (JSON, text, or empty for 204 No Content)
  let responseData = null;
  if (response.status !== 204 && response.status !== 205) {
    const contentType = response.headers?.get ? response.headers.get('content-type') : '';
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    } else if (contentType && contentType.includes('text/html')) {
      // HTML response indicates SPA fallback or reverse proxy error page
      throw new ApiError(
        `Received unexpected HTML response (HTTP ${response.status}). Ensure FastAPI backend server is running.`,
        response.status === 200 ? 502 : response.status,
        null,
        false
      );
    } else {
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : null;
      } catch {
        responseData = null;
      }
    }
  }

  // Check HTTP response status
  if (!response.ok) {
    let errorMessage = `Request failed with status code ${response.status}`;

    // Automatic session invalidation hook on 401 Unauthorized
    if (response.status === 401 && !skipAuth) {
      setAuthToken(null);
      if (typeof onUnauthorizedHandler === 'function') {
        try {
          onUnauthorizedHandler();
        } catch {
          // Prevent handler errors from masking the 401 ApiError
        }
      }
    }

    if (typeof responseData?.detail === 'string') {
      errorMessage = responseData.detail;
    } else if (Array.isArray(responseData?.detail)) {
      // Handle FastAPI HTTP 422 validation detail array: [{ loc: [...], msg: "..." }]
      errorMessage = responseData.detail
        .map((item) => (item.loc ? `${item.loc.slice(1).join('.') || item.loc.join('.')}: ${item.msg}` : item.msg))
        .join(', ');
    } else if (responseData?.message) {
      errorMessage = responseData.message;
    }

    throw new ApiError(errorMessage, response.status, responseData, false);
  }

  return responseData;
};

/**
 * Convenient API Client Interface
 */
export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
  request,
  setTokenGetter,
  setOnUnauthorized,
  setAuthToken,
  getApiBaseUrl,
};

export default api;
