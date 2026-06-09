/**
 * pages/EduPin.jsx — Redesigned with AhmiVTU design system
 */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';

const EXAMS = [
  { id: 'waec',              label: 'WAEC',         emoji: '📘', desc: 'Result Checker',   bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  { id: 'waec-registration', label: 'WAEC Reg',     emoji: '📝', desc: 'Exam Registration', bg: '#F0FDF4', color: '#166534', dot: '#22C55E' },
  { id: 'neco',              label: 'NECO',          emoji: '📗', desc: 'Result Checker',   bg: '#F0FDF4', color: '#065F46', dot: '#10B981' },
  { id: 'jamb',              label: 'JAMB',          emoji: '📙', desc: 'UTME / DE PIN',    bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B' },
];

export default function EduPin() {
  const { user }  = useSelector((s) => s.auth);
  const [selectedExam, setSelectedExam] = useState('');
  const [variations, setVariations]     = useState([]);
  const [selectedVar, setSelectedVar]   = useState(null);
  const [loading, setLoading]           = useState(false);
  const [loadingVars, setLoadingVars]   = useState(false);
  const [result, setResult]             = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!selectedExam) return;
    (async () => {
      setLoadingVars(true);
      setVariations([]);
      setSelectedVar(null);
      try {
        const res = await api.get(`/services/variations/?service_id=${selectedExam}`);
        setVariations(res.data?.data?.content?.varations || []);
      } catch {
        toast.error('Could not load plans');
      } finally {
        setLoadingVars(false);
      }
    })();
  }, [selectedExam]);

  const onSubmit = async (data) => {
    if (!selectedVar) return toast.error('Please select a plan');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/services/edu/', {
        service_id: selectedExam,
        variation_code: selectedVar.variation_code,
        amount: selectedVar.variation_amount,
        phone: data.phone,
      });
      toast.success(res.data.message);
      setResult(res.data.pin_data);
      reset();
      setSelectedExam('');
      setSelectedVar(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (a) => `₦${Number(a || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  const activeExam = EXAMS.find((e) => e.id === selectedExam);

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '4px 0 40px' }}>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">🎓 Edu Pin</h1>
        <p className="page-subtitle">Purchase exam pins for WAEC, NECO & JAMB</p>
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

      {/* Success Result Card */}
      {result && (
        <div style={{
          background: 'var(--success-light)', border: '2px solid #6EE7B7',
          borderRadius: '16px', padding: '20px', marginBottom: '20px',
        }}>
          <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--success)', marginBottom: '10px' }}>
            🎉 Purchase Successful!
          </p>
          <pre style={{
            fontSize: '12px', color: '#065F46',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            background: 'white', padding: '12px', borderRadius: '8px',
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Exam Selector */}
          <div>
            <label className="form-label">Select Exam Body</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px', marginTop: '8px',
            }}>
              {EXAMS.map((e) => (
                <button key={e.id} type="button" onClick={() => setSelectedExam(e.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '14px 12px', borderRadius: '12px', textAlign: 'left',
                    border: `2px solid ${selectedExam === e.id ? e.dot : 'var(--gray-200)'}`,
                    background: selectedExam === e.id ? e.bg : 'white',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    transform: selectedExam === e.id ? 'translateY(-2px)' : 'none',
                    boxShadow: selectedExam === e.id ? `0 4px 12px ${e.dot}33` : 'none',
                  }}>
                  <span style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: e.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                    border: `1.5px solid ${e.dot}44`,
                  }}>{e.emoji}</span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: selectedExam === e.id ? e.color : 'var(--gray-800)' }}>
                      {e.label}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '2px' }}>
                      {e.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Variations / Plans */}
          {selectedExam && (
            <div>
              <label className="form-label">
                Select Plan
                {loadingVars && (
                  <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: '8px', fontSize: '12px' }}>
                    Loading...
                  </span>
                )}
              </label>

              {loadingVars ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{
                      height: '52px', borderRadius: '10px', background: 'var(--gray-100)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                  ))}
                </div>
              ) : variations.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '20px',
                  background: 'var(--gray-50)', borderRadius: '12px',
                  color: 'var(--gray-400)', fontSize: '14px', marginTop: '8px',
                }}>No plans available</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {variations.map((v) => {
                    const isSelected = selectedVar?.variation_code === v.variation_code;
                    return (
                      <button key={v.variation_code} type="button"
                        onClick={() => setSelectedVar(v)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '14px 16px', borderRadius: '10px',
                          border: `2px solid ${isSelected ? (activeExam?.dot || 'var(--primary)') : 'var(--gray-200)'}`,
                          background: isSelected ? (activeExam?.bg || 'var(--primary-light)') : 'white',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          boxShadow: isSelected ? `0 4px 10px ${activeExam?.dot || '#1B4ED8'}22` : 'none',
                        }}>
                        <span style={{
                          fontSize: '14px', fontWeight: 600,
                          color: isSelected ? (activeExam?.color || 'var(--primary)') : 'var(--gray-800)',
                        }}>{v.name}</span>
                        <span style={{
                          fontSize: '15px', fontWeight: 800,
                          color: isSelected ? (activeExam?.color || 'var(--primary)') : 'var(--gray-900)',
                        }}>₦{Number(v.variation_amount).toLocaleString()}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Selected Plan Summary */}
          {selectedVar && (
            <div style={{
              background: 'var(--success-light)', border: '1.5px solid #A7F3D0',
              borderRadius: '10px', padding: '12px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>
                ✅ {selectedVar.name}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--success)' }}>
                ₦{Number(selectedVar.variation_amount).toLocaleString()}
              </span>
            </div>
          )}

          {/* Phone */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" placeholder="08012345678"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^0[789][01]\d{8}$/, message: 'Enter a valid Nigerian number' },
              })} />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || !selectedVar}
            className="btn btn-primary btn-full"
            style={{ padding: '14px', fontSize: '15px', borderRadius: '12px', marginTop: '4px' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span className="spinner" /> Processing...
              </span>
            ) : selectedVar
              ? `Buy ${selectedVar.name} — ₦${Number(selectedVar.variation_amount).toLocaleString()}`
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