/**
 * pages/Electricity.jsx — Redesigned with AhmiVTU design system
 */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PROVIDERS = [
  { id: 'ikeja-electric',  label: 'Ikeja Electric' },
  { id: 'eko-electric',    label: 'Eko Electric' },
  { id: 'abuja-electric',  label: 'Abuja Electric' },
  { id: 'kano-electric',   label: 'Kano Electric' },
  { id: 'phed',            label: 'Port Harcourt (PHED)' },
  { id: 'jos-electric',    label: 'Jos Electric' },
  { id: 'ibadan-electric', label: 'Ibadan Electric' },
  { id: 'kaduna-electric', label: 'Kaduna Electric' },
  { id: 'enugu-electric',  label: 'Enugu Electric' },
  { id: 'benin-electric',  label: 'Benin Electric' },
  { id: 'aedc',            label: 'Aba Electric' },
];

const QUICK_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 20000];

export default function Electricity() {
  const { user }  = useSelector((s) => s.auth);
  const [meterType, setMeterType] = useState('prepaid');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const amount = watch('amount');

  const handleVerify = async () => {
    const serviceId   = watch('service_id');
    const meterNumber = watch('meter_number');
    if (!serviceId || !meterNumber) return toast.error('Select provider and enter meter number first');
    setVerifying(true);
    setVerified(null);
    try {
      const res = await api.post('/services/verify/', {
        service_id: serviceId,
        billers_code: meterNumber,
        type: meterType,
      });
      if (res.data?.data?.content) {
        setVerified(res.data.data.content);
        toast.success('Meter verified!');
      } else {
        toast.error('Could not verify meter number');
      }
    } catch {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/services/electricity/', {
        service_id: data.service_id,
        meter_number: data.meter_number,
        variation_code: meterType,
        amount: data.amount,
        phone: data.phone,
      });
      toast.success(res.data.message);
      if (res.data.token) toast.success(`Token: ${res.data.token}`, { duration: 10000 });
      reset();
      setVerified(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (a) => `₦${Number(a || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '4px 0 40px' }}>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">💡 Electricity Bill</h1>
        <p className="page-subtitle">Pay electricity bills for any DisCo</p>
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

          {/* Provider Select */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Provider (DisCo)</label>
            <select className="form-input form-select"
              {...register('service_id', { required: 'Provider is required' })}>
              <option value="">-- Choose your DisCo --</option>
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            {errors.service_id && <p className="form-error">{errors.service_id.message}</p>}
          </div>

          {/* Meter Type Toggle */}
          <div>
            <label className="form-label">Meter Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              {['prepaid', 'postpaid'].map((t) => (
                <button key={t} type="button" onClick={() => setMeterType(t)}
                  style={{
                    padding: '12px', borderRadius: '10px', cursor: 'pointer',
                    border: `2px solid ${meterType === t ? 'var(--primary)' : 'var(--gray-200)'}`,
                    background: meterType === t ? 'var(--primary-light)' : 'white',
                    color: meterType === t ? 'var(--primary)' : 'var(--gray-600)',
                    fontSize: '14px', fontWeight: 700,
                    textTransform: 'capitalize', transition: 'all 0.15s ease',
                  }}>
                  {t === 'prepaid' ? '⚡ Prepaid' : '📅 Postpaid'}
                </button>
              ))}
            </div>
          </div>

          {/* Meter Number + Verify */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Meter Number</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '0' }}>
              <input className="form-input" placeholder="Enter meter number"
                style={{ flex: 1 }}
                {...register('meter_number', { required: 'Meter number is required' })} />
              <button type="button" onClick={handleVerify} disabled={verifying}
                style={{
                  padding: '0 18px', borderRadius: '10px', border: 'none',
                  background: verifying ? 'var(--gray-200)' : 'var(--gray-800)',
                  color: 'white', fontSize: '13px', fontWeight: 700,
                  cursor: verifying ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.15s ease',
                  minWidth: '80px',
                }}>
                {verifying ? '...' : 'Verify'}
              </button>
            </div>
            {errors.meter_number && <p className="form-error">{errors.meter_number.message}</p>}

            {/* Verified Customer Info */}
            {verified && (
              <div style={{
                marginTop: '10px', padding: '12px 14px',
                background: 'var(--success-light)', border: '1.5px solid #A7F3D0',
                borderRadius: '10px',
              }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>
                  ✅ {verified.Customer_Name || verified.name || 'Customer Verified'}
                </p>
                {verified.Address && (
                  <p style={{ fontSize: '12px', color: '#059669', marginTop: '3px' }}>
                    📍 {verified.Address}
                  </p>
                )}
              </div>
            )}
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
                    fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}>
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>
            <input type="number" className="form-input"
              placeholder="Or enter custom amount (min ₦1,000)"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 1000, message: 'Minimum is ₦1,000' },
              })} />
            {errors.amount && <p className="form-error">{errors.amount.message}</p>}
          </div>

          {/* Phone */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" placeholder="08012345678"
              {...register('phone', { required: 'Phone number is required' })} />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn btn-primary btn-full"
            style={{ padding: '14px', fontSize: '15px', borderRadius: '12px', marginTop: '4px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span className="spinner" /> Processing...
              </span>
            ) : `Pay ${amount ? `₦${Number(amount).toLocaleString()}` : ''} Electricity`}
          </button>

        </div>
      </form>
    </div>
  );
}