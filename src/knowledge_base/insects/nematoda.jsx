import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ChevronLeft, X, AlertTriangle, Bug, Shield, Calendar, Info, Sprout, Thermometer, FlaskConical, Search, Layers, Star, BookOpen, Clock } from 'lucide-react';
import nematodaData from '../../insects-folder/nematoda.json';

const ITEMS_PER_PAGE = 5;

const getSeverityClass = (sev) => {
  if (!sev) return 'bg-gray-500 text-white';
  if (sev.includes('شديد جداً') || sev.includes('very high')) return 'bg-red-500 text-white';
  if (sev.includes('شديد') || sev.includes('عالية') || sev.includes('high')) return 'bg-orange-500 text-white';
  if (sev.includes('متوسط') || sev.includes('moderate')) return 'bg-yellow-500 text-white';
  if (sev.includes('خفيف') || sev.includes('low')) return 'bg-emerald-500 text-white';
  return 'bg-gray-500 text-white';
};

const getSeverityText = (sev) => {
  if (!sev) return 'غير محدد';
  if (sev.includes('شديد جداً') || sev.includes('very high')) return 'شديد جداً';
  if (sev.includes('شديد') || sev.includes('عالية') || sev.includes('high')) return 'شديد';
  if (sev.includes('متوسط') || sev.includes('moderate')) return 'متوسط';
  if (sev.includes('خفيف') || sev.includes('low')) return 'خفيف';
  return 'غير محدد';
};

const tabs = [
  { id: 'species', emoji: '🐛', label: 'الأنواع' },
  { id: 'overview', emoji: '📋', label: 'نظرة عامة' },
  { id: 'classification', emoji: '📂', label: 'التصنيف' },
  { id: 'diagnosis', emoji: '🔬', label: 'التشخيص' },
  { id: 'management', emoji: '🛡️', label: 'المكافحة المتكاملة' },
  { id: 'beneficial', emoji: '✨', label: 'النيماتودا النافعة' },
  { id: 'susceptibility', emoji: '📊', label: 'حساسية المحاصيل' },
];

const modalTabs = [
  { id: 'description', label: 'الوصف والأعراض' },
  { id: 'cycle', label: 'دورة الحياة' },
  { id: 'management', label: 'المكافحة' },
];

const NematodaPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('species');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const data = nematodaData;

  if (!data) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">جاري تحميل بيانات النيماتودا...</p>
          </div>
        </div>
      </div>
    );
  }

  const species = data.species || [];
  const totalPages = Math.max(1, Math.ceil(species.length / ITEMS_PER_PAGE));
  const paginatedSpecies = species.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openModal = (s) => {
    setSelected(s);
    setShowModal(true);
    setActiveTab('description');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const getHostsPreview = (s) => {
    if (s.host_plants_ar?.highly_susceptible_ar?.length > 0) return s.host_plants_ar.highly_susceptible_ar[0];
    return 'متعدد العوائل';
  };

  const getSymptomsList = (s) => {
    const list = [];
    if (s.symptoms?.underground_ar) list.push(...s.symptoms.underground_ar);
    if (s.symptoms?.aboveground_ar) list.push(...s.symptoms.aboveground_ar);
    return list;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <Helmet>
        <title>النيماتودا | Hefno-Plant</title>
        <meta name="description" content="قاعدة بيانات متكاملة للنيماتودا — الأنواع، دورة الحياة، التشخيص، المكافحة المتكاملة، والنيماتودا النافعة مع دليل حساسية المحاصيل" />
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/knowledge-base/insects')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/80"
        >
          <ChevronRight size={16} />
          <span>العودة</span>
        </button>

        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shrink-0">
              <span className="text-2xl">🐛</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{data.metadata.name_ar}</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">{data.metadata.name_en}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{data.metadata.warning_ar}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-orange-100/40 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 text-xs font-bold text-orange-700 dark:text-orange-400">
                  <Layers size={14} />
                  {species.length} نوع
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100/40 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Shield size={14} />
                  دليل متكامل
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveSection(tab.id); setCurrentPage(1); }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                activeSection === tab.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/50'
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeSection === 'species' && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedSpecies.map((s) => (
                <div
                  key={s.id}
                  onClick={() => openModal(s)}
                  className="group cursor-pointer rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border-r-[3px] border-orange-500"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{s.name_ar}</h3>
                      <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{s.name_scientific}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityClass(s.danger_level)}`}>
                      {getSeverityText(s.danger_level)}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed line-clamp-2 text-gray-600 dark:text-gray-400 mb-3">
                    {s.description_ar ? s.description_ar.substring(0, 100) + '...' : ''}
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3 mt-2">
                    <div className="flex flex-wrap gap-1">
                      {s.feeding_type_ar && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] text-gray-500">
                          {s.feeding_type_ar.split('—')[0]?.trim()}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] text-gray-500">
                        {getHostsPreview(s)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                      التفاصيل <ChevronLeft size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all disabled:opacity-30 enabled:hover:bg-orange-50 dark:enabled:hover:bg-orange-900/30 text-gray-600 dark:text-gray-400"
                >
                  <ChevronRight size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-200/50 dark:shadow-orange-900/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all disabled:opacity-30 enabled:hover:bg-orange-50 dark:enabled:hover:bg-orange-900/30 text-gray-600 dark:text-gray-400"
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 shrink-0 text-xl">
                      <span>🐛</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">{selected.name_ar}</h2>
                      <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{selected.name_scientific}</p>
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
                            ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-5 space-y-4">
                    {activeTab === 'description' && (
                      <>
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">مستوى الخطورة</span>
                              <p className={`mt-0.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityClass(selected.danger_level)}`}>{getSeverityText(selected.danger_level)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">نوع التغذية</span>
                              <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selected.feeding_type_ar?.split('—')[0]?.trim() || '-'}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500 dark:text-gray-400">الانتشار في مصر</span>
                              <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selected.prevalence_egypt || 'غير محدد'}</p>
                            </div>
                          </div>
                        </div>

                        {selected.description_ar && (
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300"><Info size={12} />الوصف</h3>
                            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{selected.description_ar}</p>
                          </div>
                        )}

                        {selected.common_species?.length > 0 && (
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-300"><Layers size={12} />الأنواع الشائعة</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {selected.common_species.map((s, i) => (
                                <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {getSymptomsList(selected).length > 0 && (
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-300"><AlertTriangle size={12} />الأعراض</h3>
                            <ul className="space-y-1.5">
                              {getSymptomsList(selected).map((s, i) => (
                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                  <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selected.host_plants_ar?.highly_susceptible_ar?.length > 0 && (
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300"><Sprout size={12} />العوائل النباتية</h3>
                            <div className="mb-2">
                              <span className="text-[10px] font-bold text-red-600 dark:text-red-400">شديدة الحساسية: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selected.host_plants_ar.highly_susceptible_ar.map((h, i) => (
                                  <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-0.5 text-[10px] text-gray-700 dark:text-gray-300">{h}</span>
                                ))}
                              </div>
                            </div>
                            {selected.host_plants_ar.moderately_susceptible_ar?.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">متوسطة الحساسية: </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {selected.host_plants_ar.moderately_susceptible_ar.map((h, i) => (
                                    <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-0.5 text-[10px] text-gray-700 dark:text-gray-300">{h}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'cycle' && selected.lifecycle && (
                      <>
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300"><Clock size={12} />دورة الحياة</h3>
                          <div className="space-y-2">
                            {selected.lifecycle.total_days_at_25c && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400">المدة الكاملة عند 25°م:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{selected.lifecycle.total_days_at_25c}</span>
                              </div>
                            )}
                            {selected.lifecycle.generations_per_year && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400">الأجيال في السنة:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{selected.lifecycle.generations_per_year}</span>
                              </div>
                            )}
                            {selected.lifecycle.optimal_temp_c && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400">درجة الحرارة المثلى:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{selected.lifecycle.optimal_temp_c}°م</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {selected.lifecycle.stages_ar?.length > 0 && (
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-300"><Layers size={12} />مراحل دورة الحياة</h3>
                            <div className="space-y-2">
                              {selected.lifecycle.stages_ar.map((stage, i) => (
                                <div key={i} className="rounded-lg bg-white dark:bg-gray-700/50 p-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-gray-900 dark:text-white">{stage.stage}</span>
                                    <span className="text-[10px] text-orange-600 dark:text-orange-400">{stage.duration_ar}</span>
                                  </div>
                                  {stage.notes_ar && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{stage.notes_ar}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selected.spread_methods_ar?.length > 0 && (
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-300"><Search size={12} />طرق الانتشار</h3>
                            <ul className="space-y-1">
                              {selected.spread_methods_ar.map((m, i) => (
                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                  <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                                  {m}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'management' && selected.management && (
                      <>
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-300"><Shield size={12} />المكافحة</h3>
                          {selected.management.cultural_ar?.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1"><Bug size={11} />المكافحة الزراعية</h4>
                              <div className="space-y-1.5">
                                {selected.management.cultural_ar.map((item, i) => (
                                  <div key={i} className="rounded-lg bg-white dark:bg-gray-700/50 p-2.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-gray-900 dark:text-white">{item.method_ar}</span>
                                      {item.effectiveness && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.effectiveness.includes('عالية') ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>{item.effectiveness}</span>
                                      )}
                                    </div>
                                    {item.details_ar && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.details_ar}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {selected.management.biological_ar?.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1"><FlaskConical size={11} />المكافحة الحيوية</h4>
                              <div className="space-y-1.5">
                                {selected.management.biological_ar.map((item, i) => (
                                  <div key={i} className="rounded-lg bg-white dark:bg-gray-700/50 p-2.5">
                                    <span className="text-[11px] font-bold text-gray-900 dark:text-white">{item.agent_ar}</span>
                                    {item.details_ar && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.details_ar}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {selected.management.chemical_ar?.length > 0 && (
                            <div>
                              <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1"><FlaskConical size={11} />المكافحة الكيميائية</h4>
                              <div className="space-y-1.5">
                                {selected.management.chemical_ar.map((item, i) => (
                                  <div key={i} className="rounded-lg bg-white dark:bg-gray-700/50 p-2.5">
                                    <span className="text-[11px] font-bold text-gray-900 dark:text-white">{item.active_ingredient_ar}</span>
                                    {item.trade_names_ar && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {item.trade_names_ar.map((tn, j) => (
                                          <span key={j} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-500">{tn}</span>
                                        ))}
                                      </div>
                                    )}
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.dose_ar && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-500">الجرعة: {item.dose_ar}</span>}
                                      {item.method_ar && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] text-gray-500">{item.method_ar}</span>}
                                      {item.preharvest_interval_days && <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded text-[9px]">فترة الأمان: {item.preharvest_interval_days} يوم</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {selected.soil_preferences_ar && (
                          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300"><Thermometer size={12} />تفضيلات التربة</h3>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">الظروف المثلى</span>
                                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selected.soil_preferences_ar.best_conditions_ar?.split('—')[0]?.trim() || '-'}</p>
                              </div>
                              {selected.soil_preferences_ar.worst_conditions_ar && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">الظروف غير المناسبة</span>
                                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selected.soil_preferences_ar.worst_conditions_ar?.split('—')[0]?.trim() || '-'}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeSection === 'overview' && data.general_overview && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300"><Info size={12} />تعريف النيماتودا</h3>
              <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{data.general_overview.definition_ar}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-300"><Thermometer size={12} />الحجم</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{data.general_overview.size_ar}</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-300"><Info size={12} />الشكل</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{data.general_overview.shape_ar}</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-300"><Calendar size={12} />ملخص دورة الحياة</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{data.general_overview.lifecycle_summary_ar}</p>
              </div>
            </div>

            {data.general_overview.habitat_ar?.length > 0 && (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300"><Sprout size={12} />الموائل</h3>
                <div className="flex flex-wrap gap-1.5">
                  {data.general_overview.habitat_ar.map((h, i) => (
                    <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{h}</span>
                  ))}
                </div>
              </div>
            )}

            {data.general_overview.why_dangerous_ar?.length > 0 && (
              <div className="rounded-xl border border-red-200/60 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300"><AlertTriangle size={12} />لماذا خطيرة؟</h3>
                <ul className="space-y-1">
                  {data.general_overview.why_dangerous_ar.map((w, i) => (
                    <li key={i} className="text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 shrink-0">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.general_overview.economic_losses_egypt_ar && (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300"><Shield size={12} />الخسائر الاقتصادية في مصر</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">الخسائر السنوية</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{data.general_overview.economic_losses_egypt_ar.annual_losses_egp}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">نسبة فقدان المحصول</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{data.general_overview.economic_losses_egypt_ar.yield_loss_percent}</p>
                  </div>
                </div>
                {data.general_overview.economic_losses_egypt_ar.most_affected_crops_ar?.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">المحاصيل الأكثر تضرراً:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.general_overview.economic_losses_egypt_ar.most_affected_crops_ar.map((c, i) => (
                        <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeSection === 'classification' && data.classification && (
          <div className="space-y-4">
            {data.classification.note_ar && (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">{data.classification.note_ar}</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.classification.main_groups_ar?.map((g, i) => (
                <div key={i} className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shrink-0">
                      <BookOpen size={14} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">{g.group_ar}</h3>
                      <p className="text-[10px] italic text-gray-500 dark:text-gray-400">{g.group_en}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{g.description_ar}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'diagnosis' && data.diagnosis_guide && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300"><Search size={12} />خطوات التشخيص الميداني</h3>
              <div className="space-y-2">
                {data.diagnosis_guide.field_diagnosis_steps_ar?.map((step, i) => (
                  <div key={i} className="rounded-lg bg-white dark:bg-gray-700/50 p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-[9px] font-bold text-orange-600 dark:text-orange-400 shrink-0">{step.step}</span>
                      <div>
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">{step.action_ar}</span>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{step.details_ar}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {data.diagnosis_guide.lab_methods_ar?.length > 0 && (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-300"><FlaskConical size={12} />طرق التحليل المخبري</h3>
                <div className="space-y-2">
                  {data.diagnosis_guide.lab_methods_ar.map((method, i) => (
                    <div key={i} className="rounded-lg bg-white dark:bg-gray-700/50 p-2.5">
                      <span className="text-[11px] font-bold text-gray-900 dark:text-white">{method.method_ar}</span>
                      {method.use_ar && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{method.use_ar}</p>}
                      {method.steps_ar?.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {method.steps_ar.map((step, j) => (
                            <li key={j} className="text-[10px] text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                              <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.diagnosis_guide.identification_key_ar && (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300"><BookOpen size={12} />مفتاح التشخيص السريع</h3>
                <div className="space-y-1.5">
                  {Object.entries(data.diagnosis_guide.identification_key_ar).map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-white dark:bg-gray-700/50 p-2">
                      <p className="text-[10px] text-gray-600 dark:text-gray-400">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'management' && data.integrated_management_plan && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300"><Shield size={12} />{data.integrated_management_plan.title_ar}</h3>
              <div className="space-y-3">
                {data.integrated_management_plan.phases?.map((phase, i) => (
                  <div key={i} className="rounded-lg bg-white dark:bg-gray-700/50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-[9px] font-bold text-orange-600 dark:text-orange-400">{phase.phase}</span>
                        {phase.name_ar}
                      </span>
                      <span className="text-[10px] text-orange-600 dark:text-orange-400">{phase.timing_ar}</span>
                    </div>
                    <ul className="space-y-1">
                      {phase.actions_ar?.map((action, j) => (
                        <li key={j} className="text-[10px] text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                          <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'beneficial' && data.beneficial_nematodes && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300"><Shield size={12} />{data.beneficial_nematodes.title_ar}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{data.beneficial_nematodes.description_ar}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.beneficial_nematodes.species?.map((b, i) => (
                <div key={b.id || i} className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Star size={14} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">{b.name_ar}</h3>
                      <p className="text-[10px] italic text-gray-500 dark:text-gray-400">{b.name_en}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{b.how_it_works_ar}</p>
                  {b.target_insects_ar?.length > 0 && (
                    <div className="mb-2">
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400">الآفات المستهدفة: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {b.target_insects_ar.map((t, j) => (
                          <span key={j} className="rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2 py-0.5 text-[9px] text-red-600 dark:text-red-400">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-[10px] mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">الاستخدام:</span>
                      <p className="font-bold text-gray-900 dark:text-white">{b.application_ar}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">التوفر:</span>
                      <p className="font-bold text-gray-900 dark:text-white">{b.availability_ar}</p>
                    </div>
                  </div>
                  {b.safety_ar && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                      <Shield size={10} />
                      {b.safety_ar}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'susceptibility' && data.crops_susceptibility_matrix && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300"><BookOpen size={12} />{data.crops_susceptibility_matrix.title_ar}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-right py-2 px-2 font-bold text-gray-900 dark:text-white">المحصول</th>
                      {Object.keys(data.crops_susceptibility_matrix.matrix[0] || {}).filter(k => k !== 'crop_ar').map((key) => (
                        <th key={key} className="text-center py-2 px-2 font-bold text-gray-700 dark:text-gray-300">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.crops_susceptibility_matrix.matrix?.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/30">
                        <td className="py-2 px-2 font-bold text-gray-900 dark:text-white">{row.crop_ar}</td>
                        {Object.entries(row).filter(([key]) => key !== 'crop_ar').map(([key, val]) => (
                          <td key={key} className="text-center py-2 px-2">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                              val === 4 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                              val === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                              val === 2 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                              val === 1 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                              'bg-gray-100 dark:bg-gray-700/50 text-gray-500'
                            }`}>{val}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default NematodaPage;
