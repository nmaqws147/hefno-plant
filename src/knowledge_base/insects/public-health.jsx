import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ChevronLeft, X, Bug, AlertTriangle, Shield, Calendar, Info, FlaskConical, Layers, Activity, MapPin } from 'lucide-react';
import afatData from '../../afat-folder/afat.json';

const getSeverityClass = (severity) => {
  if (!severity) return 'bg-gray-500 text-white';
  if (severity === 'very high') return 'bg-red-500 text-white';
  if (severity === 'high') return 'bg-orange-500 text-white';
  if (severity === 'medium') return 'bg-yellow-500 text-white';
  if (severity === 'low') return 'bg-emerald-500 text-white';
  return 'bg-gray-500 text-white';
};

const getSeverityText = (severity) => {
  if (severity === 'very high') return 'شديد جداً';
  if (severity === 'high') return 'شديد';
  if (severity === 'medium') return 'متوسط';
  if (severity === 'low') return 'خفيف';
  return 'غير محدد';
};

const PublicHealthPestsPage = () => {
  const navigate = useNavigate();
  const [selectedPest, setSelectedPest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState(afatData.groups?.[0]?.group_id || null);
  const [activeTab, setActiveTab] = useState('symptoms');

  const handlePestClick = (pest) => {
    setSelectedPest(pest);
    setShowModal(true);
    setActiveTab('symptoms');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPest(null);
  };

  const activeGroupData = afatData.groups?.find(g => g.group_id === activeGroup);
  const totalPests = afatData.groups?.reduce((sum, g) => sum + (g.pests?.length || 0), 0) || 0;

  const modalTabs = [
    { id: 'symptoms', label: 'الأعراض والتشخيص' },
    { id: 'management', label: 'الإدارة والمكافحة' },
    { id: 'biology', label: 'البيولوجيا' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <Helmet>
        <title>آفات الصحة العامة | Hefno-Plant</title>
        <meta name="description" content="قاعدة بيانات شاملة لآفات الصحة العامة — البعوض، الذباب، القوارض، والآفات الناقلة للأمراض وطرق مكافحتها" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/knowledge-base/insects')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/80">
          <ChevronRight size={16} />
          <span>العودة</span>
        </button>

        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shrink-0">
              <span className="text-2xl">🦟</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{afatData.category_ar}</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">{afatData.category_en}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{afatData.category_description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100/40 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                  <Layers size={14} />
                  {afatData.groups_count} مجموعات
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100/40 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Bug size={14} />
                  {totalPests} آفة صحية
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {afatData.groups?.map((group) => (
            <button key={group.group_id} onClick={() => setActiveGroup(group.group_id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                activeGroup === group.group_id
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/50 hover:shadow-sm'
              }`}>
              <span>{group.group_ar}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeGroup === group.group_id
                  ? 'bg-white/20 text-white'
                  : 'bg-white dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'
              }`}>{group.pests?.length || 0}</span>
            </button>
          ))}
        </div>

        {activeGroupData && (
          <div className="mb-6 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shrink-0">
                <Bug size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-rose-700 dark:text-rose-400">{activeGroupData.group_ar}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activeGroupData.group_en}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeGroupData?.pests?.map((pest) => (
            <div key={pest.id} onClick={() => handlePestClick(pest)}
              className="group cursor-pointer rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border-r-[3px] border-rose-500">

              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{pest.name_ar}</h3>
                  <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{pest.scientificName}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityClass(pest.severity)}`}>
                  {getSeverityText(pest.severity)}
                </span>
              </div>

              <p className="text-xs leading-relaxed line-clamp-2 text-gray-500 dark:text-gray-400 mb-3">{pest.fullDescription?.substring(0, 120)}...</p>

              {pest.healthRisk && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 mb-2">
                  <AlertTriangle size={10} /> {pest.healthRisk}
                </span>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3 mt-2">
                <div className="flex flex-wrap gap-1">
                  {pest.peakSeason && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] text-gray-500">{pest.peakSeason}</span>}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                  التفاصيل <ChevronLeft size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedPest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-900 shadow-2xl animate-modal-in" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-5 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shrink-0 text-xl">
                <span>🦟</span>
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{selectedPest.name_ar}</h2>
                <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{selectedPest.scientificName}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{selectedPest.family_en}</p>
              </div>
              <button onClick={closeModal}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500">
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-1 border-b border-gray-100 dark:border-gray-800 px-5 pt-2 overflow-x-auto">
              {modalTabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[11px] font-bold transition-all rounded-t-xl ${
                    activeTab === tab.id
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {activeTab === 'symptoms' && (
                <>
                  {selectedPest.fullDescription && (
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <Info size={12} />
                        الوصف
                      </h3>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{selectedPest.fullDescription}</p>
                    </div>
                  )}

                  {selectedPest.symptoms_on_human?.length > 0 && (
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                        <Activity size={12} />
                        الأعراض على الإنسان
                      </h3>
                      <ul className="space-y-1.5">
                        {selectedPest.symptoms_on_human.map((symptom, idx) => (
                          <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-rose-500 mt-0.5 shrink-0">•</span>
                            {symptom}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPest.diseasesTransmitted?.length > 0 && (
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <AlertTriangle size={12} />
                        الأمراض المنقولة
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPest.diseasesTransmitted.map((disease, idx) => (
                          <span key={idx} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{disease}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPest.breedingSites?.length > 0 && (
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                        <MapPin size={12} />
                        أماكن التكاثر
                      </h3>
                      <ul className="space-y-1.5">
                        {selectedPest.breedingSites.map((site, idx) => (
                          <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-rose-500 mt-0.5 shrink-0">•</span>
                            {site}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedPest.geographicDistribution && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <MapPin size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">الانتشار الجغرافي</h4>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400">{selectedPest.geographicDistribution}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedPest.peakSeason && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                            <Calendar size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">موسم الذروة</h4>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400">{selectedPest.peakSeason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'management' && (
                <>
                  {selectedPest.healthRisk && (
                    <div className="rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" />
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-400">{selectedPest.healthRisk}</span>
                      </div>
                    </div>
                  )}

                  {selectedPest.management && (
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <Shield size={12} />
                        المكافحة
                      </h3>
                      {selectedPest.management.environmental?.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                            <MapPin size={11} />
                            المكافحة البيئية
                          </h4>
                          <ul className="space-y-1">
                            {selectedPest.management.environmental.map((item, i) => (
                              <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedPest.management.biological?.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                            <FlaskConical size={11} />
                            المكافحة الحيوية
                          </h4>
                          <ul className="space-y-1">
                            {selectedPest.management.biological.map((item, i) => (
                              <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedPest.management.chemical?.length > 0 && (
                        <div>
                          <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                            <FlaskConical size={11} />
                            المكافحة الكيميائية
                          </h4>
                          <ul className="space-y-1">
                            {selectedPest.management.chemical.map((item, i) => (
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
                </>
              )}

              {activeTab === 'biology' && selectedPest.lifeCycle && (
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                  <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                    <Info size={12} />
                    دورة الحياة
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Object.entries(selectedPest.lifeCycle).map(([stage, description]) => {
                      const stageLabels = { egg: 'بيضة', larva: 'يرقة', pupa: 'عذراء', adult: 'بالغة' };
                      const stageColors = {
                        egg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40',
                        larva: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/40',
                        pupa: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700/40',
                        adult: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/40',
                      };
                      return (
                        <div key={stage} className={`p-3 rounded-xl border ${stageColors[stage] || 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700'}`}>
                          <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{stageLabels[stage] || stage}</div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}.animate-modal-in{animation:modalIn 0.3s ease}`}</style>
    </div>
  );
};

export default PublicHealthPestsPage;
