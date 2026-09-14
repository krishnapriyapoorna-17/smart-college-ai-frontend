import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setTokenGetter, setOnUnauthorized } from '../services/api.js';
import authService from '../services/authService.js';

/**
 * Authentication Context
 * 
 * Project: "AI-Powered Multi-Agent System for Smart College Administration"
 * 
 * Coordinates student user session, authentication state, and token management
 * through authService and the central API client.
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('smart_college_token') || null;
    } catch {
      return null;
    }
  });
  // Do not assume authenticated until token is verified with backend
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [sessionError, setSessionError] = useState(null);

  // Wire token getter into central API client
  useEffect(() => {
    setTokenGetter(() => token);
  }, [token]);

  // Log out and reset session state
  const logout = useCallback(() => {
    authService.logout();
    try {
      localStorage.removeItem('smart_college_token');
    } catch {}
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setSessionError(null);
  }, []);

  // Hook global 401 unauthorized eviction into API client
  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
    });
    return () => {
      setOnUnauthorized(null);
    };
  }, [logout]);

  // Restore authenticated session on mount via GET /api/auth/me
  const restoreSession = useCallback(async () => {
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setSessionError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSessionError(null);
    try {
      const profile = await authService.getCurrentUser();
      // Ensure profile has valid data structure
      if (!profile || (typeof profile === 'object' && Object.keys(profile).length === 0)) {
        throw new Error('Invalid or empty profile received from server');
      }
      setUser(profile);
      setIsAuthenticated(true);
      setSessionError(null);
    } catch (err) {
      console.warn('[AuthContext] Session restore notice:', err?.message);
      
      if (err?.status === 401) {
        // Token is definitively invalid or expired -> purge credentials
        authService.logout();
        try {
          localStorage.removeItem('smart_college_token');
        } catch {}
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setSessionError(null);
      } else {
        // Case D: Network failure or backend unavailable
        // Do not silently treat as authenticated. Set user-visible error state.
        setIsAuthenticated(false);
        setUser(null);
        setSessionError(
          err?.isNetworkError || err?.status === 0
            ? 'Cannot connect to college backend server. Please verify FastAPI is running on port 8000.'
            : (err?.message || 'Failed to verify authenticated session.')
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Log in student using credentials
   * Calls POST /api/auth/login via authService
   */
  const login = async (identifierOrCreds, maybePassword) => {
    setIsLoading(true);
    try {
      const payload =
        typeof identifierOrCreds === 'object'
          ? identifierOrCreds
          : { identifier: identifierOrCreds, password: maybePassword };

      const response = await authService.login(payload);
      const accessToken = response?.access_token || response?.token;
      if (accessToken) {
        try {
          localStorage.setItem('smart_college_token', accessToken);
        } catch {}
      }
      setToken(accessToken);

      let userProfile = response?.user || null;
      if (!userProfile && accessToken) {
        try {
          userProfile = await authService.getCurrentUser();
        } catch {
          userProfile = null;
        }
      }
      setUser(userProfile);
      setIsAuthenticated(true);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new student account
   * Calls POST /api/auth/register via authService
   */
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const clearSessionError = () => {
    setSessionError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    sessionError,
    clearSessionError,
    login,
    register,
    logout,
    refreshUser: restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
