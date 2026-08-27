import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const SERVICE_LABELS = {
  airtime: 'Airtime', data: 'Data', electricity: 'Electricity', tv: 'Cable TV', edu: 'Edu Pin',
};
const SERVICE_COLORS = {
  airtime: '#EAB308', data: '#3B82F6', electricity: '#F97316', tv: '#A855F7', edu: '#10B981',
};

function fmtNaira(v) {
  const n = Number(v || 0);
  return 'NGN ' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({ label, value, sublabel, icon, accent }) {
  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '20px',
      border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', background: accent + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
        }}>{icon}</div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-500)' }}>{label}</span>
      </div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)' }}>{value}</div>
      {sublabel && <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{sublabel}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const loadStats = () => api.get('/admin/stats/').then((r) => setStats(r.data)).catch(() => toast.error('Failed to load stats'));
  const loadDaily = (d) => api.get(`/admin/stats/daily/?days=${d}`).then((r) => setDaily(r.data.days || [])).catch(() => toast.error('Failed to load chart'));

  useEffect(() => {
    setLoading(true);
    Promise.all([loadStats(), loadDaily(days)]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) loadDaily(days);
  }, [days]);

  if (loading) {
    return <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Loading dashboard...</div>;
  }
  if (!stats) {
    return <div style={{ color: 'var(--danger)', fontSize: '14px' }}>Could not load stats. Try refreshing.</div>;
  }

  const chartData = daily.map((d) => ({ date: d.date, Revenue: Number(d.revenue), Profit: Number(d.profit) }));

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '20px' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <StatCard label="Today's Revenue" value={fmtNaira(stats.revenue.today)} icon={'\u{1F4B5}'} accent="#3B82F6"
          sublabel={`${stats.transactions.today} transactions today`} />
        <StatCard label="Today's Profit" value={fmtNaira(stats.profit.today)} icon={'\u{1F4C8}'} accent="#10B981" />
        <StatCard label="Total Users" value={stats.users.total} icon={'\u{1F465}'} accent="#A855F7"
          sublabel={`+${stats.users.new_today} today, +${stats.users.new_this_week} this week`} />
        <StatCard label="Total Wallet Balance" value={fmtNaira(stats.total_wallet_balance)} icon={'\u{1F3E6}'} accent="#F97316"
          sublabel="Across all users" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="This Week Revenue" value={fmtNaira(stats.revenue.this_week)} icon={'\u{1F4C5}'} accent="#3B82F6" />
        <StatCard label="This Month Revenue" value={fmtNaira(stats.revenue.this_month)} icon={'\u{1F4C6}'} accent="#3B82F6" />
        <StatCard label="All-Time Revenue" value={fmtNaira(stats.revenue.total)} icon={'\u{1F4B0}'} accent="#EAB308" />
        <StatCard label="All-Time Profit" value={fmtNaira(stats.profit.total)} icon={'\u{2B50}'} accent="#EAB308" />
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)' }}>Revenue &amp; Profit Trend</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)} style={{
                padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0',
                background: days === d ? 'var(--primary)' : 'white',
                color: days === d ? 'white' : 'var(--gray-500)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>{d}d</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
            <Tooltip formatter={(value) => fmtNaira(value)} />
            <Legend wrapperStyle={{ fontSize: '13px' }} />
            <Line type="monotone" dataKey="Revenue" stroke="#3B82F6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Profit" stroke="#10B981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '16px', display: 'block' }}>
          Breakdown by Service
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(stats.breakdown).map(([key, s]) => (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', borderRadius: '10px', background: '#F8FAFC', flexWrap: 'wrap', gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: SERVICE_COLORS[key] }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)' }}>{SERVICE_LABELS[key]}</span>
                <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{s.count} tx</span>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Rev: {fmtNaira(s.revenue)}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>Profit: {fmtNaira(s.profit)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
