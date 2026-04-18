/**
 * pages/Wallet.jsx
 * Wallet funding via Paystack.
 */

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { updateUser } from '../store/authSlice';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export default function Wallet() {
  const { user } = useSelector((s) => s.auth);
  const dispatch  = useDispatch();
  const location  = useLocation();
  const [loading, setLoading]   = useState(false);
  const [history, setHistory]   = useState([]);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const amount = watch('amount');

  // Check if returning from Paystack
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const ref    = params.get('reference') || localStorage.getItem('paystack_ref');

    if (status === 'success' && ref) {
      verifyPayment(ref);
      localStorage.removeItem('paystack_ref');
    }

    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/wallet/history/');
      setHistory(res.data.results || res.data || []);
    } catch {}
  };

  const verifyPayment = async (reference) => {
    try {
      const res = await api.post('/wallet/fund/verify/', { reference });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        dispatch(updateUser({ wallet_balance: res.data.new_balance }));
        loadHistory();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment verification failed');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/wallet/fund/initialize/', { amount: data.amount });
      localStorage.setItem('paystack_ref', res.data.reference);
      // Redirect to Paystack payment page
      window.location.href = res.data.authorization_url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not initialize payment');
      setLoading(false);
    }
  };

  const fmt = (a) => `₦${Number(a || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex-1 p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">💰 My Wallet</h1>
        <p className="text-gray-500 text-sm mt-1">Fund your wallet to make purchases</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <p className="text-blue-200 text-sm font-medium mb-1">Available Balance</p>
        <p className="text-4xl font-bold">{fmt(user?.wallet_balance)}</p>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-blue-200 text-sm">Active</span>
        </div>
      </div>

      {/* Fund wallet form */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Fund Wallet</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Amount</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {QUICK_AMOUNTS.map((a) => (
                <button key={a} type="button" onClick={() => setValue('amount', a)}
                  className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                    Number(amount) === a ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>
            <input type="number" className="input-field" placeholder="Or enter custom amount"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 100, message: 'Minimum is ₦100' },
                max: { value: 1000000, message: 'Maximum is ₦1,000,000' },
              })} />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Redirecting to Paystack...' : `Fund Wallet${amount ? ` — ₦${Number(amount).toLocaleString()}` : ''}`}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>🔒 Secured by</span>
          <span className="font-bold text-green-600">Paystack</span>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Wallet History</h2>
        {history.length === 0 ? (
          <p className="text-center text-gray-400 py-6">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${
                    tx.transaction_type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.transaction_type === 'credit' ? '⬆️' : '⬇️'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{tx.description || tx.source}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('en-NG')}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${tx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.transaction_type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
