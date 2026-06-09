/**
 * pages/Profile.jsx — Redesigned with AhmiVTU design system
 */
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { updateUser, logout } from '../store/authSlice';

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tab, setTab]                     = useState('profile');
  const [saving, setSaving]               = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { register: regProfile, handleSubmit: submitProfile, formState: { errors: pErr } } = useForm({
    defaultValues: { full_name: user?.full_name || '', phone: user?.phone || '' }
  });
  const { register: regPwd, handleSubmit: submitPwd, watch, reset: resetPwd, formState: { errors: wErr } } = useForm();

  const initials = user?.full_name?.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase() || 'U';

  const fmt = (a) => `₦${Number(a||0).toLocaleString('en-NG',{minimumFractionDigits:2})}`;

  const onUpdateProfile = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      formData.append('phone', data.phone || '');
      const fileInput = document.querySelector('#avatar-input');
      if (fileInput?.files[0]) formData.append('avatar', fileInput.files[0]);
      const res = await api.put('/auth/profile/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(updateUser(res.data.user));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  const onChangePassword = async (data) => {
    setSaving(true);
    try {
      await api.post('/auth/change-password/', {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('Password changed! Logging out...');
      resetPwd();
      setTimeout(() => { dispatch(logout()); navigate('/login'); }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '4px 0 40px' }}>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">👤 Profile</h1>
        <p className="page-subtitle">Manage your account settings</p>
      </div>

      {/* User Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        borderRadius: '20px', padding: '24px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '16px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', background:'rgba(255,255,255,0.06)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'-40px', right:'60px', width:'160px', height:'160px', background:'rgba(255,255,255,0.04)', borderRadius:'50%' }} />

        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0, zIndex: 1 }}>
          {avatarPreview || user?.avatar ? (
            <img src={avatarPreview || user.avatar} alt="avatar"
              style={{ width:'72px', height:'72px', borderRadius:'50%', objectFit:'cover', border:'3px solid rgba(255,255,255,0.3)' }} />
          ) : (
            <div style={{
              width:'72px', height:'72px', borderRadius:'50%',
              background:'rgba(255,255,255,0.2)', color:'white',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'26px', fontWeight:800, border:'3px solid rgba(255,255,255,0.3)',
            }}>{initials}</div>
          )}
          <label htmlFor="avatar-input" style={{
            position:'absolute', bottom:0, right:0,
            width:'24px', height:'24px', borderRadius:'50%',
            background:'var(--accent)', display:'flex', alignItems:'center',
            justifyContent:'center', cursor:'pointer', fontSize:'11px',
          }}>✏️</label>
          <input id="avatar-input" type="file" accept="image/*" style={{ display:'none' }}
            onChange={e => { const f=e.target.files[0]; if(f) setAvatarPreview(URL.createObjectURL(f)); }} />
        </div>

        {/* User Info */}
        <div style={{ zIndex: 1 }}>
          <p style={{ fontSize:'18px', fontWeight:800, color:'white', lineHeight:1.2 }}>{user?.full_name}</p>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)', marginTop:'3px' }}>{user?.email}</p>
          <p style={{ fontSize:'15px', fontWeight:700, color:'#FCD34D', marginTop:'6px' }}>
            {fmt(user?.wallet_balance)}
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display:'flex', gap:'8px', marginBottom:'20px',
        background:'var(--gray-100)', borderRadius:'12px', padding:'4px',
      }}>
        {[
          { key:'profile',  label:'✏️ Edit Profile' },
          { key:'password', label:'🔒 Change Password' },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              flex:1, padding:'10px 12px', borderRadius:'10px', border:'none',
              background: tab===t.key ? 'white' : 'transparent',
              color: tab===t.key ? 'var(--gray-900)' : 'var(--gray-500)',
              fontSize:'13px', fontWeight:700, cursor:'pointer',
              transition:'all 0.15s ease',
              boxShadow: tab===t.key ? 'var(--shadow-sm)' : 'none',
            }}>{t.label}</button>
        ))}
      </div>

      {/* Profile Form */}
      {tab === 'profile' && (
        <form onSubmit={submitProfile(onUpdateProfile)}>
          <div className="card" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Your full name"
                {...regProfile('full_name', { required:'Name is required' })} />
              {pErr.full_name && <p className="form-error">{pErr.full_name.message}</p>}
            </div>

            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email} disabled
                style={{ background:'var(--gray-50)', color:'var(--gray-400)', cursor:'not-allowed' }} />
              <p style={{ fontSize:'11px', color:'var(--gray-400)', marginTop:'4px' }}>Email cannot be changed</p>
            </div>

            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Phone Number</label>
              <input className="form-input" placeholder="08012345678"
                {...regProfile('phone')} />
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary btn-full"
              style={{ padding:'13px', fontSize:'14px', borderRadius:'12px', marginTop:'4px' }}>
              {saving ? (
                <span style={{ display:'flex', alignItems:'center', gap:'8px', justifyContent:'center' }}>
                  <span className="spinner" /> Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Password Form */}
      {tab === 'password' && (
        <form onSubmit={submitPwd(onChangePassword)}>
          <div className="card" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

            {[
              { name:'current_password', label:'Current Password', placeholder:'Enter current password', rules:{ required:'Required' } },
              { name:'new_password',     label:'New Password',     placeholder:'Enter new password (min 6 chars)',
                rules:{ required:'Required', minLength:{ value:6, message:'Min 6 characters' } } },
            ].map((f) => (
              <div key={f.name} className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">{f.label}</label>
                <input type="password" className="form-input" placeholder={f.placeholder}
                  {...regPwd(f.name, f.rules)} />
                {wErr[f.name] && <p className="form-error">{wErr[f.name].message}</p>}
              </div>
            ))}

            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" placeholder="Re-enter new password"
                {...regPwd('confirm_password', {
                  required:'Please confirm your password',
                  validate: v => v === watch('new_password') || 'Passwords do not match',
                })} />
              {wErr.confirm_password && <p className="form-error">{wErr.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary btn-full"
              style={{ padding:'13px', fontSize:'14px', borderRadius:'12px', marginTop:'4px' }}>
              {saving ? (
                <span style={{ display:'flex', alignItems:'center', gap:'8px', justifyContent:'center' }}>
                  <span className="spinner" /> Changing...
                </span>
              ) : '🔒 Change Password'}
            </button>
          </div>
        </form>
      )}

      {/* Logout Button */}
      <button onClick={() => { dispatch(logout()); navigate('/login'); }}
        style={{
          width:'100%', marginTop:'16px', padding:'13px',
          borderRadius:'12px', border:'2px solid #FEE2E2',
          background:'white', color:'var(--danger)',
          fontSize:'14px', fontWeight:700, cursor:'pointer',
          transition:'all 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background='#FEF2F2'}
        onMouseLeave={e => e.currentTarget.style.background='white'}>
        🚪 Logout
      </button>
    </div>
  );
}