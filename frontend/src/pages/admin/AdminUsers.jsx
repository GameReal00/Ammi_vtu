import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminUserDetailPanel from '../../components/admin/AdminUserDetailPanel';

function fmtNaira(v) {
  const n = Number(v || 0);
  return 'NGN ' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const loadUsers = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      setUsers(res.data.results || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(search);
  };

  const handleBackFromDetail = (didChange) => {
    setSelectedUserId(null);
    if (didChange) loadUsers(search);
  };

  if (selectedUserId) {
    return <AdminUserDetailPanel userId={selectedUserId} onBack={handleBackFromDetail} />;
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '8px' }}>Users</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '20px' }}>{users.length} shown</p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          style={{ flex: 1, padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '11px 20px', borderRadius: '10px', fontSize: '14px' }}>
          Search
        </button>
      </form>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)', fontSize: '14px' }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)', fontSize: '14px' }}>No users found.</div>
        ) : (
          users.map((u, i) => (
            <div
              key={u.id}
              onClick={() => setSelectedUserId(u.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', cursor: 'pointer',
                borderBottom: i < users.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)' }}>{u.full_name}</div>
                <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{u.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-900)' }}>{fmtNaira(u.balance)}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{u.tx_count} tx {'\u2022'} joined {u.date_joined}</div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                  background: u.is_active ? '#DCFCE7' : '#FEE2E2',
                  color: u.is_active ? '#166534' : '#991B1B',
                }}>
                  {u.is_active ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
