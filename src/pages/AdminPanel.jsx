import { useState, useEffect } from 'react';
import { BarChart3, FileText, CreditCard, Search, DollarSign, CheckCircle, XCircle, Clock, Check, Ban, Smartphone } from 'lucide-react';
import { getPayments, activateVodafoneCashPayment, rejectVodafoneCashPayment } from '../services/subscriptionService';
import { toast } from 'sonner';
import AdminBlogPage from './blog/AdminBlogPage';
import ActionStatsScreen from '../component/admin-stats';
import SEO from '../component/SEO';

const AdminPanel = () => {
  const [tab, setTab] = useState('blog');

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 pt-[80px]" dir="rtl">
      <SEO title="لوحة التحكم" description="لوحة التحكم الخاصة بمنصة Hefno-Plant — إدارة المحتوى والمقالات والإحصائيات." url="/admin-panel" noindex={true} />

      <div className="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTab('blog')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === 'blog'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FileText size={16} />
              المقالات
            </button>
            <button
              onClick={() => setTab('stats')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === 'stats'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <BarChart3 size={16} />
              الإحصائيات
            </button>
            <button
              onClick={() => setTab('payments')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === 'payments'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <CreditCard size={16} />
              المدفوعات
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'blog' ? (
          <AdminBlogPage inPanel />
        ) : tab === 'stats' ? (
          <ActionStatsScreen inPanel />
        ) : (
          <PaymentsPanel />
        )}
      </div>
    </div>
  );
};

function PaymentsPanel() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const data = await getPayments(params);
      setPayments(data.payments || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchPayments();
  };

  useEffect(() => { fetchPayments(); }, [page, statusFilter]);

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((s, p) => s + (p.amount || 0), 0);
  const successCount = payments.filter(p => p.status === 'paid').length;
  const failedCount = payments.filter(p => p.status !== 'paid').length;

  const handleReject = async (paymentId) => {
    try {
      await rejectVodafoneCashPayment(paymentId);
      toast.success('تم إلغاء الطلب');
      fetchPayments();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleActivate = async (paymentId) => {
    try {
      await activateVodafoneCashPayment(paymentId);
      toast.success('تم تفعيل الاشتراك بنجاح');
      fetchPayments();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">إدارة المدفوعات</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">الإيرادات</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-300">{totalRevenue} ج.م</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">ناجحة</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-blue-800 dark:text-blue-300">{successCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">فاشلة</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-red-800 dark:text-red-300">{failedCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white"
        >
          <option value="">جميع الحالات</option>
          <option value="paid">ناجحة</option>
          <option value="failed">فاشلة</option>
          <option value="pending">معلقة</option>
        </select>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="بحث ..."
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white flex-1 min-w-[200px]"
        />
        <button onClick={handleSearch}
          className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-opacity">
          <Search className="w-4 h-4 inline ml-1" />
          بحث
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">المعاملات</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">المستخدم</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">الباقة</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">الطريقة</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">المبلغ</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">الحالة</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">التاريخ</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-400">جاري التحميل...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-400">لا توجد مدفوعات</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">{p.transactionId || p.id}</td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300" dir="ltr">{p.userId?.slice(0, 12)}..</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.plan === 'elite'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {p.plan} {p.billingCycle === 'monthly' ? 'شهري' : 'سنوي'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {p.paymentMethod === 'vodafone_cash' || p.provider === 'vodafone_cash' ? (
                      <>
                        <Smartphone className="w-3 h-3" />
                        فودافون كاش
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3 h-3" />
                        بطاقة
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{p.amount} ج.م</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                    p.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' :
                    p.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                    'text-amber-600 dark:text-amber-400'
                  }`}>
                    {p.status === 'paid' ? <CheckCircle className="w-3 h-3" /> :
                     p.status === 'failed' ? <XCircle className="w-3 h-3" /> :
                     <Clock className="w-3 h-3" />}
                    {p.status === 'paid' ? 'ناجحة' : p.status === 'failed' ? 'فاشلة' : 'معلقة'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(p.createdAt).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-4 py-3">
                  {p.status === 'pending' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleActivate(p.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                      >
                        <Check className="w-3 h-3" />
                        تفعيل
                      </button>
                      <button
                        onClick={() => handleReject(p.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/50"
                      >
                        <Ban className="w-3 h-3" />
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg text-sm border border-zinc-300 dark:border-zinc-700 disabled:opacity-50 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            السابق
          </button>
          <span className="text-sm text-zinc-500">صفحة {page} من {Math.ceil(total / limit)}</span>
          <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg text-sm border border-zinc-300 dark:border-zinc-700 disabled:opacity-50 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
