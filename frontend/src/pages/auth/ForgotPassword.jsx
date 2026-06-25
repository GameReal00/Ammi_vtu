/**
 * pages/auth/ForgotPassword.jsx
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

export default function ForgotPassword() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password/`, { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
      background: 'linear-gradient(135deg, #1B4ED8 0%, #1337A8 50%, #0F172A 100%)',
    }}>
      {/* Decorative circles */}
      <div style={{ position:'fixed', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-100px', left:'-60px', width:'350px', height:'350px', borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', background: 'white',
            borderRadius: '16px', marginBottom: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            <span style={{ fontSize: '26px' }}>⚡</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            Ahmi<span style={{ color: '#FCD34D' }}>VTU</span>
          </h1>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}>

          {!sent ? (
            <>
              {/* Icon + Title */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', margin: '0 auto 14px',
                }}>🔑</div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 6px' }}>
                  Forgot Password?
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: 1.5 }}>
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="btn btn-primary btn-full"
                  style={{ padding: '14px', fontSize: '15px', borderRadius: '12px' }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <span className="spinner" /> Sending...
                    </span>
                  ) : 'Send Reset Link 📧'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login" style={{
                  fontSize: '14px', color: 'var(--primary)',
                  fontWeight: 600, textDecoration: 'none',
                }}>
                  ← Back to Login
                </Link>
              </div>
            </>
          ) : (
            /* Success State */
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'var(--success-light)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', margin: '0 auto 20px',
              }}>📧</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '10px' }}>
                Check your email!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: '8px' }}>
                We sent a password reset link to:
              </p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', marginBottom: '24px' }}>
                {email}
              </p>

              <div style={{
                background: 'var(--warning-light)', border: '1.5px solid #FDE68A',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '24px',
                textAlign: 'left',
              }}>
                <p style={{ fontSize: '13px', color: '#92400E', margin: 0 }}>
                  ⏰ Link expires in <strong>1 hour.</strong> Check your spam folder if you don't see it!
                </p>
              </div>

              <button onClick={() => setSent(false)}
                style={{
                  background: 'none', border: 'none', color: 'var(--gray-400)',
                  fontSize: '13px', cursor: 'pointer', marginBottom: '12px',
                }}>
                Didn't receive it? Try again
              </button>

              <br />
              <Link to="/login" style={{
                fontSize: '14px', color: 'var(--primary)',
                fontWeight: 600, textDecoration: 'none',
              }}>
                ← Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
