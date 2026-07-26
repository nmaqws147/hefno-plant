import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createCheckoutSession, initiateVodafoneCash } from '../services/subscriptionService';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'EGP',
    description: 'ابدأ مع الميزات الأساسية',
    features: [
      { name: 'المساعد الذكي', limit: '5/اليوم' },
      { name: 'قاعدة المعرفة', limit: '5/الأسبوع' },
      { name: 'تشخيص الأمراض', limit: '1/الأسبوع' },
      { name: 'الطقس', limit: 'غير محدود' },
      { name: 'المقالات', limit: 'غير محدود' },
    ],
    cta: 'الخطة الحالية',
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 50,
    yearlyPrice: 500,
    currency: 'EGP',
    description: 'الميزات المتقدمة للمزارعين المحترفين',
    features: [
      { name: 'المساعد الذكي', limit: '100/شهر' },
      { name: 'قاعدة المعرفة', limit: '70/شهر' },
      { name: 'تشخيص الأمراض', limit: '2/شهر' },
      { name: 'الطقس', limit: 'غير محدود' },
      { name: 'المقالات', limit: 'غير محدود' },
      { name: 'دعم ذو أولوية', limit: '✓' },
    ],
    cta: 'اشترك الآن',
    highlighted: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 80,
    yearlyPrice: 800,
    currency: 'EGP',
    description: 'الوصول الكامل لجميع الميزات',
    features: [
      { name: 'المساعد الذكي', limit: 'غير محدود' },
      { name: 'قاعدة المعرفة', limit: 'غير محدود' },
      { name: 'تشخيص الأمراض', limit: 'غير محدود' },
      { name: 'الطقس', limit: 'غير محدود' },
      { name: 'المقالات', limit: 'غير محدود' },
      { name: 'دعم ذو أولوية', limit: '✓' },
      { name: 'جميع الميزات المستقبلية', limit: '✓' },
    ],
    cta: 'اشترك الآن',
    highlighted: false,
  },
];

const PAYMENT_METHODS = [
  { id: 'stripe', name: 'بطاقة ائتمان', icon: '💳' },
  { id: 'vodafone_cash', name: 'فودافون كاش', icon: '📱' },
];

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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '64px 16px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 700, color: '#111827',
            marginBottom: 16,
          }}>
            اختر باقتك المناسبة
          </h1>
          <p style={{ fontSize: 18, color: '#6b7280' }}>
            جميع الباقات تشمل الميزات الأساسية. اختر ما يناسب احتياجاتك
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 16, marginBottom: 48,
        }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '10px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: billingCycle === 'monthly' ? '#111827' : '#f3f4f6',
              color: billingCycle === 'monthly' ? '#fff' : '#6b7280',
              transition: 'all 0.2s',
            }}
          >
            شهري
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: '10px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: billingCycle === 'yearly' ? '#111827' : '#f3f4f6',
              color: billingCycle === 'yearly' ? '#fff' : '#6b7280',
              transition: 'all 0.2s',
            }}
          >
            سنوي
            <span style={{ marginLeft: 8, fontSize: 11, color: '#059669', fontWeight: 700 }}>
              وفر 17%
            </span>
          </button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32, maxWidth: 1100, margin: '0 auto',
        }}>
          {PLANS.map((plan) => {
            const price = getPlanPrice(plan);
            const isCurrentPlan = (plan.id === 'premium' && isPremium) || (plan.id === 'elite' && isElite) || (plan.id === 'free' && !isPremium && !isElite);

            return (
              <div
                key={plan.id}
                style={{
                  position: 'relative',
                  borderRadius: 16, padding: 32,
                  transition: 'all 0.3s',
                  background: plan.highlighted ? '#111827' : '#f9fafb',
                  color: plan.highlighted ? '#fff' : '#111827',
                  border: plan.highlighted ? '2px solid #34d399' : '1px solid #e5e7eb',
                  transform: plan.highlighted ? 'scale(1.05)' : 'none',
                }}
              >
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute', top: -16, left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '4px 16px', borderRadius: 999,
                    background: '#34d399', color: '#fff',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    الأكثر طلباً
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                    {plan.name}
                  </h3>
                  <p style={{
                    fontSize: 14,
                    color: plan.highlighted ? '#9ca3af' : '#6b7280',
                    marginBottom: 24,
                  }}>
                    {plan.description}
                  </p>
                  <div>
                    <span style={{ fontSize: 48, fontWeight: 700 }}>
                      {plan.id === 'free' ? '0' : price}
                    </span>
                    <span style={{
                      fontSize: 14, marginLeft: 4,
                      color: plan.highlighted ? '#9ca3af' : '#6b7280',
                    }}>
                      {plan.id === 'free' ? '' : `ج/${billingCycle === 'monthly' ? 'شهر' : 'سنة'}`}
                    </span>
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                  {plan.features.map((feat, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center',
                        gap: 12, padding: '8px 0',
                        fontSize: 14,
                        borderBottom: i < plan.features.length - 1
                          ? `1px solid ${plan.highlighted ? '#1f2937' : '#e5e7eb'}`
                          : 'none',
                      }}
                    >
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, flexShrink: 0,
                        background: feat.limit === '✓' || feat.limit === 'غير محدود'
                          ? '#d1fae5' : '#e5e7eb',
                        color: feat.limit === '✓' || feat.limit === 'غير محدود'
                          ? '#059669' : '#9ca3af',
                      }}>
                        {feat.limit === '✓' || feat.limit === 'غير محدود' ? '✓' : ''}
                      </span>
                      <span style={{ flex: 1 }}>
                        {feat.name}
                      </span>
                      <span style={{
                        fontSize: 12, fontWeight: 500,
                        color: feat.limit === 'غير محدود' ? '#059669' : (plan.highlighted ? '#9ca3af' : '#9ca3af'),
                        textAlign: 'left',
                      }}>
                        {feat.limit}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || loading === plan.id}
                  style={{
                    width: '100%', padding: '14px 24px', borderRadius: 12,
                    fontSize: 14, fontWeight: 700, border: 'none', cursor: isCurrentPlan ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    background: isCurrentPlan
                      ? '#e5e7eb'
                      : plan.highlighted ? '#34d399' : '#111827',
                    color: isCurrentPlan ? '#9ca3af' : '#fff',
                    opacity: loading === plan.id ? 0.5 : 1,
                  }}
                >
                  {loading === plan.id ? 'جاري التحميل...' : isCurrentPlan ? 'الخطة الحالية' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ maxWidth: 400, margin: '48px auto 0', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>طريقة الدفع:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 12,
                  fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: paymentMethod === pm.id ? '#111827' : '#f3f4f6',
                  color: paymentMethod === pm.id ? '#fff' : '#6b7280',
                }}
              >
                <span>{pm.icon}</span>
                {pm.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
