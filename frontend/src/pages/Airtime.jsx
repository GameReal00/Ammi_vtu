import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Better network data with brand colors
const NETWORKS = [
  { id: 'mtn',      label: 'MTN',     color: 'bg-yellow-400', text: 'text-yellow-900', initial: 'M' },
  { id: 'airtel',   label: 'Airtel',  color: 'bg-red-500',    text: 'text-white',      initial: 'A' },
  { id: 'glo',      label: 'Glo',     color: 'bg-green-500',  text: 'text-white',      initial: 'G' },
  { id: 'etisalat', label: '9mobile', color: 'bg-green-700',  text: 'text-white',      initial: '9' },
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
    <div className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"></span> 
          Airtime Top-Up
        </h1>
        <p className="text-gray-500 text-sm mt-1">Send airtime to any Nigerian network</p>
      </div>

      {/* Wallet balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4 mb-6 shadow-lg text-white flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Wallet Balance</p>
          <p className="text-2xl font-bold mt-1">
            ₦{Number(user?.wallet_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white/20 p-2 rounded-full">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Network Selection - 2x2 Grid */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Network</label>
            <div className="grid grid-cols-2 gap-3">
              {NETWORKS.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedNetwork(n.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedNetwork === n.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${n.color} ${n.text} flex items-center justify-center font-bold text-sm`}>
                    {n.initial}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{n.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <input
                type="tel"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
                placeholder="08012345678"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: { value: /^0[789][01]\d{8}$/, message: 'Enter a valid Nigerian phone number' }
                })}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone.message}</p>}
          </div>

          {/* Quick Amount - 3x2 Grid */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₦)</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setValue('amount', a)}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    Number(amount) === a
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
              placeholder="Or enter custom amount"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 50, message: 'Minimum is ₦50' },
                max: { value: 50000, message: 'Maximum is ₦50,000' },
              })}
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount.message}</p>}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              `Buy Airtime${amount ? ` — ₦${Number(amount).toLocaleString()}` : ''}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}