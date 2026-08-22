import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Search, ChevronDown, ChevronUp,
  Eye, Pencil, Trash2, MoreVertical, RefreshCw, X, AlertTriangle,
  Phone, CalendarDays, Activity, BadgeCheck, UserPlus, Crown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getUsers, getUserStats, getUserDetails, updateUser, deleteUser,
} from '../services/userAdminService';

const ROLE_OPTIONS = [
  { value: 'user', label: 'مستخدم', badge: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' },
  { value: 'admin', label: 'مدير', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  { value: 'super_admin', label: 'مدير عام', badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' },
  { value: 'moderator', label: 'مشرف', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  { value: 'editor', label: 'محرر', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  { value: 'researcher', label: 'باحث', badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  { value: 'inactive', label: 'غير نشط', badge: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' },
  { value: 'suspended', label: 'موقوف', badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
];

const PLAN_OPTIONS = [
  { value: 'free', label: 'مجاني', badge: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' },
  { value: 'premium', label: 'مميز', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  { value: 'elite', label: 'خاص', badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'تاريخ التسجيل' },
  { value: 'lastLoginAt', label: 'آخر نشاط' },
  { value: 'name', label: 'الاسم' },
  { value: 'updatedAt', label: 'آخر تحديث' },
  { value: 'membership', label: 'العضوية' },
];

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const formatDate = (ts) => {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (ts) => {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
};

function Badge({ value, options, fallback, icon: Icon }) {
  const opt = options.find(o => o.value === value);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${opt ? opt.badge : fallback}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {opt ? opt.label : value || '—'}
    </span>
  );
}

function Avatar({ user, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-lg' };
  const fullName = user.fullName || user.email || 'User';
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/40 dark:ring-gray-700/50`}>
      {user.profileImage ? (
        <img src={user.profileImage} alt={fullName} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center text-white font-bold ${getAvatarColor(fullName)}`}>
          {getInitials(fullName)}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, loading, tone }) {
  const tones = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400',
    violet: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/30 text-violet-700 dark:text-violet-400',
  };
  return (
    <div className={`p-4 rounded-xl border ${tones[tone] || tones.emerald}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {loading ? (
        <div className="mt-2 h-7 w-16 bg-current/20 rounded-lg animate-pulse" />
      ) : (
        <p className="mt-1 text-2xl font-bold">{value?.toLocaleString('en-US')}</p>
      )}
    </div>
  );
}

const Skeleton = () => (
  <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
    </div>
    <div className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="h-16 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 animate-pulse" />
      ))}
    </div>
  </div>
);

const UsersPanel = ({ inPanel = false }) => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [openMenu, setOpenMenu] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const menuRef = useRef(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
      toast.error('تعذر تحميل إحصائيات المستخدمين');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit, sort: sortBy, order: sortOrder };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (membershipFilter) params.membership = membershipFilter;
      const data = await getUsers(params);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter, statusFilter, membershipFilter, sortBy, sortOrder]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const handleSearchSubmit = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setMembershipFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(key);
      setSortOrder(key === 'name' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const handleView = async (user) => {
    setViewUser(user);
    setViewDetails(null);
    setViewLoading(true);
    try {
      const data = await getUserDetails(user.uid);
      setViewDetails(data.user);
    } catch (err) {
      toast.error('تعذر تحميل تفاصيل المستخدم');
      setViewDetails({ ...user, subscription: user.membership, usage: {} });
    } finally {
      setViewLoading(false);
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      specialization: user.specialization || '',
      role: user.role || 'user',
      status: user.status || 'active',
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await updateUser(editUser.uid, editForm);
      toast.success('تم تحديث المستخدم بنجاح');
      setEditUser(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget.uid);
      toast.success('تم إيقاف المستخدم');
      setDeleteTarget(null);
      if (viewUser?.uid === deleteTarget.uid) setViewUser(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const sortIcon = (key) => {
    if (sortBy !== key) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortOrder === 'desc'
      ? <ChevronDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
      : <ChevronUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
  };

  const clickableTh = (label, key) => (
    <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
      <button onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-200">
        {label} {sortIcon(key)}
      </button>
    </th>
  );

  return (
    <div className={inPanel ? 'h-full overflow-y-auto' : 'min-h-screen'}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">المستخدمون</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            إدارة ومراقبة جميع المستخدمين المسجلين على المنصة.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="إجمالي المستخدمين" value={stats?.total} loading={statsLoading} tone="emerald" />
          <StatCard icon={BadgeCheck} label="مستخدمون نشطون" value={stats?.active} loading={statsLoading} tone="blue" />
          <StatCard icon={UserPlus} label="مستخدمون جدد" value={stats?.newUsers} loading={statsLoading} tone="amber" />
          <StatCard icon={Crown} label="مستخدمون مميزون" value={stats?.premium} loading={statsLoading} tone="violet" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="بحث بالاسم أو البريد الإلكتروني..."
                className="w-full pr-9 pl-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow"
              />
            </div>
            <button
              onClick={handleSearchSubmit}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all shadow-sm"
            >
              بحث
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={membershipFilter}
              onChange={(e) => { setMembershipFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white"
            >
              <option value="">كل العضويات</option>
              {PLAN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white"
            >
              <option value="">كل الحالات</option>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white"
            >
              <option value="">كل الأدوار</option>
              {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              تصفير
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20 text-center gap-4">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">فشل تحميل المستخدمين</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">حدث خطأ أثناء استرجاع البيانات. حاول مرة أخرى.</p>
            </div>
            <button
              onClick={fetchUsers}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Table */}
        {!error && (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  {clickableTh('المستخدم', 'name')}
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">البريد الإلكتروني</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">الهاتف</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">الدور</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">العضوية</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">الحالة</th>
                  {clickableTh('تاريخ التسجيل', 'createdAt')}
                  {clickableTh('آخر نشاط', 'lastLoginAt')}
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={9} className="px-4 py-4">
                        <div className="h-8 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                          {search || roleFilter || statusFilter || membershipFilter ? 'لا يوجد مستخدمون مطابقون' : 'لا يوجد مستخدمون'}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          {(search || roleFilter || statusFilter || membershipFilter)
                            ? 'جرّب تغيير البحث أو عوامل التصفية.'
                            : 'سيظهر المستخدمون المسجلون هنا.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : users.map((u) => (
                  <tr key={u.uid} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} />
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-900 dark:text-white truncate">{u.fullName || '—'}</div>
                          {u.specialization && (
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{u.specialization}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-zinc-600 dark:text-zinc-300" dir="ltr">{u.email || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5" dir="ltr">
                        <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                        {u.phoneNumber || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={u.role} options={ROLE_OPTIONS} fallback="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300" />
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={u.membership?.plan} options={PLAN_OPTIONS} fallback="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" />
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={u.status} options={STATUS_OPTIONS} fallback="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" />
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(u.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Activity className="w-3 h-3" />
                        {formatDate(u.lastLoginAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative" ref={menuRef}>
                        <button
                          onClick={() => setOpenMenu(openMenu === u.uid ? null : u.uid)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenu === u.uid && (
                          <div className="absolute left-0 top-full mt-1 z-50 w-40 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg overflow-hidden">
                            <button
                              onClick={() => { setOpenMenu(null); handleView(u); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                            >
                              <Eye className="w-4 h-4" />
                              عرض
                            </button>
                            <button
                              onClick={() => { setOpenMenu(null); openEdit(u); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                            >
                              <Pencil className="w-4 h-4" />
                              تعديل
                            </button>
                            <button
                              onClick={() => { setOpenMenu(null); setDeleteTarget(u); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                              حذف
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!error && total > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              عرض {start}–{end} من {total} مستخدم
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-sm border border-zinc-300 dark:border-zinc-700 disabled:opacity-50 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                السابق
              </button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-sm transition-all ${
                      page === n
                        ? 'bg-emerald-600 text-white'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-sm border border-zinc-300 dark:border-zinc-700 disabled:opacity-50 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setViewUser(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease]" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">تفاصيل المستخدم</h3>
              <button onClick={() => setViewUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {viewLoading ? (
                <div className="space-y-3">
                  <div className="h-20 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />
                  <div className="h-20 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />
                  <div className="h-20 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />
                </div>
              ) : (
                <>
                  {/* Account info */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3">معلومات الحساب</h4>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar user={viewDetails || viewUser} size="lg" />
                      <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{viewDetails?.fullName || viewUser.fullName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400" dir="ltr">{viewDetails?.email || viewUser.email}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">الدور</span>
                        <div className="mt-1"><Badge value={viewDetails?.role || viewUser.role} options={ROLE_OPTIONS} fallback="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300" /></div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">الحالة</span>
                        <div className="mt-1"><Badge value={viewDetails?.status || viewUser.status} options={STATUS_OPTIONS} fallback="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" /></div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">العضوية</span>
                        <div className="mt-1"><Badge value={viewDetails?.subscription?.plan || viewUser.membership?.plan} options={PLAN_OPTIONS} fallback="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" /></div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">تاريخ التسجيل</span>
                        <div className="mt-1 font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                          {formatDateTime(viewDetails?.createdAt || viewUser.createdAt)}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">آخر تسجيل دخول</span>
                        <div className="mt-1 font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-gray-400" />
                          {formatDateTime(viewDetails?.lastLoginAt || viewUser.lastLoginAt)}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">الهاتف</span>
                        <div className="mt-1 font-medium text-gray-900 dark:text-white flex items-center gap-1.5" dir="ltr">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {viewDetails?.phoneNumber || viewUser.phoneNumber || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Membership info */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3">معلومات العضوية</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">الخطة</span>
                        <div className="mt-1 font-medium text-gray-900 dark:text-white">
                          {viewDetails?.subscription?.plan || viewUser.membership?.plan || 'free'}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">حالة الاشتراك</span>
                        <div className="mt-1 font-medium text-gray-900 dark:text-white">
                          {viewDetails?.subscription?.status || '—'}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">دورة الفوترة</span>
                        <div className="mt-1 font-medium text-gray-900 dark:text-white">
                          {viewDetails?.subscription?.billingCycle || '—'}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">تاريخ البدء</span>
                        <div className="mt-1 font-medium text-gray-900 dark:text-white">
                          {formatDateTime(viewDetails?.subscription?.startDate)}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-xs text-gray-500 dark:text-gray-400">تاريخ الانتهاء</span>
                        <div className="mt-1 font-medium text-gray-900 dark:text-white">
                          {formatDateTime(viewDetails?.subscription?.expirationDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => { setViewUser(null); openEdit(viewDetails || viewUser); }}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                تعديل
              </button>
              <button
                onClick={() => { setViewUser(null); setDeleteTarget(viewUser); }}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setEditUser(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">تعديل المستخدم</h3>
              <button onClick={() => setEditUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">الاسم الكامل</label>
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">رقم الهاتف</label>
                <input
                  type="text"
                  value={editForm.phoneNumber || ''}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  dir="ltr"
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">التخصص</label>
                <input
                  type="text"
                  value={editForm.specialization || ''}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">الدور</label>
                  <select
                    value={editForm.role || 'user'}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow text-sm"
                  >
                    {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">الحالة</label>
                  <select
                    value={editForm.status || 'active'}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow text-sm"
                  >
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  {editSaving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm animate-[slideUp_0.3s_ease]" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">حذف المستخدم؟</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                هل أنت متأكد من حذف {deleteTarget.fullName || 'هذا المستخدم'}؟ سيتم إيقاف الحساب ولا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl transition-colors"
                >
                  {deleteLoading ? 'جارٍ الحذف...' : 'حذف'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPanel;
