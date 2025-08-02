import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { DarkModeProvider } from './DarkModeContext';
import TenantDashboard from './components/Pages/TENANT/TenantDashboard';
import TenantProperty from './components/Pages/TENANT/TenantProperty';
import TenantMessage from './components/Pages/TENANT/TenantMessage';
import TenantMaintenance from './components/Pages/TENANT/TenantMaintenance';
import TenantPayment from './components/Pages/TENANT/TenantPayment';
import ProtectedRoute from './components/ProtectedRoute';


export default function App() {
  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/tenant"
            element={
              <ProtectedRoute requiredRole="tenant">
                <TenantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/properties"
            element={
              <ProtectedRoute requiredRole="tenant">
                <TenantProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/messages"
            element={
              <ProtectedRoute requiredRole="tenant">
                <TenantMessage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/maintenance"
            element={
              <ProtectedRoute requiredRole="tenant">
                <TenantMaintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/payment"
            element={
              <ProtectedRoute requiredRole="tenant">
                <TenantPayment />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </DarkModeProvider>
  );
}
