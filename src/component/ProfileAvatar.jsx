import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useProfile from '../hooks/useProfile';

const COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColor = (name) => {
  if (!name) return COLORS[0];
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % COLORS.length;
  return COLORS[index];
};

function ProfileAvatar({ size = 'md', className = '' }) {
  const { user } = useAuth();
  const { profile } = useProfile(user?.uid);
  const navigate = useNavigate();

  const sizes = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  if (!user) return null;

  const fullName = profile?.fullName || user.email || 'User';

  return (
    <button
      onClick={() => navigate('/profile')}
      className={`rounded-full overflow-hidden flex-shrink-0 transition-transform hover:scale-105 active:scale-95 ring-2 ring-white/20 dark:ring-gray-700/50 ${sizes[size]} ${className}`}
      title={fullName}
    >
      {profile?.profileImage ? (
        <img
          src={profile.profileImage}
          alt={fullName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center text-white font-bold ${getColor(fullName)}`}>
          {getInitials(fullName)}
        </div>
      )}
    </button>
  );
}

export default memo(ProfileAvatar);