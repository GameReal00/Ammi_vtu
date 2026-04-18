/**
 * pages/TV.jsx
 * Cable TV subscription — DSTV, GOtv, Startimes
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PROVIDERS = [
  { id: 'dstv',      label: 'DSTV',      emoji: '🔵' },
  { id: 'gotv',      label: 'GOtv',      emoji: '🟠' },
  { id: 'startimes', label: 'Startimes', emoji: '🟣' },
];

export default function TV() {
  const { user } = useSelector((s) => s.auth);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [bouquets, setBouquets]     = useState([]);
  const [selectedBouquet, setSelectedBouquet] = useState(null);
  const [loadingBouquets, setLoadingBouquets] = useState(false);
  const [verifying, setVerifying]   = useState(false);
  const [verified, setVerified]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!selectedProvider) return;
    const fetchBouquets = async () => {
      setLoadingBouquets(true);
      setBouquets([]); setSelectedBouquet(null);
      try {
        const res = await api.get(`/services/variations/?service_id=${selectedProvider}`);
        setBouquets(res.data?.data?.content?.varations || []);
      } catch { toast.error('Could not load bouquets'); }
      finally { setLoadingBouquets(false); }
    };
    fetchBouquets();
  }, [selectedProvider]);

  const handleVerify = async () => {
    const decoder = watch('decoder_number');
    if (!selectedProvider || !decoder) return toast.error('Select provider and enter decoder number first');
    setVerifying(true); setVerified(null);
    try {
      const res = await api.post('/services/verify/', { service_id: selectedProvider, billers_code: decoder });
      if (res.data?.data?.content) { setVerified(res.data.data.content); toast.success('Decoder verified!'); }
      else toast.error('Could not verify decoder');
    } catch { toast.error('Verification failed'); }
    finally { setVerifying(false); }
  };

  const onSubmit = async (data) => {
    if (!selectedBouquet) return toast.error('Please select a bouquet');
    setLoading(true);
    try {
      const res = await api.post('/services/tv/', {
        service_id: selectedProvider,
        decoder_number: data.decoder_number,
        variation_code: selectedBouquet.variation_code,
        amount: selectedBouquet.variation_amount,
        phone: data.phone,
      });
      toast.success(res.data.message);
      reset(); setSelectedProvider(''); setSelectedBouquet(null); setVerified(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📺 Cable TV</h1>
        <p className="text-gray-500 text-sm mt-1">Pay for DSTV, GOtv, and Startimes</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <span className="text-sm text-blue-700 font-medium">Wallet Balance</span>
        <span className="text-blue-800 font-bold">₦{Number(user?.wallet_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">

        {/* Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Provider</label>
          <div className="grid grid-cols-3 gap-3">
            {PROVIDERS.map((p) => (
              <button key={p.id} type="button" onClick={() => setSelectedProvider(p.id)}
                className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                  selectedProvider === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                <span className="text-3xl">{p.emoji}</span>
                <span className="text-sm font-semibold">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Decoder Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Decoder/IUC Number</label>
          <div className="flex gap-2">
            <input className="input-field" placeholder="Enter decoder number"
              {...register('decoder_number', { required: 'Decoder number is required' })} />
            <button type="button" onClick={handleVerify} disabled={verifying}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium whitespace-nowrap">
              {verifying ? '...' : 'Verify'}
            </button>
          </div>
          {verified && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 text-sm font-medium">✅ {verified.Customer_Name || 'Verified'}</p>
              {verified.Current_Bouquet && <p className="text-green-600 text-xs">Current: {verified.Current_Bouquet}</p>}
            </div>
          )}
        </div>

        {/* Bouquets */}
        {selectedProvider && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Bouquet</label>
            {loadingBouquets ? (
              <p className="text-center text-gray-400 text-sm py-3">Loading bouquets...</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {bouquets.map((b) => (
                  <button key={b.variation_code} type="button" onClick={() => setSelectedBouquet(b)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      selectedBouquet?.variation_code === b.variation_code ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}>
                    <span className="text-sm font-medium text-gray-800">{b.name}</span>
                    <span className="text-sm font-bold text-blue-600">₦{Number(b.variation_amount).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input type="tel" className="input-field" placeholder="08012345678"
            {...register('phone', { required: 'Phone is required' })} />
        </div>

        <button type="submit" disabled={loading || !selectedBouquet} className="btn-primary">
          {loading ? 'Processing...' : selectedBouquet ? `Pay ${selectedBouquet.name} — ₦${Number(selectedBouquet.variation_amount).toLocaleString()}` : 'Select a Bouquet'}
        </button>
      </form>
    </div>
  );
}
