import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function useRequireAuth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (callback) => {
    if (!user) {
      const redirectPath = location.pathname + location.search;
      toast.error('الرجاء تسجيل الدخول أولاً');
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return false;
    }
    if (typeof callback === 'function') {
      callback();
    }
    return true;
  };
}
