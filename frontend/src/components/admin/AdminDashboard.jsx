export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '8px' }}>
        Dashboard
      </h1>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '40px',
        border: '1px dashed #CBD5E1', textAlign: 'center', marginTop: '16px',
      }}>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
          Stats and the daily profit chart land here in Phase 4c.
        </p>
      </div>
    </div>
  );
}
