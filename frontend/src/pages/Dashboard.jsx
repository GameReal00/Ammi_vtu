/**
 * pages/Dashboard.jsx
 * Main dashboard — shows wallet balance, quick actions, recent transactions.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../store/authSlice';
import api from '../api/axios';

const quickActions = [
  { to: '/airtime',     icon: '📞', label: 'Airtime',     color: 'bg-green-50  border-green-200 text-green-700' },
  { to: '/data',        icon: '📶', label: 'Data',        color: 'bg-blue-50   border-blue-200 text-blue-700' },
  { to: '/electricity', icon: '💡', label: 'Electricity', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { to: '/tv',          icon: '📺', label: 'Cable TV',    color: 'bg-purple-50 border-purple-200 text-purple-700' },
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [walletData, setWalletData] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    // Refresh user profile on dashboard load
    dispatch(fetchProfile());

    // Load wallet balance
    const loadWallet = async () => {
      try {
        const res = await api.get('/wallet/balance/');
        setWalletData(res.data);
      } catch (e) {
        console.error('Wallet load error:', e);
      } finally {
        setLoadingWallet(false);
      }
    };

    // Load recent wallet transactions
    const loadHistory = async () => {
      try {
        const res = await api.get('/wallet/history/');
        setRecentTx(res.data.results?.slice(0, 5) || []);
      } catch (e) {
        console.error('History load error:', e);
      }
    };

    loadWallet();
    loadHistory();
  }, [dispatch]);

  const formatCurrency = (amount) =>
    `₦${Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '900px' }}>
    <div className="flex-1 p-6 space-y-6">

      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {getGreeting()}, {user?.full_name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your account</p>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg">
        <p className="text-blue-200 text-sm font-medium mb-1">Wallet Balance</p>
        {loadingWallet ? (
          <div className="h-10 w-40 bg-blue-500 rounded-lg animate-pulse mt-2" />
        ) : (
          <p className="text-4xl font-bold mt-1">
            {formatCurrency(walletData?.balance)}
          </p>
        )}
        <div className="flex items-center justify-between mt-4">
          <p className="text-blue-200 text-xs">
            {walletData?.is_locked ? '🔒 Wallet is locked' : '🟢 Active'}
          </p>
          <Link
            to="/wallet"
            className="bg-white text-blue-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition"
          >
            Fund Wallet
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 ${action.color}`}
            >
              <span className="text-3xl">{action.icon}</span>
              <span className="text-sm font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Recent Activity</h2>
          <Link to="/history" className="text-blue-600 text-sm font-medium hover:underline">
            View all
          </Link>
        </div>

        {recentTx.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-500 text-sm">No transactions yet.</p>
            <p className="text-gray-400 text-xs mt-1">Fund your wallet and start transacting!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                    ${tx.transaction_type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {tx.transaction_type === 'credit' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 capitalize">{tx.source}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${tx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    
  </div>      
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
