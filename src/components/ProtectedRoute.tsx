import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // e.g., ['user', 'admin']
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    // Optionally render a loading spinner or placeholder
    return <div>Loading authentication...</div>; 
  }

  if (!user && !isAdmin) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const userRole = isAdmin ? 'admin' : (user ? 'user' : null);
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User does not have the required role, redirect to unauthorized or home
      return <Navigate to="/" replace />;
    }
  }

  // Authenticated and authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;