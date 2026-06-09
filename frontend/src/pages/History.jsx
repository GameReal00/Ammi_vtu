/**
 * pages/History.jsx — Redesigned with AhmiVTU design system
 */
import { useState, useEffect } from 'react';
import api from '../api/axios';

const SERVICE_ICONS = {
  airtime: '📞', data: '📶', electricity: '💡', tv: '📺', edu: '🎓',
};

const SERVICE_COLORS = {
  airtime:     { bg: '#EEF2FF', color: '#1B4ED8' },
  data:        { bg: '#F0FDF4', color: '#059669' },
  electricity: { bg: '#FFFBEB', color: '#D97706' },
  tv:          { bg: '#FDF4FF', color: '#9333EA' },
  edu:         { bg: '#FFF1F2', color: '#E11D48' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'airtime', label: '📞 Airtime' },
  { key: 'data', label: '📶 Data' },
  { key: 'electricity', label: '💡 Electricity' },
  { key: 'tv', label: '📺 Cable TV' },
  { key: 'edu', label: '🎓 Edu Pin' },
];

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [summary, setSummary]           = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = filter !== 'all' ? `?type=${filter}` : '';
        const [txRes, sumRes] = await Promise.all([
          api.get(`/transactions/${params}`),
          api.get('/transactions/summary/'),
        ]);
        setTransactions(txRes.data.results || []);
        setSummary(sumRes.data.summary);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [filter]);

  const fmt = (a) => `₦${Number(a || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const statusStyle = (status) => {
    const map = {
      success: { bg: 'var(--success-light)', color: 'var(--success)' },
      failed:  { bg: 'var(--danger-light)',  color: 'var(--danger)' },
      pending: { bg: 'var(--warning-light)', color: 'var(--warning)' },
    };
    return map[status] || map.pending;
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '4px 0 40px' }}>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">📋 Transaction History</h1>
        <p className="page-subtitle">All your transactions in one place</p>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px', marginBottom: '20px',
        }}>
          {[
            { label: 'Total Transactions', value: summary.total_transactions || 0, isNum: true, color: 'var(--primary)' },
            { label: 'Total Spent',        value: fmt(summary.total_spent),        isNum: false, color: 'var(--danger)' },
            { label: 'Your Profit',        value: fmt(summary.total_profit),       isNum: false, color: 'var(--success)' },
          ].map((s) => (
            <div key={s.label} style={{
              background: 'white', borderRadius: '14px', padding: '16px 12px',
              border: '1px solid var(--gray-100)', textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <p style={{ fontSize: s.isNum ? '24px' : '16px', fontWeight: 800, color: s.color }}>
                {s.value}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px', fontWeight: 600 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '16px',
        overflowX: 'auto', paddingBottom: '4px',
      }}>
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              padding: '8px 14px', borderRadius: '20px', border: 'none',
              background: filter === f.key ? 'var(--primary)' : 'white',
              color: filter === f.key ? 'white' : 'var(--gray-600)',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.15s ease',
              boxShadow: filter === f.key ? '0 4px 10px rgba(27,78,216,0.25)' : 'var(--shadow-sm)',
              border: filter === f.key ? 'none' : '1px solid var(--gray-200)',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="card" style={{ padding: '8px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
            {[1,2,3,4,5].map((i) => (
              <div key={i} style={{
                height: '64px', borderRadius: '12px', background: 'var(--gray-100)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-title">No transactions found</p>
            <p className="empty-state-text">
              {filter !== 'all' ? `No ${filter} transactions yet` : 'Make your first transaction!'}
            </p>
          </div>
        ) : (
          <div>
            {transactions.map((tx, idx) => {
              const svc    = SERVICE_COLORS[tx.service_type] || { bg: 'var(--gray-100)', color: 'var(--gray-500)' };
              const status = statusStyle(tx.status);
              return (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', borderRadius: '12px',
                  borderBottom: idx < transactions.length - 1 ? '1px solid var(--gray-50)' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Icon */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: svc.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                  }}>
                    {SERVICE_ICONS[tx.service_type] || '💳'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '14px', fontWeight: 700, color: 'var(--gray-800)',
                      textTransform: 'capitalize',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {tx.service_type} {tx.network ? `— ${tx.network.toUpperCase()}` : ''}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>
                      {tx.phone || tx.account_number} &middot;{' '}
                      {new Date(tx.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Amount + Status */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '4px' }}>
                      {fmt(tx.amount)}
                    </p>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
                      fontSize: '11px', fontWeight: 700, textTransform: 'capitalize',
                      background: status.bg, color: status.color,
                    }}>{tx.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}