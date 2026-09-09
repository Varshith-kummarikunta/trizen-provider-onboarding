import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying authentication..." />;
  }

  if (!isAuthenticated) {
    // If route requires admin, redirect to admin login
    const targetLogin = allowedRoles.includes('admin') ? '/admin/login' : '/login';
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Role mismatch: redirect to respective dashboard
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/provider/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
