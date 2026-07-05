import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // الانتقال لأعلى الصفحة بنعومة أو مباشرة
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // استخدم 'smooth' لو عايز طلوع ناعم، بس 'instant' أفضل لتجربة المستخدم
    });
  }, [pathname]); // هيتنفذ الكود ده كل ما الـ pathname يتغير

  return null; // المكون ده مش بيعرض حاجة في الـ UI
};

export default ScrollToTop;