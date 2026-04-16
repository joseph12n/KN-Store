'use client';

import React, { createContext, useState, useCallback } from 'react';
import { authService } from '@/services/authService';

export const AuthContext = createContext();

const normalizeRoleUser = (user) => {
  if (!user) return null;
  if (user.role === 'Provider') {
    return { ...user, role: 'Manager' };
  }
  return user;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => normalizeRoleUser(authService.getUser()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userData = normalizeRoleUser(await authService.login(email, password));
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const userData = normalizeRoleUser(await authService.registerClient(payload));
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
