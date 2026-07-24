import { Outlet, useLocation } from 'react-router-dom';
import './knowledge-layer.css';
import SEO from '../component/SEO';
import { makeBreadcrumbs, makeCollection } from '../component/structuredData';

const KnowledgeLayout = () => {
  const location = useLocation();
  const bc = makeBreadcrumbs(location.pathname);
  const ld = makeCollection('قاعدة المعرفة الزراعية', location.pathname, 'تصفح جميع أقسام قاعدة المعرفة الزراعية — أمراض، حشرات، مبيدات، تسميد، تقويم، وأكثر.');

  return (
    <div className="knowledge-base-container">
      <SEO title="قاعدة المعرفة" description="تصفح جميع أقسام قاعدة المعرفة الزراعية — أمراض، حشرات، مبيدات، تسميد، تقويم، وأكثر." url={location.pathname} keywords="قاعدة معرفة زراعية, أمراض النباتات, الحشرات الزراعية, المبيدات, التسميد, التقويم الزراعي" breadcrumbs={bc} jsonLd={ld} />
      <main className="kb-content">
        {/* الـ Outlet هو المكان الذي ستظهر فيه صفحاتك (Insects, Fungi, etc.) */}
        <Outlet />
      </main>
    </div>
  );
};

export default KnowledgeLayout;