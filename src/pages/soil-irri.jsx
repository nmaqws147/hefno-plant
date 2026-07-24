import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../component/SEO';
import { makeBreadcrumbs } from '../component/structuredData';
import {
  X, ArrowLeft, ChevronLeft, ChevronRight, Globe, MapPin, Droplets,
  ClipboardList, Sprout, Info, FlaskConical, Settings,
  CheckCircle2, Search, FileText, BarChart3, AlertTriangle
} from 'lucide-react';
import soilsData from '../knowledge_base/Soil-irri-data/data.json';
import './soil-irri.css';

const ITEMS_PER_PAGE = 5;

const tabs = [
  { id: 'soils', label: 'التربة المصرية', icon: MapPin },
  { id: 'irrigation', label: 'أنظمة الري', icon: Droplets },
  { id: 'analysis', label: 'دليل التحليل', icon: ClipboardList },
  { id: 'water', label: 'الاحتياجات المائية', icon: Sprout },
];

const soilModalTabs = [
  { id: 'overview', label: 'نظرة عامة', icon: Info },
  { id: 'properties', label: 'الخصائص', icon: FlaskConical },
  { id: 'crops', label: 'المحاصيل', icon: Sprout },
  { id: 'management', label: 'الإدارة', icon: Settings },
];

const getTextureStyle = (texture) => {
  if (texture.includes('ثقيلة')) return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200/40 dark:border-amber-900/40' };
  if (texture.includes('خفيفة')) return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200/40 dark:border-yellow-900/40' };
  if (texture.includes('متوسطة')) return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200/40 dark:border-emerald-900/40' };
  return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' };
};

const getEfficiencyStyle = (efficiency) => {
  const value = parseInt(efficiency);
  if (value >= 85) return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200/40 dark:border-emerald-900/40' };
  if (value >= 65) return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200/40 dark:border-amber-900/40' };
  return { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200/40 dark:border-rose-900/40' };
};

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

const SoilsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('soils');
  const [selectedSoil, setSelectedSoil] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [soilModalTab, setSoilModalTab] = useState('overview');
  const [soilPage, setSoilPage] = useState(1);
  const [waterPage, setWaterPage] = useState(1);

  useEffect(() => {
    setData(soilsData);
  }, []);

  useEffect(() => {
    setSoilPage(1);
  }, [activeTab]);

  const handleSoilClick = (soil) => {
    setSelectedSoil(soil);
    setShowSoilModal(true);
    setSoilModalTab('overview');
  };

  const handleMethodClick = (method) => {
    setSelectedMethod(method);
    setShowMethodModal(true);
  };

  const closeModals = () => {
    setShowSoilModal(false);
    setShowMethodModal(false);
    setSelectedSoil(null);
    setSelectedMethod(null);
  };

  const soils = data?.egyptian_soil_types || [];
  const soilTotalPages = Math.ceil(soils.length / ITEMS_PER_PAGE);
  const paginatedSoils = soils.slice(
    (soilPage - 1) * ITEMS_PER_PAGE, soilPage * ITEMS_PER_PAGE
  );

  const methods = data?.irrigation?.irrigation_methods_ar || [];
  const waterReqs = data?.irrigation?.crop_water_requirements || [];
  const waterTotalPages = Math.ceil(waterReqs.length / ITEMS_PER_PAGE);
  const paginatedWater = waterReqs.slice(
    (waterPage - 1) * ITEMS_PER_PAGE, waterPage * ITEMS_PER_PAGE
  );

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white dark:bg-gray-900" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">جاري تحميل بيانات التربة والري...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <SEO title="التربة والري" description="دليل التربة والري — أنواع التربة، تحليل التربة، طرق الري، وإدارة الموارد المائية." url="/knowledge-base/soil-irri" keywords="أنواع التربة, تحليل التربة, طرق الري, الري الزراعي, إدارة الموارد المائية" breadcrumbs={makeBreadcrumbs('/knowledge-base/soil-irri')} />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/knowledge-base')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة</span>
          </button>

          <div className="mt-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 shrink-0">
                <Globe className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{data.metadata.name_ar}</h1>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">{data.metadata.name_en}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
                    <MapPin className="w-3.5 h-3.5" />
                    {data.egyptian_soil_types.length} نوع تربة
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/40 dark:border-blue-900/40">
                    <Droplets className="w-3.5 h-3.5" />
                    {data.irrigation?.irrigation_methods_ar?.length || 0} نظام ري
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-100/40 dark:border-purple-900/40">
                    <Sprout className="w-3.5 h-3.5" />
                    شامل ومحدث
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1.5 mb-6 overflow-x-auto bg-gray-100 dark:bg-gray-800/60 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200/60 dark:border-gray-600/60'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Soils */}
        {activeTab === 'soils' && (
          <div>
            <div className="relative mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">أنواع التربة المصرية</h2>
              </div>
              <p className="mr-12 text-sm text-gray-500 dark:text-gray-400">دليل شامل لأنواع التربة في مصر — الخصائص، المحاصيل المناسبة، ونصائح الإدارة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedSoils.map((soil) => {
                const texStyle = getTextureStyle(soil.texture_ar);
                return (
                  <div
                    key={soil.id}
                    onClick={() => handleSoilClick(soil)}
                    className="group p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${texStyle.bg} ${texStyle.text} border ${texStyle.border}`}>
                        {soil.texture_ar}
                      </span>
                    </div>
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {soil.name_ar}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">{soil.local_name_ar}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 mb-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 dark:text-gray-500">المساحة:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{soil.area_million_feddan} مليون فدان</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 dark:text-gray-500">درجة الحموضة:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{soil.chemical_properties?.ph_range || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 dark:text-gray-500">المادة العضوية:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{soil.chemical_properties?.organic_matter_percent || 'غير محدد'}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(soil.crop_suitability_ar?.excellent_ar?.slice(0, 3) || []).map((crop, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100/40 dark:border-emerald-900/40">
                          {crop}
                        </span>
                      ))}
                      {(!soil.crop_suitability_ar?.excellent_ar?.length) && (
                        (soil.crop_suitability_ar?.good_ar?.slice(0, 3) || []).map((crop, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100/40 dark:border-emerald-900/40">
                            {crop}
                          </span>
                        ))
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/60">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        عرض التفاصيل
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination currentPage={soilPage} totalPages={soilTotalPages} onPageChange={setSoilPage} />
          </div>
        )}

        {/* Tab: Irrigation */}
        {activeTab === 'irrigation' && (
          <div>
            <div className="relative mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">أنظمة الري</h2>
              </div>
              <p className="mr-12 text-sm text-gray-500 dark:text-gray-400">طرق الري في مصر — الكفاءة، المحاصيل المناسبة، والمميزات والعيوب</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {methods.map((method) => {
                const effStyle = getEfficiencyStyle(method.efficiency_percent);
                return (
                  <div
                    key={method.id}
                    onClick={() => handleMethodClick(method)}
                    className="group p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${effStyle.bg} ${effStyle.text} border ${effStyle.border}`}>
                        كفاءة {method.efficiency_percent}
                      </span>
                    </div>
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {method.name_ar}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">{method.name_en}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 mb-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 dark:text-gray-500">التربة المناسبة:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-left">{method.suitable_soils_ar?.slice(0, 2).join('، ') || 'جميع الأنواع'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 dark:text-gray-500">المحاصيل:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-left">{method.suitable_crops_ar?.slice(0, 3).join('، ') || 'محاصيل متنوعة'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/60">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        عرض التفاصيل
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Analysis */}
        {activeTab === 'analysis' && (
          <div>
            <div className="relative mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">دليل تحليل التربة</h2>
              </div>
              <p className="mr-12 text-sm text-gray-500 dark:text-gray-400">خطوات تحليل التربة — أخذ العينات، المؤشرات الرئيسية، والتفسير السريع</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">متى تحلل التربة؟</h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{data.soil_analysis_guide?.when_to_sample_ar || 'قبل الموسم بـ 4-6 أسابيع'}</p>
              </div>

              <div className="p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">كيفية أخذ العينات</h3>
                </div>
                <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>العمق:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{data.soil_analysis_guide?.sampling_guide_ar?.depth_cm || '0-30 سم'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد النقاط:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{data.soil_analysis_guide?.sampling_guide_ar?.points_per_feddan || '5-10 نقطة'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الأدوات:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{data.soil_analysis_guide?.sampling_guide_ar?.tools_ar || 'مثقاب تربة'}</span>
                  </div>
                  {data.soil_analysis_guide?.sampling_guide_ar?.container_ar && (
                    <div className="flex justify-between">
                      <span>الوعاء:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{data.soil_analysis_guide.sampling_guide_ar.container_ar}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">المؤشرات الرئيسية</h3>
                </div>
                <div className="space-y-2">
                  {(data.soil_analysis_guide?.key_parameters_ar?.slice(0, 5) || []).map((param, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 px-2 rounded-lg bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">{param.parameter_ar}</span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{param.ideal_range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Interpretation */}
            {data.soil_analysis_guide?.interpretation_quick_ar && (
              <div className="p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 pr-1 border-r-[3px] border-emerald-500 pr-3">
                  <AlertTriangle className="w-4 h-4 text-emerald-500" />
                  تفسير سريع
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(data.soil_analysis_guide.interpretation_quick_ar).map(([key, value]) => (
                    <div key={key} className="p-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-0.5">{key.replace(/_/g, ' ')}</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Water Requirements */}
        {activeTab === 'water' && (
          <div>
            <div className="relative mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">احتياجات المحاصيل المائية</h2>
              </div>
              <p className="mr-12 text-sm text-gray-500 dark:text-gray-400">الاحتياجات المائية للمحاصيل الرئيسية في مصر — الكميات، الفترات، والمراحل الحرجة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedWater.map((crop, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="text-center mb-3 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{crop.crop_ar}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">{crop.crop_en}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/40 dark:border-emerald-900/30">
                      <span className="text-xs text-gray-500 dark:text-gray-400">احتياج الماء:</span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{crop.total_m3_per_feddan} م³/فدان</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/40 dark:border-blue-900/30">
                      <span className="text-xs text-gray-500 dark:text-gray-400">فترة الري:</span>
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400 text-left">{crop.irrigation_frequency_ar}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/40 dark:border-amber-900/30">
                      <span className="text-xs text-gray-500 dark:text-gray-400">المراحل الحرجة:</span>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 text-left">{crop.critical_stages_ar?.join(' - ') || 'غير محدد'}</span>
                    </div>
                    {crop.method_recommended_ar && (
                      <div className="pt-2 text-center">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                          {crop.method_recommended_ar}
                        </span>
                      </div>
                    )}
                  </div>
                  {crop.deficit_impact_ar && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 leading-relaxed">
                        <AlertTriangle className="w-3 h-3 inline -mt-0.5 ml-0.5" />
                        {crop.deficit_impact_ar}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Pagination currentPage={waterPage} totalPages={waterTotalPages} onPageChange={setWaterPage} />
          </div>
        )}
      </div>

      {/* Soil Modal */}
      {showSoilModal && selectedSoil && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModals}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/80 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-t-2xl">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{selectedSoil.name_ar}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{selectedSoil.name_en}</p>
                {selectedSoil.local_name_ar && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">{selectedSoil.local_name_ar}</p>
                )}
              </div>
              <button
                onClick={closeModals}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 px-4 overflow-x-auto">
              {soilModalTabs.map(({ id, label, icon: TabIcon }) => (
                <button
                  key={id}
                  onClick={() => setSoilModalTab(id)}
                  className={`flex items-center gap-1.5 py-3.5 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    soilModalTab === id
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
              {/* Overview */}
              {soilModalTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between py-1.5 px-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/40">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">المناطق:</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300 text-left">{selectedSoil.regions_ar?.join('، ')}</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/40">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">المساحة:</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300 text-left">{selectedSoil.area_million_feddan} مليون فدان</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/40">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">القوام:</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300 text-left">{selectedSoil.texture_ar}</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">اللون:</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300 text-left">{selectedSoil.color_ar}</span>
                    </div>
                  </div>
                  {selectedSoil.distribution_ar && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        التوزيع الجغرافي
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selectedSoil.distribution_ar}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Properties */}
              {soilModalTab === 'properties' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                      الخصائص الفيزيائية
                    </h3>
                    <ul className="space-y-1.5 pr-1">
                      {selectedSoil.physical_properties && Object.entries(selectedSoil.physical_properties).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                          <span className="text-gray-400 dark:text-gray-500 ml-1">{key.replace(/_/g, ' ')}:</span>
                          <span>{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                      الخصائص الكيميائية
                    </h3>
                    <ul className="space-y-1.5 pr-1">
                      {selectedSoil.chemical_properties && Object.entries(selectedSoil.chemical_properties).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                          <span className="text-gray-400 dark:text-gray-500 ml-1">{key.replace(/_/g, ' ')}:</span>
                          <span>{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Crops */}
              {soilModalTab === 'crops' && (
                <div className="space-y-4">
                  {selectedSoil.crop_suitability_ar?.excellent_ar && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 pr-1">
                        <CheckCircle2 className="w-4 h-4" />
                        ممتازة
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSoil.crop_suitability_ar.excellent_ar.map((crop, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100/40 dark:border-emerald-900/40">{crop}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedSoil.crop_suitability_ar?.good_ar && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 mb-3 pr-1">
                        جيدة
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSoil.crop_suitability_ar.good_ar.map((crop, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-100/40 dark:border-amber-900/40">{crop}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedSoil.crop_suitability_ar?.not_recommended_ar && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-400 mb-3 pr-1">
                        <AlertTriangle className="w-4 h-4" />
                        غير مناسبة
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSoil.crop_suitability_ar.not_recommended_ar.map((crop, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-lg border border-rose-100/40 dark:border-rose-900/40">{crop}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Management */}
              {soilModalTab === 'management' && (
                <div className="space-y-4">
                  {selectedSoil.management_tips_ar && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                        <Settings className="w-4 h-4 text-emerald-500" />
                        نصائح الإدارة
                      </h3>
                      <ul className="space-y-1.5 pr-1">
                        {selectedSoil.management_tips_ar.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedSoil.irrigation_notes_ar && (
                      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100/40 dark:border-blue-900/30">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Droplets className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-400">نصائح الري</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selectedSoil.irrigation_notes_ar}</p>
                      </div>
                    )}
                    {selectedSoil.fertilization_notes_ar && (
                      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/40 dark:border-emerald-900/30">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FlaskConical className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">نصائح التسميد</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selectedSoil.fertilization_notes_ar}</p>
                      </div>
                    )}
                  </div>
                  {selectedSoil.reclamation_steps_ar && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                        <Settings className="w-4 h-4 text-emerald-500" />
                        خطوات الإصلاح
                      </h3>
                      <ul className="space-y-1.5 pr-1">
                        {selectedSoil.reclamation_steps_ar.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Method Modal */}
      {showMethodModal && selectedMethod && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModals}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/80 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-t-2xl">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                <Droplets className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{selectedMethod.name_ar}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{selectedMethod.name_en}</p>
              </div>
              <button
                onClick={closeModals}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">كفاءة الري</span>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg border ${getEfficiencyStyle(selectedMethod.efficiency_percent).bg} ${getEfficiencyStyle(selectedMethod.efficiency_percent).text} ${getEfficiencyStyle(selectedMethod.efficiency_percent).border}`}>
                    {selectedMethod.efficiency_percent}
                  </span>
                </div>
                {selectedMethod.water_requirement_note_ar && (
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/40 dark:border-amber-900/30">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mb-1">ملاحظة</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{selectedMethod.water_requirement_note_ar}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">التربة المناسبة</span>
                <div className="flex flex-wrap gap-2">
                  {selectedMethod.suitable_soils_ar.map((soil, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100/40 dark:border-emerald-900/40">{soil}</span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">المحاصيل المناسبة</span>
                <div className="flex flex-wrap gap-2">
                  {selectedMethod.suitable_crops_ar.map((crop, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-100/40 dark:border-blue-900/40">{crop}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedMethod.advantages_ar && (
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/40 dark:border-emerald-900/30">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-2">المميزات</span>
                    <ul className="space-y-1 pr-1">
                      {selectedMethod.advantages_ar.map((adv, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedMethod.disadvantages_ar && (
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100/40 dark:border-rose-900/30">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block mb-2">العيوب</span>
                    <ul className="space-y-1 pr-1">
                      {selectedMethod.disadvantages_ar.map((dis, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0" />
                          <span>{dis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilsPage;
