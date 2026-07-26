import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGuestId } from '../services/guestId';
import { checkQuota } from '../services/quotaService';
import QuotaModal from '../component/QuotaModal';
import './knowledge-layer.css';
import SEO from '../component/SEO';
import { makeBreadcrumbs, makeCollection } from '../component/structuredData';

const KnowledgeLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
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
        <main className="kb-content flex items-center justify-center min-h-[400px]" />
      </div>
    );
  }

  if (!access.allowed) {
    return (
      <div className="fixed inset-0 z-[9998] bg-zinc-950">
        <QuotaModal open={true} featureId="knowledge_base" onClose={() => navigate(-1)} />
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
