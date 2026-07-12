import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hefno-notfound">
      <Helmet>
        <title>404 - الصفحة غير موجودة | Hefno-Plant</title>
        <meta name="description" content="الصفحة التي تبحث عنها غير موجودة." />
      </Helmet>

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
