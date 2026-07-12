import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ChevronLeft, X, Bug, AlertTriangle, Shield, Calendar, Info, Clock, FlaskConical, Sprout, Heart, Layers } from 'lucide-react';
import pathogensData from '../../disease-folder/fungi.json';

const ITEMS_PER_PAGE = 5;

const COLOR = {
  border: 'border-purple-500',
  text: 'text-purple-600 dark:text-purple-400',
  hover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
  bgLight: 'bg-purple-50 dark:bg-purple-950/30',
  bgIcon: 'bg-purple-100 dark:bg-purple-900/30',
  gradient: 'from-purple-500 to-purple-600',
  badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  tabActive: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400',
  back: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/80',
  pagination: 'bg-purple-500 text-white shadow-md shadow-purple-200/50 dark:shadow-purple-900/30',
};

const getSeverityClass = (severity) => {
  if (!severity) return 'bg-gray-500 text-white';
  const s = severity.toLowerCase();
  if (s.includes('عالية جدا') || s === 'very high' || s.includes('very high')) return 'bg-red-500 text-white';
  if (s.includes('عالية') || s === 'high' || s.includes('high')) return 'bg-orange-500 text-white';
  if (s.includes('متوسطة') || s === 'moderate' || s.includes('moderate')) return 'bg-yellow-500 text-white';
  if (s.includes('منخفضة') || s === 'low' || s.includes('low')) return 'bg-emerald-500 text-white';
  return 'bg-gray-500 text-white';
};

const severityText = (severity) => {
  if (!severity) return 'متوسط';
  const s = severity.toLowerCase();
  if (s.includes('عالية جدا') || s === 'very high' || s.includes('very high')) return 'شديد جداً';
  if (s.includes('عالية') || s === 'high' || s.includes('high')) return 'شديد';
  if (s.includes('متوسطة') || s === 'moderate' || s.includes('moderate')) return 'متوسط';
  if (s.includes('منخفضة') || s === 'low' || s.includes('low')) return 'خفيف';
  return 'متوسط';
};

const modalTabs = [
  { id: 'symptoms', label: 'الأعراض والتشخيص' },
  { id: 'management', label: 'المكافحة والعلاج' },
  { id: 'biology', label: 'دورة الحياة والظروف' },
];

const Section = ({ title, icon: Icon, children, list }) => (
  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
    <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
      {Icon && <Icon size={12} />}
      {title}
    </h3>
    {list ? (
      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        {list.map((item, i) => <li key={i}>• {item}</li>)}
      </ul>
    ) : (
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>
    )}
  </div>
);

const SubSection = ({ title, icon: Icon, list }) => (
  <div className="mb-3">
    <h4 className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{Icon && <Icon size={11} />}{title}</h4>
    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">{list.map((item, i) => <li key={i}>• {item}</li>)}</ul>
  </div>
);

const InfoItem = ({ label, value, badge }) => (
  <div className="flex justify-between text-xs">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    {badge ? (
      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${getSeverityClass(value)}`}>{value}</span>
    ) : (
      <span className="font-bold text-gray-900 dark:text-white">{value || '-'}</span>
    )}
  </div>
);

const ZygomycotaDiseasesPage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('symptoms');
  const [currentPage, setCurrentPage] = useState(1);

  const diseases = pathogensData.zygo || [];

  const totalPages = Math.max(1, Math.ceil(diseases.length / ITEMS_PER_PAGE));
  const paginated = diseases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  const handleDiseaseClick = (d) => {
    setSelected(d);
    setShowModal(true);
    setActiveTab('symptoms');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <Helmet>
        <title>الفطريات الزيجية | Hefno-Plant</title>
        <meta name="description" content="قائمة أمراض الفطريات الزيجية — أعفان الثمار المخزنة والعفن الأسود." />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/knowledge-base/diseases/fungi')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-400 transition-colors hover:bg-purple-100 dark:hover:bg-purple-950/80"
        >
          <ChevronRight size={16} />
          <span>العودة</span>
        </button>

        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${COLOR.gradient} text-white shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30 shrink-0`}>
              <Bug size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">الفطريات الزيجية</h1>
              <p className={`mt-1 text-sm italic ${COLOR.text}`}>Zygomycota (Bread Molds)</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">فطريات حقيقية تتميز بنموها السريع جداً وميسيليوم غير مقسم بحواجز — تنتشر عبر الهواء والتربة</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-purple-100/40 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-400">
                  <AlertTriangle size={14} />
                  {diseases.length} مرض
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100/40 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Layers size={14} />
                  Rhizopus • Mucor • Choanephora
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((d) => (
            <div
              key={d.id}
              onClick={() => handleDiseaseClick(d)}
              className={`group cursor-pointer rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border-r-[3px] ${COLOR.border}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-bold text-gray-900 dark:text-white ${COLOR.hover}`}>{d.name_ar}</h3>
                  <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{d.scientificName}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${getSeverityClass(d.severity)}`}>
                  {severityText(d.severity)}
                </span>
              </div>

              <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                {d.fullDescription?.substring(0, 100)}...
              </p>

              <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-700 pt-3 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">الموسم:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{d.season || 'طوال العام'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">النوع:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{d.type?.split('—')[0]?.trim() || 'غير محدد'}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                <span className={`flex items-center gap-1 text-[11px] font-bold ${COLOR.text}`}>
                  التفاصيل
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all disabled:opacity-30 enabled:hover:bg-purple-50 dark:enabled:hover:bg-purple-900/30 text-gray-600 dark:text-gray-400"
            >
              <ChevronRight size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-200/50 dark:shadow-purple-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all disabled:opacity-30 enabled:hover:bg-purple-50 dark:enabled:hover:bg-purple-900/30 text-gray-600 dark:text-gray-400"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        )}

        {showModal && selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setShowModal(false); setSelected(null); }}
          >
            <div
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-900 shadow-2xl animate-modal-in"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-5 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 shrink-0 text-xl">
                  <span>🧫</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">{selected.name_ar}</h2>
                  <p className="text-[11px] italic text-gray-500 dark:text-gray-400 truncate">{selected.scientificName}</p>
                </div>
                <button
                  onClick={() => { setShowModal(false); setSelected(null); }}
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
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400'
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
                    {selected.fullDescription && <Section title="الوصف الكامل" icon={Info}>{selected.fullDescription}</Section>}
                    {selected.symptoms?.length > 0 && <Section title="الأعراض" icon={AlertTriangle} list={selected.symptoms} />}
                    {selected.economicThreshold && (
                      <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <AlertTriangle size={12} />
                          العتبة الاقتصادية
                        </h3>
                        <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{selected.economicThreshold}</p>
                      </div>
                    )}
                    {selected.hostPlants?.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                          <Sprout size={12} />
                          العوائل المصابة
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.hostPlants.map((h, i) => (
                            <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{h}</span>
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
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                          <Shield size={12} />
                          المكافحة
                        </h3>
                        {selected.management.cultural && <SubSection title="المكافحة الزراعية" icon={Sprout} list={selected.management.cultural} />}
                        {selected.management.biological && <SubSection title="المكافحة الحيوية" icon={Bug} list={selected.management.biological} />}
                        {selected.management.chemical && <SubSection title="المكافحة الكيماوية" icon={FlaskConical} list={selected.management.chemical} />}
                      </div>
                    )}
                    {selected.naturalEnemies?.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <Heart size={12} />
                          الأعداء الطبيعية
                        </h3>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {selected.naturalEnemies.map((e, i) => <li key={i}>• {e}</li>)}
                        </ul>
                      </div>
                    )}
                    {selected.prevention_notes && (
                      <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/20 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <Shield size={12} />
                          ملاحظات الوقاية
                        </h3>
                        <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">{selected.prevention_notes}</p>
                      </div>
                    )}
                    {selected.resistanceRisk && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <AlertTriangle size={12} />
                          مقاومة المبيدات
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{selected.resistanceRisk}</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'biology' && (
                  <>
                    {selected.infectionCycle && <Section title="دورة الإصابة" icon={Calendar}>{selected.infectionCycle}</Section>}
                    {selected.favorableConditions && (
                      <div className="rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                          <Clock size={12} />
                          الظروف الملائمة للإصابة
                        </h3>
                        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">{selected.favorableConditions}</p>
                      </div>
                    )}
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4 space-y-2">
                      <InfoItem label="نوع المرض" value={selected.type?.split('—')[0]?.trim()} />
                      <InfoItem label="شدة الإصابة" value={severityText(selected.severity)} badge />
                      <InfoItem label="الموسم" value={selected.season || 'طوال العام'} />
                      <InfoItem label="الفعالية" value={selected.effectiveness} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}.animate-modal-in{animation:modalIn 0.3s ease}`}</style>
    </div>
  );
};

export default ZygomycotaDiseasesPage;
