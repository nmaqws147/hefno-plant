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
  { q: 'هل يمكنني الترقية لاحقاً؟', a: 'بالتأكيد. يمكنك الترقية من أي باقة في أي وقت. سيتم تطبيق الفرق بشكل تناسقي على باقي فترة الفوترة.' },
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
    <div className="relative text-center px-4 pt-20 pb-8 lg:pt-28 lg:pb-10">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/3 rounded-full blur-[150px]" />
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
          خطط بأسعار تنافسية
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight leading-[1.55] max-w-4xl mx-auto">
          <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">اختر باقتك </span>
          <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">المثالية</span>
        </h1>
        <div className="mt-6 mx-auto w-24 h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      </motion.div>
    </div>
  );
}

function BillingToggle({ billingCycle, setBillingCycle }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-12">
      <div className="inline-flex bg-luxury-surface rounded-xl p-1 border border-gold/10">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            billingCycle === 'monthly'
              ? 'bg-gradient-to-r from-gold/20 to-gold/10 text-gold border border-gold/20 shadow-[0_0_20px_-5px_rgba(212,168,67,0.15)]'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          {BILLING_CYCLE_LABELS.monthly}
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            billingCycle === 'yearly'
              ? 'bg-gradient-to-r from-gold/20 to-gold/10 text-gold border border-gold/20 shadow-[0_0_20px_-5px_rgba(212,168,67,0.15)]'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          {BILLING_CYCLE_LABELS.yearly}
        </button>
      </div>
      {billingCycle === 'yearly' && (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold"
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
        isIncluded ? 'bg-gold/10' : 'bg-white/5'
      }`}>
        {isIncluded ? (
          <Check className="w-3 h-3 text-gold" />
        ) : (
          <Minus className="w-3 h-3 text-white/20" />
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

function MostPopularBadge() {
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
      <div className="px-5 py-1.5 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light text-luxury-black text-xs font-bold shadow-[0_0_30px_-5px_rgba(212,168,67,0.4)] whitespace-nowrap tracking-wider">
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
      <div className={`relative flex flex-col h-full rounded-2xl border p-6 lg:p-8 transition-all duration-500 ${
        isPopular
          ? 'bg-gradient-to-b from-luxury-card to-luxury-black border-gold/30 shadow-[0_0_60px_-15px_rgba(212,168,67,0.2)]'
          : 'bg-luxury-card border-white/[0.06] hover:border-gold/15 hover:shadow-[0_0_40px_-15px_rgba(212,168,67,0.1)]'
      }`}>
        {isPopular && <MostPopularBadge />}

        {isPopular && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/5 rounded-full blur-[60px]" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gold/5 rounded-full blur-[60px]" />
          </div>
        )}

        <div className="relative mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            isPopular
              ? 'bg-gold/10 text-gold'
              : plan.id === 'premium'
                ? 'bg-gold/5 text-gold/70'
                : 'bg-white/5 text-white/30'
          }`}>
            <plan.icon className="w-6 h-6" />
          </div>
          <h3 className={`text-xl font-serif font-bold ${isPopular ? 'text-gold' : 'text-white'}`}>{plan.name}</h3>
          <p className="mt-1 text-sm text-white/40">{plan.description}</p>
        </div>

        <div className="relative mb-6">
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-serif font-bold ${isPopular ? 'text-gold' : 'text-white'}`}>
              {plan.id === 'free' ? '0' : price}
            </span>
            {plan.id !== 'free' && (
              <span className="text-sm text-white/30">
                ج/{billingCycle === 'monthly' ? 'شهر' : 'سنة'}
              </span>
            )}
          </div>
          {plan.id !== 'free' && billingCycle === 'yearly' && (
            <p className="mt-1 text-xs text-gold/70">
              فاتورة سنوية — توفير {savingsPct}% مقارنة بالدفع الشهري
            </p>
          )}
        </div>

        <div className="relative flex-1 border-t border-white/[0.06] pt-4 mb-6">
          {plan.features.map((feat, i) => (
            <FeatureItem key={i} feature={feat} />
          ))}
        </div>

        <button
          onClick={() => handleSubscribe(plan.id)}
          disabled={isCurrentPlan || loading === plan.id}
          className={`relative w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-luxury-black ${
            isCurrentPlan
              ? 'bg-white/5 text-white/30 cursor-default border border-white/[0.06]'
              : isPopular
                ? 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-luxury-black shadow-[0_0_30px_-5px_rgba(212,168,67,0.3)] hover:shadow-[0_0_40px_-5px_rgba(212,168,67,0.4)] hover:from-gold hover:via-gold-light hover:to-gold focus:ring-gold'
                : 'bg-white/[0.06] text-white border border-white/[0.1] hover:bg-white/[0.1] hover:border-gold/20 hover:text-gold focus:ring-gold/50'
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
            className="flex flex-col items-center text-center p-5 rounded-2xl bg-luxury-card border border-gold/10 hover:border-gold/20 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3">
              <item.icon className="w-5 h-5 text-gold" />
            </div>
            <h4 className="text-sm font-bold text-white">{item.title}</h4>
            <p className="mt-1 text-xs text-white/40">{item.desc}</p>
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
        <h2 className="text-2xl font-serif font-bold text-center text-white mb-2">
          الأسئلة الشائعة
        </h2>
        <p className="text-sm text-white/40 text-center mb-8">
          إجابات على أكثر الأسئلة شيوعاً حول الباقات والاشتراكات
        </p>
        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.06] bg-luxury-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-right"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gold shrink-0 mr-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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
                      <p className="px-5 pb-4 text-sm text-white/40 leading-relaxed">
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
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-card via-luxury-black to-luxury-card" />
        <div className="absolute inset-0 border border-gold/10 rounded-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,168,67,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,168,67,0.05),transparent_50%)]" />
        <div className="relative px-8 py-14 lg:px-16 lg:py-20 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-3 leading-tight">
            <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">مستعد لتطوير</span>
            <span className="block bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent mt-1">مزرعتك؟</span>
          </h2>
          <p className="text-white/40 text-base lg:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            انضم إلى HefnoPlant اليوم وابدأ رحلتك نحو زراعة أكثر ذكاءً وإنتاجية
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-luxury-black font-bold text-sm shadow-[0_0_30px_-5px_rgba(212,168,67,0.3)] hover:shadow-[0_0_40px_-5px_rgba(212,168,67,0.4)] active:scale-[0.98] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50"
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-2xl bg-luxury-card border border-gold/10 shadow-2xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">الدفع عبر فودافون كاش</h3>
            <p className="text-xs text-white/40">{plan.name} — {BILLING_CYCLE_LABELS[billingCycle]}</p>
          </div>
        </div>

        {step === 'pay' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gold/5 border border-gold/10 p-4">
              <p className="text-xs font-medium text-gold/70 mb-1">المبلغ المطلوب</p>
              <p className="text-3xl font-serif font-bold text-gold">{amount} ج.م</p>
            </div>
            <div className="space-y-2.5">
              {[
                { n: '1', t: deviceType === 'android' ? 'اضغط "اتصل الآن" — سيفتح الاتصال بالكود جاهزًا' : 'افتح تطبيق فودافون كاش أو اطلب الكود من الهاتف' },
                { n: '2', t: 'أدخل الرقم السري (PIN) لتأكيد التحويل' },
                { n: '3', t: 'ارجع و اضغط "أرسلت المبلغ" لإتمام الطلب' },
              ].map((s) => (
                <div key={s.n} className="flex items-center gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center">{s.n}</span>
                  <span className="text-sm text-white/70">{s.t}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-luxury-black text-sm font-semibold shadow-[0_0_20px_-5px_rgba(212,168,67,0.3)] hover:shadow-[0_0_30px_-5px_rgba(212,168,67,0.4)] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'جاري التحميل...' : 'المتابعة لإتمام الدفع'}
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gold/5 border border-gold/10 p-4">
              <p className="text-xs font-medium text-gold/70 mb-1">حوّل المبلغ إلى رقم فودافون كاش</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-2xl font-serif font-bold text-gold" dir="ltr">{info?.phoneNumber}</p>
                <button
                  onClick={copyNumber}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-luxury-black border border-gold/20 text-xs font-semibold text-gold hover:bg-gold/10"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'تم النسخ' : 'نسخ'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gold/70">
                المبلغ: {amount} ج.م — باقة {plan.name} {BILLING_CYCLE_LABELS[billingCycle]}
              </p>
            </div>

            {deviceType === 'android' && ussdTelLink && (
              <a
                href={ussdTelLink}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-luxury-black text-sm font-semibold shadow-[0_0_20px_-5px_rgba(212,168,67,0.3)] hover:shadow-[0_0_30px_-5px_rgba(212,168,67,0.4)] active:scale-[0.98] transition-all"
              >
                <Smartphone className="w-4 h-4" />
                اتصل الآن لإتمام التحويل
              </a>
            )}

            {(deviceType !== 'android' || !ussdTelLink) && (
              <div className="rounded-xl bg-luxury-surface border border-white/[0.06] p-4">
                <p className="text-xs font-medium text-white/40 mb-1.5">كود التحويل السريع</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-bold text-white" dir="ltr">{ussdCode || 'جاري التحميل...'}</code>
                  <button
                    onClick={copyNumber}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-xs font-semibold text-gold hover:bg-gold/20"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-white/30">
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
              className="w-full h-11 px-3 rounded-xl border border-white/[0.06] bg-luxury-surface text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-luxury-black text-sm font-semibold shadow-[0_0_20px_-5px_rgba(212,168,67,0.3)] hover:shadow-[0_0_30px_-5px_rgba(212,168,67,0.4)] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'جاري التحميل...' : 'أرسلت المبلغ — أكد الآن'}
            </button>
            <button
              onClick={() => setStep('pay')}
              className="w-full text-sm text-white/40 hover:text-white/60"
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
    <div className="min-h-screen bg-luxury-black transition-colors duration-200">
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
