/**
 * pages/Airtime.jsx — Redesigned with AhmiVTU design system
 */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';

const NETWORKS = [
  { id: 'mtn',      label: 'MTN',     bg: '#FEF9C3', color: '#854D0E', dot: '#EAB308' },
  { id: 'airtel',   label: 'Airtel',  bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  { id: 'glo',      label: 'Glo',     bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  { id: 'etisalat', label: '9mobile', bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function Airtime() {
  const { user } = useSelector((s) => s.auth);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const amount = watch('amount');

  const onSubmit = async (data) => {
    if (!selectedNetwork) return toast.error('Please select a network');
    setLoading(true);
    try {
      const res = await api.post('/services/airtime/', {
        network: selectedNetwork,
        phone: data.phone,
        amount: data.amount,
      });
      toast.success(res.data.message);
      reset();
      setSelectedNetwork('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (a) => `₦${Number(a || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '4px 0 40px' }}>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">📞 Buy Airtime</h1>
        <p className="page-subtitle">Top-up any Nigerian number instantly</p>
      </div>

      {/* Wallet Balance Pill */}
      <div style={{
        background: 'var(--primary-light)',
        border: '1.5px solid #C7D7F8',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>💰 Wallet Balance</span>
        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>{fmt(user?.wallet_balance)}</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Network Selector */}
          <div>
            <label className="form-label">Select Network</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '8px' }}>
              {NETWORKS.map((n) => (
                <button key={n.id} type="button" onClick={() => setSelectedNetwork(n.id)}
                  style={{
                    background: selectedNetwork === n.id ? n.bg : 'white',
                    border: `2px solid ${selectedNetwork === n.id ? n.dot : 'var(--gray-200)'}`,
                    borderRadius: '12px', padding: '12px 8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    transform: selectedNetwork === n.id ? 'translateY(-2px)' : 'none',
                    boxShadow: selectedNetwork === n.id ? `0 4px 12px ${n.dot}33` : 'none',
                  }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', background: n.dot,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '13px', fontWeight: 800,
                  }}>{n.label[0]}</div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: selectedNetwork === n.id ? n.color : 'var(--gray-600)' }}>
                    {n.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" placeholder="08012345678"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^0[789][01]\d{8}$/, message: 'Enter a valid Nigerian number' }
              })} />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          {/* Quick Amounts */}
          <div>
            <label className="form-label">Amount (₦)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '8px 0' }}>
              {QUICK_AMOUNTS.map((a) => (
                <button key={a} type="button"
                  onClick={() => setValue('amount', a, { shouldValidate: true })}
                  style={{
                    padding: '10px 8px', borderRadius: '10px',
                    border: `2px solid ${Number(amount) === a ? 'var(--primary)' : 'var(--gray-200)'}`,
                    background: Number(amount) === a ? 'var(--primary)' : 'white',
                    color: Number(amount) === a ? 'white' : 'var(--gray-700)',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease',
                  }}>
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>
            <input type="number" className="form-input" placeholder="Or enter custom amount (min ₦50)"
              style={{ marginTop: '8px' }}
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 50, message: 'Minimum is ₦50' },
                max: { value: 50000, message: 'Maximum is ₦50,000' },
              })} />
            {errors.amount && <p className="form-error">{errors.amount.message}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn btn-primary btn-full"
            style={{ padding: '14px', fontSize: '15px', borderRadius: '12px', marginTop: '4px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span className="spinner" /> Processing...
              </span>
            ) : `Buy Airtime${amount ? ` — ₦${Number(amount).toLocaleString()}` : ''}`}
          </button>

        </div>
      </form>
    </div>
  );
}
