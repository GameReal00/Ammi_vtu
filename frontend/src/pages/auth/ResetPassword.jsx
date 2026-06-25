/**
 * pages/auth/ResetPassword.jsx
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

export default function ResetPassword() {
  const [searchParams]            = useSearchParams();
  const navigate                  = useNavigate();
  const token                     = searchParams.get('token');
  const [tokenValid, setTokenValid] = useState(null); // null=checking, true=valid, false=invalid
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [showPwd, setShowPwd]     = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    (async () => {
      try {
        const res = await axios.get(`${API}/auth/reset-password/validate/?token=${token}`);
        setTokenValid(res.data.valid);
      } catch {
        setTokenValid(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password/`, {
        token,
        new_password: newPassword,
      });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed. Please try again.');
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

        <div style={{
          background: 'white', borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}>

          {/* Checking token */}
          {tokenValid === null && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="spinner spinner-primary" style={{ margin: '0 auto 16px', width: '32px', height: '32px' }} />
              <p style={{ color: 'var(--gray-400)', fontSize: '14px' }}>Validating your reset link...</p>
            </div>
          )}

          {/* Invalid token */}
          {tokenValid === false && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--danger-light)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '30px', margin: '0 auto 16px',
              }}>❌</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '8px' }}>
                Link Invalid or Expired
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '24px', lineHeight: 1.5 }}>
                This reset link has expired or already been used. Please request a new one.
              </p>
              <Link to="/forgot-password">
                <button className="btn btn-primary btn-full"
                  style={{ padding: '13px', fontSize: '14px', borderRadius: '12px', marginBottom: '12px' }}>
                  Request New Link
                </button>
              </Link>
              <br />
              <Link to="/login" style={{ fontSize: '14px', color: 'var(--gray-400)', textDecoration: 'none' }}>
                ← Back to Login
              </Link>
            </div>
          )}

          {/* Valid token — show form */}
          {tokenValid === true && !done && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', margin: '0 auto 14px',
                }}>🔒</div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '6px' }}>
                  Set New Password
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
                  Choose a strong password for your account
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* New Password */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        className="form-input"
                        placeholder="At least 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ paddingRight: '48px' }}
                        required
                      />
                      <button type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        style={{
                          position: 'absolute', right: '14px', top: '50%',
                          transform: 'translateY(-50%)', background: 'none',
                          border: 'none', cursor: 'pointer', fontSize: '16px',
                        }}>
                        {showPwd ? '🙈' : '👁️'}
                      </button>
                    </div>

                    {/* Password strength bar */}
                    {newPassword.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ height: '4px', borderRadius: '4px', background: 'var(--gray-200)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: '4px', transition: 'all 0.3s ease',
                            width: newPassword.length >= 12 ? '100%' : newPassword.length >= 8 ? '60%' : '30%',
                            background: newPassword.length >= 12 ? 'var(--success)' : newPassword.length >= 8 ? 'var(--accent)' : 'var(--danger)',
                          }} />
                        </div>
                        <p style={{
                          fontSize: '11px', marginTop: '4px',
                          color: newPassword.length >= 12 ? 'var(--success)' : newPassword.length >= 8 ? 'var(--warning)' : 'var(--danger)',
                          fontWeight: 600,
                        }}>
                          {newPassword.length >= 12 ? '✅ Strong' : newPassword.length >= 8 ? '⚠️ Good' : '❌ Too short'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Confirm Password</label>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="form-error">Passwords do not match</p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && (
                      <p style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600, marginTop: '4px' }}>
                        ✅ Passwords match
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn btn-primary btn-full"
                    style={{ padding: '14px', fontSize: '15px', borderRadius: '12px', marginTop: '4px' }}>
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <span className="spinner" /> Resetting...
                      </span>
                    ) : 'Reset Password 🔑'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Success State */}
          {done && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'var(--success-light)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', margin: '0 auto 20px',
              }}>🎉</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '10px' }}>
                Password Reset!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '20px', lineHeight: 1.5 }}>
                Your password has been updated successfully. Redirecting you to login...
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="spinner spinner-primary" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
