import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionBadge({ className = '' }) {
  const { user, isPremium, isElite } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  if (isElite) {
    return (
      <button
        onClick={() => navigate('/pricing')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
          bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm ${className}`}
      >
        <span style={{ fontSize: 10 }}>✦</span>
        ELITE
      </button>
    );
  }

  if (isPremium) {
    return (
      <button
        onClick={() => navigate('/pricing')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
          bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm ${className}`}
      >
        <span style={{ fontSize: 10 }}>★</span>
        PREMIUM
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/pricing')}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
        bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      FREE
    </button>
  );
}
