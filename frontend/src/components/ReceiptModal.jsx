import toast from 'react-hot-toast';

export default function ReceiptModal({ tx, onClose }) {
  if (!tx) return null;

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const amount = `₦${Number(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  const ok = tx.status === 'success';

  const rows = [
    ['Service', `${(tx.service_type || '').toUpperCase()}${tx.network ? ' — ' + tx.network.toUpperCase() : ''}`],
    tx.plan_name ? ['Plan', tx.plan_name] : null,
    tx.phone ? ['Phone', tx.phone] : null,
    tx.account_number ? ['Meter / Account', tx.account_number] : null,
    tx.token ? ['Token', tx.token] : null,
    ['Amount', amount],
    ['Date', new Date(tx.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
  ].filter(Boolean);

  const shareText = encodeURIComponent(
    ['AMMI VTU - RECEIPT', '------------------------',
      `Service: ${tx.service_type}${tx.network ? ' (' + tx.network.toUpperCase() + ')' : ''}`,
      tx.phone ? `Phone: ${tx.phone}` : '',
      tx.account_number ? `Account: ${tx.account_number}` : '',
      tx.token ? `Token: ${tx.token}` : '',
      `Amount: ${amount}`,
      `Status: ${tx.status.toUpperCase()}`,
      `Date: ${new Date(tx.created_at).toLocaleString('en-NG')}`,
      `Txn ID: ${tx.id}`,
      tx.vtpass_ref ? `Provider Ref: ${tx.vtpass_ref}` : '',
      '------------------------', 'Powered by AMMI VTU',
    ].filter(Boolean).join('\n')
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380, maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 18, padding: '22px 20px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary, #1B4ED8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>A</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--gray-900, #111827)', margin: 0 }}>AMMI VTU</p>
              <p style={{ fontSize: 11, color: 'var(--gray-400, #9ca3af)', margin: 0 }}>Transaction Receipt</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'var(--gray-100, #f3f4f6)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>

        {/* Status banner */}
        <div style={{ marginTop: 16, textAlign: 'center', padding: 14, borderRadius: 12, background: ok ? 'var(--success-light, #ecfdf5)' : 'var(--danger-light, #fef2f2)' }}>
          <div style={{ fontSize: 26 }}>{ok ? '✅' : tx.status === 'pending' ? '⏳' : '❌'}</div>
          <p style={{ margin: '4px 0 0', fontWeight: 800, fontSize: 13, color: ok ? 'var(--success, #059669)' : 'var(--danger, #dc2626)', textTransform: 'capitalize' }}>{tx.status}</p>
          <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 800, color: 'var(--gray-900, #111827)' }}>{amount}</p>
        </div>

        <div style={{ borderTop: '2px dashed var(--gray-200, #e5e7eb)', margin: '16px 0' }} />

        {/* Detail rows */}
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '5px 0', fontSize: 13 }}>
            <span style={{ color: 'var(--gray-400, #9ca3af)', fontWeight: 600 }}>{label}</span>
            <span style={{ color: 'var(--gray-800, #1f2937)', fontWeight: 700, textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
          </div>
        ))}

        {/* Transaction ID block */}
        <div style={{ marginTop: 12, background: 'var(--gray-50, #f9fafb)', border: '1px solid var(--gray-100, #f3f4f6)', borderRadius: 10, padding: '10px 12px' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--gray-400, #9ca3af)', letterSpacing: 1 }}>TRANSACTION ID</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <p style={{ margin: 0, fontSize: 11, fontFamily: 'monospace', color: 'var(--gray-800, #1f2937)', wordBreak: 'break-all' }}>{tx.id}</p>
            <button onClick={() => copy(tx.id)} style={{ flexShrink: 0, border: '1px solid var(--gray-200, #e5e7eb)', background: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Copy</button>
          </div>
          {tx.vtpass_ref && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <p style={{ margin: 0, fontSize: 11, fontFamily: 'monospace', color: 'var(--gray-500, #6b7280)', wordBreak: 'break-all' }}>{tx.vtpass_ref}</p>
              <button onClick={() => copy(tx.vtpass_ref)} style={{ flexShrink: 0, border: '1px solid var(--gray-200, #e5e7eb)', background: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Copy</button>
            </div>
          )}
        </div>

        {/* WhatsApp share */}
        <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer"
          style={{ display: 'block', textAlign: 'center', background: '#25D366', color: '#fff', borderRadius: 12, padding: 13, fontWeight: 800, fontSize: 14, textDecoration: 'none', marginTop: 16 }}>
          Share Receipt on WhatsApp
        </a>
      </div>
    </div>
  );
}