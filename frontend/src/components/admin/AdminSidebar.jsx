import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/admin-panel/dashboard',   label: 'Dashboard',     icon: '\u{1F4CA}' },
  { to: '/admin-panel/users',       label: 'Users',         icon: '\u{1F465}' },
  { to: '/admin-panel/transactions', label: 'Transactions', icon: '\u{1F4B3}' },
  { to: '/admin-panel/pricing',     label: 'Pricing',       icon: '\u{1F4B0}' },
];

export default function AdminSidebar() {
  return (
    <aside style={{
      width: '240px', minHeight: '100vh', background: '#0F172A',
      position: 'fixed', top: 0, left: 0, padding: '24px 16px',
      display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10,
    }}>
      <div style={{ padding: '0 12px 24px', color: 'white', fontWeight: 800, fontSize: '18px' }}>
        AmmiVTU <span style={{ color: 'var(--primary)' }}>Admin</span>
      </div>

      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '11px 14px', borderRadius: '10px',
            color: isActive ? 'white' : '#94A3B8',
            background: isActive ? 'rgba(59,130,246,0.18)' : 'transparent',
            fontWeight: isActive ? 700 : 500, fontSize: '14px',
            textDecoration: 'none', transition: 'all 0.15s',
          })}
        >
          <span>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      <div style={{ marginTop: 'auto', padding: '12px' }}>
        <NavLink to="/dashboard" style={{ color: '#64748B', fontSize: '13px', textDecoration: 'none' }}>
          {'\u2190'} Back to customer app
        </NavLink>
      </div>
    </aside>
  );
}
