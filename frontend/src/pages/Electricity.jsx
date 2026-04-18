/**
 * pages/Electricity.jsx
 */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PROVIDERS = [
  { id: 'ikeja-electric',  label: 'Ikeja Electric' },
  { id: 'eko-electric',    label: 'Eko Electric' },
  { id: 'abuja-electric',  label: 'Abuja Electric' },
  { id: 'kano-electric',   label: 'Kano Electric' },
  { id: 'phed',            label: 'Port Harcourt Electric' },
  { id: 'jos-electric',    label: 'Jos Electric' },
  { id: 'ibadan-electric', label: 'Ibadan Electric' },
  { id: 'kaduna-electric', label: 'Kaduna Electric' },
  { id: 'enugu-electric',  label: 'Enugu Electric' },
  { id: 'benin-electric',  label: 'Benin Electric' },
  { id: 'aedc',            label: 'Aba Electric' },
];

const QUICK_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 20000];

export default function Electricity() {
  const { user } = useSelector((s) => s.auth);
  const [meterType, setMeterType] = useState('prepaid');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const amount = watch('amount');

  const handleVerify = async () => {
    const serviceId   = watch('service_id');
    const meterNumber = watch('meter_number');
    if (!serviceId || !meterNumber) return toast.error('Select provider and enter meter number first');
    setVerifying(true);
    setVerified(null);
    try {
      const res = await api.post('/services/verify/', {
        service_id: serviceId,
        billers_code: meterNumber,
        type: meterType,
      });
      if (res.data?.data?.content) {
        setVerified(res.data.data.content);
        toast.success('Meter verified!');
      } else {
        toast.error('Could not verify meter number');
      }
    } catch {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/services/electricity/', {
        service_id: data.service_id,
        meter_number: data.meter_number,
        variation_code: meterType,
        amount: data.amount,
        phone: data.phone,
      });
      toast.success(res.data.message);
      if (res.data.token) toast.success(`Token: ${res.data.token}`, { duration: 10000 });
      reset(); setVerified(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">💡 Electricity Bill</h1>
        <p className="text-gray-500 text-sm mt-1">Pay electricity bills for any DisCo</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <span className="text-sm text-blue-700 font-medium">Wallet Balance</span>
        <span className="text-blue-800 font-bold">₦{Number(user?.wallet_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">

        {/* Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Provider</label>
          <select className="input-field" {...register('service_id', { required: 'Provider is required' })}>
            <option value="">-- Select DisCo --</option>
            {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          {errors.service_id && <p className="text-red-500 text-xs mt-1">{errors.service_id.message}</p>}
        </div>

        {/* Meter Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meter Type</label>
          <div className="grid grid-cols-2 gap-3">
            {['prepaid', 'postpaid'].map((t) => (
              <button key={t} type="button" onClick={() => setMeterType(t)}
                className={`py-3 rounded-xl border-2 font-medium text-sm capitalize transition-all ${
                  meterType === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                }`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Meter Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meter Number</label>
          <div className="flex gap-2">
            <input className="input-field" placeholder="Enter meter number"
              {...register('meter_number', { required: 'Meter number is required' })} />
            <button type="button" onClick={handleVerify} disabled={verifying}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium whitespace-nowrap">
              {verifying ? '...' : 'Verify'}
            </button>
          </div>
          {errors.meter_number && <p className="text-red-500 text-xs mt-1">{errors.meter_number.message}</p>}
          {verified && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 text-sm font-medium">✅ {verified.Customer_Name || verified.name || 'Verified'}</p>
              {verified.Address && <p className="text-green-600 text-xs">{verified.Address}</p>}
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {QUICK_AMOUNTS.map((a) => (
              <button key={a} type="button" onClick={() => setValue('amount', a)}
                className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                  Number(amount) === a ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}>₦{a.toLocaleString()}</button>
            ))}
          </div>
          <input type="number" className="input-field" placeholder="Or enter custom amount"
            {...register('amount', { required: 'Amount is required', min: { value: 1000, message: 'Minimum ₦1,000' } })} />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input type="tel" className="input-field" placeholder="08012345678"
            {...register('phone', { required: 'Phone is required' })} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Processing...' : `Pay₦${amount ? Number(amount).toLocaleString() : ''} Electricity`}
        </button>
      </form>
    </div>
  );
}
