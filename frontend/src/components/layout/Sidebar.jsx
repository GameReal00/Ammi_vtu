import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const BASE_NAV = [
  { to: '/dashboard',   icon: '🏠', label: 'Dashboard' },
  { to: '/airtime',     icon: '📞', label: 'Airtime' },
  { to: '/data',        icon: '📶', label: 'Data' },
  { to: '/electricity', icon: '💡', label: 'Electricity' },
  { to: '/tv',          icon: '📺', label: 'Cable TV' },
  { to: '/edu',         icon: '🎓', label: 'Edu Pin' },
  { to: '/wallet',      icon: '💰', label: 'Wallet' },
  { to: '/history',     icon: '📋', label: 'History' },
  { to: '/referral',    icon: '🎁', label: 'Refer & Earn' },
  { to: '/profile',     icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const { user }   = useSelector((s) => s.auth);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const navItems = user?.is_staff || user?.is_superuser
    ? [...BASE_NAV, { to: '/admin-panel', icon: '⚙️', label: 'Admin Panel' }]
    : BASE_NAV;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const initials = user?.full_name
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: '#0A0F2E',
      display: 'flex', flexDirection: 'column', padding: '20px 12px',
      position: 'sticky', top: 0, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 28 }}>
        <div style={{ width: 36, height: 36, background: '#0047FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
        <span style={{ fontWeight: 800, fontSize: 15, color: 'white', letterSpacing: '-0.02em' }}>VTU Business</span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 13px', borderRadius: 10,
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
              background: isActive ? '#0047FF' : 'transparent',
              boxShadow: isActive ? '0 3px 10px rgba(0,71,255,0.4)' : 'none',
              transition: 'all 0.15s',
            })}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {/* Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8, paddingTop: 8 }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 13px', borderRadius: 10,
            background: 'rgba(255,59,92,0.1)', color: '#ff6b7a',
            border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>🚪</span>
            Logout
          </button>
        </div>
      </nav>

      {/* User info */}
      <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, background: '#0047FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name || 'User'}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
        </div>
      </div>
    </aside>
  );
}
