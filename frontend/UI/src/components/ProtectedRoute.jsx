import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user is authenticated (token presence is sufficient)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role (case-insensitive, supports arrays)
  if (requiredRole) {
    const userRole = (user.role || (Array.isArray(user.roles) && user.roles[0]) || '').toLowerCase();
    if (userRole !== String(requiredRole).toLowerCase()) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;