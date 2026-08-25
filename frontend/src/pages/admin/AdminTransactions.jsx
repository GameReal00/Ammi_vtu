import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const SERVICE_TYPES = [
  { value: '', label: 'All' },
  { value: 'airtime', label: 'Airtime' },
  { value: 'data', label: 'Data' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'tv', label: 'TV' },
  { value: 'edu', label: 'Edu Pin' },
];
const STATUSES = [
  { value: '', label: 'All' },
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];
const SERVICE_COLORS = {
  airtime: '#EAB308', data: '#3B82F6', electricity: '#F97316', tv: '#A855F7', edu: '#10B981',
};
const STATUS_STYLES = {
  success: { bg: '#DCFCE7', color: '#166534' },
  pending: { bg: '#FEF3C7', color: '#92400E' },
  failed: { bg: '#FEE2E2', color: '#991B1B' },
  refunded: { bg: '#E0E7FF', color: '#3730A3' },
};

function fmtNaira(v) {
  const n = Number(v || 0);
  return 'NGN ' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function FilterPills({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          border: '1px solid ' + (value === opt.value ? 'var(--primary)' : '#E2E8F0'),
          background: value === opt.value ? 'var(--primary)' : 'white',
          color: value === opt.value ? 'white' : 'var(--gray-500)',
        }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (serviceFilter) params.set('type', serviceFilter);
      if (statusFilter) params.set('status', statusFilter);
      const qs = params.toString();
      const res = await api.get(`/admin/transactions/${qs ? `?${qs}` : ''}`);
      setTransactions(res.data.results || []);
      setCount(res.data.count || 0);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceFilter, statusFilter]);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '4px' }}>Transactions</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '20px' }}>
        {count} total{count > 100 ? ' (showing most recent 100)' : ''}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-400)', marginBottom: '6px' }}>SERVICE</div>
          <FilterPills options={SERVICE_TYPES} value={serviceFilter} onChange={setServiceFilter} />
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-400)', marginBottom: '6px' }}>STATUS</div>
          <FilterPills options={STATUSES} value={statusFilter} onChange={setStatusFilter} />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)', fontSize: '14px' }}>Loading...</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)', fontSize: '14px' }}>No transactions match these filters.</div>
        ) : (
          transactions.map((t, i) => {
            const statusStyle = STATUS_STYLES[t.status] || { bg: '#F1F5F9', color: 'var(--gray-500)' };
            return (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', flexWrap: 'wrap', gap: '10px',
                borderBottom: i < transactions.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: SERVICE_COLORS[t.service_type] || '#94A3B8', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-900)', textTransform: 'capitalize' }}>{t.service_type}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{t.user_name} {'\u2022'} {t.user_email}</div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{t.phone || '\u2014'}</div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-900)' }}>{fmtNaira(t.amount)}</div>
                  <div style={{ fontSize: '12px', color: '#10B981' }}>+{fmtNaira(t.profit)} profit</div>
                </div>

                <span style={{
                  padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                  background: statusStyle.bg, color: statusStyle.color, textTransform: 'capitalize',
                }}>
                  {t.status}
                </span>

                <div style={{ fontSize: '12px', color: 'var(--gray-400)', minWidth: '110px', textAlign: 'right' }}>
                  {t.created_at}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
