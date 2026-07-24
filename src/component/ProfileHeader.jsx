const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function ProfileHeader({
  profile,
  previewUrl,
  uploading,
  uploadProgress,
  editing,
  onEdit,
  onImageClick,
  onImageSave,
  onImageRemove,
  onCancelImage,
}) {
  const displayImage = previewUrl || profile?.profileImage;
  const fullName = profile?.fullName || 'مستخدم';
  const initials = getInitials(fullName);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            {displayImage ? (
              <img src={displayImage} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-right space-y-2.5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{fullName}</h1>
            {profile?.specialization && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{profile.specialization}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 justify-center sm:justify-start text-sm text-gray-500 dark:text-gray-400">
            {profile?.email && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {profile.email}
                {profile?.emailVerified && (
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-500 text-xs font-medium">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    موثق
                  </span>
                )}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {profile?.createdAt ? 'عضو منذ ' + new Date(profile.createdAt.toDate ? profile.createdAt.toDate() : profile.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' }) : 'حساب جديد'}
            </span>
          </div>

          {!editing && (
            <div className="flex items-center gap-3 justify-center sm:justify-start pt-1">
              <button
                onClick={onEdit}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                تعديل الملف الشخصي
              </button>
              <button
                onClick={onImageClick}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                تغيير الصورة
              </button>
            </div>
          )}

          {previewUrl && (
            <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
              <button
                onClick={onImageSave}
                disabled={uploading}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {uploading ? `${Math.round(uploadProgress)}%` : 'حفظ الصورة'}
              </button>
              {profile?.profileImage && (
                <button
                  onClick={onImageRemove}
                  className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  إزالة
                </button>
              )}
              <button
                onClick={onCancelImage}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
