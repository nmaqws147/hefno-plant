import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ChevronRight, ChevronLeft, Medal, FlaskConical, AlertTriangle, Package,
  Droplets, Skull, Leaf, HardHat, ClipboardList, Ship, CheckSquare, Phone,
  BookOpen, X, Info, ShieldCheck, Shield, Star, Globe, AlertCircle
} from 'lucide-react';
import foodSafetyData from './data.json';


const ITEMS_PER_PAGE = 5;

const TABS = [
  { key: 'international_standards', label: 'المعايير الدولية', icon: Medal, color: 'blue' },
  { key: 'pesticide_residues', label: 'متبقيات المبيدات', icon: FlaskConical, color: 'purple' },
  { key: 'mycotoxins', label: 'السموم الفطرية', icon: AlertTriangle, color: 'red' },
  { key: 'post_harvest', label: 'ما بعد الحصاد', icon: Package, color: 'emerald' },
  { key: 'irrigation_water_safety', label: 'مياه الري', icon: Droplets, color: 'cyan' },
  { key: 'heavy_metals', label: 'المعادن الثقيلة', icon: Skull, color: 'red' },
  { key: 'packaging_labeling', label: 'التعبئة والتغليف', icon: Package, color: 'amber' },
  { key: 'organic_farming', label: 'الزراعة العضوية', icon: Leaf, color: 'green' },
  { key: 'worker_safety', label: 'سلامة العمال', icon: HardHat, color: 'orange' },
  { key: 'farm_records', label: 'سجلات المزرعة', icon: ClipboardList, color: 'slate' },
  { key: 'export_requirements', label: 'اشتراطات التصدير', icon: Ship, color: 'blue' },
  { key: 'checklists', label: 'قوائم المراجعة', icon: CheckSquare, color: 'emerald' },
  { key: 'egypt_contacts', label: 'جهات الاتصال', icon: Phone, color: 'teal' },
  { key: 'iso_standards_index', label: 'معايير ISO', icon: BookOpen, color: 'gray' },
];

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button key={page} onClick={() => onPageChange(page)}
          className={`min-w-[36px] h-9 px-2 rounded-xl text-sm font-bold transition-all ${
            page === currentPage
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
              : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}>
          {page}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
};

const FoodSafetyPage = () => {
  const navigate = useNavigate();
  const d = foodSafetyData;

  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalSection, setModalSection] = useState('');
  const [modalTab, setModalTab] = useState('description');

  const getTabItems = (key) => {
    const map = {
      international_standards: d.international_standards?.standards || [],
      pesticide_residues: d.pesticide_residues?.key_markets || [],
      mycotoxins: d.mycotoxins?.types || [],
      post_harvest: d.post_harvest?.storage_table || [],
      irrigation_water_safety: [...(d.irrigation_water_safety?.microbiological_standards || []), ...(d.irrigation_water_safety?.chemical_standards || [])],
      heavy_metals: d.heavy_metals?.metals || [],
      packaging_labeling: d.packaging_labeling?.packaging_materials || [],
      organic_farming: d.organic_farming?.certification_bodies_egypt || [],
      worker_safety: d.worker_safety?.re_entry_intervals?.examples || [],
      farm_records: d.farm_records?.required_records || [],
      export_requirements: d.export_requirements?.eu_requirements?.mandatory_documents_ar || [],
      checklists: (() => {
        const all = [];
        Object.entries(d.checklists || {}).filter(([k]) => k !== 'title_ar' && k !== 'icon').forEach(([key, val]) => {
          (val.items_ar || []).forEach((item) => {
            all.push({ ...item, groupTitle: val.title_ar, groupKey: key });
          });
        });
        return all;
      })(),
      egypt_contacts: d.egypt_contacts?.contacts || [],
      iso_standards_index: d.iso_standards_index?.standards || [],
    };
    return map[key] || [];
  };

  const items = getTabItems(activeTab);
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginated = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const sevClass = (s) => {
    const map = { 'عالية جداً': 'very-high', 'عالية': 'high', 'متوسطة': 'moderate', 'منخفضة': 'low' };
    return map[s] || 'moderate';
  };
  const sevTextFor = (s) => {
    const map = { 'عالية جداً': 'شديد جداً', 'عالية': 'شديد', 'متوسطة': 'متوسط', 'منخفضة': 'خفيف' };
    return map[s] || 'متوسط';
  };
  const sc = {
    'very-high': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'high': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'moderate': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'low': 'bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400',
  };

  const cardBorder = (c) => {
    const map = { blue:'border-blue-500', purple:'border-purple-500', red:'border-red-500', emerald:'border-emerald-500', cyan:'border-cyan-500', amber:'border-amber-500', green:'border-green-500', orange:'border-orange-500', slate:'border-slate-500', teal:'border-teal-500', gray:'border-gray-500' };
    return map[c] || map.emerald;
  };
  const cardHover = (c) => {
    const map = { blue:'group-hover:text-blue-600 dark:group-hover:text-blue-400', purple:'group-hover:text-purple-600 dark:group-hover:text-purple-400', red:'group-hover:text-red-600 dark:group-hover:text-red-400', emerald:'group-hover:text-emerald-600 dark:group-hover:text-emerald-400', cyan:'group-hover:text-cyan-600 dark:group-hover:text-cyan-400', amber:'group-hover:text-amber-600 dark:group-hover:text-amber-400', green:'group-hover:text-green-600 dark:group-hover:text-green-400', orange:'group-hover:text-orange-600 dark:group-hover:text-orange-400', slate:'group-hover:text-slate-600 dark:group-hover:text-slate-400', teal:'group-hover:text-teal-600 dark:group-hover:text-teal-400', gray:'group-hover:text-gray-600 dark:group-hover:text-gray-400' };
    return map[c] || map.emerald;
  };
  const cardChip = (c) => {
    const map = { blue:'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', purple:'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', red:'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400', emerald:'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', cyan:'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400', amber:'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400', green:'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400', orange:'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400', slate:'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400', teal:'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400', gray:'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400' };
    return map[c] || map.emerald;
  };

  const openModal = (item, section) => {
    setSelectedItem(item);
    setModalSection(section);
    setShowModal(true);
    setModalTab('description');
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalSection('');
  };

  const Card = ({ item, sectionKey }) => {
    const tab = TABS.find(t => t.key === sectionKey);
    const color = tab?.color || 'emerald';

    let title = '', subtitle = '', description = '', importance = '';
    let tags = [];

    if (sectionKey === 'international_standards') {
      title = item.name;
      subtitle = item.full_name_ar;
      description = item.description_ar;
      importance = item.importance_level;
      tags = item.what_covers_ar?.slice(0, 2) || [];
    } else if (sectionKey === 'pesticide_residues') {
      title = item.market;
      subtitle = item.authority;
      description = item.notes_ar || '';
      importance = item.strictness === 'الأشد في العالم' ? 'عالية جداً' : item.strictness === 'صارم لكن مختلف عن EU' ? 'عالية' : 'متوسطة';
      tags = item.default_mrl ? [item.default_mrl] : [];
    } else if (sectionKey === 'mycotoxins') {
      title = item.name_ar;
      subtitle = item.name_en;
      description = item.producer_ar ? `المنتج: ${item.producer_ar}` : '';
      importance = item.who_classification?.includes('1') ? 'عالية جداً' : 'متوسطة';
      tags = item.affected_products_ar?.slice(0, 3) || [];
    } else if (sectionKey === 'post_harvest') {
      title = item.product_ar;
      subtitle = `${item.temp_c}°م | ${item.humidity_pct}% رطوبة`;
      description = item.notes_ar || '';
      importance = item.critical_ar ? 'عالية' : 'منخفضة';
      tags = [item.duration_ar].filter(Boolean);
    } else if (sectionKey === 'irrigation_water_safety') {
      title = item.parameter;
      subtitle = item.standard || '';
      description = item.reason_ar || '';
      importance = 'منخفضة';
      tags = [item.limit_ar || item.limit_spray_ar || ''].filter(Boolean);
    } else if (sectionKey === 'heavy_metals') {
      title = item.metal_ar;
      subtitle = Object.keys(item.sources_ar || {}).length > 0 ? '' : '';
      description = (item.health_effects_ar?.chronic_ar || item.health_effects_ar?.cancer_ar || '');
      importance = 'عالية';
      tags = item.sources_ar?.slice(0, 2) || [];
    } else if (sectionKey === 'packaging_labeling') {
      title = item.material_ar;
      subtitle = item.properties_ar || '';
      description = item.notes_ar || '';
      importance = 'منخفضة';
      tags = item.uses_ar?.slice(0, 2) || [];
    } else if (sectionKey === 'organic_farming') {
      title = item.name;
      subtitle = item.origin || '';
      description = item.accepts_ar || '';
      importance = 'منخفضة';
      tags = [item.egypt_office === 'نعم' ? 'مكتب في مصر' : ''].filter(Boolean);
    } else if (sectionKey === 'worker_safety') {
      title = item.group_ar;
      subtitle = item.rei;
      description = item.examples || '';
      importance = item.rei?.includes('0') ? 'منخفضة' : item.rei?.includes('4') ? 'متوسطة' : 'عالية';
      tags = [item.rei].filter(Boolean);
    } else if (sectionKey === 'farm_records') {
      title = item.record_ar;
      subtitle = item.frequency_ar || '';
      description = (item.what_to_record_ar || []).join(' • ');
      importance = item.legal_note_ar ? 'عالية' : 'متوسطة';
      tags = item.required_for_ar?.slice(0, 2) || [];
    } else if (sectionKey === 'export_requirements') {
      title = item.document_ar;
      subtitle = item.issuer_ar || '';
      description = item.purpose_ar || '';
      importance = 'عالية';
      tags = [item.issuer_ar].filter(Boolean);
    } else if (sectionKey === 'checklists') {
      title = item.check_ar;
      subtitle = item.groupTitle || '';
      description = '';
      importance = item.critical ? 'عالية جداً' : 'منخفضة';
      tags = [item.critical ? 'حرج' : 'اختياري'].filter(Boolean);
    } else if (sectionKey === 'egypt_contacts') {
      title = item.name_ar;
      subtitle = item.role_ar || '';
      description = item.accreditation || '';
      importance = 'منخفضة';
      tags = [item.website].filter(Boolean);
    } else if (sectionKey === 'iso_standards_index') {
      title = item.number;
      subtitle = item.scope_ar || '';
      description = item.title_ar || '';
      importance = 'منخفضة';
      tags = [];
    }

    return (
      <div onClick={() => openModal(item, sectionKey)}
        className={`group p-4 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-r-[3px] ${cardBorder(color)}`}>
        {importance && (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sc[sevClass(importance)]}`}>
            {sevTextFor(importance)}
          </span>
        )}
        <h3 className={`text-base font-bold text-gray-900 dark:text-white mt-1.5 ${cardHover(color)}`}>{title}</h3>
        {subtitle && <p className="text-xs italic text-gray-400 dark:text-gray-500 truncate mb-1.5">{subtitle}</p>}
        {description && <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">{description}</p>}
        <div className="flex flex-wrap gap-1.5 mb-0">
          {tags.map((t, i) => t ? (
            <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] ${cardChip(color)}`}>{t}</span>
          ) : null)}
        </div>
      </div>
    );
  };

  const ModalHeader = ({ title, subtitle, onClose, icon: MIcon }) => (
    <div className="sticky top-0 z-10 flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-t-2xl">
      {MIcon && <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0 text-lg"><MIcon className="w-5 h-5" /></span>}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>}
      </div>
      <button onClick={onClose}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  const ModalTabs = ({ tabs, active, onChange }) => (
    <div className="flex gap-1 px-5 pt-3 border-b border-gray-200/80 dark:border-gray-700/50 overflow-x-auto">
      {tabs.map(tab => (
        <button key={tab.key} onClick={() => onChange(tab.key)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
            active === tab.key
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}>
          {tab.icon && <tab.icon size={14} />} {tab.label}
        </button>
      ))}
    </div>
  );

  const renderStandardModal = () => {
    const s = selectedItem;
    if (!s) return null;
    const tabConfig = [
      { key: 'description', label: 'وصف المعيار', icon: Info },
      { key: 'details', label: 'المتطلبات', icon: Shield },
      { key: 'resources', label: 'الموارد', icon: Globe },
    ];
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-modal-in shadow-2xl" onClick={e => e.stopPropagation()}>
        <ModalHeader title={s.name} subtitle={s.full_name_ar} onClose={closeModal} icon={Star} />
        <ModalTabs tabs={tabConfig} active={modalTab} onChange={setModalTab} />
        <div className="p-5 space-y-4">
          {modalTab === 'description' && (
            <>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${sc[sevClass(s.importance_level)]}`}>{s.importance_level}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.description_ar}</p>
              {s.history_ar && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">نبذة تاريخية</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{s.history_ar}</p>
                </div>
              )}
              {s.what_covers_ar?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">ما يغطيه المعيار:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {s.what_covers_ar.map((c, i) => <span key={i} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-[11px] text-emerald-700 dark:text-emerald-300 rounded">{c}</span>)}
                  </div>
                </div>
              )}
            </>
          )}
          {modalTab === 'details' && (
            <>
              {s.key_requirements_ar?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">المتطلبات الأساسية:</h4>
                  <ul className="space-y-1 pr-4">
                    {s.key_requirements_ar.map((r, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 list-disc">{r}</li>)}
                  </ul>
                </div>
              )}
              {s.audit_process_ar && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">عملية التدقيق:</h4>
                  <ul className="space-y-1 pr-4">
                    {s.audit_process_ar.steps?.map((r, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 list-disc">{r}</li>)}
                  </ul>
                </div>
              )}
              {s.egypt_status_ar && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-400">{s.egypt_status_ar}</p>
                </div>
              )}
            </>
          )}
          {modalTab === 'resources' && (
            <>
              {s.who_needs_ar && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3">
                  <h4 className="font-bold text-xs text-amber-700 dark:text-amber-400 mb-1">لمن هذا المعيار؟</h4>
                  <p className="text-xs text-amber-600 dark:text-amber-300">{s.who_needs_ar}</p>
                </div>
              )}
              {s.quick_tips_ar?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">نصائح سريعة:</h4>
                  <ul className="space-y-1 pr-4">
                    {s.quick_tips_ar.map((r, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 list-disc">{r}</li>)}
                  </ul>
                </div>
              )}
              {s.website && (
                <a href={`https://${s.website}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                  <Globe size={12} /> {s.website}
                </a>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderMycotoxinModal = () => {
    const m = selectedItem;
    if (!m) return null;
    const tabConfig = [
      { key: 'description', label: 'الوصف', icon: Info },
      { key: 'details', label: 'الحدود والتأثير', icon: Shield },
      { key: 'resources', label: 'الوقاية', icon: Shield },
    ];
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-modal-in shadow-2xl" onClick={e => e.stopPropagation()}>
        <ModalHeader title={m.name_ar} subtitle={m.name_en} onClose={closeModal} icon={AlertCircle} />
        <ModalTabs tabs={tabConfig} active={modalTab} onChange={setModalTab} />
        <div className="p-5 space-y-4">
          {modalTab === 'description' && (
            <>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{m.producer_ar}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${sc[sevClass(m.who_classification?.includes('1A') || m.who_classification?.includes('1') ? 'عالية جداً' : 'متوسطة')]}`}>{m.who_classification}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{m.favorable_conditions_ar}</p>
              <div>
                <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">المنتجات المتأثرة:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {m.affected_products_ar?.map((p, i) => <span key={i} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700/30 text-[11px] text-gray-600 dark:text-gray-400 rounded">{p}</span>)}
                </div>
              </div>
            </>
          )}
          {modalTab === 'details' && (
            <>
              {m.health_effects_ar && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">التأثيرات الصحية:</h4>
                  <div className="space-y-2">
                    {Object.entries(m.health_effects_ar).filter(([k]) => !k.endsWith('_ar') || k === 'chronic_ar' || k === 'cancer_ar' || k === 'acute_ar').map(([k, v]) => (
                      <p key={k} className="text-xs text-gray-600 dark:text-gray-400"><span className="font-semibold">{k === 'chronic_ar' ? 'المزمن: ' : k === 'cancer_ar' ? 'السرطان: ' : k === 'acute_ar' ? 'الحاد: ' : k === 'immune_ar' ? 'مناعي: ' : `${k}: `}</span>{v}</p>
                    ))}
                  </div>
                </div>
              )}
              {m.eu_limits && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">حدود EU:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(m.eu_limits).map(([k, v]) => <div key={k} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2"><span className="text-[10px] text-gray-500 block">{k}</span><span className="text-xs font-semibold text-gray-900 dark:text-white">{v}</span></div>)}
                  </div>
                </div>
              )}
              {m.egypt_limits_ar && <p className="text-xs text-amber-600 dark:text-amber-400">{m.egypt_limits_ar}</p>}
            </>
          )}
          {modalTab === 'resources' && (
            <>
              {m.prevention_ar?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">الوقاية:</h4>
                  <ul className="space-y-1 pr-4">
                    {m.prevention_ar.map((p, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 list-disc">{p}</li>)}
                  </ul>
                </div>
              )}
              {m.detection_ar?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">طرق الكشف:</h4>
                  <ul className="space-y-1 pr-4">
                    {m.detection_ar.map((p, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 list-disc">{p}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderMetalModal = () => {
    const m = selectedItem;
    if (!m) return null;
    const tabConfig = [
      { key: 'description', label: 'المصادر', icon: Info },
      { key: 'details', label: 'التأثيرات والحدود', icon: Shield },
      { key: 'resources', label: 'الوقاية', icon: Shield },
    ];
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-modal-in shadow-2xl" onClick={e => e.stopPropagation()}>
        <ModalHeader title={m.metal_ar} subtitle="" onClose={closeModal} icon={AlertCircle} />
        <ModalTabs tabs={tabConfig} active={modalTab} onChange={setModalTab} />
        <div className="p-5 space-y-4">
          {modalTab === 'description' && (
            <>
              <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">المصادر:</h4>
              <ul className="space-y-1 pr-4">
                {m.sources_ar?.map((s, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 list-disc">{s}</li>)}
              </ul>
              {m.high_risk_crops_ar && <div><h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1 mt-3">المحاصيل عالية الخطورة:</h4><p className="text-xs text-gray-600">{m.high_risk_crops_ar.join(' — ')}</p></div>}
            </>
          )}
          {modalTab === 'details' && (
            <>
              {m.health_effects_ar && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">التأثيرات الصحية:</h4>
                  <div className="space-y-2">
                    {Object.entries(m.health_effects_ar).filter(([k]) => !k.endsWith('_ar') || ['chronic_ar', 'cancer_ar', 'acute_ar', 'neuro_ar', 'renal_ar', 'hematopoietic_ar', 'allergy_ar', 'cr6_ar'].includes(k)).map(([k, v]) => (
                      <p key={k} className="text-xs text-gray-600 dark:text-gray-400"><span className="font-semibold">{k === 'chronic_ar' ? 'المزمن: ' : k === 'cancer_ar' ? 'السرطان: ' : k === 'acute_ar' ? 'الحاد: ' : k === 'neuro_ar' ? 'عصبي: ' : k === 'renal_ar' ? 'كلوي: ' : k === 'hematopoietic_ar' ? 'دموي: ' : k === 'allergy_ar' ? 'حساسية: ' : k === 'cr6_ar' ? 'كروم سداسي: ' : ''}</span>{v}</p>
                    ))}
                  </div>
                </div>
              )}
              {m.eu_food_limits && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">حدود EU:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(m.eu_food_limits).map(([k, v]) => <div key={k} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2"><span className="text-[10px] text-gray-500">{k}</span><p className="text-xs font-semibold text-gray-900 dark:text-white">{v}</p></div>)}
                  </div>
                </div>
              )}
            </>
          )}
          {modalTab === 'resources' && (
            <>
              {m.prevention_ar?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">الوقاية والمعالجة:</h4>
                  <ul className="space-y-1 pr-4">
                    {m.prevention_ar.map((p, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 list-disc">{p}</li>)}
                  </ul>
                </div>
              )}
              {m.soil_remediation_ar && <p className="text-xs text-gray-600 dark:text-gray-400">{m.soil_remediation_ar}</p>}
              {m.high_risk_ar && <p className="text-xs text-amber-600 dark:text-amber-400">{m.high_risk_ar}</p>}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderGenericModal = () => {
    const item = selectedItem;
    if (!item) return null;
    const sectionKey = modalSection;

    let title = '', subtitle = '';
    if (sectionKey === 'pesticide_residues') { title = item.market; subtitle = item.authority; }
    else if (sectionKey === 'post_harvest') { title = item.product_ar; subtitle = `${item.temp_c}°م / ${item.humidity_pct}%`; }
    else if (sectionKey === 'irrigation_water_safety') { title = item.parameter; subtitle = ''; }
    else if (sectionKey === 'packaging_labeling') { title = item.material_ar; subtitle = item.properties_ar; }
    else if (sectionKey === 'organic_farming') { title = item.name; subtitle = item.origin; }
    else if (sectionKey === 'worker_safety') { title = item.group_ar; subtitle = item.rei; }
    else if (sectionKey === 'farm_records') { title = item.record_ar; subtitle = item.frequency_ar; }
    else if (sectionKey === 'export_requirements') { title = item.document_ar; subtitle = item.issuer_ar; }
    else if (sectionKey === 'checklists') { title = item.check_ar; subtitle = item.groupTitle; }
    else if (sectionKey === 'egypt_contacts') { title = item.name_ar; subtitle = item.role_ar; }
    else if (sectionKey === 'iso_standards_index') { title = item.number; subtitle = item.scope_ar; }

    const tabConfig = [
      { key: 'description', label: 'الوصف', icon: Info },
      { key: 'details', label: 'تفاصيل', icon: Shield },
      { key: 'resources', label: 'معلومات إضافية', icon: Globe },
    ];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-modal-in shadow-2xl" onClick={e => e.stopPropagation()}>
        <ModalHeader title={title} subtitle={subtitle} onClose={closeModal} />
        <ModalTabs tabs={tabConfig} active={modalTab} onChange={setModalTab} />
        <div className="p-5 space-y-4">
          {modalTab === 'description' && (
            <>
              {sectionKey === 'pesticide_residues' && (
                <>
                  {item.notes_ar && <p className="text-xs text-gray-600 dark:text-gray-400">{item.notes_ar}</p>}
                  {item.default_mrl && <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">MRL الافتراضي: {item.default_mrl}</p>}
                  {item.database && <a href={`https://${item.database}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"><Globe size={12} /> قاعدة البيانات</a>}
                </>
              )}
              {sectionKey === 'post_harvest' && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400">درجة الحرارة: {item.temp_c}°م | الرطوبة: {item.humidity_pct}%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">المدة: {item.duration_ar}</p>
                  {item.notes_ar && <p className="text-xs text-gray-600 dark:text-gray-400">{item.notes_ar}</p>}
                  {item.ethylene_sensitivity && <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded text-[11px]">حساسية الإيثيلين: {item.ethylene_sensitivity}</span>}
                </>
              )}
              {sectionKey === 'irrigation_water_safety' && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.limit_ar || item.limit_spray_ar}</p>
                  {item.reason_ar && <p className="text-xs text-gray-500 mt-2">{item.reason_ar}</p>}
                </>
              )}
              {sectionKey === 'packaging_labeling' && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.properties_ar}</p>
                  {item.uses_ar?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">الاستخدامات:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {item.uses_ar.map((u, i) => <span key={i} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700/30 text-[11px] text-gray-600 dark:text-gray-400 rounded">{u}</span>)}
                      </div>
                    </div>
                  )}
                  {item.notes_ar && <p className="text-xs text-gray-500">{item.notes_ar}</p>}
                </>
              )}
              {sectionKey === 'organic_farming' && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400">المنشأ: {item.origin}</p>
                  {item.accepts_ar && <p className="text-xs text-gray-500">الشهادات: {item.accepts_ar}</p>}
                  {item.website && <a href={`https://${item.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"><Globe size={12} /> {item.website}</a>}
                </>
              )}
              {sectionKey === 'worker_safety' && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400">فترة إعادة الدخول: {item.rei}</p>
                  <p className="text-xs text-gray-500">أمثلة: {item.examples}</p>
                </>
              )}
              {sectionKey === 'farm_records' && (
                <>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {item.required_for_ar?.map((req, j) => <span key={j} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-[11px] text-emerald-600 dark:text-emerald-400 rounded">{req}</span>)}
                  </div>
                  {item.what_to_record_ar?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">ما يتم تسجيله:</h4>
                      <ul className="space-y-0.5 pr-4">
                        {item.what_to_record_ar.map((w, j) => <li key={j} className="text-xs text-gray-600 dark:text-gray-400 list-disc">{w}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              )}
              {sectionKey === 'export_requirements' && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400">الجهة المصدرة: {item.issuer_ar}</p>
                  <p className="text-xs text-gray-500">الغرض: {item.purpose_ar}</p>
                </>
              )}
              {sectionKey === 'checklists' && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.check_ar}</p>
              )}
              {sectionKey === 'egypt_contacts' && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.role_ar}</p>
                  {item.website && <a href={`https://${item.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"><Globe size={12} /> {item.website}</a>}
                </>
              )}
              {sectionKey === 'iso_standards_index' && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.title_ar}</p>
                  <p className="text-xs text-gray-500">النطاق: {item.scope_ar}</p>
                </>
              )}
            </>
          )}
          {modalTab === 'details' && (
            <>
              {sectionKey === 'pesticide_residues' && item.banned_examples_ar?.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">مبيدات محظورة/مقيدة:</h4>
                  <ul className="space-y-1 pr-4">
                    {item.banned_examples_ar.map((b, j) => <li key={j} className="text-xs text-gray-600 dark:text-gray-400 list-disc">{b}</li>)}
                  </ul>
                </div>
              )}
              {sectionKey === 'post_harvest' && item.chilling_injury_ar && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-400">{item.chilling_injury_ar}</p>
                </div>
              )}
              {sectionKey === 'post_harvest' && item.critical_ar && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                  <p className="text-xs text-red-600 dark:text-red-400">{item.critical_ar}</p>
                </div>
              )}
              {sectionKey === 'irrigation_water_safety' && item.standard && (
                <p className="text-xs text-gray-500">المرجع: {item.standard}</p>
              )}
              {sectionKey === 'packaging_labeling' && item.standards_ar && (
                <p className="text-xs text-gray-500">المواصفات: {item.standards_ar}</p>
              )}
              {sectionKey === 'packaging_labeling' && item.gas_mix_ar && (
                <p className="text-xs text-gray-500">خليط الغازات: {item.gas_mix_ar}</p>
              )}
              {sectionKey === 'organic_farming' && item.egypt_office && (
                <p className="text-xs text-gray-600 dark:text-gray-400">مكتب في مصر: {item.egypt_office}</p>
              )}
              {sectionKey === 'checklists' && (
                <p className="text-xs text-gray-600 dark:text-gray-400">المجموعة: {item.groupTitle}</p>
              )}
            </>
          )}
          {modalTab === 'resources' && (
            <>
              {sectionKey === 'pesticide_residues' && item.database && (
                <a href={`https://${item.database}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                  <Globe size={12} /> قاعدة البيانات الرسمية
                </a>
              )}
              {sectionKey === 'egypt_contacts' && item.website && (
                <a href={`https://${item.website}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                  <Globe size={12} /> الموقع الرسمي
                </a>
              )}
              {sectionKey === 'post_harvest' && item.so2_treatment_ar && (
                <p className="text-xs text-gray-500">{item.so2_treatment_ar}</p>
              )}
              {sectionKey === 'post_harvest' && item.ca_storage_ar && (
                <p className="text-xs text-gray-500">{item.ca_storage_ar}</p>
              )}
              {sectionKey === 'post_harvest' && item.precooling_ar && (
                <p className="text-xs text-gray-500">{item.precooling_ar}</p>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" dir="rtl">
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/knowledge-base')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/80 transition-colors mb-4">
          <ChevronRight className="w-4 h-4" />
          <span>العودة</span>
        </button>

        <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{d.description_ar}</h1>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Food Safety & Quality Database</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-medium">آخر تحديث: {d.last_updated}</span>
                <span className="px-2.5 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-[11px] font-medium">إصدار {d.version}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{d.metadata?.total_standards_covered || 10}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">معيار دولي</p>
          </div>
          <div className="bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{d.metadata?.total_mycotoxins || 7}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">سم فطري</p>
          </div>
          <div className="bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{d.metadata?.total_heavy_metals || 6}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">معدن ثقيل</p>
          </div>
          <div className="bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{d.metadata?.total_checklists || 3}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">قائمة مراجعة</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginated.map((item, i) => (
            <Card key={i} item={item} sectionKey={activeTab} />
          ))}
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          {['international_standards'].includes(modalSection) && renderStandardModal()}
          {['mycotoxins'].includes(modalSection) && renderMycotoxinModal()}
          {['heavy_metals'].includes(modalSection) && renderMetalModal()}
          {!['international_standards', 'mycotoxins', 'heavy_metals'].includes(modalSection) && renderGenericModal()}
        </div>
      )}
    </div>
  );
};

export default FoodSafetyPage;
