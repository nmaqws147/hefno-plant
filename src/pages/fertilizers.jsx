import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../component/SEO';
import { makeBreadcrumbs } from '../component/structuredData';
import {
  X, ChevronRight, ChevronLeft, FlaskConical, Beaker, Droplets, Leaf, Dna,
  Info, Sprout, Heart, Package, Crosshair, Coins, AlertTriangle,
  BadgeCheck, Tractor, BarChart3, Clock, MapPin
} from 'lucide-react';
import fertilizersData from '../knowledge_base/Fertilizers/fertilizers.json';
import './fertilizers.css';

const ITEMS_PER_PAGE = 5;

const groupConfig = {
  'fert-grp-N': { icon: FlaskConical, colors: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-900/40', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 dark:bg-emerald-950/20', badge: 'bg-emerald-500' } },
  'fert-grp-P': { icon: Beaker, colors: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200/60 dark:border-blue-900/40', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 dark:bg-blue-950/20', badge: 'bg-blue-500' } },
  'fert-grp-K': { icon: Droplets, colors: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-900/40', gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50 dark:bg-purple-950/20', badge: 'bg-purple-500' } },
  'fert-grp-organic': { icon: Leaf, colors: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200/60 dark:border-orange-900/40', gradient: 'from-orange-500 to-orange-600', light: 'bg-orange-50 dark:bg-orange-950/20', badge: 'bg-orange-500' } },
  'fert-grp-bio': { icon: Dna, colors: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200/60 dark:border-teal-900/40', gradient: 'from-teal-500 to-teal-600', light: 'bg-teal-50 dark:bg-teal-950/20', badge: 'bg-teal-500' } },
};

const nutrientColors = {
  N: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/40 dark:border-emerald-900/40',
  P: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200/40 dark:border-blue-900/40',
  K: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/40 dark:border-amber-900/40',
  Ca: 'text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 border-slate-200/40 dark:border-slate-900/40',
  Mg: 'text-lime-700 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/40 border-lime-200/40 dark:border-lime-900/40',
  S: 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200/40 dark:border-yellow-900/40',
};

const defaultNutrientColor = 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';

const getNutrientColor = (key) => {
  const base = key.replace(/[0-9]/g, '').replace(/[₂₃₄₅₆]/g, '').replace(/[O]/g, '');
  const match = Object.keys(nutrientColors).find(k => base.includes(k) || k.includes(base));
  return match ? nutrientColors[match] : defaultNutrientColor;
};

const modalTabs = [
  { id: 'overview', label: 'نظرة عامة', icon: Info },
  { id: 'application', label: 'الاستخدام', icon: Sprout },
  { id: 'advantages', label: 'المميزات', icon: Heart },
  { id: 'storage', label: 'التخزين', icon: Package },
];

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-w-[36px] h-9 px-2 rounded-xl text-sm font-bold transition-all ${
            page === currentPage
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
              : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
};

const FertilizersPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [groupPage, setGroupPage] = useState(1);

  useEffect(() => {
    setData(fertilizersData);
    if (fertilizersData?.groups?.length > 0) {
      setActiveGroup(fertilizersData.groups[0].id);
    }
  }, []);

  const handleFertilizerClick = (fertilizer) => {
    setSelected(fertilizer);
    setShowModal(true);
    setActiveTab('overview');
  };

  const activeGroupData = data?.groups?.find(g => g.id === activeGroup);
  const fertilizers = activeGroupData?.fertilizers || [];
  const totalPages = Math.ceil(fertilizers.length / ITEMS_PER_PAGE);
  const paginatedFertilizers = fertilizers.slice(
    (groupPage - 1) * ITEMS_PER_PAGE,
    groupPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setGroupPage(1);
  }, [activeGroup]);

  const config = groupConfig[activeGroup] || groupConfig['fert-grp-N'];
  const GroupIcon = config.icon;
  const colors = config.colors;

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white dark:bg-gray-900" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">جاري تحميل بيانات الأسمدة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <SEO title="الأسمدة الزراعية" description="دليل الأسمدة الزراعية — أنواع الأسمدة العضوية والمعدنية وطرق استخدامها لكل محصول." url="/knowledge-base/fertilizer" keywords="أسمدة زراعية, أسمدة عضوية, أسمدة معدنية, تسميد المحاصيل, أنواع الأسمدة" breadcrumbs={makeBreadcrumbs('/knowledge-base/fertilizer')} />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/knowledge-base')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/80 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>العودة</span>
          </button>

          <div className="mt-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 shrink-0">
                <FlaskConical className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{data.ar_name}</h1>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">{data.name_en}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
                    <FlaskConical className="w-3.5 h-3.5" />
                    {data.total_fertilizers} سماد
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/40 dark:border-blue-900/40">
                    {data.groups_count} مجموعة
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-100/40 dark:border-purple-900/40">
                    NPK + عناصر صغرى
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 p-4 mb-6 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50 shadow-sm w-full sm:w-fit mx-auto flex-wrap">
          <div className="text-center">
            <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">{data.total_fertilizers}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">نوع سماد</span>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <span className="block text-xl font-black text-blue-600 dark:text-blue-400">{data.groups_count}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">مجموعة رئيسية</span>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <span className="block text-sm font-black text-amber-600 dark:text-amber-400">NPK+Ca+Mg+S</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">عناصر متاحة</span>
          </div>
        </div>

        {/* Group Tabs */}
        <div className="flex gap-1.5 p-1.5 mb-6 overflow-x-auto bg-gray-100 dark:bg-gray-800/60 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          {data.groups.map((group) => {
            const cfg = groupConfig[group.id] || groupConfig['fert-grp-N'];
            const GrpIcon = cfg.icon;
            const isActive = activeGroup === group.id;
            return (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white dark:bg-gray-700 shadow-sm border border-gray-200/60 dark:border-gray-600/60'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <GrpIcon className={`w-4 h-4 ${isActive ? cfg.colors.text : 'text-gray-400'}`} />
                <span className={isActive ? cfg.colors.text : ''}>{group.ar_name}</span>
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {group.fertilizers_count || group.fertilizers?.length || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Group Content */}
        {activeGroupData && (
          <div>
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50 shadow-sm">
              <GroupIcon className={`w-5 h-5 ${colors.text}`} />
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{activeGroupData.ar_name}</h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">— {activeGroupData.name_en}</span>
              <span className="mr-auto text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
                {fertilizers.length} سماد
              </span>
            </div>

            {activeGroupData.ar_description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 pr-1 leading-relaxed">{activeGroupData.ar_description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedFertilizers.map((fertilizer) => {
                const isBio = fertilizer.id.includes('bio');
                const nutrientEntries = fertilizer.nutrient_content || fertilizer.nutrient_content_approx;
                const hasNutrients = nutrientEntries && Object.entries(nutrientEntries).some(([_, v]) => parseFloat(v) > 0);
                return (
                  <div
                    key={fertilizer.id}
                    onClick={() => handleFertilizerClick(fertilizer)}
                    className="group p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <div className="mb-3">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {fertilizer.ar_name}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic truncate">{fertilizer.name_en}</p>
                      {fertilizer.chemical_formula && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate" dir="ltr">{fertilizer.chemical_formula}</p>
                      )}
                    </div>

                    {/* Nutrient badges */}
                    {hasNutrients && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {Object.entries(nutrientEntries)
                          .filter(([_, v]) => parseFloat(v) > 0)
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <span key={key} className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${getNutrientColor(key)}`}>
                              {key} {value}{String(value).includes('%') ? '' : '%'}
                            </span>
                          ))}
                      </div>
                    )}
                    {isBio && fertilizer.target_element && !hasNutrients && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg border ${colors.light} ${colors.text} ${colors.border}`}>
                          <Crosshair className="w-3 h-3" />
                          {fertilizer.target_element}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">
                      {fertilizer.ar_advantages?.slice(0, 1)[0] || `سماد ${fertilizer.nitrogen_type || 'متعدد الاستخدامات'} يوفر العناصر الغذائية للنبات`}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        {fertilizer.application?.soil_kg_per_feddan ? 'تسميد أرضي' : 
                         fertilizer.application?.foliar_percent ? 'رش ورقي' : 'متعدد الاستخدامات'}
                      </span>
                      {fertilizer.organic_certified && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200/40 dark:border-green-900/40">
                          عضوي معتمد
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/60">
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                        <Coins className="w-3 h-3" />
                        {fertilizer.price_category || 'متوسط'}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        عرض التفاصيل
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination currentPage={groupPage} totalPages={totalPages} onPageChange={setGroupPage} />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/80 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-t-2xl">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} text-white font-bold text-lg shadow-md shrink-0`}>
                {selected.id.includes('bio') ? <Dna className="w-6 h-6" /> : <FlaskConical className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{selected.ar_name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{selected.name_en}</p>
                {selected.chemical_formula && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono" dir="ltr">{selected.chemical_formula}</p>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 px-4 overflow-x-auto">
              {modalTabs.map(({ id, label, icon: TabIcon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 py-3.5 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === id
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">المحتوى الغذائي والعناصر</span>
                    <div className="flex flex-wrap gap-2">
                      {(selected.nutrient_content || selected.nutrient_content_approx) ? (
                        Object.entries(selected.nutrient_content || selected.nutrient_content_approx || {})
                          .filter(([_, v]) => parseFloat(v) > 0)
                          .map(([key, value]) => (
                            <span key={key} className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getNutrientColor(key)}`}>
                              {key}: {value}{String(value).includes('%') ? '' : '%'}
                            </span>
                          ))
                      ) : selected.target_element ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border ${colors.light} ${colors.text} ${colors.border}`}>
                          <Crosshair className="w-3 h-3" />
                          يستهدف عنصر: {selected.target_element}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">غير محدد</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">الحالة / النوع</span>
                      <span className="text-sm text-gray-800 dark:text-gray-200">{selected.ar_form || selected.ar_type || "غير محدد"}</span>
                    </div>
                    {selected.solubility_g_per_100ml && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">الذوبان</span>
                        <span className="text-sm text-gray-800 dark:text-gray-200">{selected.solubility_g_per_100ml} جم/100مل</span>
                      </div>
                    )}
                    {selected.ph_effect_on_soil && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">التأثير على التربة (pH)</span>
                        <span className="text-sm text-gray-800 dark:text-gray-200">{selected.ph_effect_on_soil}</span>
                      </div>
                    )}
                  </div>

                  {selected.suitable_crops && selected.suitable_crops.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">المحاصيل المناسبة</h3>
                      <div className="flex flex-wrap gap-2">
                        {selected.suitable_crops.map((crop, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100/40 dark:border-emerald-900/40">{crop}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Application Tab */}
              {activeTab === 'application' && selected.application && (
                <div className="space-y-3">
                  {selected.application.soil_kg_per_feddan && (
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/40 dark:border-emerald-900/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sprout className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">إضافة تربة</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selected.application.soil_kg_per_feddan}</p>
                    </div>
                  )}
                  {selected.application.soil_ton_per_feddan && (
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/40 dark:border-emerald-900/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Tractor className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">كمية الفدان</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selected.application.soil_ton_per_feddan}</p>
                    </div>
                  )}
                  {selected.application.foliar_percent && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100/40 dark:border-blue-900/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Leaf className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">رش ورقي</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selected.application.foliar_percent}</p>
                    </div>
                  )}
                  {selected.application.fertigation_kg_per_feddan && (
                    <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100/40 dark:border-purple-900/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Droplets className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-400">تسميد بالتنقيط</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selected.application.fertigation_kg_per_feddan}</p>
                    </div>
                  )}
                  {selected.application.seed_inoculation_ar && (
                    <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl border border-teal-100/40 dark:border-teal-900/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FlaskConical className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">تلقيح البذور</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selected.application.seed_inoculation_ar}</p>
                    </div>
                  )}
                  {selected.application.soil_application_ar && (
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/40 dark:border-emerald-900/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sprout className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">إضافة للتربة</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selected.application.soil_application_ar}</p>
                    </div>
                  )}
                  {selected.application.dose_per_feddan_ar && (
                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/40 dark:border-amber-900/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <BarChart3 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">الجرعة للفدان</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selected.application.dose_per_feddan_ar}</p>
                    </div>
                  )}
                  {selected.application.max_single_dose_ar && (
                    <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100/40 dark:border-rose-900/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-400">الجرعة القصوى</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selected.application.max_single_dose_ar}</p>
                    </div>
                  )}
                  {selected.application.ar_timing && (
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-400">التوقيت والطريقة</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {selected.application.ar_timing}{selected.application.ar_method ? ` - ${selected.application.ar_method}` : ''}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Advantages Tab */}
              {activeTab === 'advantages' && (
                <div className="space-y-4">
                  {selected.ar_advantages && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 pr-1">
                        <BadgeCheck className="w-4 h-4" />
                        المميزات
                      </h3>
                      <ul className="space-y-1.5 pr-1">
                        {selected.ar_advantages.map((adv, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selected.ar_disadvantages && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-400 mb-3 pr-1">
                        <AlertTriangle className="w-4 h-4" />
                        العيوب والتحذيرات
                      </h3>
                      <ul className="space-y-1.5 pr-1">
                        {selected.ar_disadvantages.map((dis, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 shrink-0" />
                            <span>{dis}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Storage Tab */}
              {activeTab === 'storage' && (
                <div className="space-y-4">
                  {selected.storage_ar && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1">
                        <Package className="w-4 h-4 text-emerald-500" />
                        شروط التخزين
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.storage_ar}</p>
                    </div>
                  )}
                  {selected.ar_strains && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1">
                        <Dna className="w-4 h-4 text-emerald-500" />
                        السلالات المتوفرة
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(selected.ar_strains).map(([key, val]) => (
                          <div key={key} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">{key}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.egypt_importance && (
                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/40 dark:border-amber-900/30">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">الأهمية في مصر</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.egypt_importance}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer - Price */}
            <div className="sticky bottom-0 p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-b-2xl">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                الفئة السعرية: <strong className="text-gray-800 dark:text-gray-200">{selected.price_category}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizersPage;
