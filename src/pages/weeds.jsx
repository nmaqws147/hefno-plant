import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, X, Bug, Shield, Calendar,
  Search, Info, Sprout, Leaf, ShieldCheck, FlaskConical,
  BookOpen, RefreshCw, AlertCircle
} from 'lucide-react';
import SEO from '../component/SEO';
import { makeBreadcrumbs } from '../component/structuredData';
import weedsData from '../knowledge_base/Weeds/data.json';

const ITEMS_PER_PAGE = 5;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button key={page} onClick={() => onPageChange(page)}
          className={`min-w-[36px] h-9 px-2 rounded-xl text-sm font-bold transition-all ${
            page === currentPage
              ? 'bg-emerald-600 text-white shadow-md'
              : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}>
          {page}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
};

const WeedsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedWeed, setSelectedWeed] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setData(weedsData);
    if (weedsData?.weed_categories?.[0]) {
      setActiveCategory(weedsData.weed_categories[0].id);
    }
  }, []);

  const openModal = (weed) => {
    setSelectedWeed(weed);
    setShowModal(true);
    setActiveTab('overview');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedWeed(null);
  };

  const getDangerClass = (level) => {
    if (!level) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    if (level.includes('جداً') || level.includes('جدا')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (level.includes('عالية')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    if (level.includes('منخفضة')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (level.includes('متوسطة')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  const activeCategoryData = data?.weed_categories?.find(cat => cat.id === activeCategory) || null;
  const allWeeds = activeCategoryData?.weeds || [];
  const totalPages = Math.ceil(allWeeds.length / ITEMS_PER_PAGE);
  const paginatedWeeds = allWeeds.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const months = data?.weed_management_calendar?.months || [];
  const organicMethods = data?.organic_weed_management?.methods_ar || [];
  const tips = data?.card_display_config?.quick_tips_ar || [];
  const stats = data?.card_display_config?.highlight_stats || [];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">جاري تحميل بيانات الحشائش...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" dir="rtl">
      <SEO title="الحشائش الضارة" description="دليل الحشائش الضارة في الزراعة — أنواعها، طرق مكافحتها، وإدارتها المتكاملة." url="/knowledge-base/weeds" keywords="الحشائش الضارة, مكافحة الحشائش, أنواع الحشائش, مبيدات الحشائش, weeds" breadcrumbs={makeBreadcrumbs('/knowledge-base/weeds')} />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

        <button onClick={() => navigate('/knowledge-base')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/80 transition-colors mb-4">
          <ChevronRight className="w-4 h-4" />
          <span>العودة</span>
        </button>

        <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <Sprout size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data.metadata.name_ar}</h1>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{data.metadata.name_en}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-4 shadow-sm text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value_ar}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label_ar}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {data.weed_categories.map(cat => (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              {cat.name_ar}
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeCategory === cat.id ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
              }`}>{cat.weeds?.length || 0}</span>
            </button>
          ))}
        </div>

        {activeCategoryData && (
          <>
            <div className="bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-5 mb-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeCategoryData.name_ar}</h2>
              <p className="text-xs italic text-gray-500 dark:text-gray-400 mb-1">{activeCategoryData.name_en}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activeCategoryData.description_ar}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedWeeds.map(weed => (
                <div key={weed.id} onClick={() => openModal(weed)}
                  className="group p-4 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 duration-300 cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{weed.name_ar}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${getDangerClass(weed.danger_level)}`}>{weed.danger_level}</span>
                  </div>
                  <p className="text-xs italic text-gray-400 dark:text-gray-500 truncate mb-1.5">{weed.name_scientific}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">{weed.description_ar}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[11px] text-gray-500">{weed.type_ar}</span>
                    <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[11px] text-gray-500">{weed.family_ar}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700/50">
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 transition-all flex items-center gap-1">
                      عرض التفاصيل <ChevronLeft size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}

        {tips.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 mt-8">
              <AlertCircle size={20} className="text-emerald-500" /> نصائح سريعة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl shadow-sm">
                  <AlertCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {months.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-emerald-500" /> التقويم الشهري لمكافحة الحشائش
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {months.map((m, i) => (
                <div key={i} className="bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{m.months_ar}</span>
                    <span className="text-xs text-gray-500">{m.season_ar}</span>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5">الحشائش النشطة:</p>
                    <div className="flex flex-wrap gap-1">
                      {m.active_weeds_ar?.map((w, j) => (
                        <span key={j} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[11px] text-gray-600">{w}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">الإجراءات:</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {m.recommended_actions_ar?.map((a, j) => (
                        <li key={j}>• {a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {organicMethods.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Leaf size={20} className="text-emerald-500" /> المكافحة العضوية المتكاملة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {organicMethods.map((m, i) => (
                <div key={i} className="bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{m.method_ar}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{m.details_ar}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{m.effectiveness_ar}</span>
                    <div className="flex flex-wrap gap-1">
                      {m.crops_ar?.map((c, j) => (
                        <span key={j} className="px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[10px] text-gray-500">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {showModal && selectedWeed && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-t-2xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Sprout size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{selectedWeed.name_ar}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{selectedWeed.name_scientific}</p>
              </div>
              <button onClick={closeModal}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-1 px-5 pt-3 border-b border-gray-200/80 dark:border-gray-700/50">
              <button onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'overview' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <BookOpen size={14} /> نظرة عامة
              </button>
              <button onClick={() => setActiveTab('identification')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'identification' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <Search size={14} /> التعريف
              </button>
              <button onClick={() => setActiveTab('management')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'management' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <Shield size={14} /> المكافحة
              </button>
              <button onClick={() => setActiveTab('reproduction')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'reproduction' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <RefreshCw size={14} /> التكاثر
              </button>
            </div>

            <div className="p-5 space-y-4">
              {activeTab === 'overview' && (
                <>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                      <Info size={14} className="text-emerald-500" /> الوصف
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{selectedWeed.description_ar}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                      <p className="text-xs text-gray-500">العائلة</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedWeed.family_ar}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                      <p className="text-xs text-gray-500">النوع</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedWeed.type_ar}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                      <p className="text-xs text-gray-500">درجة الخطر</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold mt-0.5 ${getDangerClass(selectedWeed.danger_level)}`}>{selectedWeed.danger_level}</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                      <p className="text-xs text-gray-500">الموطن</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedWeed.habitat_ar?.join('، ')}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                      <Sprout size={14} className="text-emerald-500" /> المحاصيل المتضررة
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedWeed.affected_crops_ar?.map((crop, j) => (
                        <div key={j} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl px-3 py-1.5">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{crop.crop_ar}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${getDangerClass(crop.severity)}`}>{crop.severity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedWeed.allelopathy_ar && selectedWeed.allelopathy_ar !== 'لا' && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-xl">
                      <h4 className="font-bold text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-1">
                        <FlaskConical size={12} /> الأليلوباثي (التثبيط الكيميائي)
                      </h4>
                      <p className="text-xs text-amber-600 dark:text-amber-300">{selectedWeed.allelopathy_ar}</p>
                    </div>
                  )}

                  {selectedWeed.useful_notes_ar && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl">
                      <h4 className="font-bold text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1 mb-1">
                        <AlertCircle size={12} /> ملاحظات
                      </h4>
                      <p className="text-xs text-blue-600 dark:text-blue-300">{selectedWeed.useful_notes_ar}</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'identification' && selectedWeed.identification && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'الارتفاع', value: selectedWeed.identification.height_cm },
                    { label: 'الأوراق', value: selectedWeed.identification.leaf_ar },
                    { label: 'الساق', value: selectedWeed.identification.stem_ar },
                    { label: 'الأزهار', value: selectedWeed.identification.flower_ar },
                    { label: 'البذور', value: selectedWeed.identification.seed_ar },
                    { label: 'الجذور', value: selectedWeed.identification.root_ar },
                    { label: 'الموسم', value: selectedWeed.identification.season_ar },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'management' && selectedWeed.management && (
                <div className="space-y-4">
                  {selectedWeed.management.prevention_ar?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                        <ShieldCheck size={14} className="text-emerald-500" /> الوقاية
                      </h3>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 pr-1">
                        {selectedWeed.management.prevention_ar.map((item, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedWeed.management.cultural_ar?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                        <Sprout size={14} className="text-emerald-500" /> المكافحة الزراعية
                      </h3>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 pr-1">
                        {selectedWeed.management.cultural_ar.map((item, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedWeed.management.mechanical_ar?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                        <Bug size={14} className="text-emerald-500" /> المكافحة الميكانيكية
                      </h3>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 pr-1">
                        {selectedWeed.management.mechanical_ar.map((item, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedWeed.management.herbicides?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                        <FlaskConical size={14} className="text-emerald-500" /> المبيدات الموصى بها
                      </h3>
                      <div className="space-y-2">
                        {selectedWeed.management.herbicides.map((herb, j) => (
                          <div key={j} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{herb.active_ingredient_ar}</p>
                            <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-500">
                              <div><span className="block text-gray-400">الجرعة</span>{herb.dose_ar}</div>
                              <div><span className="block text-gray-400">الطريقة</span>{herb.method_ar}</div>
                              <div><span className="block text-gray-400">التوقيت</span>{herb.timing_ar}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedWeed.management.organic_control_ar?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                        <Leaf size={14} className="text-emerald-500" /> المكافحة العضوية
                      </h3>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 pr-1">
                        {selectedWeed.management.organic_control_ar.map((item, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reproduction' && selectedWeed.reproduction_ar && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                      <p className="text-xs text-gray-500">عدد البذور</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedWeed.reproduction_ar.seeds_per_plant}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                      <p className="text-xs text-gray-500">عمر البذور في التربة</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedWeed.reproduction_ar.viability_years}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 sm:col-span-2">
                      <p className="text-xs text-gray-500">طرق الانتشار</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedWeed.reproduction_ar.spread_ar}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                      <RefreshCw size={14} className="text-emerald-500" /> طرق التكاثر
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedWeed.reproduction_ar.methods_ar?.map((method, j) => (
                        <span key={j} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300">{method}</span>
                      ))}
                    </div>
                  </div>

                  {selectedWeed.reproduction_ar.tubers_per_plant && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                      <p className="text-xs text-gray-500">الدرنات لكل نبات</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedWeed.reproduction_ar.tubers_per_plant}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeedsPage;
