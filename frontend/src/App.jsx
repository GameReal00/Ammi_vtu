import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/layout/Sidebar';
import IdleWarningModal from './components/IdleWarningModal';
import useIdleTimeout from './hooks/useIdleTimeout';
import { logout } from './store/authSlice';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword  from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Airtime from './pages/Airtime';
import Data from './pages/Data';
import Electricity from './pages/Electricity';
import TV from './pages/TV';
import EduPin from './pages/EduPin';
import History from './pages/History';
import Referral from './pages/Referral';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import SetPin from './pages/SetPin';

// Admin panel (Phase 4)
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminPricing from './pages/admin/AdminPricing';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const IDLE_WARNING_MS = 60 * 1000;

function ProtectedLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  const handleIdleLogout = () => {
    setShowIdleWarning(false);
    dispatch(logout());
    navigate('/login');
  };

  const { resetNow } = useIdleTimeout({
    idleTime: IDLE_TIMEOUT_MS,
    warningTime: IDLE_WARNING_MS,
    onWarning: () => setShowIdleWarning(true),
    onIdle: handleIdleLogout,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>

      {showIdleWarning && (
        <IdleWarningModal
          secondsLeft={IDLE_WARNING_MS / 1000}
          onStay={() => { setShowIdleWarning(false); resetNow(); }}
          onLogout={handleIdleLogout}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#0F172A',
            borderRadius: '14px',
            padding: '14px 16px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            border: '1px solid #E2E8F0',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#fff' },
            style: { background: '#F0FDF4', border: '1px solid #A7F3D0', color: '#065F46' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
            style: { background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' },
          },
          loading: {
            iconTheme: { primary: '#1B4ED8', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login"            element={<Login />} />
        <Route path="/register"         element={<Register />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />
        <Route path="/"                 element={<Navigate to="/dashboard" replace />} />

        {/* Protected customer routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/airtime"     element={<Airtime />} />
          <Route path="/data"        element={<Data />} />
          <Route path="/electricity" element={<Electricity />} />
          <Route path="/tv"          element={<TV />} />
          <Route path="/edu"         element={<EduPin />} />
          <Route path="/history"     element={<History />} />
          <Route path="/referral"    element={<Referral />} />
          <Route path="/wallet"      element={<Wallet />} />
          <Route path="/profile"     element={<Profile />} />
          <Route path="/set-pin"     element={<SetPin />} />
        </Route>

        {/* Admin panel routes - staff only, guarded inside AdminLayout */}
        <Route path="/admin-panel" element={<AdminLayout />}>
          <Route index                element={<Navigate to="/admin-panel/dashboard" replace />} />
          <Route path="dashboard"     element={<AdminDashboard />} />
          <Route path="users"         element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="pricing"       element={<AdminPricing />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
