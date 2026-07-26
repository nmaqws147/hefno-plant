import { useQuotaDisplay } from '../hooks/useQuotaDisplay';

export default function QuotaBadge({ featureId, onExhausted }) {
  const { allowed, remaining, limit, loading, label, exhausted } = useQuotaDisplay(featureId);

  if (loading) return null;

  if (exhausted) {
    return (
      <div
        onClick={() => onExhausted?.()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          background: '#fef2f2',
          color: '#dc2626',
          cursor: 'pointer',
          border: '1px solid #fca5a5',
        }}
      >
        <span style={{ fontSize: 14 }}>0</span>
        <span>/</span>
        <span>{limit}</span>
        <span style={{ marginRight: 2 }}>{label.unit}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        background: remaining <= Math.ceil(limit * 0.2) ? '#fffbeb' : '#f0fdf4',
        color: remaining <= Math.ceil(limit * 0.2) ? '#b45309' : '#16a34a',
        border: `1px solid ${remaining <= Math.ceil(limit * 0.2) ? '#fde68a' : '#bbf7d0'}`,
      }}
    >
      <span>{remaining}</span>
      <span>/</span>
      <span>{limit}</span>
      <span style={{ marginRight: 2 }}>{label.unit}</span>
    </div>
  );
}
