import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const SERVICE_TYPES = [
  { value: '', label: 'All' },
  { value: 'data', label: 'Data' },
  { value: 'tv', label: 'TV' },
  { value: 'edu', label: 'Edu Pin' },
];

function fmtNaira(v) {
  const n = Number(v || 0);
  return 'NGN ' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PlanRow({ plan, onSave }) {
  const [override, setOverride] = useState(plan.selling_price_override || '');
  const [isEnabled, setIsEnabled] = useState(plan.is_enabled);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(plan.id, {
        selling_price_override: override === '' ? null : override,
        is_enabled: isEnabled,
      });
      setDirty(false);
      toast.success(`${plan.plan_name} updated`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '10px',
    }}>
      <div style={{ minWidth: '160px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-900)' }}>{plan.plan_name}</div>
        <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Cost: {fmtNaira(plan.provider_price)}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px',
          background: override === '' ? '#E0E7FF' : '#FEF3C7',
          color: override === '' ? '#3730A3' : '#92400E',
        }}>
          {override === '' ? 'Auto' : 'Manual'}
        </span>

        <input
          type="number" step="0.01" min="0" placeholder="Auto"
          value={override}
          onChange={(e) => { setOverride(e.target.value); setDirty(true); }}
          style={{ width: '90px', padding: '7px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
        />

        {override !== '' && (
          <button onClick={() => { setOverride(''); setDirty(true); }} style={{
            background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 600,
          }}>
            Reset to Auto
          </button>
        )}

        <button
          onClick={() => { setIsEnabled(!isEnabled); setDirty(true); }}
          style={{
            padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
            border: '1px solid ' + (isEnabled ? '#A7F3D0' : '#FECACA'),
            background: isEnabled ? '#F0FDF4' : '#FEF2F2',
            color: isEnabled ? '#166534' : '#991B1B',
          }}
        >
          {isEnabled ? 'Enabled' : 'Disabled'}
        </button>

        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-900)', minWidth: '80px', textAlign: 'right' }}>
          {fmtNaira(plan.selling_price)}
        </span>

        <button
          onClick={handleSave} disabled={!dirty || saving}
          className="btn btn-primary"
          style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', opacity: (!dirty || saving) ? 0.5 : 1 }}
        >
          {saving ? '...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function PricingServicePlans() {
  const [plans, setPlans] = useState([]);
  const [serviceType, setServiceType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (serviceType) params.set('service_type', serviceType);
      if (search) params.set('search', search);
      params.set('page', page);
      const res = await api.get(`/admin/pricing/service-plans/?${params.toString()}`);
      setPlans(res.data.results || []);
      setTotalPages(res.data.total_pages || 1);
      setCount(res.data.count || 0);
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [serviceType, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleSavePlan = (id, body) => api.post(`/admin/pricing/service-plans/${id}/update/`, body).then(load);

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {SERVICE_TYPES.map((t) => (
          <button key={t.value} onClick={() => { setServiceType(t.value); setPage(1); }} style={{
            padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            border: '1px solid ' + (serviceType === t.value ? 'var(--primary)' : '#E2E8F0'),
            background: serviceType === t.value ? 'var(--primary)' : 'white',
            color: serviceType === t.value ? 'white' : 'var(--gray-500)',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plan name..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '13px' }}>
          Search
        </button>
      </form>

      <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '10px' }}>{count} plans</p>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)', fontSize: '14px' }}>Loading...</div>
        ) : plans.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)', fontSize: '14px' }}>No plans found.</div>
        ) : (
          plans.map((p) => <PlanRow key={p.id} plan={p} onSave={handleSavePlan} />)
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} style={{
            padding: '8px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white',
            fontSize: '13px', cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.5 : 1,
          }}>Previous</button>
          <span style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--gray-500)' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{
            padding: '8px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white',
            fontSize: '13px', cursor: page >= totalPages ? 'default' : 'pointer', opacity: page >= totalPages ? 0.5 : 1,
          }}>Next</button>
        </div>
      )}
    </div>
  );
}
