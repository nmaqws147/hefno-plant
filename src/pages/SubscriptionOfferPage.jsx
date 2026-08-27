import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { PLAN_PRICES } from '../constants/pricing';
import {
  Crown, Sparkles, Check, Leaf, Bot, BookOpen, ScanSearch,
  Cloud, Newspaper, ShieldCheck, Zap, ChevronLeft,
} from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'ابدأ مع الميزات الأساسية',
    icon: Leaf,
    color: 'white',
    features: [
      { name: 'المساعد الذكي', limit: '5/اليوم', included: true },
      { name: 'قاعدة المعرفة', limit: '5/الأسبوع', included: true },
      { name: 'تشخيص الأمراض', limit: '1/الأسبوع', included: true },
      { name: 'الطقس', included: true, unlimited: true },
      { name: 'المقالات', included: true, unlimited: true },
      { name: 'دعم ذو أولوية', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: PLAN_PRICES.premium.monthly,
    yearlyPrice: PLAN_PRICES.premium.yearly,
    description: 'الميزات المتقدمة للمزارعين المحترفين',
    icon: Sparkles,
    color: 'gold',
    popular: false,
    features: [
      { name: 'المساعد الذكي', limit: '100/شهر', included: true },
      { name: 'قاعدة المعرفة', limit: '70/شهر', included: true },
      { name: 'تشخيص الأمراض', limit: '14/شهر', included: true },
      { name: 'الطقس', included: true, unlimited: true },
      { name: 'المقالات', included: true, unlimited: true },
      { name: 'دعم ذو أولوية', included: true },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: PLAN_PRICES.elite.monthly,
    yearlyPrice: PLAN_PRICES.elite.yearly,
    description: 'الوصول الكامل غير المحدود لجميع الميزات',
    icon: Crown,
    color: 'emerald',
    popular: true,
    features: [
      { name: 'المساعد الذكي', included: true, unlimited: true },
      { name: 'قاعدة المعرفة', included: true, unlimited: true },
      { name: 'تشخيص الأمراض', included: true, unlimited: true },
      { name: 'الطقس', included: true, unlimited: true },
      { name: 'المقالات', included: true, unlimited: true },
      { name: 'دعم ذو أولوية', included: true },
      { name: 'جميع الميزات المستقبلية', included: true },
    ],
  },
];

function FeatureItem({ feature }) {
  const isIncluded = feature.included;
  const isUnlimited = feature.unlimited;
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
        isIncluded ? 'bg-gold/10' : 'bg-white/5'
      }`}>
        {isIncluded ? (
          <Check className="w-3 h-3 text-gold" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
        )}
      </div>
      <span className="flex-1 text-sm text-white/70">{feature.name}</span>
      <span className={`text-xs font-medium shrink-0 ${
        !isIncluded ? 'text-white/20' :
        isUnlimited ? 'text-gold' :
        'text-white/40'
      }`}>
        {!isIncluded ? '—' : isUnlimited ? 'غير محدود' : feature.limit}
      </span>
    </div>
  );
}

export default function SubscriptionOfferPage() {
  const { user, userProfile, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile?.onboardingCompleted) {
      navigate('/', { replace: true });
    }
  }, [userProfile, navigate]);

  const handleSkip = async () => {
    setLoading(true);
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (_) {}
    navigate('/');
  };

  const handleSubscribe = async (planId) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
        });
      } catch (_) {}
    }
    navigate('/pricing');
  };

  if (userProfile?.onboardingCompleted) return null;

  return (
    <div className="min-h-screen bg-luxury-black">
      <div className="relative text-center px-4 pt-16 pb-8 lg:pt-24 lg:pb-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold mb-6 tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5" />
            مرحباً بك في HefnoPlant
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight leading-[1.55] max-w-4xl mx-auto">
            <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">اختر باقتك </span>
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">المثالية</span>
          </h1>
          <p className="mt-4 text-white/40 text-base lg:text-lg max-w-xl mx-auto">
            ابدأ مجاناً أو احصل على وصول غير محدود لجميع الميزات
          </p>
          <div className="mt-6 mx-auto w-24 h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
              className={`relative flex flex-col ${
                plan.popular ? 'md:scale-105 md:-translate-y-2 z-10' : 'z-0'
              }`}
            >
              <div className={`relative flex flex-col h-full rounded-2xl border p-6 lg:p-8 transition-all duration-500 ${
                plan.popular
                  ? 'bg-gradient-to-b from-luxury-card to-luxury-black border-gold/30 shadow-[0_0_60px_-15px_rgba(212,168,67,0.2)]'
                  : 'bg-luxury-card border-white/[0.06] hover:border-gold/15'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <div className="px-5 py-1.5 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light text-luxury-black text-xs font-bold shadow-[0_0_30px_-5px_rgba(212,168,67,0.4)] whitespace-nowrap tracking-wider">
                      الأكثر طلباً
                    </div>
                  </div>
                )}

                {plan.popular && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/5 rounded-full blur-[60px]" />
                  </div>
                )}

                <div className="relative mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    plan.popular ? 'bg-gold/10 text-gold' :
                    plan.id === 'premium' ? 'bg-gold/5 text-gold/70' :
                    'bg-white/5 text-white/30'
                  }`}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-xl font-serif font-bold ${plan.popular ? 'text-gold' : 'text-white'}`}>{plan.name}</h3>
                  <p className="mt-1 text-sm text-white/40">{plan.description}</p>
                </div>

                <div className="relative mb-6">
                  {plan.id === 'free' ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-serif font-bold text-white">0</span>
                      <span className="text-sm text-white/30">ج.م</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-serif font-bold ${plan.popular ? 'text-gold' : 'text-white'}`}>
                        {plan.monthlyPrice}
                      </span>
                      <span className="text-sm text-white/30">ج/شهر</span>
                    </div>
                  )}
                </div>

                <div className="relative flex-1 border-t border-white/[0.06] pt-4 mb-6">
                  {plan.features.map((feat, i) => (
                    <FeatureItem key={i} feature={feat} />
                  ))}
                </div>

                <button
                  onClick={() => plan.id === 'free' ? handleSkip() : handleSubscribe(plan.id)}
                  disabled={loading}
                  className={`relative w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-luxury-black shadow-[0_0_30px_-5px_rgba(212,168,67,0.3)] hover:shadow-[0_0_40px_-5px_rgba(212,168,67,0.4)]'
                      : plan.id === 'premium'
                        ? 'bg-white/[0.06] text-white border border-white/[0.1] hover:bg-white/[0.1] hover:border-gold/20 hover:text-gold'
                        : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/70'
                  }`}
                >
                  {plan.id === 'free' ? 'متابعة مجاناً' : `اشترك في ${plan.name}`}
                </button>

                {plan.id !== 'free' && (
                  <div className="mt-3 text-center">
                    <p className="text-[11px] text-white/25">ادفع عبر فودافون كاش</p>
                    <p className="text-xs text-gold/60 font-mono" dir="ltr">01004653117</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center pb-16">
        <button
          onClick={handleSkip}
          className="text-sm text-white/30 hover:text-white/50 transition-colors inline-flex items-center gap-1"
        >
          تخطي والمتابعة مجاناً
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
