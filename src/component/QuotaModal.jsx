import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { id: 'ai_chatbot', name: 'المساعد الذكي', limit: 5, period: 'يومي' },
  { id: 'knowledge_base', name: 'قاعدة المعرفة', limit: 5, period: 'أسبوعي' },
  { id: 'disease_diagnosis', name: 'تشخيص الأمراض', limit: 1, period: 'أسبوعي' },
];

export default function QuotaModal({ open, onClose, featureId }) {
  const { user, isPremium } = useAuth();

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const current = FEATURES.find((f) => f.id === featureId);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', direction: 'rtl',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, maxWidth: 400, width: '90%',
          padding: 32, position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, left: 12, border: 'none',
            background: '#f3f4f6', borderRadius: '50%', width: 32, height: 32,
            fontSize: 18, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>
            لقد استنفذت حصتك
          </h2>
          {current && (
            <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>
              {current.name} — {current.limit} {current.period === 'يومي' ? 'رسائل' : 'استخدامات'} في {current.period === 'يومي' ? 'اليوم' : 'الأسبوع'}
            </p>
          )}
        </div>

        {!user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 14, color: '#4b5563', textAlign: 'center', margin: 0 }}>
              سجل دخول للحصول على حصة أكبر
            </p>
            <button
              onClick={() => { window.location.href = '/login'; }}
              style={{
                padding: '12px 24px', borderRadius: 12, border: 'none',
                background: '#4a7c59', color: '#fff', fontSize: 16,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { window.location.href = '/SignUpPage'; }}
              style={{
                padding: '12px 24px', borderRadius: 12, border: '2px solid #4a7c59',
                background: 'transparent', color: '#4a7c59', fontSize: 16,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              إنشاء حساب جديد
            </button>
          </div>
        ) : isPremium ? (
          <p style={{ fontSize: 14, color: '#4b5563', textAlign: 'center' }}>
            أنت مشترك في الباقة المميزة. إذا استمرت المشكلة، حاول مرة أخرى لاحقاً.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px', borderRadius: 12, border: 'none',
                background: '#f3f4f6', color: '#374151', fontSize: 16,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              حسناً
            </button>
          </div>
        )}

        <div style={{ marginTop: 24, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
          <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', margin: 0 }}>
            جميع الميزات الأساسية مجانية. الباقة المميزة (قريباً) تمنحك استخدام غير محدود.
          </p>
        </div>
      </div>
    </div>
  );
}
