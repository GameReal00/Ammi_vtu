/**
 * components/layout/Sidebar.jsx
 * Mobile-first sidebar — hidden drawer on mobile, fixed on desktop
 */

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';

const navItems = [
  { to: '/dashboard',   emoji: '🏠', label: 'Dashboard' },
  { to: '/airtime',     emoji: '📞', label: 'Airtime' },
  { to: '/data',        emoji: '📶', label: 'Data' },
  { to: '/electricity', emoji: '💡', label: 'Electricity' },
  { to: '/tv',          emoji: '📺', label: 'Cable TV' },
  { to: '/edu',         emoji: '🎓', label: 'Edu Pin' },
  { to: '/wallet',      emoji: '💰', label: 'Wallet' },
  { to: '/history',     emoji: '📋', label: 'History' },
  { to: '/referral',    emoji: '🎁', label: 'Refer & Earn' },
  { to: '/profile',     emoji: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const [open, setOpen]   = useState(false);
  const dispatch          = useDispatch();
  const navigate          = useNavigate();
  const location          = useLocation();
  const { user }          = useSelector((s) => s.auth);

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const initials = user?.full_name
    ?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U';

  return (
    <>
      {/* ── Mobile Top Header ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'white',
        borderBottom: '1px solid #E2E8F0',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}
      className="mobile-header"
      >
        {/* Hamburger */}
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px', borderRadius: '8px', display: 'flex',
            flexDirection: 'column', gap: '5px',
          }}
          aria-label="Open menu"
        >
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#0F172A', borderRadius: '2px' }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#0F172A', borderRadius: '2px' }} />
          <span style={{ display: 'block', width: '16px', height: '2px', background: '#0F172A', borderRadius: '2px' }} />
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '30px', height: '30px', background: '#1B4ED8',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px'
          }}>A</div>
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#0F172A' }}>
            Ahmi<span style={{ color: '#F59E0B' }}>VTU</span>
          </span>
        </div>

        {/* Avatar */}
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: '#1B4ED8', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700,
        }}>
          {initials}
        </div>
      </header>

      {/* ── Backdrop Overlay ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 299,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* ── Sidebar Drawer ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 300,
        width: '260px',
        background: '#0F172A',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: open ? '4px 0 24px rgba(0,0,0,0.25)' : 'none',
      }}
      className="sidebar-drawer"
      >
        {/* Sidebar Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', background: '#1B4ED8',
              borderRadius: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '16px'
            }}>A</div>
            <span style={{ fontWeight: 800, fontSize: '17px', color: 'white' }}>
              Ahmi<span style={{ color: '#F59E0B' }}>VTU</span>
            </span>
          </div>
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'white', width: '32px', height: '32px',
              borderRadius: '8px', cursor: 'pointer', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Close menu"
          >×</button>
        </div>

        {/* User Info */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: '#1B4ED8', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, flexShrink: 0,
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: '13px', fontWeight: 700, color: 'white',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {user?.full_name || 'User'}
            </p>
            <p style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.45)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 12px', borderRadius: '10px',
                marginBottom: '2px', textDecoration: 'none',
                fontSize: '14px', fontWeight: isActive ? 700 : 500,
                background: isActive ? '#1B4ED8' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                transition: 'all 0.15s ease',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.classList.contains('active'))
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.classList.contains('active'))
                  e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '17px', lineHeight: 1 }}>{item.emoji}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{
          padding: '12px 10px',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              width: '100%', padding: '11px 12px', borderRadius: '10px',
              background: 'rgba(220,38,38,0.15)', border: 'none',
              color: '#FCA5A5', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.15)'}
          >
            <span style={{ fontSize: '17px' }}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        /* Desktop: always show sidebar, hide mobile header */
        @media (min-width: 768px) {
          .mobile-header { display: none !important; }
          .sidebar-drawer {
            transform: translateX(0) !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
}
