/**
 * pages/Data.jsx — Redesigned with AhmiVTU design system
 */
import { useState, useEffect } from 'react';
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

export default function Data() {
  const { user } = useSelector((s) => s.auth);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [plans, setPlans]             = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading]         = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!selectedNetwork) return;
    (async () => {
      setLoadingPlans(true);
      setPlans([]);
      setSelectedPlan(null);
      try {
        const res = await api.get(`/services/variations/?service_id=${selectedNetwork}-data`);
        setPlans(res.data?.data?.content?.varations || []);
      } catch {
        toast.error('Could not load data plans');
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, [selectedNetwork]);

  const onSubmit = async (data) => {
    if (!selectedNetwork) return toast.error('Please select a network');
    if (!selectedPlan)    return toast.error('Please select a data plan');
    setLoading(true);
    try {
      const res = await api.post('/services/data/', {
        network: selectedNetwork,
        phone: data.phone,
        variation_code: selectedPlan.variation_code,
        amount: selectedPlan.variation_amount,
        plan_name: selectedPlan.name,
      });
      toast.success(res.data.message);
      reset();
      setSelectedNetwork('');
      setSelectedPlan(null);
      setPlans([]);
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
        <h1 className="page-title">📶 Data Purchase</h1>
        <p className="page-subtitle">Buy data for any Nigerian network</p>
      </div>

      {/* Wallet Balance Pill */}
      <div style={{
        background: 'var(--primary-light)', border: '1.5px solid #C7D7F8',
        borderRadius: '12px', padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
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

          {/* Data Plans */}
          {selectedNetwork && (
            <div>
              <label className="form-label">
                Select Plan
                {loadingPlans && (
                  <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: '8px', fontSize: '12px' }}>
                    Loading...
                  </span>
                )}
              </label>

              {loadingPlans ? (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px'
                }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      height: '72px', borderRadius: '10px',
                      background: 'var(--gray-100)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                  ))}
                </div>
              ) : plans.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '24px',
                  background: 'var(--gray-50)', borderRadius: '12px',
                  color: 'var(--gray-400)', fontSize: '14px', marginTop: '8px'
                }}>
                  No plans available
                </div>
              ) : (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px', maxHeight: '280px', overflowY: 'auto',
                  paddingRight: '4px', marginTop: '8px',
                }}>
                  {plans.map((plan) => {
                    const isSelected = selectedPlan?.variation_code === plan.variation_code;
                    return (
                      <button key={plan.variation_code} type="button"
                        onClick={() => setSelectedPlan(plan)}
                        style={{
                          textAlign: 'left', padding: '12px',
                          borderRadius: '10px',
                          border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--gray-200)'}`,
                          background: isSelected ? 'var(--primary-light)' : 'white',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          transform: isSelected ? 'translateY(-1px)' : 'none',
                          boxShadow: isSelected ? '0 4px 10px rgba(27,78,216,0.15)' : 'none',
                        }}>
                        <p style={{
                          fontSize: '12px', fontWeight: 700,
                          color: isSelected ? 'var(--primary)' : 'var(--gray-800)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          marginBottom: '4px',
                        }}>{plan.name}</p>
                        <p style={{
                          fontSize: '15px', fontWeight: 800,
                          color: isSelected ? 'var(--primary)' : 'var(--gray-900)',
                        }}>₦{Number(plan.variation_amount).toLocaleString()}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Selected Plan Summary */}
          {selectedPlan && (
            <div style={{
              background: 'var(--success-light)', border: '1.5px solid #A7F3D0',
              borderRadius: '10px', padding: '12px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>
                ✅ {selectedPlan.name}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--success)' }}>
                ₦{Number(selectedPlan.variation_amount).toLocaleString()}
              </span>
            </div>
          )}

          {/* Submit */}
          <button type="submit"
            disabled={loading || !selectedPlan}
            className="btn btn-primary btn-full"
            style={{ padding: '14px', fontSize: '15px', borderRadius: '12px', marginTop: '4px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span className="spinner" /> Processing...
              </span>
            ) : selectedPlan
              ? `Buy ${selectedPlan.name} — ₦${Number(selectedPlan.variation_amount).toLocaleString()}`
              : 'Select a Plan to Continue'}
          </button>

        </div>
      </form>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
