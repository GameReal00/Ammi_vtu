import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/layout/Sidebar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Airtime from './pages/Airtime';
import Data from './pages/Data';
import Electricity from './pages/Electricity';
import TV from './pages/TV';
import EduPin from './pages/EduPin';
import History from './pages/History';
import Referral from './pages/Referral';
import Wallet  from './pages/Wallet';
import Profile from './pages/Profile';


function ProtectedLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', fontSize: '14px' } }} />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/"         element={<Navigate to="/dashboard" replace />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/airtime"     element={<Airtime />} />
          <Route path="/data"        element={<Data />} />
          <Route path="/electricity" element={<Electricity />} />
          <Route path="/tv"          element={<TV />} />
          <Route path="/edu"         element={<EduPin />} />
          <Route path="/history"     element={<History />} />
          <Route path="/referral"    element={<Referral />} />
          <Route path="/wallet"  element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile"     element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
