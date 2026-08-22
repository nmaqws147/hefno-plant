import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { initiateVodafoneCash, confirmVodafoneCash } from '../services/subscriptionService';
import { PLAN_PRICES, BILLING_CYCLE_LABELS } from '../constants/pricing';
import { toast } from 'sonner';
import {
  Leaf, Sparkles, Crown, Check, Minus, CreditCard, Smartphone, Copy,
  ShieldCheck, RefreshCw, Headphones, ChevronDown, ChevronLeft,
  Bot, BookOpen, ScanSearch, Cloud, Newspaper, Zap, X,
} from 'lucide-react';

function getDeviceType() {
  const ua = navigator.userAgent || '';
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  return 'desktop';
}

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
    monthlyPrice: PLAN_PRICES.elite.monthly,
    yearlyPrice: PLAN_PRICES.elite.yearly,
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
    monthlyPrice: PLAN_PRICES.premium.monthly,
    yearlyPrice: PLAN_PRICES.premium.yearly,
    description: 'الميزات المتقدمة للمزارعين المحترفين',
    icon: Sparkles,
    features: [
      { name: 'المساعد الذكي', limit: '100/شهر', included: true },
      { name: 'قاعدة المعرفة', limit: '70/شهر', included: true },
      { name: 'تشخيص الأمراض', limit: '14/شهر', included: true },
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
  { q: 'ما هي طرق الدفع المتاحة؟', a: 'الدفع عبر فودافون كاش. حوّل المبلغ إلى رقم فودافون كاش المخصص ثم قم بتأكيد الدفع، وسيتم تفعيل اشتراكك بعد التحقق.' },
  { q: 'هل مدفوعاتي آمنة؟', a: 'نعم. يتم التحقق من كل عملية دفع يدوياً قبل تفعيل الاشتراك، وبياناتك محمية بالكامل.' },

];

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'دفع آمن', desc: 'تحقق يدوي قبل تفعيل الاشتراك' },
  { icon: CreditCard, title: 'فودافون كاش', desc: 'حوّل بسهولة من تطبيق فودافون كاش' },
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
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-[1.55] max-w-3xl mx-auto">
          <span>اختر باقتك المثالية</span>
        </h1>
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
          {BILLING_CYCLE_LABELS.monthly}
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            billingCycle === 'yearly'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          {BILLING_CYCLE_LABELS.yearly}
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
  const savingsPct = billingCycle === 'yearly'
    ? Math.round((1 - price / (plan.monthlyPrice * 12)) * 100)
    : 0;

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
              فاتورة سنوية — توفير {savingsPct}% مقارنة بالدفع الشهري
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

function VodafoneCashModal({ open, plan, billingCycle, onClose, onActivated }) {
  const [step, setStep] = useState('pay');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deviceType] = useState(() => getDeviceType());

  useEffect(() => {
    if (open) {
      setStep('pay');
      setReference('');
      setLoading(false);
      setInfo(null);
      setCopied(false);
    }
  }, [open]);

  if (!open) return null;

  const amount = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

  const ussdCode = info?.phoneNumber ? `*9*7*${info.phoneNumber}*${amount}#` : '';
  const ussdTelLink = info?.phoneNumber ? `tel:*9*7*${info.phoneNumber}*${amount}%23` : '';

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(info?.phoneNumber || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const data = await initiateVodafoneCash(plan.id, billingCycle);
      setInfo(data);
      setStep('confirm');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmVodafoneCash(plan.id, billingCycle, reference);
      toast.success('تم استلام طلبك! بانتظار تأكيد الإدارة');
      onActivated?.();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">الدفع عبر فودافون كاش</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{plan.name} — {BILLING_CYCLE_LABELS[billingCycle]}</p>
          </div>
        </div>

        {step === 'pay' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 p-4">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">المبلغ المطلوب</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{amount} ج.م</p>
            </div>
            <div className="space-y-2.5">
              {[
                { n: '1', t: deviceType === 'android' ? 'اضغط "اتصل الآن" — سيفتح الاتصال بالكود جاهزًا' : 'افتح تطبيق فودافون كاش أو اطلب الكود من الهاتف' },
                { n: '2', t: 'أدخل الرقم السري (PIN) لتأكيد التحويل' },
                { n: '3', t: 'ارجع و اضغط "أرسلت المبلغ" لإتمام الطلب' },
              ].map((s) => (
                <div key={s.n} className="flex items-center gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">{s.n}</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{s.t}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'جاري التحميل...' : 'المتابعة لإتمام الدفع'}
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 p-4">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">حوّل المبلغ إلى رقم فودافون كاش</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300" dir="ltr">{info?.phoneNumber}</p>
                <button
                  onClick={copyNumber}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'تم النسخ' : 'نسخ'}
                </button>
              </div>
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                المبلغ: {amount} ج.م — باقة {plan.name} {BILLING_CYCLE_LABELS[billingCycle]}
              </p>
            </div>

            {deviceType === 'android' && ussdTelLink && (
              <a
                href={ussdTelLink}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] transition-all"
              >
                <Smartphone className="w-4 h-4" />
                اتصل الآن لإتمام التحويل
              </a>
            )}

            {(deviceType !== 'android' || !ussdTelLink) && (
              <div className="rounded-xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800 p-4">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">كود التحويل السريع</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-bold text-zinc-900 dark:text-white" dir="ltr">{ussdCode || 'جاري التحميل...'}</code>
                  <button
                    onClick={copyNumber}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-zinc-700 border border-emerald-200 dark:border-emerald-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-zinc-600"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  اطلب الكود من هاتفك، وأدخل الرقم السري لتأكيد التحويل
                </p>
              </div>
            )}

            <input
              type="text"
              dir="ltr"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="رقم العملية (اختياري)"
              className="w-full h-11 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'جاري التحميل...' : 'أرسلت المبلغ — أكد الآن'}
            </button>
            <button
              onClick={() => setStep('pay')}
              className="w-full text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              رجوع
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function PricingPage() {
  const { user, isPremium, isElite, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(null);
  const [vcModal, setVcModal] = useState(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('تم تفعيل الاشتراك بنجاح!');
      let attempt = 0;
      const poll = async () => {
        await refreshSubscription?.();
        attempt += 1;
        if (attempt < 5) setTimeout(poll, 2000);
      };
      poll();
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
    const plan = PLANS.find((p) => p.id === planId);
    setVcModal({ plan, billingCycle });
  };

  const handleVcActivated = async () => {
    await refreshSubscription?.();
  };

  const getPlanPrice = (plan) => {
    if (plan.id === 'free') return 0;
    return plan.id === 'premium' || plan.id === 'elite'
      ? (billingCycle === 'monthly' ? PLAN_PRICES[plan.id].monthly : PLAN_PRICES[plan.id].yearly)
      : (billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice);
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

      </div>

      <TrustSection />
      <FAQSection />
      <FinalCTA />

      {vcModal && (
        <VodafoneCashModal
          open={!!vcModal}
          plan={vcModal.plan}
          billingCycle={vcModal.billingCycle}
          onClose={() => setVcModal(null)}
          onActivated={handleVcActivated}
        />
      )}
    </div>
  );
}
