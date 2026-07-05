/**
 * components/IdleWarningModal.jsx
 * Shown when the user has been inactive and is about to be auto-logged-out.
 */
import { useEffect, useState } from 'react';

export default function IdleWarningModal({ secondsLeft: initialSeconds, onStay, onLogout }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      onLogout();
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onLogout]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
      backdropFilter: 'blur(4px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '32px 28px',
        maxWidth: '360px', width: '100%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--warning-light)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '30px', margin: '0 auto 16px',
        }}>⏰</div>

        <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '8px' }}>
          Still there?
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '6px' }}>
          You've been inactive for a while. For your security, you'll be logged out in
        </p>
        <p style={{ fontSize: '36px', fontWeight: 800, color: 'var(--danger)', marginBottom: '22px', fontVariantNumeric: 'tabular-nums' }}>
          {seconds}s
        </p>

        <button onClick={onStay}
          className="btn btn-primary btn-full"
          style={{ padding: '13px', fontSize: '14px', borderRadius: '12px', marginBottom: '10px' }}>
          Stay Logged In
        </button>
        <button onClick={onLogout}
          style={{
            background: 'none', border: 'none', color: 'var(--gray-400)',
            fontSize: '13px', cursor: 'pointer', padding: '6px', fontWeight: 600,
          }}>
          Logout now
        </button>
      </div>
    </div>
  );
}
