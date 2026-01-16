import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function AdminRoute(): React.ReactElement {
  const { auth } = useAuth();
  const location = useLocation();
  if (!auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (auth.role !== 'admin') {
    return <Navigate to="/vendor" replace />;
  }
  return <Outlet />;
}


