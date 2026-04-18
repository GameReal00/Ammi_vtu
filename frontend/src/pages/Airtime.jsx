/**
 * pages/Airtime.jsx
 * Airtime top-up for all networks.
 */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';

const NETWORKS = [
  { id: 'mtn',      label: 'MTN',     color: 'bg-yellow-400', emoji: '🟡' },
  { id: 'airtel',   label: 'Airtel',  color: 'bg-red-500',    emoji: '🔴' },
  { id: 'glo',      label: 'Glo',     color: 'bg-green-500',  emoji: '🟢' },
  { id: 'etisalat', label: '9mobile', color: 'bg-green-700',  emoji: '🟩' },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function Airtime() {
  const { user } = useSelector((s) => s.auth);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const amount = watch('amount');

  const onSubmit = async (data) => {
    if (!selectedNetwork) return toast.error('Please select a network');
    setLoading(true);
    try {
      const res = await api.post('/services/airtime/', {
        network: selectedNetwork,
        phone: data.phone,
        amount: data.amount,
      });
      toast.success(res.data.message);
      reset();
      setSelectedNetwork('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📞 Airtime Top-Up</h1>
        <p className="text-gray-500 text-sm mt-1">Send airtime to any Nigerian network</p>
      </div>

      {/* Wallet balance */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <span className="text-sm text-blue-700 font-medium">Wallet Balance</span>
        <span className="text-blue-800 font-bold">₦{Number(user?.wallet_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Network Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Network</label>
            <div className="grid grid-cols-4 gap-2">
              {NETWORKS.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedNetwork(n.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    selectedNetwork === n.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{n.emoji}</span>
                  <span className="text-xs font-semibold text-gray-700">{n.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              className="input-field"
              placeholder="08012345678"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^0[789][01]\d{8}$/, message: 'Enter a valid Nigerian phone number' }
              })}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* Quick Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setValue('amount', a)}
                  className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                    Number(amount) === a
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input-field"
              placeholder="Or enter custom amount"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 50, message: 'Minimum is ₦50' },
                max: { value: 50000, message: 'Maximum is ₦50,000' },
              })}
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Processing...' : `Buy Airtime${amount ? ` — ₦${Number(amount).toLocaleString()}` : ''}`}
          </button>
        </form>
      </div>
    </div>
  );
}
