/**
 * pages/auth/Login.jsx — Redesigned with AhmiVTU design system
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { loginUser, clearError } from '../../store/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Invalid email or password');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
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
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            Ammi<span style={{ color: '#FCD34D' }}>VTU</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Email */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                  })} />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                    Forgot password?
                  </span>
                </div>
                <input type="password" className="form-input" placeholder="Enter your password"
                  style={{ marginTop: '6px' }}
                  {...register('password', { required: 'Password is required' })} />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isLoading}
                className="btn btn-primary btn-full"
                style={{ padding: '14px', fontSize: '15px', borderRadius: '12px', marginTop: '4px' }}>
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span className="spinner" /> Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            margin: '20px 0', color: 'var(--gray-300)',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }} />
            <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>New here?</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }} />
          </div>

          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '13px', borderRadius: '12px',
              border: '2px solid var(--primary)', background: 'white',
              color: 'var(--primary)', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              Create Free Account
            </button>
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          {['🔒 Secure', '⚡ Instant', '🇳🇬 Nigerian'].map((b) => (
            <span key={b} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}