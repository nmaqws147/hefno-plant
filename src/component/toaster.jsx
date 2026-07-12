import { useEffect, useState } from 'react';
import './toaster.css';

const Toaster = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // دالة لاستقبال البيانات من أي مكان في التطبيق
    const handleToast = (event) => {
      const { message, type, duration } = event.detail;
      setToast({ message, type });

      // إخفاء التنبيه تلقائياً
      setTimeout(() => {
        setToast(null);
      }, duration || 3000);
    };

    // الاستماع للحدث المخصص
    window.addEventListener('show-toast', handleToast);

    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  if (!toast) return null;

  return (
    <div className={`toast-item glass ${toast.type}`}>
      <span className="toast-icon">
        {toast.type === 'success' ? '✅' : '❌'}
      </span>
      <p>{toast.message}</p>
    </div>
  );
};

// دالة خارجية سهلة الاستخدام لنادي التوستر من أي ملف JS/JSX
export const toast = (message, type = 'success', duration = 3000) => {
  const event = new CustomEvent('show-toast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

export default Toaster;