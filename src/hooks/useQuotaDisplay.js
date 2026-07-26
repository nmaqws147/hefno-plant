import { useFeatureAccess } from './useFeatureAccess';

const LABELS = {
  ai_chatbot: { name: 'المساعد الذكي', unit: 'رسالة', period: 'اليوم' },
  knowledge_base: { name: 'قاعدة المعرفة', unit: 'بحث', period: 'الأسبوع' },
  disease_diagnosis: { name: 'تشخيص الأمراض', unit: 'تشخيص', period: 'الأسبوع' },
};

export function useQuotaDisplay(featureId) {
  const { allowed, remaining, limit, loading, error, refresh } = useFeatureAccess(featureId);
  const label = LABELS[featureId] || { name: featureId, unit: 'استخدام', period: '' };

  return {
    allowed,
    remaining,
    limit,
    loading,
    error,
    refresh,
    label,
    exhausted: !loading && !allowed && remaining === 0,
    percent: limit > 0 ? Math.round((remaining / limit) * 100) : 0,
  };
}
