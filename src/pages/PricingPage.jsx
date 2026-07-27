import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createCheckoutSession, initiateVodafoneCash } from '../services/subscriptionService';
import { toast } from 'sonner';
import {
  Leaf, Sparkles, Crown, Check, Minus, CreditCard, Smartphone,
  ShieldCheck, RefreshCw, Headphones, ChevronDown, ChevronLeft,
  Bot, BookOpen, ScanSearch, Cloud, Newspaper, Zap,
} from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'ابدأ مع الميزات الأساسية',
    icon: Leaf,
    features: [
      { name: 'المساعد الذكي', limit: '5/اليوم', included: true },
      { name: 'قاعدة المعرفة', limit: '5/الأسبوع', included: true },
      { name: 'تشخيص الأمراض', limit: '1/الأسبوع', included: true },
      { name: 'الطقس', included: true, unlimited: true },
      { name: 'المقالات', included: true, unlimited: true },
      { name: 'دعم ذو أولوية', included: false },
    ],
    cta: 'ابدأ مجاناً',
    popular: false,
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 80,
    yearlyPrice: 800,
    description: 'الوصول الكامل غير المحدود لجميع الميزات',
    icon: Crown,
    features: [
      { name: 'المساعد الذكي', included: true, unlimited: true },
      { name: 'قاعدة المعرفة', included: true, unlimited: true },
      { name: 'تشخيص الأمراض', included: true, unlimited: true },
      { name: 'الطقس', included: true, unlimited: true },
      { name: 'المقالات', included: true, unlimited: true },
      { name: 'دعم ذو أولوية', included: true },
      { name: 'جميع الميزات المستقبلية', included: true },
    ],
    cta: 'اشترك في Elite',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 50,
    yearlyPrice: 500,
    description: 'الميزات المتقدمة للمزارعين المحترفين',
    icon: Sparkles,
    features: [
      { name: 'المساعد الذكي', limit: '100/شهر', included: true },
      { name: 'قاعدة المعرفة', limit: '70/شهر', included: true },
      { name: 'تشخيص الأمراض', limit: '2/شهر', included: true },
      { name: 'الطقس', included: true, unlimited: true },
      { name: 'المقالات', included: true, unlimited: true },
      { name: 'دعم ذو أولوية', included: true },
    ],
    cta: 'اشترك في Premium',
    popular: false,
  },
];

const FAQS = [
  { q: 'هل يمكنني الإلغاء في أي وقت؟', a: 'نعم، يمكنك إلغاء اشتراكك في أي وقت. ستظل الميزات المدفوعة متاحة حتى نهاية فترة الفوترة دون أي رسوم إضافية.' },
  { q: 'هل يمكنني الترقية لاحقاً؟', a: 'بالتأكيد. يمكنك الترقية من أي باقة في أي وقت. سيتم تطبيق الفرق بشكل تناسبي على باقي فترة الفوترة.' },
  { q: 'ما هي طرق الدفع المتاحة؟', a: 'ندعم الدفع عبر بطاقات الائتمان (فيزا، ماستركارد) عبر Stripe، وكذلك فودافون كاش للعملاء في مصر.' },
  { q: 'هل مدفوعاتي آمنة؟', a: 'جميع المدفوعات مشفرة ومحمية بواسطة Stripe، أحد أشهر مزودي خدمات الدفع الرقمي في العالم والمعتمد عالمياً.' },

];

const PAYMENT_METHODS = [
  { id: 'stripe', name: 'بطاقة ائتمان', icon: CreditCard },
  { id: 'vodafone_cash', name: 'فودافون كاش', icon: Smartphone },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'مدفوعات آمنة', desc: 'مشفرة بالكامل عبر Stripe' },
  { icon: CreditCard, title: 'بوابات دفع عالمية', desc: 'فيزا، ماستركارد، فودافون كاش' },
  { icon: RefreshCw, title: 'إلغاء في أي وقت', desc: 'بدون رسوم إضافية' },
  { icon: Headphones, title: 'دعم فني', desc: 'فريق متخصص لمساعدتك' },
];

const FEATURE_ICONS = { ai_chatbot: Bot, knowledge_base: BookOpen, disease_diagnosis: ScanSearch, weather: Cloud, articles: Newspaper };

function HeroSection() {
  return (
    <div className="relative text-center px-4 pt-20 pb-12 lg:pt-28 lg:pb-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/5 dark:bg-emerald-400/3 rounded-full blur-[150px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" />
          خطط بأسعار تنافسية
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.55] max-w-3xl mx-auto">
          اختر باقتك المثالية{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300">
            لرحلة زراعية ذكية
          </span>
        </h1>
        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          جميع الباقات تشمل الميزات الأساسية. اختر ما يناسب احتياجاتك وابدأ رحلتك مع HefnoPlant.
        </p>
      </motion.div>
    </div>
  );
}

function BillingToggle({ billingCycle, setBillingCycle }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      <div className="inline-flex bg-zinc-100 dark:bg-zinc-800/80 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700/50">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            billingCycle === 'monthly'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          شهري
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            billingCycle === 'yearly'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          سنوي
        </button>
      </div>
      {billingCycle === 'yearly' && (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold"
        >
          وفر 17%
        </motion.span>
      )}
    </div>
  );
}

function FeatureItem({ feature }) {
  const isIncluded = feature.included;
  const isUnlimited = feature.unlimited;
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
        isIncluded ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-zinc-100 dark:bg-zinc-800'
      }`}>
        {isIncluded ? (
          <Check className={`w-3 h-3 ${isUnlimited ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
        ) : (
          <Minus className="w-3 h-3 text-zinc-300 dark:text-zinc-600" />
        )}
      </div>
      <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{feature.name}</span>
      <span className={`text-xs font-medium shrink-0 ${
        !isIncluded ? 'text-zinc-300 dark:text-zinc-600' :
        isUnlimited ? 'text-emerald-600 dark:text-emerald-400' :
        'text-zinc-500 dark:text-zinc-400'
      }`}>
        {!isIncluded ? '—' : isUnlimited ? 'غير محدود' : feature.limit}
      </span>
    </div>
  );
}

function MostPopularBadge() {
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
      <div className="px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 whitespace-nowrap">
        الأكثر طلباً
      </div>
    </div>
  );
}

function PricingCard({ plan, index, billingCycle, getPlanPrice, isCurrentPlan, handleSubscribe, loading }) {
  const price = getPlanPrice(plan);
  const isPopular = plan.popular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
      className={`relative flex flex-col ${
        isPopular
          ? 'md:scale-105 md:-translate-y-2 z-10'
          : 'z-0'
      }`}
    >
      <div className={`relative flex flex-col h-full rounded-2xl border p-6 lg:p-8 bg-white dark:bg-zinc-900 transition-shadow duration-300 ${
        isPopular
          ? 'border-emerald-400/50 dark:border-emerald-500/30 shadow-[0_0_40px_-12px_rgba(5,150,105,0.25)] dark:shadow-[0_0_60px_-20px_rgba(5,150,105,0.15)]'
          : 'border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md'
      }`}>
        {isPopular && <MostPopularBadge />}

        <div className="mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            isPopular
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
              : plan.id === 'premium'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
          }`}>
            <plan.icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{plan.name}</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{plan.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-zinc-900 dark:text-white">
              {plan.id === 'free' ? '0' : price}
            </span>
            {plan.id !== 'free' && (
              <span className="text-sm text-zinc-400 dark:text-zinc-500">
                ج/{billingCycle === 'monthly' ? 'شهر' : 'سنة'}
              </span>
            )}
          </div>
          {plan.id !== 'free' && billingCycle === 'yearly' && (
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                  {Math.round((1 - price / (plan.monthlyPrice * 12)) * 100)}% توفير مقارنة بالشهري
            </p>
          )}
        </div>

        <div className="flex-1 border-t border-zinc-100 dark:border-zinc-800 pt-4 mb-6">
          {plan.features.map((feat, i) => (
            <FeatureItem key={i} feature={feat} />
          ))}
        </div>

        <button
          onClick={() => handleSubscribe(plan.id)}
          disabled={isCurrentPlan || loading === plan.id}
          className={`w-full h-12 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 ${
            isCurrentPlan
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-default'
              : isPopular
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/30 hover:from-emerald-400 hover:to-emerald-500 focus:ring-emerald-500'
                : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 focus:ring-zinc-900 dark:focus:ring-white'
          } ${loading === plan.id ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
        >
          {loading === plan.id ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              جاري التحميل...
            </span>
          ) : isCurrentPlan ? (
            'خطتك الحالية'
          ) : (
            plan.cta
          )}
        </button>
      </div>
    </motion.div>
  );
}

function PaymentSelector({ paymentMethod, setPaymentMethod }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="flex flex-col items-center gap-4 mt-10"
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400">طريقة الدفع:</p>
      <div className="flex items-center gap-3">
        {PAYMENT_METHODS.map((pm) => {
          const selected = paymentMethod === pm.id;
          return (
            <button
              key={pm.id}
              onClick={() => setPaymentMethod(pm.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                selected
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <pm.icon className="w-4 h-4" />
              {pm.name}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function TrustSection() {
  return (
    <div className="max-w-4xl mx-auto px-4 mt-20 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        {TRUST_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            className="flex flex-col items-center text-center p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
              <item.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{item.title}</h4>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="max-w-2xl mx-auto px-4 mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-2">
          الأسئلة الشائعة
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8">
          إجابات على أكثر الأسئلة شيوعاً حول الباقات والاشتراكات
        </p>
        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-right"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 mr-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function FinalCTA() {
  const navigate = useNavigate();
  return (
    <div className="relative px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative px-8 py-14 lg:px-16 lg:py-20 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
            مستعد لتطوير مزرعتك؟
          </h2>
          <p className="text-emerald-100/80 text-base lg:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            انضم إلى HefnoPlant اليوم وابدأ رحلتك نحو زراعة أكثر ذكاءً وإنتاجية
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-white text-emerald-700 font-bold text-sm shadow-xl shadow-black/10 hover:bg-emerald-50 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            ابدأ الآن مجاناً
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PricingPage() {
  const { user, isPremium, isElite, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('تم تفعيل الاشتراك بنجاح!');
      refreshSubscription?.();
    }
    if (searchParams.get('canceled') === 'true') {
      toast.error('تم إلغاء عملية الدفع');
    }
  }, [searchParams, refreshSubscription]);

  const handleSubscribe = async (planId) => {
    if (!user) return navigate('/login?redirect=/pricing');
    if (planId === 'free') return;
    if ((planId === 'premium' && isPremium) || (planId === 'elite' && isElite)) {
      toast.info('أنت مشترك بالفعل في هذه الباقة');
      return;
    }
    setLoading(planId);
    try {
      if (paymentMethod === 'stripe') {
        const { sessionUrl } = await createCheckoutSession(planId, billingCycle);
        window.location.href = sessionUrl;
      } else {
        const result = await initiateVodafoneCash(planId, billingCycle);
        toast.success(`تم إنشاء طلب الدفع: ${result.paymentReference}`);
        alert(result.instructions);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const getPlanPrice = (plan) => {
    if (plan.id === 'free') return 0;
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const isCurrentPlanFn = (planId) => {
    if (planId === 'elite' && isElite) return true;
    if (planId === 'premium' && isPremium) return true;
    if (planId === 'free' && !isPremium && !isElite) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-200">
      <HeroSection />
      <BillingToggle billingCycle={billingCycle} setBillingCycle={setBillingCycle} />

      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {PLANS.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              index={index}
              billingCycle={billingCycle}
              getPlanPrice={getPlanPrice}
              isCurrentPlan={isCurrentPlanFn(plan.id)}
              handleSubscribe={handleSubscribe}
              loading={loading}
            />
          ))}
        </div>

        <PaymentSelector paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
      </div>

      <TrustSection />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}
