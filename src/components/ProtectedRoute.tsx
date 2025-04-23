import React from 'react';
import { Navigate } from 'react-router-dom';

import { UserRole } from '../services/api';

interface RootState {
  auth: {
    user: {
      role: UserRole | null;
    };
  };
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  // Get user role from localStorage
  let role: UserRole | null = null;
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      role = user.role || null;
    } catch {
      role = null;
    }
  }

  if (!role) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role.toLowerCase() !== requiredRole.toLowerCase()) {
    // User's role doesn't match required role, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
