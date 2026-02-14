import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const LOCAL_ADMIN_TOKEN = 'local-admin-token';

  const verifyUser = useCallback(async () => {
    try {
      // shortcut for local admin token to avoid backend call
      if (token === LOCAL_ADMIN_TOKEN) {
        setUser({ name: 'Arham', username: 'arham', role: 'admin', email: 'arham@example.com' });
        setError(null);
        setLoading(false);
        return;
      }

      // Handle mock OAuth tokens from dev flow
      if (token && token.startsWith('mock-')) {
        const oauthUserStr = sessionStorage.getItem('oauth_user');
        if (oauthUserStr) {
          const oauthUser = JSON.parse(oauthUserStr);
          setUser(oauthUser);
          setError(null);
          setLoading(false);
          return;
        }
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      setToken(null);
      localStorage.removeItem('token');
      sessionStorage.removeItem('oauth_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  // Check user on initial mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      } else {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // Verify user whenever token changes
  useEffect(() => {
    if (token) {
      verifyUser();
    } else {
      setLoading(false);
    }
  }, [token, verifyUser]);

  const register = async (name, email, password, confirmPassword, role = 'student') => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        confirmPassword,
        role
      });

      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.toLowerCase().trim(),
        password
      });

      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      throw err;
    }
  };

  const loginAdmin = async (username, password) => {
    try {
      setError(null);
      // local shortcut: accept admin login for arham / 1428 without backend
      const normalized = (username || '').split('@')[0].trim().toLowerCase();
      if (normalized === 'arham' && password === '1428') {
        const newToken = LOCAL_ADMIN_TOKEN;
        const userData = { name: 'Arham', username: 'arham', role: 'admin', email: 'arham@example.com' };
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        return { token: newToken, user: userData };
      }

      const response = await axios.post(`${API_URL}/auth/login-admin`, {
        username: username.trim(),
        password
      });

      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Admin login failed';
      setError(errorMsg);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    loginAdmin,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
