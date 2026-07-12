import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, Bug, ChevronLeft, ChevronRight, Clock, FlaskConical, Heart, Info, Search, Shield, X } from 'lucide-react';
import pathogens from '../disease-folder/bacteria.json';

const ITEMS_PER_PAGE = 5;

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

const BacteriaPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const diseases = pathogens || [];
  const totalPages = Math.max(1, Math.ceil(diseases.length / ITEMS_PER_PAGE));
  const paginated = diseases.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openModal = (d) => { setSelected(d); setShowModal(true); setActiveTab('description'); };
  const closeModal = () => { setShowModal(false); setSelected(null); };

  const modalTabs = [
    { id: 'description', label: 'الوصف والأعراض' },
    { id: 'cycle', label: 'دورة المرض والظروف' },
    { id: 'management', label: 'المكافحة' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <Helmet>
        <title>الأمراض البكتيرية | Hefno-Plant</title>
        <meta name="description" content="دليل الأمراض البكتيرية — معلومات شاملة عن البكتيريا المسببة لأمراض النبات." />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/knowledge-base/diseases')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/80"
        >
          <ChevronRight size={16} />
          <span>العودة</span>
        </button>

        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 shrink-0">
              <span className="text-2xl">🦠</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">الأمراض البكتيرية</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">Bacterial Diseases</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">البكتيريا المسببة لأمراض النبات كائنات وحيدة الخلية بدائية النواة. تنتشر عبر الماء والرياح والحشرات والجروح.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <AlertTriangle size={14} />
                  {diseases.length} مرض بكتيري
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-100/40 dark:border-gray-800/40 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                  Xanthomonas • Pseudomonas • Erwinia
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((d) => (
            <div
              key={d.id}
              onClick={() => openModal(d)}
              className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/70 p-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer border-r-[3px] border-emerald-500"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{d.name_ar}</h3>
                  <p className="text-[11px] italic text-gray-500">{d.scientificName}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityClass(d.severity)}`}>
                  {getSeverityText(d.severity)}
                </span>
              </div>

              <p className="text-xs leading-relaxed line-clamp-2 text-gray-600 dark:text-gray-400 mb-3">{d.fullDescription ? d.fullDescription.slice(0, 100) + '...' : ''}</p>

              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3 mt-2">
                <div className="flex flex-wrap gap-1">
                  {d.family_ar && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] text-gray-500">{d.family_ar?.split('—')[0]?.trim()}</span>}
                  {d.hostPlants?.length > 0 && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] text-gray-500">{d.hostPlants[0]}</span>}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  التفاصيل <ChevronLeft size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0 text-xl">
                  <span>🦠</span>
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
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
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
                        {selected.family_ar && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">العائلة</span>
                            <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selected.family_ar?.split(' — ')[0]?.trim()}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">شدة الإصابة</span>
                          <p className={`mt-0.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityClass(selected.severity)}`}>{getSeverityText(selected.severity)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">نوع المرض</span>
                          <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selected.type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">العوائل</span>
                          <p className="font-bold text-gray-900 dark:text-white mt-0.5">{Array.isArray(selected.hostPlants) ? selected.hostPlants.join('، ') : '-'}</p>
                        </div>
                      </div>
                    </div>

                    {selected.fullDescription && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                          <Info size={12} />
                          الوصف الكامل
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{selected.fullDescription}</p>
                      </div>
                    )}

                    {selected.symptoms?.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <AlertTriangle size={12} />
                          الأعراض
                        </h3>
                        <ul className="space-y-1.5">
                          {selected.symptoms.map((s, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'cycle' && (
                  <>
                    {selected.infectionCycle && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                          <Clock size={12} />
                          دورة العدوى
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{selected.infectionCycle}</p>
                      </div>
                    )}
                    {selected.favorableConditions && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <Search size={12} />
                          الظروف الملائمة
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{selected.favorableConditions}</p>
                      </div>
                    )}
                    {selected.naturalEnemies?.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <Heart size={12} />
                          الأعداء الطبيعية
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

                {activeTab === 'management' && (
                  <>
                    {selected.management && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <Shield size={12} />
                          المكافحة
                        </h3>
                        {selected.management.cultural?.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                              <Bug size={11} />
                              المكافحة الزراعية
                            </h4>
                            <ul className="space-y-1">
                              {selected.management.cultural.map((item, i) => (
                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                  <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selected.management.biological?.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1"><FlaskConical size={11} />المكافحة الحيوية</h4>
                            <ul className="space-y-1">
                              {selected.management.biological.map((item, i) => (
                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                  <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selected.management.chemical?.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1"><FlaskConical size={11} />المكافحة الكيميائية</h4>
                            <ul className="space-y-1">
                              {selected.management.chemical.map((item, i) => (
                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                  <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">الفعالية</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{selected.effectiveness || 'غير محدد'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">الموسم</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{selected.season || 'طوال العام'}</p>
                      </div>
                      {selected.resistanceRisk && (
                        <>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">خطر المقاومة</span>
                            <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{selected.resistanceRisk}</p>
                          </div>
                          {selected.economicThreshold && (
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">العتبة الاقتصادية</span>
                              <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{selected.economicThreshold}</p>
                            </div>
                          )}
                        </>
                      )}
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

export default BacteriaPage;
