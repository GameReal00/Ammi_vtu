/**
 * pages/Referral.jsx
 * Refer & Earn page.
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Referral() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions/referral/')
      .then((res) => setData(res.data))
      .catch(() => toast.error('Could not load referral info'))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(data?.referral_link || '');
    toast.success('Referral link copied!');
  };

  if (loading) return (
    <div className="flex-1 p-6 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  return (
    <div className="flex-1 p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🎁 Refer & Earn</h1>
        <p className="text-gray-500 text-sm mt-1">Invite friends and earn bonuses!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{data?.total_referrals || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Total Referrals</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">₦{Number(data?.total_bonus_earned || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Bonus Earned</p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="card mb-4">
        <p className="text-sm font-medium text-gray-600 mb-3">Your Referral Code</p>
        <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-4 text-center mb-4">
          <p className="text-3xl font-bold text-blue-700 tracking-widest">{data?.referral_code}</p>
        </div>
        <button onClick={copyLink} className="btn-primary">
          📋 Copy Referral Link
        </button>
      </div>

      {/* How it works */}
      <div className="card mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">How it works</p>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Share your referral link with friends' },
            { step: '2', text: 'Friend registers using your link' },
            { step: '3', text: 'Friend funds their wallet' },
            { step: '4', text: 'You earn a bonus automatically!' },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {s.step}
              </div>
              <p className="text-sm text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral list */}
      {data?.referrals?.length > 0 && (
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">People You Referred</p>
          <div className="space-y-2">
            {data.referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium">{r.referred_name}</p>
                  <p className="text-xs text-gray-400">{r.referred_email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.bonus_paid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {r.bonus_paid ? `+₦${r.bonus_amount}` : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
