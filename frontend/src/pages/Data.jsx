/**
 * pages/Data.jsx
 * Data plan purchase for all networks.
 * Fetches plans from VTPass API dynamically.
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';

const NETWORKS = [
  { id: 'mtn',      label: 'MTN',     emoji: '🟡' },
  { id: 'airtel',   label: 'Airtel',  emoji: '🔴' },
  { id: 'glo',      label: 'Glo',     emoji: '🟢' },
  { id: 'etisalat', label: '9mobile', emoji: '🟩' },
];

export default function Data() {
  const { user } = useSelector((s) => s.auth);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [plans, setPlans]         = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading]     = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch plans when network changes
  useEffect(() => {
    if (!selectedNetwork) return;
    const fetchPlans = async () => {
      setLoadingPlans(true);
      setPlans([]);
      setSelectedPlan(null);
      try {
        const res = await api.get(`/services/variations/?service_id=${selectedNetwork}-data`);
        const variations = res.data?.data?.content?.varations || [];
        setPlans(variations);
      } catch {
        toast.error('Could not load data plans');
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [selectedNetwork]);

  const onSubmit = async (data) => {
    if (!selectedNetwork) return toast.error('Please select a network');
    if (!selectedPlan)    return toast.error('Please select a data plan');
    setLoading(true);
    try {
      const res = await api.post('/services/data/', {
        network: selectedNetwork,
        phone: data.phone,
        variation_code: selectedPlan.variation_code,
        amount: selectedPlan.variation_amount,
        plan_name: selectedPlan.name,
      });
      toast.success(res.data.message);
      reset();
      setSelectedNetwork('');
      setSelectedPlan(null);
      setPlans([]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📶 Data Purchase</h1>
        <p className="text-gray-500 text-sm mt-1">Buy data for any Nigerian network</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <span className="text-sm text-blue-700 font-medium">Wallet Balance</span>
        <span className="text-blue-800 font-bold">₦{Number(user?.wallet_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
      </div>

      <div className="card space-y-5">

        {/* Network */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Network</label>
          <div className="grid grid-cols-4 gap-2">
            {NETWORKS.map((n) => (
              <button key={n.id} type="button" onClick={() => setSelectedNetwork(n.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  selectedNetwork === n.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <span className="text-2xl">{n.emoji}</span>
                <span className="text-xs font-semibold">{n.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input type="tel" className="input-field" placeholder="08012345678"
            {...register('phone', {
              required: 'Phone number is required',
              pattern: { value: /^0[789][01]\d{8}$/, message: 'Enter a valid Nigerian phone number' }
            })} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        {/* Plans */}
        {selectedNetwork && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
            {loadingPlans ? (
              <div className="text-center py-4 text-gray-400 text-sm">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">No plans available</div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {plans.map((plan) => (
                  <button key={plan.variation_code} type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      selectedPlan?.variation_code === plan.variation_code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}>
                    <p className="text-xs font-semibold text-gray-800 truncate">{plan.name}</p>
                    <p className="text-sm font-bold text-blue-600 mt-1">₦{Number(plan.variation_amount).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <button type="submit" disabled={loading || !selectedPlan} className="btn-primary">
            {loading ? 'Processing...' : selectedPlan ? `Buy ${selectedPlan.name} — ₦${Number(selectedPlan.variation_amount).toLocaleString()}` : 'Select a Plan'}
          </button>
        </form>
      </div>
    </div>
  );
}
