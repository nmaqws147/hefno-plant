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
import { getSubscription, getPayments } from '../services/subscriptionService';
import { PLAN_PRICES } from '../constants/pricing';
import { Crown, Sparkles, CreditCard, Calendar, TrendingUp, Trash2, AlertTriangle, X } from 'lucide-react';
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

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
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    getSubscription().then(setSubscription).catch(console.error);
    getPayments({ limit: 10 }).then(d => setPaymentHistory(d.payments || [])).catch(console.error);
  }, []);

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

  const handleDeleteAccount = useCallback(async () => {
    if (!deletePassword.trim()) {
      setDeleteError('أدخل كلمة المرور للتأكيد');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      const token = await user.getIdToken();
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      await logout();
      toast.success('تم حذف الحساب بنجاح');
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setDeleteError('كلمة المرور غير صحيحة');
      } else {
        setDeleteError(err.message || 'حدث خطأ أثناء حذف الحساب');
      }
    } finally {
      setDeleteLoading(false);
    }
  }, [user, deletePassword, navigate]);

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

        {/* Subscription Card */}
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">خطتك الحالية</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {subscription?.plan === 'elite' ? <Crown className="w-5 h-5 text-amber-500" /> :
                 subscription?.plan === 'premium' ? <Sparkles className="w-5 h-5 text-emerald-500" /> :
                 <CreditCard className="w-5 h-5 text-gray-400" />}
                {subscription?.plan === 'elite' ? 'Elite' : subscription?.plan === 'premium' ? 'Premium' : 'مجاني'}
              </h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              subscription?.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
              subscription?.status === 'cancelled' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
              'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}>
              {subscription?.status === 'active' ? 'نشط' : subscription?.status === 'cancelled' ? 'ملغي' : 'مجاني'}
            </span>
          </div>

          {subscription?.plan !== 'free' && subscription?.expirationDate && (
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(subscription.expirationDate).toLocaleDateString('ar-EG')}
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                {subscription.billingCycle === 'monthly' ? 'شهري' : 'سنوي'}
              </span>
              {subscription?.plan === 'premium' || subscription?.plan === 'elite' ? (
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  {PLAN_PRICES[subscription.plan][subscription.billingCycle === 'monthly' ? 'monthly' : 'yearly']} ج.م/{subscription.billingCycle === 'monthly' ? 'شهر' : 'سنة'}
                </span>
              ) : null}
            </div>
          )}

          {(!subscription || subscription.plan === 'free') && (
            <button onClick={() => navigate('/pricing')}
              className="mt-3 w-full h-10 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all">
              ترقية الآن
            </button>
          )}
        </div>

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

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">سجل المدفوعات</h3>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
              {paymentHistory.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {p.plan === 'elite' ? 'Elite' : 'Premium'} — {p.billingCycle === 'monthly' ? 'شهري' : 'سنوي'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{p.amount} ج.م</p>
                    <span className={`text-xs font-medium ${
                      p.status === 'paid' ? 'text-emerald-600' : p.status === 'failed' ? 'text-red-500' : 'text-amber-500'
                    }`}>
                      {p.status === 'paid' ? 'مكتملة' : p.status === 'failed' ? 'فاشلة' : 'معلقة'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              حذف الحساب
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
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

        {deleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setDeleteModalOpen(false); setDeletePassword(''); setDeleteError(''); }} />
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
              <button
                onClick={() => { setDeleteModalOpen(false); setDeletePassword(''); setDeleteError(''); }}
                className="absolute top-4 left-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">حذف الحساب</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
              </div>

              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                  سيتم حذف حسابك وجميع بياناتك نهائياً بما في ذلك ملفك الشخصي واشتراكك وسجل الاستخدام. لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  أدخل كلمة المرور للتأكيد
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                  placeholder="كلمة المرور"
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {deleteError && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{deleteError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setDeleteModalOpen(false); setDeletePassword(''); setDeleteError(''); }}
                  disabled={deleteLoading}
                  className="flex-1 h-11 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || !deletePassword.trim()}
                  className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {deleteLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                      </svg>
                      جاري الحذف...
                    </span>
                  ) : 'حذف الحساب'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
