import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const FEATURE_NAMES = {
  ai_chatbot: { name: 'المساعد الذكي', unit: 'رسالة' },
  knowledge_base: { name: 'قاعدة المعرفة', unit: 'بحث' },
  disease_diagnosis: { name: 'تشخيص الأمراض', unit: 'تشخيص' },
};

export function usePackageQuota(featureId) {
  const { subscription, isPremium, isElite } = useAuth();

  return useMemo(() => {
    if (isElite) {
      return {
        total: Infinity,
        remaining: Infinity,
        used: 0,
        label: 'غير محدود',
        isUnlimited: true,
        isElite: true,
        featureName: FEATURE_NAMES[featureId]?.name || featureId,
      };
    }

    if (!isPremium || !subscription?.packageQuotas) {
      return null;
    }

    const quota = subscription.packageQuotas[featureId];
    if (!quota) return null;

    const remaining = quota.remaining;
    const total = quota.total;
    const info = FEATURE_NAMES[featureId] || { name: featureId, unit: 'استخدام' };

    return {
      total,
      remaining,
      used: total - remaining,
      label: `${remaining} / ${total}`,
      isUnlimited: false,
      isElite: false,
      featureName: info.name,
      unit: info.unit,
    };
  }, [subscription, isPremium, isElite, featureId]);
}
