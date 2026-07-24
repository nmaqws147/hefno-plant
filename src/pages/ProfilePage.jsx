import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import useProfile from '../hooks/useProfile';
import { updateProfile } from '../services/profileService';
import { uploadProfileImage, deleteProfileImage, validateImage } from '../services/storageService';
import SEO from '../component/SEO';
import ProfileHeader from '../component/ProfileHeader';
import ProfileInfoCard from '../component/ProfileInfoCard';
import ProfileField from '../component/ProfileField';
import ProfileSkeleton from '../component/ProfileSkeleton';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { profile, loading, refetch } = useProfile(user?.uid);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [form, setForm] = useState({ fullName: '', phoneNumber: '', specialization: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        specialization: profile.specialization || '',
      });
    }
  }, [profile]);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImage(file);
    if (error) { toast.error(error); return; }
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleImageSave = useCallback(async () => {
    if (!previewUrl || !user?.uid) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadProfileImage(user.uid, previewUrl, (pct) => setUploadProgress(pct));
      await updateProfile(user.uid, { profileImage: url });
      setPreviewUrl(null);
      toast.success('تم تحديث صورة الملف الشخصي');
      refetch();
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  }, [previewUrl, user, refetch]);

  const handleImageRemove = useCallback(async () => {
    if (!user?.uid) return;
    try {
      await deleteProfileImage(user.uid);
      await updateProfile(user.uid, { profileImage: null });
      setPreviewUrl(null);
      toast.success('تم إزالة صورة الملف الشخصي');
      refetch();
    } catch {
      toast.error('فشل إزالة الصورة');
    }
  }, [user, refetch]);

  const handleCancelImage = useCallback(() => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'الاسم الكامل مطلوب';
    if (!form.phoneNumber.trim()) errs.phoneNumber = 'رقم الهاتف مطلوب';
    if (!form.specialization.trim()) errs.specialization = 'التخصص مطلوب';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSave = useCallback(async () => {
    if (!validate() || !user?.uid) return;
    setSaving(true);
    try {
      await updateProfile(user.uid, {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        specialization: form.specialization,
      });
      toast.success('تم حفظ التغييرات');
      setEditing(false);
      refetch();
    } catch {
      toast.error('فشل حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  }, [form, user, validate, refetch]);

  const handleCancel = useCallback(() => {
    setForm({
      fullName: profile?.fullName || '',
      phoneNumber: profile?.phoneNumber || '',
      specialization: profile?.specialization || '',
    });
    setErrors({});
    setEditing(false);
  }, [profile]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error('فشل تسجيل الخروج');
    }
  }, [logout, navigate]);

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="text-center px-4">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-6">الرجاء تسجيل الدخول لعرض الملف الشخصي</p>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      <SEO title="الملف الشخصي" description="الملف الشخصي في Hefno-Plant" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">الملف الشخصي</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            رجوع
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleImageSelect}
        />

        <ProfileHeader
          profile={profile}
          previewUrl={previewUrl}
          uploading={uploading}
          uploadProgress={uploadProgress}
          editing={editing}
          onEdit={() => setEditing(true)}
          onImageClick={() => fileInputRef.current?.click()}
          onImageSave={handleImageSave}
          onImageRemove={handleImageRemove}
          onCancelImage={handleCancelImage}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          <ProfileInfoCard
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            title="المعلومات الشخصية"
          >
            <ProfileField
              label="الاسم الكامل"
              value={form.fullName}
              onChange={(v) => setForm(f => ({ ...f, fullName: v }))}
              editable
              editing={editing}
              error={errors.fullName}
              placeholder="أدخل اسمك الكامل"
            />
            <ProfileField
              label="رقم الهاتف"
              value={form.phoneNumber}
              onChange={(v) => setForm(f => ({ ...f, phoneNumber: v }))}
              editable
              editing={editing}
              error={errors.phoneNumber}
              type="tel"
              placeholder="+20 100 000 0000"
            />
            <ProfileField
              label="التخصص"
              value={form.specialization}
              onChange={(v) => setForm(f => ({ ...f, specialization: v }))}
              editable
              editing={editing}
              error={errors.specialization}
              placeholder="أدخل تخصصك"
            />
          </ProfileInfoCard>

          <ProfileInfoCard
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            title="معلومات الحساب"
          >
            <ProfileField label="البريد الإلكتروني" value={profile?.email} verified={profile?.emailVerified} />
            <ProfileField label="مزود الحساب" value={profile?.provider === 'email' ? 'البريد الإلكتروني' : profile?.provider} />
            <ProfileField label="تاريخ الإنشاء" value={formatDate(profile?.createdAt)} />
            <ProfileField label="آخر تسجيل دخول" value={formatDate(profile?.lastLoginAt)} />
            <ProfileField label="الدور" value={profile?.role === 'user' ? 'مستخدم' : profile?.role} />
          </ProfileInfoCard>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          {editing ? (
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 sm:flex-none px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                    </svg>
                    جاري الحفظ...
                  </span>
                ) : 'حفظ التغييرات'}
              </button>
            </div>
          ) : (
            <div />
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
