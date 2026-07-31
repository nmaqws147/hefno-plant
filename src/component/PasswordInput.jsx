import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PasswordInput = ({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  focused,
  error,
  placeholder = '••••••••',
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1">
        {label}
      </label>
      <div className="relative">
        <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focused ? 'text-emerald-500' : 'text-[#8a8580] dark:text-gray-500'}`}>
          <LockIcon />
        </div>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required
          disabled={disabled}
          className="w-full bg-forest/[0.03] dark:bg-gray-800 border border-forest/15 dark:border-gray-600 rounded-xl px-4 py-3.5 pr-11 pl-12 text-sm text-right text-gray-900 dark:text-gray-100 placeholder:text-[#8a8580]/60 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 outline-none transition-all duration-300 disabled:opacity-60"
          placeholder={placeholder}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focused ? 'text-emerald-500' : 'text-[#8a8580] dark:text-gray-500'} hover:text-emerald-500`}
        >
          {visible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
      {error && <p className="mt-1.5 mr-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default PasswordInput;
