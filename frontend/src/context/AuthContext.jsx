import React, { createContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

// Compatibilidad temporal: usuarios antiguos con rol Provider
// se exponen en frontend como Manager.
const normalizeRoleUser = (user) => {
  if (!user) return null;
  if (user.role === 'Provider') {
    return { ...user, role: 'Manager' };
  }
  return user;
};

export const AuthProvider = ({ children }) => {
  // Estado inicial recuperado de localStorage para persistir sesión.
  const [user, setUser] = useState(() => normalizeRoleUser(authService.getUser()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login público con persistencia de token + usuario.
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

  // Registro público de clientes.
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

  // Cierre de sesión local (JWT stateless).
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
