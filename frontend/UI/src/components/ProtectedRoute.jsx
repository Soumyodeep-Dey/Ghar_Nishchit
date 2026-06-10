import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  getAccessToken,
  getStoredUser,
  isAdminSession,
  isTokenExpired,
  hasValidRefreshToken,
  refreshSession,
  clearAuthSession,
} from '../services/authService.js';

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
    Loading...
  </div>
);

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      if (isAdminSession()) {
        if (active) {
          setUser(getStoredUser() || {});
          setStatus('authorized');
        }
        return;
      }

      const accessToken = getAccessToken();
      if (accessToken && !isTokenExpired(accessToken)) {
        if (active) {
          setUser(getStoredUser() || {});
          setStatus('authorized');
        }
        return;
      }

      if (hasValidRefreshToken()) {
        try {
          const data = await refreshSession();
          if (active) {
            setUser(data.user || getStoredUser() || {});
            setStatus('authorized');
          }
          return;
        } catch {
          // fall through to unauthorized
        }
      }

      clearAuthSession();
      if (active) setStatus('unauthorized');
    })();

    return () => {
      active = false;
    };
  }, []);

  if (status === 'loading') return <RouteLoader />;
  if (status === 'unauthorized') return <Navigate to="/login" replace />;

  if (requiredRole) {
    const userRole = (user?.role || (Array.isArray(user?.roles) && user.roles[0]) || '').toLowerCase();
    if (userRole !== String(requiredRole).toLowerCase()) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
