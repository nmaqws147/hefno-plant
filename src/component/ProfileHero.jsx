import { motion } from 'framer-motion';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function ProfileHero({
  profile,
  previewUrl,
  uploading,
  uploadProgress,
  editing,
  onEdit,
  onImageClick,
}) {
  const displayImage = previewUrl || profile?.profileImage;
  const fullName = profile?.fullName || 'مستخدم';
  const initials = getInitials(fullName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-[#1a2c0d] rounded-3xl border border-gray-100 dark:border-[#2d4a1f] shadow-sm p-6 sm:p-8 mb-6"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group flex-shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl">
            {displayImage ? (
              <img src={displayImage} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">{initials}</span>
              </div>
            )}
          </div>
          {!editing && (
            <button
              onClick={onImageClick}
              className="absolute -bottom-1 -left-1 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200 opacity-0 group-hover:opacity-100 sm:opacity-100"
              title="تغيير الصورة"
            >
              {uploading ? (
                <span className="text-[10px] font-bold">{Math.round(uploadProgress)}%</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-right space-y-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-[#e8f5e8]">
              {fullName}
            </h1>
            {profile?.specialization && (
              <span className="inline-block mt-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                {profile.specialization}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
            {profile?.email && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[#a8c6a8]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {profile.email}
              </span>
            )}
            {profile?.emailVerified !== undefined && (
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                profile.emailVerified
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                {profile.emailVerified ? 'بريد مؤكد' : 'بريد غير مؤكد'}
              </span>
            )}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {profile?.createdAt
                ? `منذ ${Math.floor((Date.now() - (profile.createdAt.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt)).getTime()) / (1000 * 60 * 60 * 24 * 30))} شهر`
                : 'حساب جديد'}
            </span>
          </div>
        </div>

        {!editing && (
          <button
            onClick={onEdit}
            className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
          >
            تعديل الملف الشخصي
          </button>
        )}
      </div>
    </motion.div>
  );
}
