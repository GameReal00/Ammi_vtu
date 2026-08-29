import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

function MarginRow({ label, percent, enabled, hasToggle, onSave }) {
  const [value, setValue] = useState(percent);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setValue(percent); setIsEnabled(enabled); }, [percent, enabled]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ margin_percent: value, is_enabled: isEnabled });
      setDirty(false);
      toast.success(`${label} updated`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', borderRadius: '10px', background: '#F8FAFC', flexWrap: 'wrap', gap: '10px',
    }}>
      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)', minWidth: '110px' }}>{label}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number" step="0.01" min="0" value={value}
            onChange={(e) => { setValue(e.target.value); setDirty(true); }}
            style={{ width: '80px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }}
          />
          <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>%</span>
        </div>

        {hasToggle && (
          <button
            onClick={() => { setIsEnabled(!isEnabled); setDirty(true); }}
            style={{
              padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              border: '1px solid ' + (isEnabled ? '#A7F3D0' : '#FECACA'),
              background: isEnabled ? '#F0FDF4' : '#FEF2F2',
              color: isEnabled ? '#166534' : '#991B1B',
            }}
          >
            {isEnabled ? 'Enabled' : 'Disabled'}
          </button>
        )}

        <button
          onClick={handleSave} disabled={!dirty || saving}
          className="btn btn-primary"
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', opacity: (!dirty || saving) ? 0.5 : 1 }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)' }}>{title}</div>
        <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{description}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>
    </div>
  );
}

export default function PricingMargins() {
  const [networkMargins, setNetworkMargins] = useState([]);
  const [typeMargins, setTypeMargins] = useState([]);
  const [electricityMargins, setElectricityMargins] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [nm, tm, em] = await Promise.all([
        api.get('/admin/pricing/network-margins/'),
        api.get('/admin/pricing/service-type-margins/'),
        api.get('/admin/pricing/electricity-margins/'),
      ]);
      setNetworkMargins(nm.data.results || []);
      setTypeMargins(tm.data.results || []);
      setElectricityMargins(em.data.results || []);
    } catch {
      toast.error('Failed to load margins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  if (loading) {
    return <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Loading margins...</div>;
  }

  return (
    <div>
      <Section title="Airtime Margins" description="Your profit % on airtime, per network. Disable a network to hide it from customers.">
        {networkMargins.map((m) => (
          <MarginRow
            key={m.id} label={m.network_display} percent={m.margin_percent} enabled={m.is_enabled} hasToggle
            onSave={(body) => api.post(`/admin/pricing/network-margins/${m.id}/update/`, body).then(loadAll)}
          />
        ))}
      </Section>

      <Section title="Default Margins by Service Type" description="Applies automatically to any data/TV/edu plan without its own custom price - see the Service Plans tab.">
        {typeMargins.map((m) => (
          <MarginRow
            key={m.id} label={m.service_type_display} percent={m.margin_percent} enabled={true} hasToggle={false}
            onSave={(body) => api.post(`/admin/pricing/service-type-margins/${m.id}/update/`, { margin_percent: body.margin_percent }).then(loadAll)}
          />
        ))}
      </Section>

      <Section title="Electricity Fees" description="Your service fee %, per provider. Rows appear automatically the first time a customer pays that provider.">
        {electricityMargins.length === 0 ? (
          <p style={{ color: 'var(--gray-500)', fontSize: '13px' }}>No electricity providers used yet.</p>
        ) : (
          electricityMargins.map((m) => (
            <MarginRow
              key={m.id} label={m.service_id} percent={m.fee_percent} enabled={m.is_enabled} hasToggle
              onSave={(body) => api.post(`/admin/pricing/electricity-margins/${m.id}/update/`, { fee_percent: body.margin_percent, is_enabled: body.is_enabled }).then(loadAll)}
            />
          ))
        )}
      </Section>
    </div>
  );
}
