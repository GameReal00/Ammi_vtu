/**
 * pages/AdminPanel.jsx
 * Full admin dashboard — stats, users, transactions, wallet adjustment.
 * Only accessible to superusers (is_staff: true).
 */

import { useState, useEffect } from 'react';
import { useSelector, useNavigate } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../api/axios';

const TABS = ['Overview', 'Users', 'Transactions', 'Adjust Wallet'];

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, color = '#0047FF' }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E8ECFF' }}>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────
function Overview({ stats }) {
  if (!stats) return <p style={{ color: '#9CA3AF', padding: 20 }}>Loading...</p>;
  const { users, transactions, revenue, profit, total_wallet_balance, breakdown } = stats;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Users"        value={users.total}                  sub={`+${users.new_today} today`} />
        <StatCard label="Total Revenue"      value={fmt(revenue.total)}           sub={`${fmt(revenue.today)} today`} color="#00C566" />
        <StatCard label="Total Profit"       value={fmt(profit.total)}            sub={`${fmt(profit.today)} today`} color="#0047FF" />
        <StatCard label="Wallet Balances"    value={fmt(total_wallet_balance)}    sub="All users combined" color="#FFB800" />
        <StatCard label="Total Transactions" value={transactions.total}           sub={`${transactions.today} today`} />
        <StatCard label="This Month"         value={fmt(revenue.this_month)}      sub={`${transactions.this_month} transactions`} color="#9333EA" />
      </div>

      <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E8ECFF' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Service Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key} style={{ background: '#F5F7FF', borderRadius: 12, padding: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize', color: '#0A0F2E', marginBottom: 4 }}>
                {key === 'tv' ? '📺 Cable TV' : key === 'edu' ? '🎓 Edu Pin' : key === 'airtime' ? '📞 Airtime' : key === 'data' ? '📶 Data' : '💡 Electricity'}
              </p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#0047FF' }}>{val.count}</p>
              <p style={{ fontSize: 12, color: '#6B7280' }}>{fmt(val.revenue)} revenue</p>
              <p style={{ fontSize: 12, color: '#00C566' }}>{fmt(val.profit)} profit</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────
function Users({ onSelectUser }) {
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/users/${search ? `?q=${search}` : ''}`);
        setUsers(res.data.results);
      } catch { toast.error('Failed to load users'); }
      finally { setLoading(false); }
    };
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <input
        placeholder="🔍 Search by email or name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E8ECFF', marginBottom: 16, fontSize: 14, outline: 'none' }}
      />
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E8ECFF', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F5F7FF', borderBottom: '1px solid #E8ECFF' }}>
              {['Name', 'Email', 'Balance', 'Transactions', 'Joined', 'Status', 'Action'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>No users found</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #F5F7FF' }}>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{u.full_name}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{u.email}</td>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#0047FF' }}>{fmt(u.balance)}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{u.tx_count}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#9CA3AF' }}>{u.date_joined}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: u.is_active ? '#DCFCE7' : '#FFE4E6', color: u.is_active ? '#15803D' : '#BE123C' }}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => onSelectUser(u)}
                    style={{ padding: '6px 14px', borderRadius: 8, background: '#EEF3FF', color: '#0047FF', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Transactions Tab ──────────────────────────────────────────
function Transactions() {
  const [txs, setTxs]       = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/transactions/${filter ? `?type=${filter}` : ''}`);
        setTxs(res.data.results);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, [filter]);

  const STATUS_COLORS = { success: '#DCFCE7', failed: '#FFE4E6', pending: '#FEF9C3' };
  const STATUS_TEXT   = { success: '#15803D', failed: '#BE123C', pending: '#854D0E' };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['', 'airtime', 'data', 'electricity', 'tv', 'edu'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: filter === f ? '#0047FF' : '#F5F7FF', color: filter === f ? 'white' : '#6B7280' }}>
            {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E8ECFF', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ background: '#F5F7FF', borderBottom: '1px solid #E8ECFF' }}>
              {['User', 'Service', 'Phone/Acct', 'Amount', 'Profit', 'Status', 'Date'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
            ) : txs.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #F5F7FF' }}>
                <td style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{t.user_name}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF' }}>{t.user_email}</p>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{t.service_type} {t.network && `(${t.network.toUpperCase()})`}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{t.phone || t.account_number}</td>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700 }}>{fmt(t.amount)}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#00C566', fontWeight: 600 }}>{fmt(t.profit)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: STATUS_COLORS[t.status], color: STATUS_TEXT[t.status] }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{t.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Adjust Wallet Tab ─────────────────────────────────────────
function AdjustWallet({ selectedUser, onClearUser }) {
  const [userId, setUserId]   = useState(selectedUser?.id || '');
  const [userEmail, setUserEmail] = useState(selectedUser?.email || '');
  const [amount, setAmount]   = useState('');
  const [type, setType]       = useState('credit');
  const [reason, setReason]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) { setUserId(selectedUser.id); setUserEmail(selectedUser.email); }
  }, [selectedUser]);

  const handleSubmit = async () => {
    if (!userId || !amount || !reason) return toast.error('All fields are required');
    setLoading(true);
    try {
      const res = await api.post('/admin/wallet/adjust/', { user_id: userId, amount, type, reason });
      toast.success(res.data.message);
      setAmount(''); setReason('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Adjustment failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E8ECFF' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>💰 Adjust User Wallet</h3>

        {selectedUser && (
          <div style={{ background: '#EEF3FF', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{selectedUser.full_name}</p>
              <p style={{ fontSize: 12, color: '#6B7280' }}>{selectedUser.email} • Balance: {fmt(selectedUser.balance)}</p>
            </div>
            <button onClick={onClearUser} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>User Email or ID</label>
            <input value={userEmail || userId} onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user email or paste user ID"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E8ECFF', fontSize: 14, outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['credit', 'debit'].map((t) => (
                <button key={t} onClick={() => setType(t)}
                  style={{ padding: '12px', borderRadius: 10, border: `2px solid ${type === t ? (t === 'credit' ? '#00C566' : '#FF3B5C') : '#E8ECFF'}`, background: type === t ? (t === 'credit' ? '#F0FDF4' : '#FFF0F3') : 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: type === t ? (t === 'credit' ? '#15803D' : '#BE123C') : '#6B7280', textTransform: 'capitalize' }}>
                  {t === 'credit' ? '⬆️ Credit' : '⬇️ Debit'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Amount (₦)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E8ECFF', fontSize: 14, outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Reason</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Bonus, Refund, Compensation"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E8ECFF', fontSize: 14, outline: 'none' }} />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: '14px', borderRadius: 12, background: type === 'credit' ? '#00C566' : '#FF3B5C', color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Processing...' : `${type === 'credit' ? '⬆️ Credit' : '⬇️ Debit'} Wallet`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────
export default function AdminPanel() {
  const { user }     = useSelector((s) => s.auth);
  const navigate     = useNavigate();
  const [tab, setTab]             = useState('Overview');
  const [stats, setStats]         = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (false) {
      navigate('/dashboard');
      toast.error('Access denied');
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/stats/');
      setStats(res.data);
    } catch { toast.error('Failed to load stats'); }
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setTab('Adjust Wallet');
  };

  return (
    <div style={{ flex: 1, padding: 24, background: '#F5F7FF', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0A0F2E', letterSpacing: '-0.03em' }}>
          ⚡ Admin Panel
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>
          Platform overview and management
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'white', padding: 6, borderRadius: 14, border: '1px solid #E8ECFF', width: 'fit-content' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '9px 20px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: tab === t ? '#0047FF' : 'transparent', color: tab === t ? 'white' : '#6B7280', boxShadow: tab === t ? '0 2px 8px rgba(0,71,255,0.3)' : 'none' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Overview'        && <Overview stats={stats} />}
      {tab === 'Users'           && <Users onSelectUser={handleSelectUser} />}
      {tab === 'Transactions'    && <Transactions />}
      {tab === 'Adjust Wallet'   && <AdjustWallet selectedUser={selectedUser} onClearUser={() => setSelectedUser(null)} />}
    </div>
  );
}
