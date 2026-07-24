import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { AlertTriangle, Bug, Leaf, Search, ArrowLeft, FlaskConical, Shield, BookOpen, X, Droplets, Star, ClipboardList, Wheat, Layers, Activity } from 'lucide-react';
import SEO from '../../component/SEO';
import { makeBreadcrumbs, makeCollection } from '../../component/structuredData';
import data from '../../knowledge_base/nematoda/nematoda.json';
import { getGroups } from '../../pesticides-folder/buildGroups';
import nemaData from '../../pesticides-folder/pesti-items/nema.json';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  })
};

const dangerColors = {
  'عالية جداً': { border: 'border-red-500', badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', icon: '🔴' },
  'عالية': { border: 'border-orange-500', badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', icon: '🟠' },
  'متوسطة-عالية': { border: 'border-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', icon: '🟡' },
  'متوسطة': { border: 'border-yellow-500', badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', icon: '🟢' },
};

export default function NematodaSpeciesList() {
  const navigate = useNavigate();
  const { species, metadata, beneficial_nematodes, registered_nematicides } = data;

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemModalTab, setItemModalTab] = useState(0);

  const groups = useMemo(() => getGroups('nema-grp'), []);

  const itemsByGroup = useMemo(() => {
    const map = {};
    nemaData.items.forEach(item => {
      const gid = item.nematicide_group_id;
      if (!map[gid]) map[gid] = [];
      map[gid].push(item);
    });
    return map;
  }, []);

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
      <SEO
        title="قاعدة بيانات النيماتودا"
        description="دليل شامل للنيماتودا الضارة والنافعة — تشخيص، أعراض، مكافحة متكاملة، وأحدث المبيدات"
        url="/knowledge-base/nematoda-species"
        keywords="نيماتودا, نيماتودا تعقد الجذور, نيماتودا التقرح, Meloidogyne, مكافحة النيماتودا, مبيدات نيماتودية"
        breadcrumbs={makeBreadcrumbs('/knowledge-base/nematoda-species')}
        jsonLd={makeCollection('قاعدة بيانات النيماتودا', '/knowledge-base/nematoda-species', 'دليل شامل لتشخيص ومكافحة النيماتودا')}
      />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-red-500/5 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 p-5 sm:p-7 mb-6"
        >
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-red-500/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white grid place-items-center shrink-0 shadow-lg">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-red-800 dark:text-red-300">النيماتودا — تحذير</h1>
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{metadata.warning_ar}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-200/70 dark:bg-red-900/40 text-red-700 dark:text-red-300">12 نوع موثق</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-200/70 dark:bg-red-900/40 text-red-700 dark:text-red-300">8 أنواع ضارة</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-200/70 dark:bg-red-900/40 text-red-700 dark:text-red-300">{species.length} أنواع رئيسية</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Species Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {species.map((s, i) => {
            const dc = dangerColors[s.danger_level] || dangerColors['متوسطة'];
            return (
              <motion.div
                key={s.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/knowledge-base/nematoda-species/${s.id}`)}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-white/[0.08] bg-gradient-to-b from-[oklch(0.24_0.04_155/0.85)] to-[oklch(0.16_0.02_155/0.6)] backdrop-blur-xl cursor-pointer transition-all hover:border-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)] min-h-[220px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent opacity-30" />
                <div className="relative p-4 sm:p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`size-8 rounded-xl ${dc.badge} border grid place-items-center`}>
                        <Leaf size={16} />
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight">{s.name_ar}</h3>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dc.badge} shrink-0`}>
                      {dc.icon} {s.danger_level}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed mb-2 line-clamp-2">{s.name_scientific}</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-2 line-clamp-2">{s.description_ar}</p>
                  <div className="mb-2">
                    <div className="text-xs font-semibold text-primary">{s.prevalence_egypt}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {s.host_crops.slice(0, 4).map((c) => (
                      <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-md border border-white/10 text-gray-300">{c}</span>
                    ))}
                    {s.host_crops.length > 4 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400">+{s.host_crops.length - 4}</span>
                    )}
                  </div>
                  <div className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    عرض التفاصيل <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Beneficial Nematodes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/30 dark:to-emerald-900/20 p-5 sm:p-7 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-green-500 text-white grid place-items-center"><Shield size={18} /></div>
            <h2 className="text-base font-black text-green-800 dark:text-green-300">النيماتودا المفيدة — المكافحة البيولوجية</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {beneficial_nematodes.map((epn) => (
              <div key={epn.id} className="p-4 bg-white/60 dark:bg-white/5 rounded-xl border border-green-200 dark:border-green-900/40">
                <h3 className="text-sm font-bold text-green-700 dark:text-green-400 mb-1">{epn.name_ar}</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">{epn.description_ar}</p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">{epn.availability_ar}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">{epn.safety_ar}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Nematicides — Groups */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 p-5 sm:p-7"
        >
          <div className="absolute -top-10 -left-10 size-32 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="relative flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white grid place-items-center shadow-lg"><FlaskConical size={18} /></div>
            <div>
              <h2 className="text-base font-black text-amber-800 dark:text-amber-300">المبيدات النيماتودية — المواد الفعالة</h2>
              <p className="text-[11px] text-amber-600 dark:text-amber-400">دليل شامل لـ 26 مادة فعالة في 8 مجموعات كيميائية وبيولوجية</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-200/70 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <Layers size={12} /> {groups.length} مجموعات
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-200/70 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <FlaskConical size={12} /> {nemaData.total_count} مادة فعالة
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {groups.map((group) => {
              const items = itemsByGroup[group.id] || [];
              return (
                <motion.div
                  key={group.id}
                  whileHover={{ y: -3 }}
                  onClick={() => { setSelectedGroup(group); setShowGroupModal(true); }}
                  className="group cursor-pointer rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-white/80 dark:bg-amber-950/20 p-3 shadow-sm transition-all hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                      {group.code || group.id?.split('-').pop()}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{items.length} م.ف</span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white leading-tight mb-1">{group.chemical_class_en || group.name_ar}</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{group.name_ar || group.name_en}</p>
                  {group.MoA_ar && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{group.MoA_ar.substring(0, 35)}...</p>
                  )}
                  <div className="mt-2 flex items-center justify-between border-t border-amber-100 dark:border-amber-800/30 pt-2">
                    <span className="text-[9px] text-amber-600 dark:text-amber-400">{group.chemical_class_ar || ''}</span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      عرض <ArrowLeft className="size-2.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Group Modal */}
        {showGroupModal && selectedGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowGroupModal(false)}>
            <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-900 shadow-2xl animate-modal-in" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-5 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shrink-0">
                  <FlaskConical size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">{selectedGroup.chemical_class_en || selectedGroup.name_ar}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedGroup.name_ar} — رمز {selectedGroup.code}</p>
                  <div className="mt-1 flex gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                      {(itemsByGroup[selectedGroup.id] || []).length} مادة فعالة
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowGroupModal(false)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
              {selectedGroup.MoA_ar && (
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{selectedGroup.MoA_ar}</p>
                </div>
              )}
              <div className="p-5">
                {(itemsByGroup[selectedGroup.id] || []).length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">لا توجد مواد فعالة في هذه المجموعة</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(itemsByGroup[selectedGroup.id] || []).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => { setSelectedItem(item); setShowItemModal(true); setItemModalTab(0); }}
                        className="group cursor-pointer rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                      >
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{item.name_ar}</h4>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">{item.name_en} — {item.type_ar}</p>
                        <div className="space-y-1 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">التركيب:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{item.chemical_class_en || '—'}</span>
                          </div>
                          {item.application?.dose_feddan_ar && (
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">الجرعة:</span>
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
                        {item.target_nematodes?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.target_nematodes.slice(0, 3).map((n, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{n.name_ar}</span>
                            ))}
                            {item.target_nematodes.length > 3 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500">+{item.target_nematodes.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                {/* Tab 0: Info */}
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
                {/* Tab 1: Application + Resistance */}
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
                {/* Tab 2: Targets + Safety */}
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
