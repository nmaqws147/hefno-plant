import { useEffect } from 'react';
import SEO from '../component/SEO';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hefno-notfound">
      <SEO title="404 - الصفحة غير موجودة" description="الصفحة التي تبحث عنها غير موجودة." noindex />

      <div className="hefno-notfound-container">
        <div className="hefno-notfound-code">404</div>
        <h1 className="hefno-notfound-title">الصفحة غير موجودة</h1>
        <p className="hefno-notfound-desc">
          عذراً، الصفحة التي تبحث عنها غير موجودة
        </p>
        <Link to="/" className="hefno-notfound-btn">
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
