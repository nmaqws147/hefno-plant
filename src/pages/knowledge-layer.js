import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGuestId } from '../services/guestId';
import { checkQuota } from '../services/quotaService';
import './knowledge-layer.css';
import SEO from '../component/SEO';
import { makeBreadcrumbs, makeCollection } from '../component/structuredData';

const btn = {
  padding: '12px 24px', borderRadius: 12, border: 'none',
  fontSize: 16, fontWeight: 600, cursor: 'pointer', width: '100%', maxWidth: 280,
};
const primaryBtn = { ...btn, background: '#4a7c59', color: '#fff' };
const outlineBtn = { ...btn, background: 'transparent', border: '2px solid #4a7c59', color: '#4a7c59' };
const eliteBtn = { ...btn, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff' };
const ghostBtn = { ...btn, background: '#f3f4f6', color: '#374151' };

const blockContent = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minHeight: 400, textAlign: 'center', padding: 32, gap: 12,
};

const KnowledgeLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const [access, setAccess] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAccess(null);
      const guestId = user ? null : getGuestId();
      const authToken = user ? await user.getIdToken() : null;
      try {
        const result = await checkQuota('knowledge_base', { guestId, authToken, increment: true });
        if (!cancelled) setAccess(result);
      } catch (_) {
        if (!cancelled) setAccess({ allowed: true });
      }
    })();
    return () => { cancelled = true; };
  }, [user, location.pathname]);

  const bc = makeBreadcrumbs(location.pathname);
  const ld = makeCollection('قاعدة المعرفة الزراعية', location.pathname, 'تصفح جميع أقسام قاعدة المعرفة الزراعية — أمراض، حشرات، مبيدات، تسميد، تقويم، وأكثر.');

  if (access === null) {
    return (
      <div className="knowledge-base-container">
        <main className="kb-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div style={{ color: '#4a7c59', fontSize: 18 }}></div>
        </main>
      </div>
    );
  }

  if (!access.allowed) {
    return (
      <div className="knowledge-base-container">
        <main className="kb-content">
          <div style={blockContent}>
            <div style={{ fontSize: 40 }}>🔒</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>لقد استنفذت حصتك</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>قاعدة المعرفة — 5 استخدامات في الأسبوع</p>
            {!user ? (
              <>
                <p style={{ fontSize: 14, color: '#4b5563', margin: '12px 0 0' }}>سجل دخول للحصول على حصة أكبر</p>
                <button style={primaryBtn} onClick={() => navigate('/login')}>تسجيل الدخول</button>
                <button style={outlineBtn} onClick={() => navigate('/SignUpPage')}>إنشاء حساب جديد</button>
              </>
            ) : isPremium ? (
              <>
                <p style={{ fontSize: 14, color: '#4b5563', margin: '12px 0 0' }}>لقد استنفذت حصتك الشهرية. انتقل إلى الباقة الفريدة للاستخدام غير المحدود.</p>
                <button style={eliteBtn} onClick={() => navigate('/pricing')}>الانتقال إلى Elite</button>
                <button style={ghostBtn} onClick={() => navigate(-1)}>عودة</button>
              </>
            ) : (
              <>
                <button style={primaryBtn} onClick={() => navigate('/pricing')}>ترقية الباقة</button>
                <button style={ghostBtn} onClick={() => navigate(-1)}>عودة</button>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="knowledge-base-container">
      <SEO title="قاعدة المعرفة" description="تصفح جميع أقسام قاعدة المعرفة الزراعية — أمراض، حشرات، مبيدات، تسميد، تقويم، وأكثر." url={location.pathname} keywords="قاعدة معرفة زراعية, أمراض النباتات, الحشرات الزراعية, المبيدات, التسميد, التقويم الزراعي" breadcrumbs={bc} jsonLd={ld} />
      <main className="kb-content">
        <Outlet />
      </main>
    </div>
  );
};

export default KnowledgeLayout;
