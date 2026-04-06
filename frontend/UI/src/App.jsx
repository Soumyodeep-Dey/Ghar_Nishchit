import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';

// dark mode context
import DarkModeProvider from './DarkModeContext.jsx';


// toast notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Landing = lazy(() => import('./components/landing'));
const Login = lazy(() => import('./components/Auth/Login'));
const SignUp = lazy(() => import('./components/Auth/SignUp'));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword'));

const TenantDashboard = lazy(() => import('./components/Pages/TENANT/TenantDashboard'));
const TenantProperty = lazy(() => import('./components/Pages/TENANT/TenantProperty'));
const TenantMessage = lazy(() => import('./components/Pages/TENANT/TenantMessage'));
const TenantMaintenance = lazy(() => import('./components/Pages/TENANT/TenantMaintenance'));
const TenantPayment = lazy(() => import('./components/Pages/TENANT/TenantPayment'));
const UpdateTenantProfile = lazy(() => import('./components/Pages/TENANT/UpdateTenantProfile'));

const LandlordDashboard = lazy(() => import('./components/Pages/LANDLORD/LandlordDashboard'));
const LandlordProperty = lazy(() => import('./components/Pages/LANDLORD/LandlordProperty'));
const LandlordMessage = lazy(() => import('./components/Pages/LANDLORD/LandlordMessage'));
const LandlordMaintenance = lazy(() => import('./components/Pages/LANDLORD/LandlordMaintenance'));
const LandlordPayment = lazy(() => import('./components/Pages/LANDLORD/LandlordPayment'));
const LandlordTenant = lazy(() => import('./components/Pages/LANDLORD/LandlordTenant'));
const UpdateLandlordProfile = lazy(() => import('./components/Pages/LANDLORD/UpdateLandlordProfile'));

const AppLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
    Loading...
  </div>
);

export default function App() {
  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Suspense fallback={<AppLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
            <Route
              path="/tenant/profile"
              element={
                <ProtectedRoute requiredRole="tenant">
                  <UpdateTenantProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord"
              element={
                <ProtectedRoute requiredRole="landlord">
                  <LandlordDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/properties"
              element={
                <ProtectedRoute requiredRole="landlord">
                  <LandlordProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/messages"
              element={
                <ProtectedRoute requiredRole="landlord">
                  <LandlordMessage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/maintenance"
              element={
                <ProtectedRoute requiredRole="landlord">
                  <LandlordMaintenance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/payment"
              element={
                <ProtectedRoute requiredRole="landlord">
                  <LandlordPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/tenants"
              element={
                <ProtectedRoute requiredRole="landlord">
                  <LandlordTenant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/profile"
              element={
                <ProtectedRoute requiredRole="landlord">
                  <UpdateLandlordProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </DarkModeProvider>
  );
}
