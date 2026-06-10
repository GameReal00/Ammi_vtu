/**
 * pages/TV.jsx — Redesigned with AhmiVTU design system
 */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PROVIDERS = [
  { id: 'dstv',      label: 'DSTV',      emoji: '📡', bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  { id: 'gotv',      label: 'GOtv',      emoji: '📺', bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
  { id: 'startimes', label: 'Startimes', emoji: '🎬', bg: '#FDF4FF', color: '#7E22CE', dot: '#A855F7' },
];

export default function TV() {
  const { user } = useSelector((s) => s.auth);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [bouquets, setBouquets]         = useState([]);
  const [selectedBouquet, setSelectedBouquet] = useState(null);
  const [loadingBouquets, setLoadingBouquets] = useState(false);
  const [verifying, setVerifying]       = useState(false);
  const [verified, setVerified]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!selectedProvider) return;
    (async () => {
      setLoadingBouquets(true);
      setBouquets([]);
      setSelectedBouquet(null);
      try {
        const res = await api.get(`/services/variations/?service_id=${selectedProvider}`);
        setBouquets(res.data?.data?.content?.varations || []);
      } catch {
        toast.error('Could not load bouquets');
      } finally {
        setLoadingBouquets(false);
      }
    })();
  }, [selectedProvider]);

  const handleVerify = async () => {
    const decoder = watch('decoder_number');
    if (!selectedProvider || !decoder) return toast.error('Select provider and enter decoder number first');
    setVerifying(true);
    setVerified(null);
    try {
      const res = await api.post('/services/verify/', {
        service_id: selectedProvider,
        billers_code: decoder,
      });
      if (res.data?.data?.content) {
        setVerified(res.data.data.content);
        toast.success('Decoder verified!');
      } else {
        toast.error('Could not verify decoder');
      }
    } catch {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedBouquet) return toast.error('Please select a bouquet');
    setLoading(true);
    try {
      const res = await api.post('/services/tv/', {
        service_id: selectedProvider,
        decoder_number: data.decoder_number,
        variation_code: selectedBouquet.variation_code,
        amount: selectedBouquet.variation_amount,
        phone: data.phone,
      });
      toast.success(res.data.message);
      reset();
      setSelectedProvider('');
      setSelectedBouquet(null);
      setVerified(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (a) => `₦${Number(a || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  const activeProvider = PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '4px 0 40px' }}>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">📺 Cable TV</h1>
        <p className="page-subtitle">Pay for DSTV, GOtv and Startimes subscriptions</p>
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

          {/* Provider Selector */}
          <div>
            <label className="form-label">Select Provider</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
              {PROVIDERS.map((p) => (
                <button key={p.id} type="button" onClick={() => setSelectedProvider(p.id)}
                  style={{
                    background: selectedProvider === p.id ? p.bg : 'white',
                    border: `2px solid ${selectedProvider === p.id ? p.dot : 'var(--gray-200)'}`,
                    borderRadius: '12px', padding: '16px 8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    transform: selectedProvider === p.id ? 'translateY(-2px)' : 'none',
                    boxShadow: selectedProvider === p.id ? `0 4px 12px ${p.dot}33` : 'none',
                  }}>
                  <span style={{ fontSize: '28px', lineHeight: 1 }}>{p.emoji}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: 700,
                    color: selectedProvider === p.id ? p.color : 'var(--gray-600)',
                  }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Decoder Number + Verify */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Decoder / IUC Number</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '0' }}>
              <input className="form-input" placeholder="Enter decoder number"
                style={{ flex: 1 }}
                {...register('decoder_number', { required: 'Decoder number is required' })} />
              <button type="button" onClick={handleVerify} disabled={verifying}
                style={{
                  padding: '0 18px', borderRadius: '10px', border: 'none',
                  background: verifying ? 'var(--gray-200)' : 'var(--gray-800)',
                  color: 'white', fontSize: '13px', fontWeight: 700,
                  cursor: verifying ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap', minWidth: '80px', transition: 'all 0.15s ease',
                }}>
                {verifying ? '...' : 'Verify'}
              </button>
            </div>
            {errors.decoder_number && <p className="form-error">{errors.decoder_number.message}</p>}

            {/* Verified Info */}
            {verified && (
              <div style={{
                marginTop: '10px', padding: '12px 14px',
                background: 'var(--success-light)', border: '1.5px solid #A7F3D0',
                borderRadius: '10px',
              }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>
                  ✅ {verified.Customer_Name || 'Customer Verified'}
                </p>
                {verified.Current_Bouquet && (
                  <p style={{ fontSize: '12px', color: '#059669', marginTop: '3px' }}>
                    📺 Current: {verified.Current_Bouquet}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bouquets */}
          {selectedProvider && (
            <div>
              <label className="form-label">
                Select Bouquet
                {loadingBouquets && (
                  <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: '8px', fontSize: '12px' }}>
                    Loading...
                  </span>
                )}
              </label>

              {loadingBouquets ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      height: '52px', borderRadius: '10px', background: 'var(--gray-100)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                  ))}
                </div>
              ) : bouquets.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '20px',
                  background: 'var(--gray-50)', borderRadius: '12px',
                  color: 'var(--gray-400)', fontSize: '14px', marginTop: '8px',
                }}>No bouquets available</div>
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  maxHeight: '260px', overflowY: 'auto', paddingRight: '4px', marginTop: '8px',
                }}>
                  {bouquets.map((b) => {
                    const isSelected = selectedBouquet?.variation_code === b.variation_code;
                    return (
                      <button key={b.variation_code} type="button"
                        onClick={() => setSelectedBouquet(b)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '14px 16px', borderRadius: '10px', textAlign: 'left',
                          border: `2px solid ${isSelected ? (activeProvider?.dot || 'var(--primary)') : 'var(--gray-200)'}`,
                          background: isSelected ? (activeProvider?.bg || 'var(--primary-light)') : 'white',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          boxShadow: isSelected ? `0 4px 10px ${activeProvider?.dot || '#1B4ED8'}22` : 'none',
                        }}>
                        <span style={{
                          fontSize: '14px', fontWeight: 600,
                          color: isSelected ? (activeProvider?.color || 'var(--primary)') : 'var(--gray-800)',
                          flex: 1, marginRight: '12px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{b.name}</span>
                        <span style={{
                          fontSize: '15px', fontWeight: 800, flexShrink: 0,
                          color: isSelected ? (activeProvider?.color || 'var(--primary)') : 'var(--gray-900)',
                        }}>₦{Number(b.variation_amount).toLocaleString()}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Selected Bouquet Summary */}
          {selectedBouquet && (
            <div style={{
              background: 'var(--success-light)', border: '1.5px solid #A7F3D0',
              borderRadius: '10px', padding: '12px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>
                ✅ {selectedBouquet.name}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--success)' }}>
                ₦{Number(selectedBouquet.variation_amount).toLocaleString()}
              </span>
            </div>
          )}

          {/* Phone */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" placeholder="08012345678"
              {...register('phone', { required: 'Phone number is required' })} />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || !selectedBouquet}
            className="btn btn-primary btn-full"
            style={{ padding: '14px', fontSize: '15px', borderRadius: '12px', marginTop: '4px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span className="spinner" /> Processing...
              </span>
            ) : selectedBouquet
              ? `Pay ${selectedBouquet.name} — ₦${Number(selectedBouquet.variation_amount).toLocaleString()}`
              : 'Select a Bouquet to Continue'}
          </button>

        </div>
      </form>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}