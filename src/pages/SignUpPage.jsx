import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
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

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name[0]}***@${domain}`;
};

const OtpInput = ({ value, onChange, onKeyDown, inputRef, autoFocus }) => (
  <input
    ref={inputRef}
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={1}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    autoFocus={autoFocus}
    className="size-11 sm:size-12 text-center text-lg font-bold rounded-xl border-2 border-forest/15 dark:border-gray-600 bg-forest/[0.03] dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all duration-200"
  />
);

const SignUpPage = () => {
  const [step, setStep] = useState('form');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sentEmail, setSentEmail] = useState('');
  const otpRefs = useRef([]);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sendOtp = useCallback(async (emailAddr) => {
    setOtpError('');
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailAddr }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل إرسال رمز التحقق');
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) { setError('الرجاء إدخال الاسم الكامل'); return; }
    if (!phoneNumber.trim()) { setError('الرجاء إدخال رقم الهاتف'); return; }
    if (!specialization.trim()) { setError('الرجاء إدخال التخصص'); return; }
    if (password !== confirm) { setError('كلمة المرور غير متطابقة'); return; }
    if (password.length < 6) { setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) { setError('هذا البريد الإلكتروني مسجل بالفعل'); setLoading(false); return; }
      } catch (_) { /* ignore fetchSignInMethodsForEmail failure */ }
      setSentEmail(email);
      await sendOtp(email);
      setStep('otp');
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    }
    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpSubmit = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setOtpError('الرجاء إدخال رمز التحقق كاملاً'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sentEmail, otp: code }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'رمز التحقق غير صحيح');
      await signup(email, password, fullName.trim(), phoneNumber.trim(), specialization);
      navigate(decodeURIComponent(searchParams.get('redirect') || '/'));
    } catch (err) {
      setOtpError(getFirebaseErrorMessage(err));
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
    setOtpLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpError('');
    setOtpLoading(true);
    try {
      await sendOtp(sentEmail);
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setOtpError(err.message);
    }
    setOtpLoading(false);
  };

  return (
    <div className="min-h-screen bg-champagne dark:bg-[#111827] flex items-center justify-center px-4 py-8 sm:py-12 relative" dir="rtl">
      <SEO title={step === 'otp' ? 'تأكيد الحساب' : 'إنشاء حساب'} description="إنشاء حساب جديد في Hefno-Plant" />

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
                  key="form-error"
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

            {step === 'form' && (
              <motion.form
                key="form"
                variants={stagger}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <motion.div variants={fadeUp} className="relative">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'fullName' ? 'text-emerald-500' : 'text-[#8a8580] dark:text-gray-500'}`}>
                      <UserIcon />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={() => setFocusedField(null)}
                      required
                      disabled={loading}
                      className="w-full bg-forest/[0.03] dark:bg-gray-800 border border-forest/15 dark:border-gray-600 rounded-xl px-4 py-3.5 pr-11 text-sm text-right text-gray-900 dark:text-gray-100 placeholder:text-[#8a8580]/60 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 outline-none transition-all duration-300 disabled:opacity-60"
                      placeholder="محمد أحمد"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="relative">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'phoneNumber' ? 'text-emerald-500' : 'text-[#8a8580] dark:text-gray-500'}`}>
                      <PhoneIcon />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      onFocus={() => setFocusedField('phoneNumber')}
                      onBlur={() => setFocusedField(null)}
                      required
                      disabled={loading}
                      className="w-full bg-forest/[0.03] dark:bg-gray-800 border border-forest/15 dark:border-gray-600 rounded-xl px-4 py-3.5 pr-11 text-sm text-right text-gray-900 dark:text-gray-100 placeholder:text-[#8a8580]/60 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 outline-none transition-all duration-300 disabled:opacity-60"
                      placeholder="+20 100 000 0000"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="relative">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1">
                    التخصص
                  </label>
                  <div className="relative">
                    <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'specialization' ? 'text-emerald-500' : 'text-[#8a8580] dark:text-gray-500'}`}>
                      <BriefcaseIcon />
                    </div>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      onFocus={() => setFocusedField('specialization')}
                      onBlur={() => setFocusedField(null)}
                      required
                      disabled={loading}
                      className="w-full bg-forest/[0.03] dark:bg-gray-800 border border-forest/15 dark:border-gray-600 rounded-xl px-4 py-3.5 pr-11 text-sm text-right text-gray-900 dark:text-gray-100 placeholder:text-[#8a8580]/60 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 outline-none transition-all duration-300 disabled:opacity-60"
                      placeholder="ادخل تخصصك"
                    />
                  </div>
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
                      placeholder="6 أحرف على الأقل"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="relative">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'confirm' ? 'text-emerald-500' : 'text-[#8a8580] dark:text-gray-500'}`}>
                      <LockIcon />
                    </div>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      onFocus={() => setFocusedField('confirm')}
                      onBlur={() => setFocusedField(null)}
                      required
                      disabled={loading}
                      className="w-full bg-forest/[0.03] dark:bg-gray-800 border border-forest/15 dark:border-gray-600 rounded-xl px-4 py-3.5 pr-11 text-sm text-right text-gray-900 dark:text-gray-100 placeholder:text-[#8a8580]/60 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 outline-none transition-all duration-300 disabled:opacity-60"
                      placeholder="أعد إدخال كلمة المرور"
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
                      إنشاء حساب
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
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="text-center mb-6">
                  <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-800 grid place-items-center mx-auto mb-3">
                    <MailIcon />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">تأكيد الحساب</h3>
                  <p className="text-xs text-[#8a8580] dark:text-gray-400 mt-1 px-2">
                    تم إرسال رمز التحقق إلى <span className="font-semibold text-emerald-600 dark:text-emerald-400">{maskEmail(sentEmail)}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <AnimatePresence>
                    {otpError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 text-center"
                      >
                        {otpError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
                    {otp.map((digit, i) => (
                      <OtpInput
                        key={i}
                        value={digit}
                        inputRef={(el) => { otpRefs.current[i] = el; }}
                        autoFocus={i === 0}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading || otp.join('').length !== 6}
                    className="relative w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 dark:shadow-emerald-600/10 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <span className={`inline-flex items-center justify-center gap-2 ${otpLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                      تأكيد
                    </span>
                    {otpLoading && (
                      <span className="absolute inset-0 flex items-center justify-center gap-2">
                        <SpinnerIcon />
                        جاري التحقق...
                      </span>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || otpLoading}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline disabled:text-[#8a8580]/50 disabled:no-underline disabled:cursor-not-allowed transition-colors"
                    >
                      {resendCooldown > 0
                        ? `إعادة الإرسال بعد ${resendCooldown} ثانية`
                        : 'إعادة إرسال الرمز'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'form' && (
              <>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="mt-6 text-center text-sm text-[#8a8580] dark:text-gray-400"
                >
                  لديك حساب بالفعل؟{' '}
                  <Link to="/login" className="text-gold hover:text-gold/80 font-semibold transition-colors">
                    تسجيل الدخول
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
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;