import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('[AuthContext] Session expired or invalid token:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success && res.data) {
      const { token: newToken, user: newUser, profile: newProfile } = res.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setProfile(newProfile);
      return { success: true, user: newUser };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (name, email, password) => {
    const res = await authService.register(name, email, password);
    if (res.success && res.data) {
      const { token: newToken, user: newUser, profile: newProfile } = res.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      setProfile(newProfile);
      return { success: true, user: newUser };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
    isProvider: user?.role === 'provider',
    login,
    register,
    logout,
    refreshMe,
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
