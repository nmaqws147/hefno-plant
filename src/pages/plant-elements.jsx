import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { X, ChevronRight, ChevronLeft, FlaskConical, AlertTriangle, Info, Droplets, Thermometer, Heart, Shield } from 'lucide-react';
import nutrientsData from '../knowledge_base/planet-elements/plants-elements.json';
import './plant-elements.css';

const elementColors = {
  N: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-900/40', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 dark:bg-emerald-950/20' },
  P: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200/60 dark:border-blue-900/40', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 dark:bg-blue-950/20' },
  K: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-900/40', gradient: 'from-amber-500 to-amber-600', light: 'bg-amber-50 dark:bg-amber-950/20' },
  Ca: { bg: 'bg-slate-100 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-400', border: 'border-slate-200/60 dark:border-slate-900/40', gradient: 'from-slate-500 to-slate-600', light: 'bg-slate-50 dark:bg-slate-950/20' },
  Mg: { bg: 'bg-lime-100 dark:bg-lime-900/30', text: 'text-lime-700 dark:text-lime-400', border: 'border-lime-200/60 dark:border-lime-900/40', gradient: 'from-lime-500 to-lime-600', light: 'bg-lime-50 dark:bg-lime-950/20' },
  S: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200/60 dark:border-yellow-900/40', gradient: 'from-yellow-500 to-yellow-600', light: 'bg-yellow-50 dark:bg-yellow-950/20' },
  Fe: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200/60 dark:border-red-900/40', gradient: 'from-red-500 to-red-600', light: 'bg-red-50 dark:bg-red-950/20' },
  Zn: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-900/40', gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50 dark:bg-purple-950/20' },
  Mn: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200/60 dark:border-orange-900/40', gradient: 'from-orange-500 to-orange-600', light: 'bg-orange-50 dark:bg-orange-950/20' },
  B: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200/60 dark:border-teal-900/40', gradient: 'from-teal-500 to-teal-600', light: 'bg-teal-50 dark:bg-teal-950/20' },
  Cu: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200/60 dark:border-rose-900/40', gradient: 'from-rose-500 to-rose-600', light: 'bg-rose-50 dark:bg-rose-950/20' },
  Mo: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200/60 dark:border-cyan-900/40', gradient: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-50 dark:bg-cyan-950/20' },
  Cl: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200/60 dark:border-indigo-900/40', gradient: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50 dark:bg-indigo-950/20' },
  Ni: { bg: 'bg-stone-100 dark:bg-stone-900/30', text: 'text-stone-700 dark:text-stone-400', border: 'border-stone-200/60 dark:border-stone-900/40', gradient: 'from-stone-500 to-stone-600', light: 'bg-stone-50 dark:bg-stone-950/20' },
};

const categories = [
  { key: 'macro_primary', label: 'العناصر الكبرى الأساسية', en: 'Macro Primary', short: 'الكبرى الأساسية' },
  { key: 'macro_secondary', label: 'العناصر الكبرى الثانوية', en: 'Macro Secondary', short: 'الكبرى الثانوية' },
  { key: 'micronutrient', label: 'العناصر الصغرى', en: 'Micronutrients', short: 'العناصر الصغرى' },
];

const modalTabs = [
  { id: 'functions', label: 'الوظائف', icon: Heart },
  { id: 'deficiency', label: 'أعراض النقص', icon: AlertTriangle },
  { id: 'correction', label: 'المكافحة', icon: Droplets },
  { id: 'interactions', label: 'التفاعلات', icon: Shield },
  { id: 'range', label: 'المدى الأمثل', icon: Thermometer },
];

const PlantNutrientsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeCat, setActiveCat] = useState('macro_primary');
  const [tab, setTab] = useState('functions');

  useEffect(() => {
    try { setData(nutrientsData); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  const elements = data?.elements?.filter(e => e.category === activeCat) || [];
  const total = data?.elements?.length || 0;
  const macroP = data?.classification?.macro_primary?.length || 0;
  const macroS = data?.classification?.macro_secondary?.length || 0;
  const micro = data?.classification?.micronutrients?.length || 0;

  const currentCat = categories.find(c => c.key === activeCat) || categories[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white dark:bg-gray-900" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">جاري تحميل العناصر الغذائية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <Helmet>
        <title>العناصر الغذائية | Hefno-Plant</title>
        <meta name="description" content="دليل شامل للعناصر الغذائية الأساسية للنبات — الوظائف، أعراض النقص، المكافحة" />
      </Helmet>

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
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{data?.ar_name}</h1>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">{data?.name_en}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">دليل شامل للعناصر الغذائية الأساسية للنبات — الوظائف، أعراض النقص، المكافحة</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
                    <FlaskConical className="w-3.5 h-3.5" />
                    {total} عنصر غذائي
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/40 dark:border-blue-900/40">
                    {macroP + macroS} عناصر كبرى
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-100/40 dark:border-purple-900/40">
                    {micro} عناصر صغرى
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 p-1.5 mb-6 overflow-x-auto bg-gray-100 dark:bg-gray-800/60 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          {categories.map(({ key, short }) => (
            <button
              key={key}
              onClick={() => setActiveCat(key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeCat === key
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200/60 dark:border-gray-600/60'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              {short}
            </button>
          ))}
        </div>

        {/* Category Info */}
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{currentCat.label}</h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">— {currentCat.en}</span>
          <span className="mr-auto text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
            {elements.length} عنصر
          </span>
        </div>

        {/* Elements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {elements.map((el) => {
            const colors = elementColors[el.symbol] || elementColors.N;
            return (
              <div
                key={el.id}
                onClick={() => { setSelected(el); setShowModal(true); setTab('functions'); }}
                className="group p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} text-white font-black shadow-md shrink-0`}>
                    {el.symbol}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {el.ar_name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">{el.name_en}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
                  {el.ar_role?.substring(0, 100)}...
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {el.plant_form_absorbed?.slice(0, 2).map((f, j) => (
                    <span key={j} className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${colors.light} ${colors.text} border ${colors.border}`}>
                      {f}
                    </span>
                  ))}
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

        {/* Stats */}
        <div className="mt-8 flex items-center justify-center gap-6 p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50 shadow-sm w-full sm:w-fit mx-auto flex-wrap">
          <div className="text-center">
            <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">{total}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">عنصر غذائي</span>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <span className="block text-xl font-black text-blue-600 dark:text-blue-400">{macroP + macroS}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">عناصر كبرى</span>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <span className="block text-xl font-black text-purple-600 dark:text-purple-400">{micro}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">عناصر صغرى</span>
          </div>
        </div>
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
              {(() => {
                const c = elementColors[selected.symbol] || elementColors.N;
                return (
                  <>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} text-white font-black text-lg shadow-md shrink-0`}>
                      {selected.symbol}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{selected.ar_name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{selected.name_en}</p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                );
              })()}
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 px-4 overflow-x-auto">
              {modalTabs.map(({ id, label, icon: TabIcon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 py-3.5 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    tab === id
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
              {tab === 'functions' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                      <Info className="w-4 h-4 text-emerald-500" />
                      الدور في النبات
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.ar_role}</p>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                      <Heart className="w-4 h-4 text-emerald-500" />
                      الوظائف الرئيسية
                    </h3>
                    <ul className="space-y-1.5 pr-1">
                      {selected.functions?.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {selected.plant_form_absorbed && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                        <Droplets className="w-4 h-4 text-emerald-500" />
                        الصيغة الممتصة
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selected.plant_form_absorbed.map((f, i) => (
                          <span key={i} className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100/40 dark:border-emerald-900/40">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'deficiency' && selected.deficiency && (
                <div className="space-y-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                      <AlertTriangle className="w-4 h-4 text-emerald-500" />
                      أعراض النقص
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.deficiency.ar_symptoms}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between py-1.5 px-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/40">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">أول الأجزاء تأثراً</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300 text-left">{selected.deficiency.first_affected}</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/40">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">الحركة</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300 text-left">{selected.deficiency.mobility}</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/40">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">المفتاح البصري</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300 text-left">{selected.deficiency.visual_key}</span>
                    </div>
                    {selected.deficiency.confused_with && (
                      <div className="flex justify-between py-1.5 px-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">يتشابه مع</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300 text-left">{selected.deficiency.confused_with.join('، ')}</span>
                      </div>
                    )}
                  </div>
                  {selected.deficiency.severity_levels && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                        <Thermometer className="w-4 h-4 text-emerald-500" />
                        مستويات شدة النقص
                      </h3>
                      <div className="space-y-2">
                        {selected.deficiency.severity_levels.map((l, i) => (
                          <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">المستوى {l.level}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{l.ar_desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.deficiency.soil_causes && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        أسباب نقص العنصر في التربة
                      </h3>
                      <ul className="space-y-1.5 pr-1">
                        {selected.deficiency.soil_causes.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {tab === 'correction' && selected.deficiency?.correction && (
                <div className="space-y-3">
                  {selected.deficiency.correction.foliar_ar && (
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/40 dark:border-emerald-900/30">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1">💧 الرش الورقي</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.deficiency.correction.foliar_ar}</p>
                    </div>
                  )}
                  {selected.deficiency.correction.soil_ar && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100/40 dark:border-blue-900/30">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block mb-1">🌱 إضافة للتربة</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.deficiency.correction.soil_ar}</p>
                    </div>
                  )}
                  {selected.deficiency.correction.organic_ar && (
                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/40 dark:border-amber-900/30">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-1">🍂 المواد العضوية</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.deficiency.correction.organic_ar}</p>
                    </div>
                  )}
                  {selected.deficiency.correction.timing_ar && (
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-400 block mb-1">⏰ التوقيت المناسب</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.deficiency.correction.timing_ar}</p>
                    </div>
                  )}
                  {selected.toxicity && (
                    <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100/40 dark:border-rose-900/30">
                      <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block mb-1">⚠️ سمية زيادة العنصر</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.toxicity.ar_symptoms}</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'interactions' && (
                <div className="space-y-4">
                  {selected.interactions?.synergistic?.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 pr-1">
                        🤝 تفاعلات تكاملية (Synergistic)
                      </h3>
                      <ul className="space-y-1.5 pr-1">
                        {selected.interactions.synergistic.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selected.interactions?.antagonistic?.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-400 mb-3 pr-1">
                        ⚔️ تفاعلات تنافسية (Antagonistic)
                      </h3>
                      <ul className="space-y-1.5 pr-1">
                        {selected.interactions.antagonistic.map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 shrink-0" />
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {tab === 'range' && selected.optimal_range && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selected.optimal_range.leaf_tissue_ppm && (
                      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/40 dark:border-emerald-900/30 text-center">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1">🍃 المدى في الأوراق</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{selected.optimal_range.leaf_tissue_ppm}</span>
                      </div>
                    )}
                    {selected.optimal_range.soil_ppm && (
                      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100/40 dark:border-blue-900/30 text-center">
                        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block mb-1">🌱 المدى في التربة</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{selected.optimal_range.soil_ppm}</span>
                      </div>
                    )}
                    {selected.optimal_range.ph_optimal && (
                      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/40 dark:border-amber-900/30 text-center">
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mb-1">⚗️ درجة الحموضة</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{selected.optimal_range.ph_optimal}</span>
                      </div>
                    )}
                  </div>
                  {selected.crop_needs_high && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1">🌾 المحاصيل ذات الاحتياج العالي</h3>
                      <div className="flex flex-wrap gap-2">
                        {selected.crop_needs_high.map((c, i) => (
                          <span key={i} className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100/40 dark:border-emerald-900/40">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.crop_needs_low && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1">🌿 المحاصيل ذات الاحتياج المنخفض</h3>
                      <div className="flex flex-wrap gap-2">
                        {selected.crop_needs_low.map((c, i) => (
                          <span key={i} className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.egypt_note && (
                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/40 dark:border-amber-900/30">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-1">🇪🇬 ملاحظة لمصر</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selected.egypt_note}</p>
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

export default PlantNutrientsPage;
