import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function SetPin() {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (pin.length < 4 || pin.length > 6) return toast.error('PIN must be 4-6 digits');
    if (pin !== confirm) return toast.error('PINs do not match');

    setLoading(true);
    try {
      await api.post('/auth/set-pin/', { pin });
      toast.success('PIN saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-md mx-auto w-full">
      <div className="mb-6">
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>🔐 Security</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
          Create or change your payment PIN
        </p>
      </div>

      <form onSubmit={submit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="form-label">New PIN (4-6 digits)</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            className="input-field"
            placeholder="****"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <div>
          <label className="form-label">Confirm PIN</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            className="input-field"
            placeholder="****"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-full">
          {loading ? 'Saving...' : 'Save PIN'}
        </button>
      </form>
    </div>
  );
}