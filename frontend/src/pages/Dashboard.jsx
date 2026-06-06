/**
 * pages/Dashboard.jsx — Mobile-first redesign
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../store/authSlice';
import api from '../api/axios';

const quickActions = [
  { to: '/airtime',     emoji: '📞', label: 'Airtime',     bg: '#EEF2FF', color: '#1B4ED8' },
  { to: '/data',        emoji: '📶', label: 'Data',        bg: '#F0FDF4', color: '#059669' },
  { to: '/electricity', emoji: '💡', label: 'Electricity', bg: '#FFFBEB', color: '#D97706' },
  { to: '/tv',          emoji: '📺', label: 'Cable TV',    bg: '#FDF4FF', color: '#9333EA' },
  { to: '/edu',         emoji: '🎓', label: 'Edu Pin',     bg: '#FFF1F2', color: '#E11D48' },
  { to: '/wallet',      emoji: '💰', label: 'Fund Wallet', bg: '#F0F9FF', color: '#0284C7' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default function Dashboard() {
  const dispatch  = useDispatch();
  const { user }  = useSelector((s) => s.auth);
  const [walletData,   setWalletData]   = useState(null);
  const [recentTx,     setRecentTx]     = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    dispatch(fetchProfile());
    (async () => {
      try {
        const [wallet, history] = await Promise.all([
          api.get('/wallet/balance/'),
          api.get('/wallet/history/'),
        ]);
        setWalletData(wallet.data);
        setRecentTx(history.data.results?.slice(0, 5) || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingWallet(false);
      }
    })();
  }, [dispatch]);

  const fmt = (a) =>
    `₦${Number(a || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const firstName = user?.full_name?.split(' ')[0] || 'User';

  return (
    <div style={{ padding: '16px', maxWidth: '680px', margin: '0 auto' }}>

      {/* ── Greeting ── */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.3px' }}>
          Good {getGreeting()}, {firstName} 👋
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '2px' }}>
          Here's what's happening with your account
        </p>
      </div>

      {/* ── Wallet Hero Card ── */}
      <div className="wallet-hero" style={{ marginBottom: '20px' }}>
        <p className="wallet-hero-label">Wallet Balance</p>
        {loadingWallet ? (
          <div style={{
            height: '44px', width: '160px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.15)', marginBottom: '24px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        ) : (
          <p className="wallet-hero-amount">{fmt(walletData?.balance)}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', opacity: 0.75, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: walletData?.is_locked ? '#FCA5A5' : '#4ADE80',
              display: 'inline-block'
            }} />
            {walletData?.is_locked ? 'Wallet Locked' : 'Active'}
          </span>
          <Link to="/wallet" className="btn btn-white btn-sm">
            + Fund Wallet
          </Link>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="card" style={{ marginBottom: '16px', padding: '20px' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px'
        }}>
          {quickActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: a.bg,
                borderRadius: '12px',
                padding: '14px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                border: `1.5px solid ${a.bg}`,
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '26px', lineHeight: 1 }}>{a.emoji}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: a.color }}>
                  {a.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">Recent Activity</h2>
          <Link to="/history" style={{
            fontSize: '13px', fontWeight: 600,
            color: 'var(--primary)', textDecoration: 'none'
          }}>
            View all →
          </Link>
        </div>

        {recentTx.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-title">No transactions yet</p>
            <p className="empty-state-text">Fund your wallet and start transacting!</p>
          </div>
        ) : (
          <div className="tx-list">
            {recentTx.map((tx) => {
              const isCredit = tx.transaction_type === 'credit';
              return (
                <div key={tx.id} className="tx-item">
                  <div className={`tx-icon ${isCredit ? 'credit' : 'debit'}`}>
                    <span style={{ fontSize: '16px' }}>{isCredit ? '↓' : '↑'}</span>
                  </div>
                  <div className="tx-info">
                    <p className="tx-desc" style={{ textTransform: 'capitalize' }}>
                      {tx.description?.split('—')[0]?.trim() || tx.source}
                    </p>
                    <p className="tx-date">
                      {new Date(tx.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>
                    {isCredit ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
