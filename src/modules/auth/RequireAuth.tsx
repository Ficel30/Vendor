import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export function RequireAuth(): React.ReactElement {
  const { auth } = useAuth();
  const location = useLocation();
  if (!auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Enforce vendor-only access for vendor routes
  if (location.pathname.startsWith('/vendor') && auth.role && auth.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }
  // Enforce admin-only access for admin routes
  if (location.pathname.startsWith('/admin') && auth.role && auth.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}


