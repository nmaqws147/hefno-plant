import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import SEO from '../component/SEO';
import logoImage from '../images/logo-removebg-preview.webp';

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4L12 13L2 4" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('الرجاء إدخال البريد الإلكتروني'); return; }
    if (!password) { setError('الرجاء إدخال كلمة المرور'); return; }
    setLoading(true);
    try {
      await login(email, password);
      const redirect = searchParams.get('redirect') || '/';
      navigate(decodeURIComponent(redirect));
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-champagne dark:bg-[#111827] flex items-center justify-center px-4 py-8 sm:py-12 relative" dir="rtl">
      <SEO title="تسجيل الدخول" description="تسجيل الدخول إلى Hefno-Plant" />

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
            <AnimatePresence>
              {error && (
                <motion.div
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

            <motion.form
              variants={stagger}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
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

              <motion.div variants={fadeUp} className="relative">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-emerald-500' : 'text-[#8a8580] dark:text-gray-500'}`}>
                    <LockIcon />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={loading}
                    className="w-full bg-forest/[0.03] dark:bg-gray-800 border border-forest/15 dark:border-gray-600 rounded-xl px-4 py-3.5 pr-11 text-sm text-right text-gray-900 dark:text-gray-100 placeholder:text-[#8a8580]/60 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 outline-none transition-all duration-300 disabled:opacity-60"
                    placeholder="••••••••"
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
                    تسجيل الدخول
                  </span>
                  {loading && (
                    <span className="absolute inset-0 flex items-center justify-center gap-2">
                      <SpinnerIcon />
                      جاري التحميل...
                    </span>
                  )}
                  <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.06] transition-colors duration-300" />
                </button>
              </motion.div>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-6 text-center text-sm text-[#8a8580] dark:text-gray-400"
            >
              ليس لديك حساب؟{' '}
              <Link to="/signup" className="text-gold hover:text-gold/80 font-semibold transition-colors">
                إنشاء حساب
              </Link>
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="mt-3 text-center"
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

export default LoginPage;