import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ChevronLeft, X, AlertTriangle, Search, Bug, Layers, Info, Shield, Sprout, Calendar, FlaskConical, RefreshCw, Thermometer } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const orderColors = {
  Lepidoptera: { border: 'border-r-[3px] border-lime-500', badge: 'bg-lime-100 dark:bg-lime-900/40 text-lime-600 dark:text-lime-400', gradient: 'from-lime-500 to-lime-600', tabActive: 'bg-lime-50 dark:bg-lime-950/40 text-lime-700 dark:text-lime-400' },
  Coleoptera: { border: 'border-r-[3px] border-red-500', badge: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400', gradient: 'from-red-500 to-red-600', tabActive: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400' },
  Hemiptera: { border: 'border-r-[3px] border-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-500 to-emerald-600', tabActive: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' },
  Thysanoptera: { border: 'border-r-[3px] border-purple-500', badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400', gradient: 'from-purple-500 to-purple-600', tabActive: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400' },
  Orthoptera: { border: 'border-r-[3px] border-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400', gradient: 'from-amber-500 to-amber-600', tabActive: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' },
  Diptera: { border: 'border-r-[3px] border-blue-500', badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-blue-600', tabActive: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' },
};
const defaultColor = { border: 'border-r-[3px] border-gray-500', badge: 'bg-gray-100 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400', gradient: 'from-gray-500 to-gray-600', tabActive: 'bg-gray-50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-400' };

const orderEmojis = {
  Lepidoptera: '🦋', Coleoptera: '🐞', Hemiptera: '🦟',
  Thysanoptera: '🐜', Orthoptera: '🦗', Diptera: '🪰',
};

const getSeverityClass = (sev) => {
  if (!sev) return 'bg-gray-500 text-white';
  if (sev.includes('very high') || sev.includes('شديد جداً')) return 'bg-red-500 text-white';
  if (sev.includes('high') || sev.includes('شديد') || sev.includes('عالية')) return 'bg-orange-500 text-white';
  if (sev.includes('moderate') || sev.includes('متوسط') || sev.includes('متوسطة')) return 'bg-yellow-500 text-white';
  if (sev.includes('low') || sev.includes('خفيف') || sev.includes('خفيفة')) return 'bg-emerald-500 text-white';
  return 'bg-gray-500 text-white';
};

const getSeverityText = (sev) => {
  if (!sev) return 'غير محدد';
  if (sev.includes('very high') || sev.includes('شديد جداً')) return 'شديد جداً';
  if (sev.includes('high') || sev.includes('شديد') || sev.includes('عالية')) return 'شديد';
  if (sev.includes('moderate') || sev.includes('متوسط') || sev.includes('متوسطة')) return 'متوسط';
  if (sev.includes('low') || sev.includes('خفيف') || sev.includes('خفيفة')) return 'خفيف';
  return 'غير محدد';
};

const modalTabs = [
  { id: 'symptoms', label: 'الأعراض والتشخيص' },
  { id: 'management', label: 'برنامج الإدارة والمكافحة' },
  { id: 'biology', label: 'البيولوجيا ودورة الحياة' },
];

const InsectOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('symptoms');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const data = await import('../knowledge_base/insects/insects-folder/data.json');
        const allData = data.default;
        const selectedOrder = allData[orderId];
        if (selectedOrder) {
          setOrder({ id: orderId, ...selectedOrder });
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error("خطأ في تحميل بيانات الرتبة:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrderData();
  }, [orderId]);

  const color = orderColors[orderId] || defaultColor;
  const emoji = orderEmojis[orderId] || '🐛';

  const filteredInsects = order?.pathogens?.filter(insect => {
    const matchesSearch = searchTerm === '' ||
      insect.name_ar.includes(searchTerm) ||
      insect.scientificName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || insect.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  }) || [];

  const totalPages = Math.max(1, Math.ceil(filteredInsects.length / ITEMS_PER_PAGE));
  const paginated = filteredInsects.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openModal = (insect) => {
    setSelected(insect);
    setShowModal(true);
    setActiveTab('symptoms');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-gray-900" dir="rtl">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">جاري تحميل بيانات الرتبة الحشرية...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4" dir="rtl">
        <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 shadow-lg">
          <div className="inline-flex p-4 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-2xl mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">الرتبة غير موجودة</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">عذراً، لم نتمكن من العثور على الرتبة الحشرية المطلوبة في قاعدة البيانات.</p>
          <button
            onClick={() => navigate('/knowledge-base/insects')}
            className="mt-6 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors shadow-md"
          >
            العودة إلى قائمة الرتب
          </button>
        </div>
      </div>
    );
  }

  const insectCount = order.pathogens?.length || order.pathogens_count || 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <Helmet>
        <title>{order.order_ar} | رتب الحشرات | Hefno-Plant</title>
        <meta name="description" content={`دليل رتبة ${order.order_ar} — معلومات شاملة عن الآفات الحشرية.`} />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/knowledge-base/insects')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/80"
        >
          <ChevronRight size={16} />
          <span>العودة إلى الرتب</span>
        </button>

        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color.gradient} text-white shadow-lg shrink-0`}>
              <span className="text-2xl">{emoji}</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{order.order_ar}</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">{order.order_en}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.order_description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <AlertTriangle size={14} />
                  {insectCount} نوع حشري
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100/40 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Layers size={14} />
                  {order.families_count} عائلة
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              className="w-full pr-10 pl-9 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              placeholder="ابحث عن آفة..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setPage(1); }}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-44 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/60 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
          >
            <option value="all">كل درجات الخطورة</option>
            <option value="very high">شديد جداً</option>
            <option value="high">شديد</option>
            <option value="medium">متوسط</option>
            <option value="low">خفيف</option>
          </select>
        </div>

        {filteredInsects.length > 0 && (
          <div className="mb-4 text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1.5 px-1">
            عرض {filteredInsects.length} من أصل {insectCount} آفة مسجلة
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((insect) => (
            <div
              key={insect.id}
              onClick={() => openModal(insect)}
              className={`group cursor-pointer rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${color.border}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{insect.name_ar}</h3>
                  <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{insect.scientificName}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityClass(insect.severity)}`}>
                  {getSeverityText(insect.severity)}
                </span>
              </div>

              <p className="text-xs leading-relaxed line-clamp-2 text-gray-500 dark:text-gray-400 mb-3">
                {insect.fullDescription?.substring(0, 120)}...
              </p>

              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3 mt-2">
                <div className="flex flex-wrap gap-1">
                  {insect.family_ar && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] text-gray-500">{insect.family_ar}</span>
                  )}
                  {insect.hostPlants?.slice(0, 1).map((h) => (
                    <span key={h} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] text-gray-500">{h}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  التفاصيل <ChevronLeft size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInsects.length === 0 && (
          <div className="max-w-md mx-auto text-center mt-16 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 shadow-sm">
            <div className="inline-flex p-3.5 bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-400 rounded-xl mb-3">
              <Search size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">لا توجد نتائج مطابقة لبحثك</h3>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              لم نجد أي تطابق للمصطلح "<span className="text-emerald-600 font-semibold dark:text-emerald-400">{searchTerm}</span>" في هذه الرتبة.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSeverityFilter('all'); }}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl transition-colors shadow-sm"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all disabled:opacity-30 enabled:hover:bg-emerald-50 dark:enabled:hover:bg-emerald-900/30 text-gray-600 dark:text-gray-400"
            >
              <ChevronRight size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  page === p
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all disabled:opacity-30 enabled:hover:bg-emerald-50 dark:enabled:hover:bg-emerald-900/30 text-gray-600 dark:text-gray-400"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        )}

        {showModal && selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <div
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-900 shadow-2xl animate-modal-in"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-5 py-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color.badge} shrink-0 text-xl`}>
                  <span>{emoji}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">{selected.name_ar}</h2>
                  <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{selected.scientificName}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex gap-1 border-b border-gray-100 dark:border-gray-800 px-5 pt-2 overflow-x-auto">
                {modalTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[11px] font-bold transition-all rounded-t-xl ${
                      activeTab === tab.id
                        ? `${color.tabActive}`
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-4">
                {activeTab === 'symptoms' && (
                  <>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <Info size={12} /> وصف الآفة
                      </h3>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{selected.fullDescription}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <Search size={12} /> الأعراض التشخيصية
                      </h3>
                      <ul className="space-y-1.5">
                        {selected.symptoms?.map((s, i) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5 shrink-0">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-lime-700 dark:text-lime-300">
                        <Sprout size={12} /> العوائل النباتية
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.hostPlants?.map((h, i) => (
                          <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{h}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <AlertTriangle size={12} /> العتبة الاقتصادية
                      </h3>
                      <p className="text-xs text-amber-700 dark:text-amber-300">{selected.economicThreshold}</p>
                    </div>
                  </>
                )}

                {activeTab === 'management' && (
                  <>
                    {selected.management?.cultural?.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                          <Sprout size={12} /> المكافحة الزراعية
                        </h3>
                        <ul className="space-y-1.5">
                          {selected.management.cultural.map((item, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selected.management?.biological?.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300">
                          <Shield size={12} /> المكافحة الحيوية
                        </h3>
                        <ul className="space-y-1.5">
                          {selected.management.biological.map((item, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selected.management?.chemical?.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                          <FlaskConical size={12} /> المكافحة الكيميائية
                        </h3>
                        <ul className="space-y-1.5">
                          {selected.management.chemical.map((item, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selected.naturalEnemies?.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <Bug size={12} /> الأعداء الطبيعيين
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.naturalEnemies.map((e, i) => (
                            <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{e}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'biology' && (
                  <>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <RefreshCw size={12} /> دورة الحياة
                      </h3>
                      {selected.lifeCycle?.egg && (
                        <div className="mb-2">
                          <span className="text-[10px] font-bold text-gray-500">البيضة:</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{selected.lifeCycle.egg}</p>
                        </div>
                      )}
                      {selected.lifeCycle?.larva && (
                        <div className="mb-2">
                          <span className="text-[10px] font-bold text-gray-500">اليرقة:</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{selected.lifeCycle.larva}</p>
                        </div>
                      )}
                      {selected.lifeCycle?.pupa && (
                        <div className="mb-2">
                          <span className="text-[10px] font-bold text-gray-500">العذراء:</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{selected.lifeCycle.pupa}</p>
                        </div>
                      )}
                      {selected.lifeCycle?.adult && (
                        <div className="mb-2">
                          <span className="text-[10px] font-bold text-gray-500">الحشرة الكاملة:</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{selected.lifeCycle.adult}</p>
                        </div>
                      )}
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <Calendar size={12} /> الأجيال السنوية
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{selected.generationsPerYear}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <Thermometer size={12} /> الظروف المثلى للإصابة
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{selected.favorableConditions}</p>
                    </div>
                    <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                        <AlertTriangle size={12} /> مخاطر المقاومة
                      </h3>
                      <p className="text-xs text-rose-700 dark:text-rose-300">{selected.resistanceRisk}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-modal-in { animation: modalIn 0.3s ease; }
      `}</style>
    </div>
  );
};

export default InsectOrderPage;
