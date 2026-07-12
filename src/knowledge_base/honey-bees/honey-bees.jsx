import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Hexagon, Calendar, Flower2, Bug, FlaskConical,
  Sprout, Beaker, Wrench, BookOpen, X, AlertTriangle, Search, Shield, Info
} from 'lucide-react';
import honeyBeesData from './data.json';


const ITEMS_PER_PAGE = 5;

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

const tabConfig = [
  { id: 'species', icon: Hexagon, color: 'emerald' },
  { id: 'calendar', icon: Calendar, color: 'blue' },
  { id: 'honey_plants', icon: Flower2, color: 'emerald' },
  { id: 'diseases', icon: Bug, color: 'rose' },
  { id: 'pesticide_toxicity', icon: FlaskConical, color: 'orange' },
  { id: 'pollination', icon: Sprout, color: 'emerald' },
  { id: 'honey_production', icon: Beaker, color: 'amber' },
  { id: 'equipment', icon: Wrench, color: 'gray' },
  { id: 'references', icon: BookOpen, color: 'slate' },
];

const toArray = (v) => Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.values(v) : []);

const HoneyBeesPage = () => {
  const navigate = useNavigate();
  const d = honeyBeesData;
  const s = d.sections;
  const [activeTab, setActiveTab] = useState(s[0]?.id || 'species');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState('description');

  const currentSection = s.find(sec => sec.id === activeTab);
  const currentTabConfig = tabConfig.find(t => t.id === activeTab);
  const color = currentTabConfig?.color || 'emerald';

  const getItems = () => {
    if (!currentSection?.content) return [];
    const c = currentSection.content;
    switch (activeTab) {
      case 'species': return c.species || [];
      case 'calendar': return c.months || [];
      case 'honey_plants': return c.plants || [];
      case 'diseases': return c.diseases || [];
      case 'pesticide_toxicity': return c.toxicity_categories_ar || [];
      case 'pollination': return c.crops || [];
      case 'honey_production': return c.honey_types || [];
      case 'equipment': return c.equipment_list || [];
      case 'references': return [...(c.egyptian_sources_ar || []), ...(c.international_sources_ar || [])];
      default: return [];
    }
  };

  const items = getItems();
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginated = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openModal = (item) => { setSelected(item); setShowModal(true); setModalTab('description'); };
  const closeModal = () => { setShowModal(false); setSelected(null); };

  const tabColorBorder = (c) => {
    const map = { emerald: 'border-emerald-500', blue: 'border-blue-500', rose: 'border-rose-500', orange: 'border-orange-500', amber: 'border-amber-500', gray: 'border-gray-500', slate: 'border-slate-500' };
    return map[c] || 'border-emerald-500';
  };

  const SpeciesCard = ({ item }) => (
    <div onClick={() => openModal(item)}
      className={`group p-4 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-r-[3px] ${tabColorBorder(color)}`}>
      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-1.5">{item.name_ar}</h3>
      <p className="text-xs italic text-gray-400 dark:text-gray-500 truncate mb-1.5">{item.scientific_name}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">{item.origin_ar}</p>
      <div className="flex flex-wrap gap-1.5 mb-0">
        {item.characteristics_ar?.slice(0, 2).map((c, i) => (
          <span key={i} className="inline-flex items-center px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded text-[11px]">{c}</span>
        ))}
        {item.advantages_ar?.length > 0 && (
          <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[11px] text-gray-500">{item.advantages_ar.length} ميزة</span>
        )}
      </div>
      <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700/50">
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all flex items-center gap-1">
          عرض التفاصيل <ChevronLeft size={14} />
        </span>
      </div>
    </div>
  );

  const CalendarCard = ({ item }) => (
    <div className="group p-4 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-r-[3px] border-blue-500">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.month_ar}</h3>
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{item.season_ar}</span>
      </div>
      <ul className="space-y-0.5 mb-2">
        {item.tasks_ar?.slice(0, 3).map((t, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400">• {t}</li>)}
        {item.tasks_ar?.length > 3 && <li className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+{item.tasks_ar.length - 3} مهام أخرى</li>}
      </ul>
      {item.honey_plants_ar && (
        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700/50">
          <p className="text-[11px] text-gray-500"><span className="font-semibold">المرعى:</span> {item.honey_plants_ar}</p>
        </div>
      )}
    </div>
  );

  const PlantCard = ({ item }) => (
    <div onClick={() => openModal(item)}
      className={`group p-4 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-r-[3px] border-emerald-500`}>
      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-1.5">{item.name_ar}</h3>
      <p className="text-xs italic text-gray-400 dark:text-gray-500 truncate mb-1.5">{item.scientific}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">{item.importance_ar}</p>
      <div className="flex flex-wrap gap-1.5 mb-0">
        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded text-[11px]">{item.type_ar}</span>
        <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[11px] text-gray-500">{item.season_ar}</span>
        {item.productivity_ar && <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[11px] text-gray-500">{item.productivity_ar}</span>}
      </div>
      <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700/50">
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all flex items-center gap-1">
          عرض التفاصيل <ChevronLeft size={14} />
        </span>
      </div>
    </div>
  );

  const DiseaseCard = ({ item }) => (
    <div onClick={() => openModal(item)}
      className="group p-4 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-r-[3px] border-rose-500">
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
        item.danger_level === 'عالية جداً' || item.danger_level === 'عالية — دخيلة على مصر' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
        item.danger_level === 'عالية' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      }`}>
        {item.danger_level}
      </span>
      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 mt-1.5">{item.name_ar}</h3>
      <p className="text-xs italic text-gray-400 dark:text-gray-500 truncate mb-1.5">{item.scientific}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">{item.type_ar}</p>
      <div className="flex flex-wrap gap-1.5 mb-0">
        {toArray(item.symptoms_ar).slice(0, 2).map((s, i) => (
          <span key={i} className="inline-flex items-center px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded text-[11px]">{s}</span>
        ))}
      </div>
      <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700/50">
        <span className="text-xs font-medium text-rose-600 dark:text-rose-400 group-hover:gap-2 transition-all flex items-center gap-1">
          عرض التفاصيل <ChevronLeft size={14} />
        </span>
      </div>
    </div>
  );

  const ToxicityCard = ({ item }) => (
    <div className="group p-4 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-r-[3px] border-orange-500">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">{item.category_ar}</h3>
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">{item.ld50_range}</span>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">{item.description_ar}</p>
      <div className="flex flex-wrap gap-1.5 mb-0">
        {item.examples_ar?.slice(0, 3).map((e, i) => (
          <span key={i} className="inline-flex items-center px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded text-[11px]">{e}</span>
        ))}
        {item.examples_ar?.length > 3 && <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[11px] text-gray-500">+{item.examples_ar.length - 3}</span>}
      </div>
    </div>
  );

  const PollinationCard = ({ item }) => (
    <div className="group p-4 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-r-[3px] border-emerald-500">
      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-1.5">{item.crop_ar}</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">{item.dependence_ar}</p>
      <div className="flex flex-wrap gap-1.5 mb-0">
        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded text-[11px]">{item.recommended_hives_ar}</span>
        {item.notes_ar && <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[11px] text-gray-500">{item.notes_ar}</span>}
      </div>
    </div>
  );

  const ProductionCard = ({ item }) => (
    <div className="group p-4 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-r-[3px] border-amber-500">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">{item.type_ar}</h3>
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{item.percentage_ar}</span>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-1">{item.season_ar && <span className="font-semibold">الموسم: </span>}{item.season_ar}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{item.characteristics_ar}</p>
    </div>
  );

  const EquipmentCard = ({ item }) => (
    <div className="group p-4 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-r-[3px] border-gray-500">
      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-400 mt-1.5">{item.item_ar}</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">{item.purpose_ar}</p>
      <div className="flex flex-wrap gap-1.5 mb-0">
        {item.components_ar?.slice(0, 2).map((c, i) => (
          <span key={i} className="inline-flex items-center px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-[11px]">{c}</span>
        ))}
        {item.notes_ar && <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[11px] text-gray-500">{item.notes_ar}</span>}
      </div>
    </div>
  );

  const ReferenceCard = ({ item }) => (
    <div className="group p-4 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-r-[3px] border-slate-500">
      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-400 mt-1.5">{item.name_ar || item.name}</h3>
      {item.description_ar && <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">{item.description_ar}</p>}
      {item.website && <a href={`https://${item.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">{item.website}</a>}
    </div>
  );

  const renderCard = (item, index) => {
    switch (activeTab) {
      case 'species': return <SpeciesCard key={index} item={item} />;
      case 'calendar': return <CalendarCard key={index} item={item} />;
      case 'honey_plants': return <PlantCard key={index} item={item} />;
      case 'diseases': return <DiseaseCard key={index} item={item} />;
      case 'pesticide_toxicity': return <ToxicityCard key={index} item={item} />;
      case 'pollination': return <PollinationCard key={index} item={item} />;
      case 'honey_production': return <ProductionCard key={index} item={item} />;
      case 'equipment': return <EquipmentCard key={index} item={item} />;
      case 'references': return <ReferenceCard key={index} item={item} />;
      default: return null;
    }
  };

  const renderModalContent = () => {
    if (!selected) return null;
    const sec = activeTab;

    if (sec === 'species') {
      if (modalTab === 'description') return (
        <><div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div><span className="text-xs text-gray-500">الاسم العلمي</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.scientific_name}</p></div>
          <div><span className="text-xs text-gray-500">المنشأ</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.origin_ar}</p></div>
          <div><span className="text-xs text-gray-500">الحالة</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.status_ar}</p></div>
        </div>
        {selected.characteristics_ar?.length > 0 && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">الخصائص</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">{selected.characteristics_ar.map((c, i) => <li key={i}>• {c}</li>)}</ul>
          </div>
        )}</>
      );
      if (modalTab === 'management') return (
        <>{selected.advantages_ar?.length > 0 && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">المميزات</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">{selected.advantages_ar.map((a, i) => <li key={i}>• {a}</li>)}</ul>
          </div>
        )}
        {selected.disadvantages_ar?.length > 0 && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">العيوب</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">{selected.disadvantages_ar.map((d, i) => <li key={i}>• {d}</li>)}</ul>
          </div>
        )}</>
      );
      if (modalTab === 'details') return (
        <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">معلومات إضافية</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selected.status_ar}</p>
        </div>
      );
      return null;
    }
    
    if (sec === 'honey_plants') {
      if (modalTab === 'description') return (
        <><div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div><span className="text-xs text-gray-500">الاسم العلمي</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.scientific}</p></div>
          <div><span className="text-xs text-gray-500">النوع</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.type_ar}</p></div>
          <div><span className="text-xs text-gray-500">الموسم</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.season_ar}</p></div>
          <div><span className="text-xs text-gray-500">الإنتاجية</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.productivity_ar || '-'}</p></div>
        </div>
        <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">الأهمية</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selected.importance_ar}</p>
        </div></>
      );
      if (modalTab === 'details') return (
        <>{selected.honey_quality_ar && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">جودة العسل</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selected.honey_quality_ar}</p>
          </div>
        )}
        {selected.notes_ar && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">ملاحظات</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selected.notes_ar}</p>
          </div>
        )}</>
      );
      return null;
    }
    
    if (sec === 'diseases') {
      if (modalTab === 'description') return (
        <><div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div><span className="text-xs text-gray-500">الاسم العلمي</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.scientific}</p></div>
          <div><span className="text-xs text-gray-500">النوع</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.type_ar}</p></div>
          <div><span className="text-xs text-gray-500">درجة الخطورة</span><p className={`mt-0.5 text-sm font-semibold inline-block px-2 py-0.5 rounded-full ${selected.danger_level === 'عالية جداً' || selected.danger_level === 'عالية — دخيلة على مصر' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : selected.danger_level === 'عالية' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>{selected.danger_level}</p></div>
        </div>
        {toArray(selected.symptoms_ar).length > 0 && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">الأعراض</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">{toArray(selected.symptoms_ar).map((s, i) => <li key={i}>• {s}</li>)}</ul>
          </div>
        )}</>
      );
      if (modalTab === 'management') return (
        <>{selected.treatment_ar?.length > 0 && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">العلاج والمكافحة</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">{selected.treatment_ar.map((t, i) => <li key={i}>• {t}</li>)}</ul>
          </div>
        )}
        {selected.treatment_timing_ar && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3">
            <h4 className="font-bold text-xs text-amber-700 dark:text-amber-400 mb-1">توقيت العلاج</h4>
            <p className="text-xs text-amber-600 dark:text-amber-300">{selected.treatment_timing_ar}</p>
          </div>
        )}
        {selected.monitoring_ar && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3">
            <h4 className="font-bold text-xs text-blue-700 dark:text-blue-400 mb-1">المراقبة</h4>
            <p className="text-xs text-blue-600 dark:text-blue-300">{selected.monitoring_ar}</p>
          </div>
        )}</>
      );
      if (modalTab === 'details') return (
        <>{selected.life_cycle_ar && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">دورة الحياة</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selected.life_cycle_ar}</p>
          </div>
        )}
        {selected.transmission_ar && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">طرق الانتشار</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selected.transmission_ar}</p>
          </div>
        )}
        {selected.damage_ar && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl p-3">
            <h4 className="font-bold text-xs text-red-700 dark:text-red-400 mb-1">الضرر</h4>
            <p className="text-xs text-red-600 dark:text-red-300">{selected.damage_ar}</p>
          </div>
        )}
        {selected.favorable_conditions_ar && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3">
            <h4 className="font-bold text-xs text-amber-700 dark:text-amber-400 mb-1">الظروف المساعدة</h4>
            <p className="text-xs text-amber-600 dark:text-amber-300">{selected.favorable_conditions_ar}</p>
          </div>
        )}
        {selected.diagnosis_ar && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3">
            <h4 className="font-bold text-xs text-blue-700 dark:text-blue-400 mb-1">التشخيص</h4>
            <p className="text-xs text-blue-600 dark:text-blue-300">{selected.diagnosis_ar}</p>
          </div>
        )}
        {selected.prevention_ar?.length > 0 && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">الوقاية</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">{selected.prevention_ar.map((p, i) => <li key={i}>• {p}</li>)}</ul>
          </div>
        )}
        {selected.status_egypt_ar && (
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">الوضع في مصر</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{selected.status_egypt_ar}</p>
          </div>
        )}</>
      );
      return null;
    }
    
    if (sec === 'pesticide_toxicity') {
      if (modalTab === 'description') return (
        <><div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div><span className="text-xs text-gray-500">التصنيف</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.category_ar}</p></div>
          <div><span className="text-xs text-gray-500">LD50</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.ld50_range}</p></div>
        </div>
        <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">الوصف</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selected.description_ar}</p>
        </div></>
      );
      if (modalTab === 'details') return (
        <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">أمثلة</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">{selected.examples_ar?.map((e, i) => <li key={i}>• {e}</li>)}</ul>
        </div>
      );
      return null;
    }
    
    if (sec === 'pollination') {
      if (modalTab === 'description') return (
        <><div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div><span className="text-xs text-gray-500">المحصول</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.crop_ar}</p></div>
          <div><span className="text-xs text-gray-500">الاعتماد على التلقيح</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.dependence_ar}</p></div>
          <div><span className="text-xs text-gray-500">الخلايا الموصى بها</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.recommended_hives_ar}</p></div>
        </div>
        {selected.notes_ar && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">ملاحظات</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selected.notes_ar}</p>
          </div>
        )}</>
      );
      return null;
    }
    
    if (sec === 'honey_production') {
      if (modalTab === 'description') return (
        <><div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div><span className="text-xs text-gray-500">النوع</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.type_ar}</p></div>
          <div><span className="text-xs text-gray-500">النسبة</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.percentage_ar}</p></div>
          <div><span className="text-xs text-gray-500">الموسم</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.season_ar}</p></div>
        </div>
        <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">الخصائص</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selected.characteristics_ar}</p>
        </div></>
      );
      return null;
    }
    
    if (sec === 'equipment') {
      if (modalTab === 'description') return (
        <><div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <div><span className="text-xs text-gray-500">القطعة</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.item_ar}</p></div>
          <div><span className="text-xs text-gray-500">الغرض</span><p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{selected.purpose_ar}</p></div>
        </div>
        {selected.components_ar?.length > 0 && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">المكونات</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">{selected.components_ar.map((c, i) => <li key={i}>• {c}</li>)}</ul>
          </div>
        )}</>
      );
      if (modalTab === 'details') return (
        <>{selected.types_ar?.length > 0 && (
          <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">الأنواع</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">{selected.types_ar.map((t, i) => <li key={i}>• {t}</li>)}</ul>
          </div>
        )}
        {selected.wood_type_ar && (
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">نوع الخشب</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{selected.wood_type_ar}</p>
          </div>
        )}
        {selected.fuel_ar && (
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">الوقود</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{selected.fuel_ar}</p>
          </div>
        )}
        {selected.type_ar && (
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">النوع</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{selected.type_ar}</p>
          </div>
        )}
        {selected.notes_ar && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3">
            <h4 className="font-bold text-xs text-amber-700 dark:text-amber-400 mb-1">ملاحظات</h4>
            <p className="text-xs text-amber-600 dark:text-amber-300">{selected.notes_ar}</p>
          </div>
        )}</>
      );
      return null;
    }
    
    return (
      <div><h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-2 mb-3 border-b-2 border-emerald-200 dark:border-emerald-700/50">معلومات</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{JSON.stringify(selected)}</p>
      </div>
    );
  };

const Modal = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-modal-in shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="sticky top-0 z-10 flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-t-2xl">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0 text-lg">
          {activeTab === 'species' ? '🐝' : activeTab === 'diseases' ? '🦠' : activeTab === 'honey_plants' ? '🌿' : activeTab === 'equipment' ? '🔧' : '📋'}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{selected?.name_ar || selected?.crop_ar || selected?.type_ar || selected?.item_ar || selected?.category_ar || selected?.name || ''}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{selected?.scientific_name || selected?.scientific || ''}</p>
        </div>
        <button onClick={closeModal}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1 px-5 pt-3 border-b border-gray-200/80 dark:border-gray-700/50">
        {[
          { key: 'description', label: 'الوصف', icon: Search },
          { key: 'management', label: 'الإدارة', icon: Shield },
          { key: 'details', label: 'تفاصيل', icon: Info },
        ].map(tab => (
          <button key={tab.key} onClick={() => setModalTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              modalTab === tab.key
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {renderModalContent()}
      </div>
    </div>
  </div>
);

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
          <span className="text-3xl">🐝</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{d.metadata.name_ar}</h1>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{d.metadata.name_en}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{d.metadata.description_ar}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                <AlertTriangle size={12} /> {d.stats.bee_species} نوع • {d.stats.honey_plants} نبات • {d.stats.bee_diseases} مرض
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                <Info size={12} /> {d.stats.total_hives_egypt} خلية
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {tabConfig.map(tab => {
          const section = s.find(sec => sec.id === tab.id);
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setPage(1); setShowModal(false); setSelected(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}>
              <Icon size={16} />
              <span>{section?.title_ar || tab.id}</span>
            </button>
          );
        })}
      </div>

      {currentSection?.content?.introduction_ar && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-4 mb-6 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{currentSection.content.introduction_ar}</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="max-w-md mx-auto text-center mt-16 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="inline-flex p-3.5 bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-400 rounded-xl mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">لا توجد بيانات</h3>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">لا توجد عناصر في هذا القسم حالياً.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginated.map((item, index) => renderCard(item, index))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
    {showModal && selected && <Modal />}
  </div>
);
};

export default HoneyBeesPage;
