import { useState, useEffect } from 'react';
import './cookieConsent.css';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('hefno-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('hefno-cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('hefno-cookie-consent', 'declined');
    setVisible(false);
  };

  return (
    <div className={`hefno-cookie ${visible ? 'visible' : ''}`}>
      <div className="hefno-cookie-inner">
        <div className="hefno-cookie-text">
          نستخدم ملفات تعريف الارتباط (كوكيز) لتحسين تجربتك وتحليل حركة الزوار وعرض إعلانات مخصصة. لمعرفة المزيد، اطلع على{' '}
          <a href="/privacy" className="hefno-cookie-link">سياسة الخصوصية</a>.
        </div>
        <div className="hefno-cookie-actions">
          <button className="hefno-cookie-decline" onClick={decline}>رفض</button>
          <button className="hefno-cookie-accept" onClick={accept}>موافق</button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
