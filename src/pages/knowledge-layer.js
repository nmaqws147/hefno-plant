import { Outlet } from 'react-router-dom';
import './knowledge-layer.css';
import { Helmet } from 'react-helmet-async';

const KnowledgeLayout = () => {
  return (
    <div className="knowledge-base-container">
      <Helmet>
        <title>قاعدة المعرفة | Hefno-Plant</title>
        <meta name="description" content="تصفح جميع أقسام قاعدة المعرفة الزراعية — أمراض، حشرات، مبيدات، تسميد، تقويم، وأكثر." />
      </Helmet>
      <main className="kb-content">
        {/* الـ Outlet هو المكان الذي ستظهر فيه صفحاتك (Insects, Fungi, etc.) */}
        <Outlet />
      </main>
    </div>
  );
};

export default KnowledgeLayout;