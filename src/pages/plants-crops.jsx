import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../component/SEO';
import { makeBreadcrumbs } from '../component/structuredData';
import { ChevronRight, ChevronLeft, Wheat, Apple, Leaf, Flower2, Sprout, Info, Calendar, Droplets, FlaskConical, MapPin, Clock, Sun, X, Shield, AlertTriangle, Heart } from 'lucide-react';
import plantsData from '../knowledge_base/crops/data.json';

const ITEMS_PER_PAGE = 5;

const plantIcons = {
  قمح: '🌾', 'ذرة شامية': '🌽', أرز: '🍚', قطن: '🧶', 'فول بلدي': '🫛', 'بنجر السكر': '🍠',
  سمسم: '🥯', 'فول سوداني': '🥜', فاصوليا: '🫘', عدس: '🍲', حمص: '🫘', 'قصب السكر': '🎋',
  طماطم: '🍅', بطاطس: '🥔', بصل: '🧅', خيار: '🥒', فلفل: '🌶️', جرجير: '🥬',
  سبانخ: '🍃', ملوخية: '🌿', باذنجان: '🍆', جزر: '🥕', كوسة: '/images/plants/kosa.png',
  برتقال: '🍊', مانجو: '🥭', فراولة: '🍓', عنب: '🍇', رمان: '🍑', تين: '🫐', موز: '🍌',
  'وردة (نبات الورد)': '🌹', 'نخيل الزينة': '🌴', ياسمين: '🌸', بوجينفيليا: '🌺', كالانكو: '🌷',
  كمون: '/images/plants/cumin.png', نعناع: '🍃', بابونج: '🌼', حلبة: '🌱', شمر: '/images/plants/fennel.png', ريحان: '🪴',
};

const plantBorderColors = {
  'grp-field': 'border-r-[3px] border-amber-500',
  'grp-vegetables': 'border-r-[3px] border-emerald-500',
  'grp-fruits': 'border-r-[3px] border-orange-500',
  'grp-ornamental': 'border-r-[3px] border-pink-500',
  'grp-medicinal': 'border-r-[3px] border-purple-500',
};

const plantBadgeColors = {
  'grp-field': 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  'grp-vegetables': 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  'grp-fruits': 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  'grp-ornamental': 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400',
  'grp-medicinal': 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
};

const getPlantIcon = (plant) => plantIcons[plant.name_ar] || '🌱';

const renderPlantIcon = (plant, size = 'text-lg') => {
  const icon = getPlantIcon(plant);
  if (icon.startsWith('/')) {
    return <img src={icon} alt="" className={`w-6 h-6 object-contain`} />;
  }
  return <span className={size}>{icon}</span>;
};

const getPlantBorderColor = (groupId) => plantBorderColors[groupId] || 'border-r-[3px] border-gray-500';

const getPlantBadgeColor = (groupId) => plantBadgeColors[groupId] || 'bg-gray-100 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400';

const groupIcons = {
  'grp-field': Wheat,
  'grp-vegetables': Sprout,
  'grp-fruits': Apple,
  'grp-ornamental': Flower2,
  'grp-medicinal': Leaf,
};

const groupColors = {
  'grp-field': { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-900/40', gradient: 'from-amber-500 to-amber-600', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  'grp-vegetables': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-900/40', gradient: 'from-emerald-500 to-emerald-600', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  'grp-fruits': { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200/60 dark:border-orange-900/40', gradient: 'from-orange-500 to-orange-600', badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
  'grp-ornamental': { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-200/60 dark:border-pink-900/40', gradient: 'from-pink-500 to-pink-600', badge: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400' },
  'grp-medicinal': { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-900/40', gradient: 'from-purple-500 to-purple-600', badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
};

const getSeasonClass = (season) => {
  if (season.includes('شتوي')) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30';
  if (season.includes('صيفي')) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
  if (season.includes('ربيع')) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30';
  if (season.includes('خريف')) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30';
  return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50';
};

const getSeverityClass = (severity) => {
  if (severity.includes('عالية جدا')) return 'bg-red-500 text-white';
  if (severity.includes('عالية')) return 'bg-orange-500 text-white';
  if (severity.includes('متوسطة')) return 'bg-yellow-500 text-white';
  if (severity.includes('منخفضة')) return 'bg-emerald-500 text-white';
  return 'bg-gray-500 text-white';
};

const modalTabs = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'seasons', label: 'المواسم' },
  { id: 'soil', label: 'التربة' },
  { id: 'irrigation', label: 'الري' },
  { id: 'nutrition', label: 'التسميد' },
  { id: 'pests', label: 'الآفات' },
];

const PlantsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setData(plantsData);
    if (plantsData?.groups?.length > 0) {
      setActiveGroup(plantsData.groups[0].id);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeGroup]);

  const handlePlantClick = (plant) => {
    setSelectedPlant(plant);
    setShowModal(true);
    setActiveTab('overview');
  };

  const getActiveGroupData = () => {
    if (!data?.groups) return null;
    return data.groups.find(g => g.id === activeGroup);
  };

  const activeGroupData = getActiveGroupData();

  const plants = useMemo(() => {
    return activeGroupData?.plants || [];
  }, [activeGroupData]);

  const totalPages = Math.max(1, Math.ceil(plants.length / ITEMS_PER_PAGE));
  const paginatedPlants = plants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-gray-900" dir="rtl">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">جاري تحميل بيانات المحاصيل...</p>
        </div>
      </div>
    );
  }

  const total = data.metadata.total_plants;
  const groupsCount = data.metadata.groups_count;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <SEO title="المحاصيل الزراعية" description="دليل المحاصيل الزراعية — معلومات شاملة عن أنواع المحاصيل وطرق زراعتها ورعايتها." url="/knowledge-base/plants-crops" keywords="محاصيل زراعية, أنواع المحاصيل, زراعة المحاصيل, رعاية المحاصيل, محصول القمح, محصول الأرز" breadcrumbs={makeBreadcrumbs('/knowledge-base/plants-crops')} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/knowledge-base')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/80"
        >
          <ChevronRight size={16} />
          <span>العودة</span>
        </button>

        {/* Header */}
        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 shrink-0">
              <Sprout size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{data.metadata.name_ar}</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">{data.metadata.name_en}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Sprout size={14} />
                  {total} محصول
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100/40 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  {groupsCount} مجموعة
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Group Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {data.groups.map((group) => {
            const GI = groupIcons[group.id] || Flower2;
            const colors = groupColors[group.id] || groupColors['grp-field'];
            return (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  activeGroup === group.id
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30'
                    : `${colors.bg} text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/50 hover:shadow-sm`
                }`}
              >
                <GI size={16} />
                <span>{group.name_ar}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeGroup === group.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'
                }`}>
                  {group.plants_count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Group Info */}
        {activeGroupData && (() => {
          const colors = groupColors[activeGroup] || groupColors['grp-field'];
          const GI = groupIcons[activeGroup] || Flower2;
          return (
            <div className={`mb-6 rounded-2xl border ${colors.border} ${colors.bg} p-5`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-white shadow-lg shrink-0`}>
                  <GI size={18} />
                </div>
                <div>
                  <h2 className={`text-base font-black ${colors.text}`}>{activeGroupData.name_ar}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activeGroupData.name_en}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{activeGroupData.description_ar}</p>
              {activeGroupData.sub_categories && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {activeGroupData.sub_categories.map((cat, idx) => (
                    <span key={idx} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${colors.badge}`}>{cat}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Plants Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedPlants.map((plant) => {
            const groupId = plant.group_id || activeGroup;
            return (
            <div
              key={plant.id}
              onClick={() => handlePlantClick(plant)}
              className={`group cursor-pointer rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${getPlantBorderColor(groupId)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${getPlantBadgeColor(groupId)}`}>
                  {renderPlantIcon(plant)}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getSeasonClass(plant.seasons?.season_type_ar || '')}`}>
                  {plant.seasons?.season_type_ar || 'موسمي'}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-white">{plant.name_ar}</h3>
              <p className="mb-2 text-[11px] italic text-gray-500 dark:text-gray-400">{plant.name_scientific}</p>

              <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                {plant.description_ar?.substring(0, 100)}...
              </p>

              <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-700 pt-3 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    <Calendar size={10} className="ml-1 inline" />
                    موسم الزراعة:
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{plant.seasons?.planting_season_ar || 'غير محدد'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    <Clock size={10} className="ml-1 inline" />
                    مدة النمو:
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{plant.seasons?.growth_duration_days || '-'} يوم</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    <MapPin size={10} className="ml-1 inline" />
                    المناطق:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 line-clamp-1">{plant.geographic_regions_egypt_ar?.slice(0, 2).join('، ') || 'متعددة'}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  عرض التفاصيل
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all disabled:opacity-30 enabled:hover:bg-emerald-50 dark:enabled:hover:bg-emerald-900/30 text-gray-600 dark:text-gray-400"
            >
              <ChevronRight size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all disabled:opacity-30 enabled:hover:bg-emerald-50 dark:enabled:hover:bg-emerald-900/30 text-gray-600 dark:text-gray-400"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedPlant && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setShowModal(false); setSelectedPlant(null); }}
          >
            <div
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-900 shadow-2xl animate-modal-in"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-5 py-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-lg shrink-0 ${getPlantBadgeColor(selectedPlant.group_id || activeGroup)}`}>
                  {renderPlantIcon(selectedPlant, 'text-xl')}
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">{selectedPlant.name_ar}</h2>
                  <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{selectedPlant.name_scientific}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{selectedPlant.name_en}</p>
                </div>
                <button
                  onClick={() => { setShowModal(false); setSelectedPlant(null); }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex gap-1 border-b border-gray-100 dark:border-gray-800 px-5 pt-2 overflow-x-auto">
                {modalTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[11px] font-bold transition-all rounded-t-xl ${
                      activeTab === tab.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-5">
                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <Info size={12} />
                        الوصف
                      </h3>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{selectedPlant.description_ar}</p>
                    </div>

                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">التصنيف:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedPlant.category}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">الأهمية الاقتصادية:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedPlant.economic_importance_ar}</span>
                        </div>
                        {selectedPlant.export_potential && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">تصدير:</span>
                            <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                              <Shield size={10} />
                              محصول تصديري
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedPlant.geographic_regions_egypt_ar && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <MapPin size={12} />
                          مناطق الزراعة في مصر
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPlant.geographic_regions_egypt_ar.map((region, idx) => (
                            <span key={idx} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{region}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPlant.common_varieties_ar && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <Sprout size={12} />
                          الأصناف الشائعة
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPlant.common_varieties_ar.map((variety, idx) => (
                            <span key={idx} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{variety}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPlant.nutritional_value_per_100g && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                          <Heart size={12} />
                          القيمة الغذائية (لكل 100 جرام)
                        </h3>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <div className="rounded-lg bg-white dark:bg-gray-700/50 p-2 text-center">
                            <div className="text-xs font-bold text-gray-900 dark:text-white">{selectedPlant.nutritional_value_per_100g.calories_kcal}</div>
                            <div className="text-[9px] text-gray-500 dark:text-gray-400">سعرات</div>
                          </div>
                          <div className="rounded-lg bg-white dark:bg-gray-700/50 p-2 text-center">
                            <div className="text-xs font-bold text-gray-900 dark:text-white">{selectedPlant.nutritional_value_per_100g.protein_g}g</div>
                            <div className="text-[9px] text-gray-500 dark:text-gray-400">بروتين</div>
                          </div>
                          <div className="rounded-lg bg-white dark:bg-gray-700/50 p-2 text-center">
                            <div className="text-xs font-bold text-gray-900 dark:text-white">{selectedPlant.nutritional_value_per_100g.carbs_g}g</div>
                            <div className="text-[9px] text-gray-500 dark:text-gray-400">كربوهيدرات</div>
                          </div>
                          <div className="rounded-lg bg-white dark:bg-gray-700/50 p-2 text-center">
                            <div className="text-xs font-bold text-gray-900 dark:text-white">{selectedPlant.nutritional_value_per_100g.fiber_g}g</div>
                            <div className="text-[9px] text-gray-500 dark:text-gray-400">ألياف</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Seasons */}
                {activeTab === 'seasons' && selectedPlant.seasons && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Sprout size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">موسم الزراعة</h4>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400">{selectedPlant.seasons.planting_season_ar}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">أشهر: {selectedPlant.seasons.planting_months?.join('، ')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                            <Sun size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">موسم الحصاد</h4>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400">{selectedPlant.seasons.harvest_season_ar}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">أشهر: {selectedPlant.seasons.harvest_months?.join('، ')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                            <Clock size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">مدة النمو</h4>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400">{selectedPlant.seasons.growth_duration_days} يوم</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shrink-0">
                            <Calendar size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">نوع الموسم</h4>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400">{selectedPlant.seasons.season_type_ar}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedPlant.seasons.critical_stages_ar && (
                      <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <AlertTriangle size={12} />
                          المراحل الحرجة للري والتسميد
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPlant.seasons.critical_stages_ar.map((stage, idx) => (
                            <span key={idx} className="rounded-full bg-white dark:bg-gray-700 border border-amber-200 dark:border-amber-700 px-2.5 py-1 text-[10px] text-amber-700 dark:text-amber-300">{stage}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Soil */}
                {activeTab === 'soil' && selectedPlant.soil_requirements && (
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">التربة المناسبة:</span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {selectedPlant.soil_requirements.preferred_types_ar?.map((type, idx) => (
                            <span key={idx} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{type}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">درجة الحموضة (pH):</span>
                        <span className="font-bold text-gray-900 dark:text-white">{selectedPlant.soil_requirements.ph_range}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">تحمل الملوحة:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{selectedPlant.soil_requirements.salinity_tolerance_ar}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">الصرف:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{selectedPlant.soil_requirements.drainage_ar}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">المادة العضوية:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{selectedPlant.soil_requirements.organic_matter_ar}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Irrigation */}
                {activeTab === 'irrigation' && selectedPlant.irrigation && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">إجمالي المياه:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedPlant.irrigation.total_water_m3_per_feddan} م³/فدان</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">عدد الريات:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedPlant.irrigation.irrigation_times}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">الرية الأولى:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedPlant.irrigation.first_irrigation_ar}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">طريقة الري:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedPlant.irrigation.method_ar}</span>
                        </div>
                      </div>
                    </div>

                    {selectedPlant.irrigation.critical_stages_ar && (
                      <div className="rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                          <Droplets size={12} />
                          المراحل الحرجة للمياه
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPlant.irrigation.critical_stages_ar.map((stage, idx) => (
                            <span key={idx} className="rounded-full bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 px-2.5 py-1 text-[10px] text-blue-700 dark:text-blue-300">{stage}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Nutrition */}
                {activeTab === 'nutrition' && selectedPlant.nutrition && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4 text-center">
                        <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-black">N</div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{selectedPlant.nutrition.total_n_kg_per_feddan}</div>
                        <div className="text-[9px] text-gray-500 dark:text-gray-400">كجم/فدان</div>
                        <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{selectedPlant.nutrition.n_split_ar}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4 text-center">
                        <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black">P</div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{selectedPlant.nutrition.total_p_kg_per_feddan}</div>
                        <div className="text-[9px] text-gray-500 dark:text-gray-400">كجم/فدان</div>
                        <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{selectedPlant.nutrition.p_timing_ar}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4 text-center">
                        <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-black">K</div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{selectedPlant.nutrition.total_k_kg_per_feddan}</div>
                        <div className="text-[9px] text-gray-500 dark:text-gray-400">كجم/فدان</div>
                        <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{selectedPlant.nutrition.k_timing_ar}</p>
                      </div>
                    </div>

                    {selectedPlant.nutrition.micronutrients_ar && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                          <FlaskConical size={12} />
                          العناصر الصغرى
                        </h3>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {Object.entries(selectedPlant.nutrition.micronutrients_ar).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-700/50 p-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-200 dark:bg-gray-600 text-[9px] font-black text-gray-700 dark:text-gray-300">{key}</span>
                              <span className="text-[10px] text-gray-600 dark:text-gray-400">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPlant.recommended_fertilizers && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <FlaskConical size={12} />
                          الأسمدة الموصى بها
                        </h3>
                        <div className="space-y-2">
                          {selectedPlant.recommended_fertilizers.map((fert, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-700/50 p-2.5">
                              <div>
                                <div className="text-[11px] font-bold text-gray-900 dark:text-white">{fert.name_ar}</div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">{fert.purpose_ar}</div>
                              </div>
                              <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{fert.dose_ar}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pests */}
                {activeTab === 'pests' && selectedPlant.pests_and_diseases_ar && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {selectedPlant.pests_and_diseases_ar.map((pest, idx) => (
                      <div key={idx} className="rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 p-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${getSeverityClass(pest.severity)}`}>
                            {pest.severity}
                          </span>
                          <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-[9px] text-gray-600 dark:text-gray-400">
                            {pest.type}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{pest.name_ar}</h4>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-modal-in {
          animation: modalIn 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default PlantsPage;
