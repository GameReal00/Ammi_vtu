import { useState } from 'react';
import PricingMargins from '../../components/admin/PricingMargins';
import PricingServicePlans from '../../components/admin/PricingServicePlans';

const TABS = [
  { key: 'margins', label: 'Margins' },
  { key: 'plans', label: 'Service Plans' },
];

export default function AdminPricing() {
  const [tab, setTab] = useState('margins');

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '16px' }}>Pricing</h1>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', borderBottom: '1px solid #E2E8F0' }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 18px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
            color: tab === t.key ? 'var(--primary)' : 'var(--gray-500)',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'margins' ? <PricingMargins /> : <PricingServicePlans />}
    </div>
  );
}
