/**
 * pages/Referral.jsx — Redesigned with AhmiVTU design system
 */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const HOW_IT_WORKS = [
  { step: '1', emoji: '🔗', text: 'Share your unique referral link with friends' },
  { step: '2', emoji: '👤', text: 'Friend registers using your link' },
  { step: '3', emoji: '💳', text: 'Friend funds their wallet' },
  { step: '4', emoji: '🎉', text: 'You earn a bonus automatically!' },
];

export default function Referral() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions/referral/')
      .then((res) => setData(res.data))
      .catch(() => toast.error('Could not load referral info'))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(data?.referral_link || '');
    toast.success('Referral link copied! 🎉');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(data?.referral_code || '');
    toast.success('Code copied!');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
      <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
        <div className="spinner spinner-primary" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: '14px' }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '4px 0 40px' }}>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">🎁 Refer & Earn</h1>
        <p className="page-subtitle">Invite friends and earn bonuses!</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          borderRadius: '16px', padding: '20px 16px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px', background:'rgba(255,255,255,0.08)', borderRadius:'50%' }} />
          <p style={{ fontSize: '36px', fontWeight: 800, color: 'white', lineHeight: 1 }}>
            {data?.total_referrals || 0}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '6px', fontWeight: 600 }}>
            Total Referrals
          </p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, var(--success) 0%, #047857 100%)',
          borderRadius: '16px', padding: '20px 16px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px', background:'rgba(255,255,255,0.08)', borderRadius:'50%' }} />
          <p style={{ fontSize: '22px', fontWeight: 800, color: 'white', lineHeight: 1 }}>
            ₦{Number(data?.total_bonus_earned || 0).toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '6px', fontWeight: 600 }}>
            Bonus Earned
          </p>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px' }}>
          Your Referral Code
        </p>
        <div style={{
          background: 'var(--primary-light)', border: '2px dashed #93C5FD',
          borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '14px',
          cursor: 'pointer',
        }} onClick={copyCode}>
          <p style={{
            fontSize: '32px', fontWeight: 800, color: 'var(--primary)',
            letterSpacing: '6px', fontFamily: 'monospace',
          }}>
            {data?.referral_code || '------'}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '6px' }}>
            Tap to copy code
          </p>
        </div>

        <button onClick={copyLink}
          className="btn btn-primary btn-full"
          style={{ padding: '13px', fontSize: '14px', borderRadius: '12px' }}>
          📋 Copy Referral Link
        </button>

        {data?.referral_link && (
          <p style={{
            fontSize: '11px', color: 'var(--gray-400)', textAlign: 'center',
            marginTop: '10px', wordBreak: 'break-all',
          }}>
            {data.referral_link}
          </p>
        )}
      </div>

      {/* How It Works */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '16px' }}>
          How it works
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {HOW_IT_WORKS.map((s, i) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 800, flexShrink: 0,
              }}>{s.step}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <span style={{ fontSize: '20px' }}>{s.emoji}</span>
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', fontWeight: 500 }}>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referred People List */}
      {data?.referrals?.length > 0 && (
        <div className="card">
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '14px' }}>
            People You Referred ({data.referrals.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.referrals.map((r) => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: '12px', background: 'var(--gray-50)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--primary-light)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 800,
                  }}>
                    {r.referred_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-800)' }}>
                      {r.referred_name}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                      {r.referred_email}
                    </p>
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                  background: r.bonus_paid ? 'var(--success-light)' : 'var(--gray-100)',
                  color: r.bonus_paid ? 'var(--success)' : 'var(--gray-400)',
                }}>
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