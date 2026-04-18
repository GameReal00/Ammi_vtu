/**
 * pages/EduPin.jsx
 * Purchase exam pins — WAEC, NECO, JAMB
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';

const EXAMS = [
  { id: 'waec',              label: 'WAEC',              emoji: '📘', desc: 'WAEC Result Checker' },
  { id: 'waec-registration', label: 'WAEC Registration', emoji: '📝', desc: 'WAEC Exam Registration' },
  { id: 'neco',              label: 'NECO',              emoji: '📗', desc: 'NECO Result Checker' },
  { id: 'jamb',              label: 'JAMB',              emoji: '📙', desc: 'JAMB PIN' },
];

export default function EduPin() {
  const { user } = useSelector((s) => s.auth);
  const [selectedExam, setSelectedExam] = useState('');
  const [variations, setVariations]     = useState([]);
  const [selectedVar, setSelectedVar]   = useState(null);
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!selectedExam) return;
    const fetch = async () => {
      try {
        const res = await api.get(`/services/variations/?service_id=${selectedExam}`);
        setVariations(res.data?.data?.content?.varations || []);
        setSelectedVar(null);
      } catch { toast.error('Could not load plans'); }
    };
    fetch();
  }, [selectedExam]);

  const onSubmit = async (data) => {
    if (!selectedVar) return toast.error('Please select a plan');
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/services/edu/', {
        service_id: selectedExam,
        variation_code: selectedVar.variation_code,
        amount: selectedVar.variation_amount,
        phone: data.phone,
      });
      toast.success(res.data.message);
      setResult(res.data.pin_data);
      reset(); setSelectedExam(''); setSelectedVar(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Purchase failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🎓 Edu Pin</h1>
        <p className="text-gray-500 text-sm mt-1">Purchase exam pins for WAEC, NECO, JAMB</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <span className="text-sm text-blue-700 font-medium">Wallet Balance</span>
        <span className="text-blue-800 font-bold">₦{Number(user?.wallet_balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5 mb-6">
          <h3 className="text-green-800 font-bold mb-2">✅ Purchase Successful!</h3>
          <pre className="text-green-700 text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">

        {/* Exam type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Exam</label>
          <div className="grid grid-cols-2 gap-3">
            {EXAMS.map((e) => (
              <button key={e.id} type="button" onClick={() => setSelectedExam(e.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selectedExam === e.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                <span className="text-2xl">{e.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{e.label}</p>
                  <p className="text-xs text-gray-500">{e.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Variations */}
        {variations.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
            <div className="space-y-2">
              {variations.map((v) => (
                <button key={v.variation_code} type="button" onClick={() => setSelectedVar(v)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-all ${
                    selectedVar?.variation_code === v.variation_code ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}>
                  <span className="text-sm font-medium">{v.name}</span>
                  <span className="text-sm font-bold text-blue-600">₦{Number(v.variation_amount).toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input type="tel" className="input-field" placeholder="08012345678"
            {...register('phone', { required: 'Phone is required' })} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <button type="submit" disabled={loading || !selectedVar} className="btn-primary">
          {loading ? 'Processing...' : selectedVar ? `Buy ${selectedVar.name} — ₦${Number(selectedVar.variation_amount).toLocaleString()}` : 'Select a Plan'}
        </button>
      </form>
    </div>
  );
}
