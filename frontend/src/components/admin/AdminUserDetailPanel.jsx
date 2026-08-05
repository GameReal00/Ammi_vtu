import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

function fmtNaira(v) {
  const n = Number(v || 0);
  return 'NGN ' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AdminUserDetailPanel({ userId, onBack }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('credit');
  const [adjustReason, setAdjustReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [changed, setChanged] = useState(false);

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}/`);
      setUser(res.data);
    } catch {
      toast.error('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleToggleStatus = async () => {
    if (!window.confirm(`${user.is_active ? 'Suspend' : 'Reactivate'} ${user.email}?`)) return;
    try {
      const res = await api.post('/admin/users/toggle/', { user_id: userId });
      toast.success(res.data.message);
      setChanged(true);
      loadUser();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleAdjustWallet = async (e) => {
    e.preventDefault();
    if (!adjustAmount || Number(adjustAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/admin/wallet/adjust/', {
        user_id: userId, amount: adjustAmount, type: adjustType,
        reason: adjustReason || 'Admin adjustment',
      });
      toast.success(res.data.message);
      setShowAdjust(false);
      setAdjustAmount('');
      setAdjustReason('');
      setChanged(true);
      loadUser();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to adjust wallet');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Loading user...</div>;
  }
  if (!user) {
    return <div style={{ color: 'var(--danger)', fontSize: '14px' }}>Could not load this user.</div>;
  }

  return (
    <div>
      <button onClick={() => onBack(changed)} style={{
        background: 'none', border: 'none', color: 'var(--primary)', fontSize: '14px',
        fontWeight: 600, cursor: 'pointer', marginBottom: '16px', padding: 0,
      }}>
        {'\u2190'} Back to Users
      </button>

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '4px' }}>{user.full_name}</h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)' }}>{user.email}</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{user.phone_number} {'\u2022'} joined {user.date_joined}</p>
          </div>
          <span style={{
            padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
            background: user.is_active ? '#DCFCE7' : '#FEE2E2',
            color: user.is_active ? '#166534' : '#991B1B',
          }}>
            {user.is_active ? 'Active' : 'Suspended'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', margin: '20px 0' }}>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Wallet Balance</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--gray-900)' }}>{fmtNaira(user.balance)}</div>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Total Spent</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--gray-900)' }}>{fmtNaira(user.totals.total_spent)}</div>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Profit Generated</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#10B981' }}>{fmtNaira(user.totals.total_profit_generated)}</div>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Transactions</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--gray-900)' }}>{user.totals.total_transactions}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAdjust(true)} className="btn btn-primary" style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '13px' }}>
            Adjust Wallet
          </button>
          <button onClick={handleToggleStatus} style={{
            padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            border: '1px solid ' + (user.is_active ? '#FECACA' : '#A7F3D0'),
            background: user.is_active ? '#FEF2F2' : '#F0FDF4',
            color: user.is_active ? '#991B1B' : '#166534',
            cursor: 'pointer',
          }}>
            {user.is_active ? 'Suspend User' : 'Reactivate User'}
          </button>
        </div>
      </div>

      {showAdjust && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px',
        }}>
          <form onSubmit={handleAdjustWallet} style={{ background: 'white', borderRadius: '18px', padding: '28px', maxWidth: '380px', width: '100%' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '16px' }}>
              Adjust Wallet - {user.full_name}
            </h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button type="button" onClick={() => setAdjustType('credit')} style={{
                flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                border: '1px solid ' + (adjustType === 'credit' ? '#10B981' : '#E2E8F0'),
                background: adjustType === 'credit' ? '#F0FDF4' : 'white',
                color: adjustType === 'credit' ? '#166534' : 'var(--gray-500)',
              }}>Credit (add)</button>
              <button type="button" onClick={() => setAdjustType('debit')} style={{
                flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                border: '1px solid ' + (adjustType === 'debit' ? '#EF4444' : '#E2E8F0'),
                background: adjustType === 'debit' ? '#FEF2F2' : 'white',
                color: adjustType === 'debit' ? '#991B1B' : 'var(--gray-500)',
              }}>Debit (remove)</button>
            </div>

            <input
              type="number" min="1" step="0.01" placeholder="Amount (NGN)"
              value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', marginBottom: '10px', outline: 'none' }}
            />
            <input
              type="text" placeholder="Reason (optional)"
              value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', marginBottom: '18px', outline: 'none' }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setShowAdjust(false)} style={{
                flex: 1, padding: '11px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                border: '1px solid #E2E8F0', background: 'white', color: 'var(--gray-500)', cursor: 'pointer',
              }}>Cancel</button>
              <button type="submit" disabled={submitting} className="btn btn-primary" style={{
                flex: 1, padding: '11px', borderRadius: '10px', fontSize: '14px', opacity: submitting ? 0.6 : 1,
              }}>
                {submitting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '14px', display: 'block' }}>
          Recent Transactions
        </span>
        {user.recent_transactions.length === 0 ? (
          <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>No transactions yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {user.recent_transactions.map((t) => (
              <div key={t.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: '8px', background: '#F8FAFC', flexWrap: 'wrap', gap: '6px',
              }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)', textTransform: 'capitalize' }}>{t.service_type}</span>
                  <span style={{ fontSize: '12px', color: 'var(--gray-400)', marginLeft: '8px' }}>{t.created_at}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-900)' }}>{fmtNaira(t.amount)}</span>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px',
                    background: t.status === 'success' ? '#DCFCE7' : t.status === 'failed' ? '#FEE2E2' : '#FEF3C7',
                    color: t.status === 'success' ? '#166534' : t.status === 'failed' ? '#991B1B' : '#92400E',
                  }}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
