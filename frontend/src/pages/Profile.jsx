/**
 * pages/Profile.jsx
 * Edit profile, change password, upload avatar.
 */

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { updateUser, logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user }  = useSelector((s) => s.auth);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [tab, setTab]           = useState('profile');
  const [saving, setSaving]     = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { register: regProfile, handleSubmit: submitProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: { full_name: user?.full_name || '', phone: user?.phone || '' }
  });

  const { register: regPwd, handleSubmit: submitPwd, watch, reset: resetPwd, formState: { errors: pwdErrors } } = useForm();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

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
      toast.success('Password changed! Please login again.');
      resetPwd();
      setTimeout(() => { dispatch(logout()); navigate('/login'); }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed');
    } finally { setSaving(false); }
  };

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const initials = user?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="flex-1 p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">👤 Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account settings</p>
      </div>

      {/* Avatar */}
      <div className="card mb-6 flex items-center gap-4">
        <div className="relative">
          {avatarPreview || user?.avatar ? (
            <img src={avatarPreview || user.avatar} alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-100" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
          )}
          <label htmlFor="avatar-input" className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer text-white text-xs shadow">
            ✏️
          </label>
          <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">{user?.full_name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <p className="text-blue-600 text-sm font-medium mt-1">₦{Number(user?.wallet_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['profile', 'password'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}>{t === 'profile' ? '✏️ Edit Profile' : '🔒 Change Password'}</button>
        ))}
      </div>

      {/* Profile form */}
      {tab === 'profile' && (
        <form onSubmit={submitProfile(onUpdateProfile)} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input className="input-field" placeholder="Your full name"
              {...regProfile('full_name', { required: 'Name is required' })} />
            {profileErrors.full_name && <p className="text-red-500 text-xs mt-1">{profileErrors.full_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input className="input-field bg-gray-50" value={user?.email} disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input className="input-field" placeholder="08012345678"
              {...regProfile('phone')} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Password form */}
      {tab === 'password' && (
        <form onSubmit={submitPwd(onChangePassword)} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input type="password" className="input-field" placeholder="Enter current password"
              {...regPwd('current_password', { required: 'Current password is required' })} />
            {pwdErrors.current_password && <p className="text-red-500 text-xs mt-1">{pwdErrors.current_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input type="password" className="input-field" placeholder="Enter new password"
              {...regPwd('new_password', { required: 'New password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
            {pwdErrors.new_password && <p className="text-red-500 text-xs mt-1">{pwdErrors.new_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input type="password" className="input-field" placeholder="Confirm new password"
              {...regPwd('confirm_password', {
                required: 'Please confirm password',
                validate: (v) => v === watch('new_password') || 'Passwords do not match'
              })} />
            {pwdErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{pwdErrors.confirm_password.message}</p>}
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Changing...' : '🔒 Change Password'}
          </button>
        </form>
      )}

      {/* Logout */}
      <button onClick={handleLogout} className="w-full mt-4 py-3 rounded-xl border-2 border-red-200 text-red-500 font-medium text-sm hover:bg-red-50 transition-all">
        🚪 Logout
      </button>
    </div>
  );
}
