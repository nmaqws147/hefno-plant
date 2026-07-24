import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ArrowRight, AlertTriangle, Leaf, Bug, Activity, FlaskConical, Shield, Search, BookOpen, Droplets, Thermometer, MapPin, X, Star, ClipboardList, Wheat } from 'lucide-react';
import SEO from '../../component/SEO';
import { makeBreadcrumbs } from '../../component/structuredData';
import data from '../../knowledge_base/nematoda/nematoda.json';
import nemaData from '../../pesticides-folder/pesti-items/nema.json';

const dangerColors = {
  'عالية جداً': { border: 'border-red-500', badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', bg: 'from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20', icon: '🔴' },
  'عالية': { border: 'border-orange-500', badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', bg: 'from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20', icon: '🟠' },
  'متوسطة-عالية': { border: 'border-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', bg: 'from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20', icon: '🟡' },
  'متوسطة': { border: 'border-yellow-500', badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', bg: 'from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20', icon: '🟢' },
};

function DetailCard({ icon: Icon, title, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`p-4 sm:p-5 bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm ${className}`}
    >
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3 border-r-[3px] border-emerald-500 pr-3">
        {Icon && <Icon size={15} className="text-emerald-500" />} {title}
      </h3>
      {children}
    </motion.div>
  );
}

function Tag({ children, color = 'emerald' }) {
  const cls = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  }[color] || cls.emerald;
  return <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${cls}`}>{children}</span>;
}

export default function NematodaSpeciesDetail() {
  const { speciesId } = useParams();
  const navigate = useNavigate();
  const species = data.species.find(s => s.id === speciesId);

  if (!species) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f1a09]" dir="rtl">
        <div className="text-center">
          <Search size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">لم يتم العثور على النوع المطلوب</p>
          <button onClick={() => navigate('/knowledge-base/nematoda-species')} className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">العودة للقائمة</button>
        </div>
      </div>
    );
  }

  const dc = dangerColors[species.danger_level] || dangerColors['متوسطة'];
  const [beneficial] = data.beneficial_nematodes;

  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemModalTab, setItemModalTab] = useState(0);

  const speciesNematicides = useMemo(() => {
    return nemaData.items.filter(item =>
      item.target_nematodes?.some(n =>
        species.name_ar.includes(n.name_ar.replace(/^نيماتودا\s+/, '')) ||
        n.name_ar.includes(species.name_ar.replace(/^نيماتودا\s+/, '')) ||
        species.common_species?.some(cs => n.name_ar.includes(cs.split(' ')[0])) ||
        species.name_en.toLowerCase().includes(n.name_ar.replace(/^نيماتودا\s+/, '').toLowerCase())
      )
    );
  }, [species]);

  const getRiskLevel = (risk) => {
    if (typeof risk === 'number') return risk;
    const r = String(risk || '').toLowerCase();
    if (r.includes('عالي جدا') || r.includes('very high')) return 4;
    if (r.includes('عالي') || r.includes('high')) return 3;
    if (r.includes('متوسط') || r.includes('medium')) return 2;
    if (r.includes('منخفض') || r.includes('low')) return 1;
    return 2;
  };
  const getRiskColor = (risk) => {
    const level = getRiskLevel(risk);
    if (level >= 4) return '#dc2626';
    if (level === 3) return '#f59e0b';
    if (level === 2) return '#eab308';
    return '#10b981';
  };
  const getRiskText = (risk) => {
    const r = String(risk || '').toLowerCase();
    if (r.includes('عالي جدا') || r.includes('very high')) return 'شديد جداً';
    if (r.includes('عالي') || r.includes('high')) return 'شديد';
    if (r.includes('متوسط') || r.includes('medium')) return 'متوسط';
    if (r.includes('منخفض') || r.includes('low')) return 'منخفض';
    return 'متوسط';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1a09]" dir="rtl">
      <SEO title={species.name_ar} description={`${species.name_ar} — ${species.name_scientific} — ${species.description_ar}`} url={`/knowledge-base/nematoda-species/${species.id}`} keywords={`${species.name_ar}, ${species.name_scientific}, نيماتودا, ${species.common_species?.join(', ')}`} breadcrumbs={makeBreadcrumbs(`/knowledge-base/nematoda-species/${species.id}`)} />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-red-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 ${dc.border} bg-gradient-to-br ${dc.bg} p-5 sm:p-7`}
        >
          <button onClick={() => navigate('/knowledge-base/nematoda-species')} className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-3 transition-colors">
            <ArrowRight size={12} /> العودة للقائمة
          </button>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className={`size-16 rounded-2xl ${dc.badge} grid place-items-center text-xl shrink-0 border-2 ${dc.border}`}>{dc.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{species.name_ar}</h1>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${dc.badge}`}>{dc.icon} {species.danger_level}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{species.name_en}</p>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-500 mt-0.5 italic">{species.name_scientific}</p>
              {species.common_species && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {species.common_species.map(s => <Tag key={s} color="amber">{s}</Tag>)}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column */}
          <div className="space-y-5">
            <DetailCard icon={AlertTriangle} title="وصف النوع">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{species.description_ar}</p>
            </DetailCard>

            <DetailCard icon={Activity} title="نمط التغذية">
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{species.feeding_type_ar}</span>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-bold">الانتشار في مصر: </span>{species.prevalence_egypt}
              </div>
            </DetailCard>

            <DetailCard icon={Bug} title="الأعراض على النبات">
              {species.symptoms_aboveground && (
                <div className="mb-3">
                  <strong className="text-[11px] text-amber-600 dark:text-amber-400">أعراض هوائية:</strong>
                  <ul className="mt-1 space-y-1">
                    {species.symptoms_aboveground.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"><span className="size-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {species.symptoms_underground && (
                <div>
                  <strong className="text-[11px] text-red-600 dark:text-red-400">أعراض تحت الأرض:</strong>
                  <ul className="mt-1 space-y-1">
                    {species.symptoms_underground.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"><span className="size-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </DetailCard>

            <DetailCard icon={MapPin} title="العوائل النباتية">
              <div className="flex flex-wrap gap-1.5">
                {species.host_crops.map(c => <Tag key={c}>{c}</Tag>)}
              </div>
            </DetailCard>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <DetailCard icon={Thermometer} title="دورة الحياة">
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{species.lifecycle_summary}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-white/[0.04] text-center">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{species.lifecycle_summary?.split('—')[0]?.trim() || '—'}</div>
                  <div className="text-[10px] text-gray-400">دورة الحياة</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-white/[0.04] text-center">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{species.lifecycle_summary?.split('—')[1]?.trim() || '—'}</div>
                  <div className="text-[10px] text-gray-400">الأجيال / سنة</div>
                </div>
              </div>
            </DetailCard>

            <DetailCard icon={FlaskConical} title="الإدارة والمكافحة">
              <div className="space-y-2">
                <div className="p-3 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"><Shield size={12} /> الخطة المتكاملة</h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">{species.management_summary}</p>
                </div>
                <div className="p-3 bg-red-50/80 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/40">
                  <h4 className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5"><AlertTriangle size={12} /> عتبة الضرر الاقتصادي</h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">{species.threshold_ar}</p>
                </div>
              </div>
            </DetailCard>

            {beneficial && (
              <DetailCard icon={Shield} title="الأعداء الطبيعية (النيماتودا المفيدة)">
                <div className="p-3 bg-green-50/80 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/40">
                  <h4 className="text-xs font-bold text-green-700 dark:text-green-400">{beneficial.name_ar}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{beneficial.description_ar}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">{beneficial.availability_ar}</span>
                </div>
              </DetailCard>
            )}
          </div>
        </div>

        {/* Nematicides for this species */}
        <DetailCard icon={FlaskConical} title="المبيدات النيماتودية الموصى بها">
          {speciesNematicides.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">لا توجد مبيدات نيماتودية محددة لهذا النوع في قاعدة البيانات</p>
              <button
                onClick={() => navigate('/knowledge-base/pesticides/nematicides')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 px-4 py-2 text-[11px] font-bold text-amber-700 dark:text-amber-400 transition-colors hover:bg-amber-100 dark:hover:bg-amber-950/50"
              >
                <FlaskConical size={12} />
                استعرض جميع المبيدات النيماتودية (26 مادة فعالة)
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  {speciesNematicides.length} مادة فعالة
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {speciesNematicides.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setShowItemModal(true); setItemModalTab(0); }}
                    className="group cursor-pointer rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="size-6 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white grid place-items-center shrink-0">
                        <FlaskConical size={11} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{item.name_ar}</h4>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500">{item.name_en}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-[10px] pr-8">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">المجموعة:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{item.chemical_class_en || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">النوع:</span>
                        <span className="text-gray-700 dark:text-gray-300">{item.type_ar}</span>
                      </div>
                      {item.application?.dose_feddan_ar && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            <Droplets size={9} className="inline ml-0.5" />الجرعة:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">{item.application.dose_feddan_ar}</span>
                        </div>
                      )}
                      {item.resistance?.risk_ar && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">مقاومة:</span>
                          <span className="font-bold" style={{ color: getRiskColor(item.resistance.risk_ar) }}>{getRiskText(item.resistance.risk_ar)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-2">
                      <span className="text-[9px] text-amber-600 dark:text-amber-400">{item.nematicide_group_id?.split('-').pop() || ''}</span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        عرض التفاصيل <ArrowRight className="size-2.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DetailCard>

        {/* Item Detail Modal */}
        {showItemModal && selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowItemModal(false)}>
            <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-900 shadow-2xl animate-modal-in" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-5 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shrink-0">
                  <FlaskConical size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">{selectedItem.name_ar}</h2>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{selectedItem.name_en} — {selectedItem.type_ar}</p>
                </div>
                <button onClick={() => setShowItemModal(false)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-1 border-b border-gray-100 dark:border-gray-800 px-5 pt-2">
                {['معلومات', 'تطبيق ومقاومة', 'أهداف وسلامة'].map((tab, i) => (
                  <button key={tab} onClick={() => setItemModalTab(i)}
                    className={`px-4 py-2 text-[11px] font-bold transition-all rounded-t-xl ${
                      itemModalTab === i
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-5">
                {itemModalTab === 0 && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">المجموعة الكيميائية:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedItem.chemical_class_en || '—'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">نوع المادة:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedItem.type_ar}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">التأثير:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedItem.systemic ? 'جهازي' : 'ملامسي'}</span>
                        </div>
                        {selectedItem.activity_ar && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">آلية التأثير:</span>
                            <span className="font-bold text-gray-900 dark:text-white">{selectedItem.activity_ar}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedItem.special_use_ar && (
                      <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4">
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <Star size={12} /> استخدامات خاصة
                        </h4>
                        <p className="text-xs leading-relaxed text-amber-600 dark:text-amber-400">{selectedItem.special_use_ar}</p>
                      </div>
                    )}
                    {selectedItem.regulatory_ar && (
                      <div className="rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 p-4">
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                          <ClipboardList size={12} /> معلومات تنظيمية
                        </h4>
                        <p className="text-xs leading-relaxed text-blue-600 dark:text-blue-400">{selectedItem.regulatory_ar}</p>
                      </div>
                    )}
                  </div>
                )}
                {itemModalTab === 1 && (
                  <div className="space-y-4">
                    {selectedItem.application && Object.keys(selectedItem.application).length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Droplets size={12} /> معلومات التطبيق
                        </h4>
                        <div className="space-y-2">
                          {selectedItem.application.dose_feddan_ar && <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">الجرعة:</span><span className="font-bold text-gray-900 dark:text-white">{selectedItem.application.dose_feddan_ar}</span></div>}
                          {selectedItem.application.timing_ar && <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">التوقيت:</span><span className="text-gray-900 dark:text-white">{selectedItem.application.timing_ar}</span></div>}
                          {selectedItem.application.methods_ar?.length > 0 && <div className="text-xs"><span className="text-gray-500 dark:text-gray-400">طريقة التطبيق: </span><span className="text-gray-900 dark:text-white">{selectedItem.application.methods_ar.join('، ')}</span></div>}
                          {selectedItem.application.preharvest_interval_ar && <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">فترة التحريم:</span><span className="text-gray-900 dark:text-white">{selectedItem.application.preharvest_interval_ar}</span></div>}
                          {selectedItem.application.max_applications_season && <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-gray-400">الحد الأقصى:</span><span className="font-bold text-gray-900 dark:text-white">{selectedItem.application.max_applications_season} رشات/موسم</span></div>}
                        </div>
                      </div>
                    )}
                    {selectedItem.resistance && (
                      <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4">
                        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <AlertTriangle size={12} /> معلومات المقاومة
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">مخاطر المقاومة:</span>
                            <span className="font-bold" style={{ color: getRiskColor(selectedItem.resistance.risk_ar) }}>{getRiskText(selectedItem.resistance.risk_ar)}</span>
                          </div>
                          {selectedItem.resistance.mechanism_ar && (
                            <div className="text-xs">
                              <span className="text-gray-500 dark:text-gray-400">آلية المقاومة: </span>
                              <span className="text-amber-700 dark:text-amber-400">{selectedItem.resistance.mechanism_ar}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {itemModalTab === 2 && (
                  <div className="space-y-4">
                    {selectedItem.target_nematodes?.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                          <Shield size={12} /> النيماتودا المستهدفة
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedItem.target_nematodes.map((n, i) => (
                            <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{n.name_ar}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedItem.target_crops?.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Wheat size={12} /> المحاصيل
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedItem.target_crops.map((c, i) => (
                            <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedItem.safety_notes_ar && (
                      <div className="rounded-xl border border-red-200/60 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4">
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300">
                          <AlertTriangle size={12} /> تحذيرات السلامة
                        </h4>
                        <p className="text-xs leading-relaxed text-red-600 dark:text-red-400">{selectedItem.safety_notes_ar}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}
