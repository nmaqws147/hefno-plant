import { usePackageQuota } from '../hooks/usePackageQuota';

export default function PackageQuotaDisplay({ featureId, onUpgrade }) {
  const quota = usePackageQuota(featureId);

  if (!quota) return null;

  if (quota.isElite || quota.isUnlimited) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 8,
        background: '#f5f3ff', color: '#7c3aed',
        fontSize: 12, fontWeight: 500,
      }}>
        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {quota.featureName}: غير محدود
      </div>
    );
  }

  const percent = quota.total > 0 ? Math.round((quota.remaining / quota.total) * 100) : 0;
  const isLow = percent <= 20;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 8,
      background: '#fff', color: '#374151',
      border: '1px solid #e5e7eb', fontSize: 12,
    }}>
      <span style={{ color: '#6b7280' }}>{quota.featureName}:</span>
      <span style={{ fontWeight: 600, color: isLow ? '#dc2626' : '#111827' }}>
        {quota.remaining} / {quota.total}
      </span>
      {isLow && onUpgrade && (
        <button
          onClick={onUpgrade}
          style={{
            padding: '2px 8px', borderRadius: 4,
            background: '#fef2f2', color: '#dc2626',
            border: 'none', fontSize: 10, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ترقية
        </button>
      )}
    </div>
  );
}
