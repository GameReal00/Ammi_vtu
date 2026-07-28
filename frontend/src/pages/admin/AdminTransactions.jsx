export default function AdminTransactions() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '8px' }}>
        Transactions
      </h1>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '40px',
        border: '1px dashed #CBD5E1', textAlign: 'center', marginTop: '16px',
      }}>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
          Filterable table of every transaction, all users - Phase 4e.
        </p>
      </div>
    </div>
  );
}
