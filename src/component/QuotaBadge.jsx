import { useAuth } from '../context/AuthContext';
import { useQuotaDisplay } from '../hooks/useQuotaDisplay';

export default function QuotaBadge({ featureId, onExhausted }) {
  const { isElite } = useAuth();
  const { allowed, remaining, limit, loading, label, exhausted, displayText, isUnlimited } = useQuotaDisplay(featureId);

  if (loading) return null;

  if (isElite || isUnlimited) {
    return (
      <div
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
          background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe',
        }}
      >
        <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        غير محدود
      </div>
    );
  }

  if (exhausted) {
    return (
      <div
        onClick={() => onExhausted?.()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: '#fef2f2', color: '#dc2626', cursor: 'pointer', border: '1px solid #fca5a5',
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
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
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
