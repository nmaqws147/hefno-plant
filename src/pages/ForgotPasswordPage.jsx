import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../component/SEO';
import logoImage from '../images/logo-removebg-preview.webp';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4L12 13L2 4" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'حدث خطأ غير متوقع');
        return;
      }
      setResendCooldown(60);
    } catch (_) {
      setError('حدث خطأ غير متوقع، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('الرجاء إدخال البريد الإلكتروني'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'حدث خطأ غير متوقع');
        setResendCooldown(60);
        return;
      }
      setSuccess(true);
      setResendCooldown(60);
    } catch (_) {
      setError('حدث خطأ غير متوقع، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-champagne dark:bg-[#111827] flex items-center justify-center px-4 py-8 sm:py-12 relative" dir="rtl">
      <SEO title="استعادة كلمة المرور" description="استعادة كلمة المرور لحسابك في Hefno-Plant" />

      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(30,53,47,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-forest/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg relative z-10"
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-forest/10 dark:border-gray-700 shadow-2xl shadow-forest/5 dark:shadow-black/30 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-l from-forest via-emerald-500 to-gold" />

          <div className="pt-10 pb-2 sm:pt-12 sm:pb-4 text-center">
            <img
              src={logoImage}
              alt="HEFNOPLANT"
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain mx-auto"
            />
          </div>

          <div className="px-6 sm:px-8 pb-8 sm:pb-10 pt-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {!success ? (
              <motion.form
                key="form"
                variants={stagger}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <motion.div variants={fadeUp}>
                  <h2 className="text-center text-base font-bold text-gray-900 dark:text-white mb-1">
                    نسيت كلمة المرور؟
                  </h2>
                  <p className="text-center text-xs text-[#8a8580] dark:text-gray-400 leading-relaxed">
                    أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="relative">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-emerald-500' : 'text-[#8a8580] dark:text-gray-500'}`}>
                      <MailIcon />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      disabled={loading}
                      className="w-full bg-forest/[0.03] dark:bg-gray-800 border border-forest/15 dark:border-gray-600 rounded-xl px-4 py-3.5 pr-11 text-sm text-right text-gray-900 dark:text-gray-100 placeholder:text-[#8a8580]/60 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 outline-none transition-all duration-300 disabled:opacity-60"
                      placeholder="your@email.com"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 dark:shadow-emerald-600/10 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <span className={`inline-flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                      إرسال رابط إعادة التعيين
                    </span>
                    {loading && (
                      <span className="absolute inset-0 flex items-center justify-center gap-2">
                        <SpinnerIcon />
                        جاري الإرسال...
                      </span>
                    )}
                    <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.06] transition-colors duration-300" />
                  </button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-800 grid place-items-center mx-auto mb-3">
                  <CheckIcon />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">تم الإرسال</h3>
                <p className="text-xs text-[#8a8580] dark:text-gray-400 mt-1 px-2 leading-relaxed">
                  إذا كان هناك حساب مرتبط بهذا البريد، سيصلك رابط إعادة تعيين كلمة المرور
                </p>
                <Link
                  to="/login"
                  className="mt-5 inline-block text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                >
                  العودة إلى تسجيل الدخول
                </Link>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="mt-3 block w-full text-center text-xs text-[#8a8580] dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:text-[#8a8580]/50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `إعادة الإرسال بعد ${resendCooldown} ثانية`
                    : 'إعادة إرسال الرابط'}
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="mt-6 text-center"
            >
              <Link to="/" className="text-xs text-[#8a8580] dark:text-gray-500 hover:text-gold transition-colors">
                &larr; العودة إلى الرئيسية
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
