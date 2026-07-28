import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminSidebar from './AdminSidebar';

/**
 * Gate for everything under /admin-panel.
 * Fast path: if the logged-in user's profile already has is_staff, trust it.
 * Fallback: ask the backend directly (IsAdminUser) - that's the real security
 * boundary regardless, so this works correctly even if is_staff isn't in
 * the profile payload.
 */
export default function AdminLayout() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (user?.is_staff) {
      setAllowed(true);
      setChecking(false);
      return;
    }

    let cancelled = false;
    api.get('/admin/stats/')
      .then(() => { if (!cancelled) { setAllowed(true); setChecking(false); } })
      .catch(() => { if (!cancelled) { setAllowed(false); setChecking(false); } });
    return () => { cancelled = true; };
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    if (!checking && !allowed) {
      navigate('/dashboard', { replace: true });
    }
  }, [checking, allowed, navigate]);

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'var(--gray-500)', fontSize: '14px',
      }}>
        Checking access...
      </div>
    );
  }

  if (!allowed) return null; // redirect already fired above

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>
      <AdminSidebar />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px' }}>
        <Outlet />
      </main>
    </div>
  );
}
