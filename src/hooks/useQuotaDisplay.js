import { useAuth } from '../context/AuthContext';
import { useFeatureAccess } from './useFeatureAccess';

const LABELS = {
  ai_chatbot: { name: 'المساعد الذكي', unit: 'رسالة', period: 'اليوم' },
  knowledge_base: { name: 'قاعدة المعرفة', unit: 'بحث', period: 'الأسبوع' },
  disease_diagnosis: { name: 'تشخيص الأمراض', unit: 'تشخيص', period: 'الأسبوع' },
};

export function useQuotaDisplay(featureId) {
  const { isElite } = useAuth();
  const { allowed, remaining, limit, loading, error, refresh } = useFeatureAccess(featureId);
  const label = LABELS[featureId] || { name: featureId, unit: 'استخدام', period: '' };

  if (isElite || remaining === Infinity) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      loading: false,
      error: null,
      refresh,
      label,
      exhausted: false,
      percent: 100,
      displayText: 'غير محدود',
      isUnlimited: true,
    };
  }

  const exhausted = !loading && !allowed && remaining === 0;

  let displayText;
  if (limit > 0) {
    displayText = `${remaining} / ${limit} ${label.unit}`;
  } else {
    displayText = `${limit} ${label.unit}`;
  }

  return {
    allowed,
    remaining,
    limit,
    loading,
    error,
    refresh,
    label,
    exhausted,
    percent: limit > 0 ? Math.round((remaining / limit) * 100) : 0,
    displayText,
    isUnlimited: false,
  };
}
