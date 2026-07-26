import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { X, Bot, BookOpen, ScanSearch, Sparkles, Crown } from 'lucide-react';

const FEATURE_INFO = {
  ai_chatbot: { name: 'المساعد الذكي', unit: 'رسالة', period: 'يومي' },
  knowledge_base: { name: 'قاعدة المعرفة', unit: 'استخدام', period: 'أسبوعي' },
  disease_diagnosis: { name: 'تشخيص الأمراض', unit: 'تشخيص', period: 'أسبوعي' },
};

const FEATURE_ICONS = {
  ai_chatbot: Bot,
  knowledge_base: BookOpen,
  disease_diagnosis: ScanSearch,
};

function QuotaProgress({ used, total }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden" dir="ltr">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function QuotaCard({ featureId, used, total, remaining }) {
  const info = FEATURE_INFO[featureId];
  if (!info) return null;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  return (
    <div className="bg-zinc-800/50 rounded-2xl border border-zinc-700/50 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-100">{info.name}</span>
        <span className="text-sm text-zinc-400">
          {used} / {total} {info.unit}
        </span>
      </div>
      <QuotaProgress used={used} total={total} />
      <div className="flex items-center justify-between text-xs">
        <span className={remaining > 0 ? 'text-emerald-400' : 'text-red-400'}>
          {remaining > 0 ? `متبقي ${remaining} ${info.unit}` : 'تم الاستنفاد'}
        </span>
        <span className="text-zinc-500">{pct}%</span>
      </div>
    </div>
  );
}

function ActionButtons({ user, isPremium, onClose, navigate }) {
  if (!user) {
    return (
      <div className="space-y-3 mt-6">
        <button
          onClick={() => { window.location.href = '/login'; }}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          تسجيل الدخول
        </button>
        <button
          onClick={() => { window.location.href = '/SignUpPage'; }}
          className="w-full h-12 rounded-xl border border-zinc-700 text-zinc-300 font-medium text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-zinc-500/50"
        >
          إنشاء حساب جديد
        </button>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="space-y-3 mt-6">
        <button
          onClick={() => navigate('/pricing')}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold text-sm hover:from-violet-400 hover:to-purple-500 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        >
          الانتقال إلى Elite
        </button>
        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl border border-zinc-700 text-zinc-300 font-medium text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-zinc-500/50"
        >
          لاحقاً
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-6">
      <button
        onClick={() => navigate('/pricing')}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        ترقية الباقة
      </button>
      <button
        onClick={onClose}
        className="w-full h-12 rounded-xl border border-zinc-700 text-zinc-300 font-medium text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-zinc-500/50"
      >
        حسناً
      </button>
    </div>
  );
}

export default function QuotaLimitModal({ open, onClose, featureId }) {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const { remaining, limit } = useFeatureAccess(featureId || '__none__');
  const primaryRef = useRef(null);

  const total = Number.isFinite(limit) && limit > 0 ? limit : 5;
  const used = Number.isFinite(remaining) ? Math.max(0, total - remaining) : 0;

  const IconComponent = (featureId && FEATURE_ICONS[featureId]) || Sparkles;
  const info = FEATURE_INFO[featureId];

  let title = 'تم استنفاد الحصة';
  let description = info
    ? `لقد استنفدت حصتك ${info.period === 'يومي' ? 'اليومية' : 'الأسبوعية'} من ${info.name}. قم بالترقية للاستمرار.`
    : 'لقد استنفدت حصتك الحالية. قم بالترقية للاستمرار.';
  let iconBg = 'from-emerald-500/20 to-emerald-600/10';

  if (!user) {
    title = 'تم استنفاد الحصة المجانية';
    description = 'لقد استنفدت حصتك المجانية. سجل دخول أو أنشئ حساباً للاستمرار.';
  } else if (isPremium) {
    title = 'تم استنفاد باقة الاشتراك';
    description = 'لقد استهلكت كل حصتك الشهرية. انتقل إلى الباقة الفريدة للاستخدام غير المحدود.';
    iconBg = 'from-violet-500/20 to-purple-600/10';
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => primaryRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
    document.body.style.overflow = '';
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quota-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-8 animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500/50"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${iconBg} flex items-center justify-center ring-1 ring-emerald-500/20`}>
          <IconComponent className="w-7 h-7 text-emerald-400" />
        </div>

        <h2
          id="quota-modal-title"
          className="text-xl font-bold text-white text-center mt-4"
        >
          {title}
        </h2>

        <p className="text-sm text-zinc-400 text-center mt-2 leading-relaxed">
          {description}
        </p>

        {featureId && (
          <div className="mt-6">
            <QuotaCard featureId={featureId} used={used} total={total} remaining={remaining} />
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 text-center leading-relaxed">
            الباقة المميزة تمنحك 100 رسالة / 70 بحث / 2 تشخيص شهرياً. الباقة الفريدة غير محدودة.
          </p>
        </div>

        <ActionButtons
          user={user}
          isPremium={isPremium}
          onClose={onClose}
          navigate={navigate}
        />

        <button ref={primaryRef} className="sr-only" aria-hidden="true" />
      </div>
    </div>
  );
}
