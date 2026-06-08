import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Branded Network Data
const NETWORKS = [
  { id: 'mtn', label: 'MTN', color: 'bg-[#FFC107]', textColor: 'text-black' },
  { id: 'airtel', label: 'Airtel', color: 'bg-[#D7182A]', textColor: 'text-white' },
  { id: 'glo', label: 'Glo', color: 'bg-[#008B4B]', textColor: 'text-white' },
  { id: 'etisalat', label: '9mobile', color: 'bg-[#003399]', textColor: 'text-white' },
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
    <div className="flex-1 w-full min-h-screen bg-gray-50 p-4 flex justify-center items-start pt-8">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 relative overflow-hidden">
        
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📱</span> Buy Airtime
          </h1>
          <p className="text-gray-500 text-sm mt-1">Top-up any Nigerian number instantly</p>
        </div>

        {/* Wallet Balance - Premium Glassmorphism Style */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-4 mb-6 shadow-lg text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <p className="text-indigo-100 text-xs font-medium uppercase tracking-wide">Wallet Balance</p>
              <span className="text-2xl bg-white/20 p-1.5 rounded-full">💰</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              ₦{Number(user?.wallet_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </p>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {/* Network Selection - Better Interactive Cards */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Network</label>
          <div className="grid grid-cols-4 gap-2">
            {NETWORKS.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelectedNetwork(n.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-200 ${
                  selectedNetwork === n.id
                    ? 'border-indigo-600 bg-indigo-50 shadow-md scale-105'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${n.color} ${n.textColor} flex items-center justify-center font-bold text-sm shadow-sm mb-1`}>
                  {n.label[0]}
                </div>
                <span className={`text-[10px] font-semibold ${selectedNetwork === n.id ? 'text-indigo-700' : 'text-gray-600'}`}>
                  {n.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
            <input
              type="tel"
              className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white placeholder-gray-400"
              placeholder="080 123 456 78"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^0[789][01]\d{8}$/, message: 'Enter a valid Nigerian number' }
              })}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone.message}</p>}
        </div>

        {/* Amounts - Grid + Custom Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setValue('amount', a, { shouldValidate: true })}
                className={`py-2.5 rounded-lg border transition-all duration-200 font-semibold text-sm ${
                  Number(amount) === a
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                }`}
              >
                ₦{a.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            type="number"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white placeholder-gray-400"
            placeholder="Or enter custom amount (e.g. 350)"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 50, message: 'Minimum is ₦50' },
              max: { value: 50000, message: 'Maximum is ₦50,000' },
            })}
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.amount.message}</p>}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            `Buy Airtime ${amount ? `— ₦${Number(amount).toLocaleString()}` : ''}`
          )}
        </button>
      </form>
    </div>
  );
}