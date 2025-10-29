import { Route, Routes } from 'react-router-dom';
import Landing from './components/landing';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import DarkModeProvider from './DarkModeContext.jsx';
import TenantDashboard from './components/Pages/TENANT/TenantDashboard';
import TenantProperty from './components/Pages/TENANT/TenantProperty';
import TenantMessage from './components/Pages/TENANT/TenantMessage';
import TenantMaintenance from './components/Pages/TENANT/TenantMaintenance';
import TenantPayment from './components/Pages/TENANT/TenantPayment';
import LandlordDashboard from './components/Pages/LANDLORD/LandlordDashboard';
import LandlordProperty from './components/Pages/LANDLORD/LandlordProperty';
import LandlordMessage from './components/Pages/LANDLORD/LandlordMessage';
import LandlordMaintenance from './components/Pages/LANDLORD/LandlordMaintenance';
import LandlordPayment from './components/Pages/LANDLORD/LandlordPayment';
import LandlordTenant from './components/Pages/LANDLORD/LandlordTenant';
import UpdateLandlordProfile from './components/Pages/LANDLORD/UpdateLandlordProfile';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './components/Auth/ForgotPassword';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
      </div>
    </DarkModeProvider>
  );
}
