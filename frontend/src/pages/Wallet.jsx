/**
 * pages/Wallet.jsx — Redesigned + cleaned up (removed duplicate useEffect/debug logs)
 */
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { updateUser } from '../store/authSlice';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export default function Wallet() {
  const { user }  = useSelector((s) => s.auth);
  const dispatch  = useDispatch();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const amount = watch('amount');

  useEffect(() => {
    const params  = new URLSearchParams(location.search);
    const status  = params.get('status');
    const ref     = params.get('reference') || localStorage.getItem('paystack_ref');
    if (status === 'success' && ref) {
      localStorage.removeItem('paystack_ref');
      verifyPayment(ref);
    }
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/wallet/history/');
      setHistory(res.data.results || res.data || []);
    } catch {}
  };

  const verifyPayment = async (reference) => {
    try {
      const res = await api.post('/wallet/fund/verify/', { reference });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        dispatch(updateUser({ wallet_balance: res.data.new_balance }));
        loadHistory();
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment verification failed');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/wallet/fund/initialize/', { amount: data.amount });
      localStorage.setItem('paystack_ref', res.data.reference);
      window.location.href = res.data.authorization_url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not initialize payment');
      setLoading(false);
    }
  };

  const fmt = (a) => `₦${Number(a || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '4px 0 40px' }}>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">💰 My Wallet</h1>
        <p className="page-subtitle">Fund your wallet to make purchases</p>
      </div>

      {/* Wallet Hero Card */}
      <div className="wallet-hero" style={{ marginBottom: '20px' }}>
        <p className="wallet-hero-label">Available Balance</p>
        <p className="wallet-hero-amount">{fmt(user?.wallet_balance)}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
          <span style={{ fontSize: '13px', opacity: 0.75 }}>Active & Ready</span>
        </div>
      </div>

      {/* Fund Wallet Form */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '16px' }}>
          ➕ Fund Wallet
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Select Amount</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px', margin: '8px 0',
            }}>
              {QUICK_AMOUNTS.map((a) => (
                <button key={a} type="button"
                  onClick={() => setValue('amount', a, { shouldValidate: true })}
                  style={{
                    padding: '10px 8px', borderRadius: '10px',
                    border: `2px solid ${Number(amount) === a ? 'var(--primary)' : 'var(--gray-200)'}`,
                    background: Number(amount) === a ? 'var(--primary)' : 'white',
                    color: Number(amount) === a ? 'white' : 'var(--gray-700)',
                    fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}>
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>
            <input type="number" className="form-input"
              placeholder="Or enter custom amount (min ₦100)"
              style={{ marginTop: '8px' }}
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 100, message: 'Minimum is ₦100' },
                max: { value: 1000000, message: 'Maximum is ₦1,000,000' },
              })} />
            {errors.amount && <p className="form-error">{errors.amount.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full"
            style={{ padding: '14px', fontSize: '15px', borderRadius: '12px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span className="spinner" /> Redirecting to Paystack...
              </span>
            ) : `Fund Wallet${amount ? ` — ₦${Number(amount).toLocaleString()}` : ''}`}
          </button>
        </form>

        {/* Secured badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '6px', marginTop: '14px',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>🔒 Secured by</span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#059669' }}>Paystack</span>
        </div>
      </div>

      {/* Wallet Transaction History */}
      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '16px' }}>
          📄 Wallet History
        </h2>

        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-title">No transactions yet</p>
            <p className="empty-state-text">Fund your wallet to get started!</p>
          </div>
        ) : (
          <div className="tx-list">
            {history.slice(0, 10).map((tx) => {
              const isCredit = tx.transaction_type === 'credit';
              return (
                <div key={tx.id} className="tx-item">
                  <div className={`tx-icon ${isCredit ? 'credit' : 'debit'}`}>
                    <span style={{ fontSize: '16px' }}>{isCredit ? '↓' : '↑'}</span>
                  </div>
                  <div className="tx-info">
                    <p className="tx-desc">
                      {tx.description?.length > 40
                        ? tx.description.slice(0, 40) + '...'
                        : tx.description || tx.source}
                    </p>
                    <p className="tx-date">
                      {new Date(tx.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>
                    {isCredit ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}