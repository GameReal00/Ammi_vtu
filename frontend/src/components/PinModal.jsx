import { useState } from 'react';
import api from '../api/axios';

export default function PinModal({ open, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-pin/', { pin });
      setPin('');
      onSuccess(pin);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 360, backgroundColor: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Enter Payment PIN</h3>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Confirm it's really you before this transaction.</p>
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="****"
          style={{ width: '100%', marginTop: 16, padding: '12px 16px', textAlign: 'center', fontSize: 24, letterSpacing: 8, border: '1px solid #e5e7eb', borderRadius: 12, backgroundColor: '#f9fafb', outline: 'none', boxSizing: 'border-box' }}
        />
        {error && <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#ffffff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={loading || pin.length < 4} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 600, cursor: 'pointer', opacity: loading || pin.length < 4 ? 0.5 : 1 }}>
            {loading ? 'Checking...' : 'Confirm'}
          </button>
        </div>
      </form>
    </div>
  );
}