import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, attendanceApi } from '../services/api';
import { useNotification } from './NotificationContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAttendance, setActiveAttendance] = useState(null);
  const { success, error: notifyError } = useNotification();

  const checkAttendanceStatus = useCallback(async () => {
    try {
      const res = await attendanceApi.getStatus();
      setActiveAttendance(res.isCheckedIn ? res.activeSession : null);
    } catch {
      // Ignore if not logged in
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('fitpulse_token');
    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      setUser(res.user);
      setProfile(res.user.profile || null);
      if (res.user.role === 'member') {
        await checkAttendanceStatus();
      }
    } catch (err) {
      console.warn('Session verification failed:', err.message);
      localStorage.removeItem('fitpulse_token');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [checkAttendanceStatus]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const res = await authApi.login(credentials);
      localStorage.setItem('fitpulse_token', res.token);
      setUser(res.user);
      await checkAuth();
      success(`Welcome back, ${res.user.name}!`);
      return res;
    } catch (err) {
      notifyError(err.message || 'Login failed. Please check credentials.');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      localStorage.setItem('fitpulse_token', res.token);
      setUser(res.user);
      await checkAuth();
      success('Account created successfully! Welcome to FitPulse.');
      return res;
    } catch (err) {
      notifyError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('fitpulse_token');
      setUser(null);
      setProfile(null);
      setActiveAttendance(null);
      success('You have logged out.');
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        activeAttendance,
        login,
        register,
        logout,
        refreshUser,
        checkAttendanceStatus,
        setActiveAttendance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
