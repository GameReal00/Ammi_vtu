/**
 * pages/auth/Register.jsx — Redesigned with AhmiVTU design system
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { registerUser, clearError } from '../../store/authSlice';

const FIELDS = [
  { name: 'full_name',     label: 'Full Name',       type: 'text',     placeholder: 'Adamu Ibrahim',
    rules: { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } } },
  { name: 'email',         label: 'Email Address',   type: 'email',    placeholder: 'you@example.com',
    rules: { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } } },
  { name: 'phone_number',  label: 'Phone Number',    type: 'tel',      placeholder: '08012345678',
    rules: { required: 'Phone number is required', pattern: { value: /^[0-9+\-\s]{7,20}$/, message: 'Enter a valid phone number' } } },
  { name: 'password',      label: 'Password',        type: 'password', placeholder: 'At least 8 characters',
    rules: { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } } },
];

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((s) => s.auth);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  useEffect(() => {
    if (error) {
      const messages = Object.entries(error)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
        .join('\n');
      toast.error(messages || 'Registration failed');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Please log in.');
      navigate('/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
      background: 'linear-gradient(135deg, #1B4ED8 0%, #1337A8 50%, #0F172A 100%)',
    }}>
      {/* Decorative background circles */}
      <div style={{ position:'fixed', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-100px', left:'-60px', width:'350px', height:'350px', borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo & Heading */}
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
            Ammi<span style={{ color: '#FCD34D' }}>VTU</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            Create your free account
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'white', borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {FIELDS.map((f) => (
                <div key={f.name} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{f.label}</label>
                  <input
                    type={f.type}
                    className="form-input"
                    placeholder={f.placeholder}
                    {...register(f.name, f.rules)}
                  />
                  {errors[f.name] && <p className="form-error">{errors[f.name].message}</p>}
                </div>
              ))}

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" placeholder="Repeat your password"
                  {...register('confirm_password', {
                    required: 'Please confirm your password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })} />
                {errors.confirm_password && <p className="form-error">{errors.confirm_password.message}</p>}
              </div>

              <button type="submit" disabled={isLoading}
                className="btn btn-primary btn-full"
                style={{ padding: '14px', fontSize: '15px', borderRadius: '12px', marginTop: '4px' }}>
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span className="spinner" /> Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--gray-500)', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px',
          marginTop: '20px',
        }}>
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