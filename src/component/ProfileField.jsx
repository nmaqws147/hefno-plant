import { useState } from 'react';

export default function ProfileField({
  label,
  value,
  onChange,
  editable = false,
  editing = false,
  error,
  type = 'text',
  placeholder = '',
  readOnlyValue,
  verified,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
        {verified !== undefined && (
          <span className={`mr-2 inline-flex items-center gap-1 text-xs font-medium ${verified ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill={verified ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {verified ? 'مفعل' : 'غير مفعل'}
          </span>
        )}
      </label>

      {editing && editable ? (
        <>
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className={`w-full bg-white dark:bg-gray-950 border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-colors duration-200 ${
              error ? 'border-red-500' : focused ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </>
      ) : (
        <p className={`text-sm py-0.5 ${value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
          {value || (editable ? placeholder || '—' : readOnlyValue || '—')}
        </p>
      )}
    </div>
  );
}
