import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';
import { validatePassword, PASSWORD_RULES } from '../utils/passwordRules';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import SEO from '../component/SEO';
import PasswordInput from '../component/PasswordInput';
import logoImage from '../images/logo-removebg-preview.webp';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

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

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ResetPasswordPage = () => {
  const [status, setStatus] = useState('verifying');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Cache-Control');
    meta.setAttribute('content', 'no-store, no-cache, must-revalidate');
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, []);

  useEffect(() => {
    if (!oobCode || mode !== 'resetPassword') {
      setStatus('invalid');
      return;
    }
    let active = true;
    (async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        if (active) setStatus('ready');
      } catch (_) {
        if (active) setStatus('invalid');
      }
    })();
    return () => { active = false; };
  }, [oobCode, mode]);

  const passwordResult = validatePassword(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!passwordResult.valid) { setError('يرجى استيفاء جميع شروط كلمة المرور'); return; }
    if (newPassword !== confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-champagne dark:bg-[#111827] flex items-center justify-center px-4 py-8 sm:py-12 relative" dir="rtl">
      <SEO title="إعادة تعيين كلمة المرور" description="إعادة تعيين كلمة المرور في Hefno-Plant" noindex />

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
              {status === 'verifying' && (
                <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
                  <SpinnerIcon />
                  <p className="mt-4 text-sm text-[#8a8580] dark:text-gray-400">جاري التحقق من الرابط...</p>
                </motion.div>
              )}

              {status === 'invalid' && (
                <motion.div key="invalid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="size-14 rounded-2xl bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 grid place-items-center mx-auto mb-3">
                    <XIcon />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">رابط غير صالح</h3>
                  <p className="text-xs text-[#8a8580] dark:text-gray-400 mt-2 px-2 leading-relaxed">
                    رابط إعادة التعيين غير صالح أو منتهي الصلاحية
                  </p>
                  <Link
                    to="/forgot-password"
                    className="mt-5 inline-block text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                  >
                    طلب رابط جديد
                  </Link>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-800 grid place-items-center mx-auto mb-3">
                    <CheckIcon />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">تم إعادة التعيين بنجاح</h3>
                  <p className="text-xs text-[#8a8580] dark:text-gray-400 mt-1 px-2">
                    جاري تحويلك إلى صفحة تسجيل الدخول...
                  </p>
                  <Link
                    to="/login"
                    className="mt-5 inline-block text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                  >
                    الذهاب إلى تسجيل الدخول
                  </Link>
                </motion.div>
              )}

              {status === 'ready' && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <motion.div variants={fadeUp}>
                    <h2 className="text-center text-base font-bold text-gray-900 dark:text-white mb-1">
                      إعادة تعيين كلمة المرور
                    </h2>
                    <p className="text-center text-xs text-[#8a8580] dark:text-gray-400 leading-relaxed">
                      اختر كلمة مرور جديدة قوية لحسابك
                    </p>
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 text-center"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div variants={fadeUp}>
                    <PasswordInput
                      label="كلمة المرور الجديدة"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setFocusedField('newPassword')}
                      onBlur={() => setFocusedField(null)}
                      focused={focusedField === 'newPassword'}
                      disabled={loading}
                    />
                    <div className="mt-3 grid grid-cols-1 gap-1.5">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = newPassword.length > 0 && !passwordResult.failed.includes(rule.key);
                        return (
                          <div key={rule.key} className="flex items-center gap-2">
                            <span className={`size-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-[#8a8580]/40 dark:bg-gray-600'}`} />
                            <span className={`text-[11px] ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#8a8580] dark:text-gray-500'}`}>
                              {rule.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <PasswordInput
                      label="تأكيد كلمة المرور"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      onFocus={() => setFocusedField('confirm')}
                      onBlur={() => setFocusedField(null)}
                      focused={focusedField === 'confirm'}
                      disabled={loading}
                    />
                    {confirm && confirm !== newPassword && (
                      <p className="mt-1.5 mr-1 text-xs text-red-500 dark:text-red-400">كلمتا المرور غير متطابقتين</p>
                    )}
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="relative w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 dark:shadow-emerald-600/10 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                    >
                      <span className={`inline-flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                        إعادة تعيين كلمة المرور
                      </span>
                      {loading && (
                        <span className="absolute inset-0 flex items-center justify-center gap-2">
                          <SpinnerIcon />
                          جاري الحفظ...
                        </span>
                      )}
                      <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.06] transition-colors duration-300" />
                    </button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>

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

export default ResetPasswordPage;
