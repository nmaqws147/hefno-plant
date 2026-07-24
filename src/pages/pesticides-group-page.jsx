import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, X, FlaskConical, AlertTriangle, Droplets, Shield, BookOpen, Bug, Leaf, Sprout, Wheat, ClipboardList, Star, Hospital, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import SEO from '../component/SEO';
import { makeBreadcrumbs } from '../component/structuredData';

const ITEMS_PER_PAGE = 5;

const categoryMeta = {
  insecticides: { Comp: Bug, color: '#ef4444', gradient: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
  fungicides: { Comp: Shield, color: '#8b5cf6', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  herbicides: { Comp: Leaf, color: '#10b981', gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  nematicides: { Comp: Sprout, color: '#f59e0b', gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  bactericides: { Comp: FlaskConical, color: '#06b6d4', gradient: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
  publicHealth: { Comp: Hospital, color: '#8b5a2b', gradient: 'from-amber-600 to-amber-700', bg: 'bg-amber-50 dark:bg-amber-950/30' },
};

const normalizeGroupCode = (code) => {
  if (!code) return '';
  return String(code).trim().toUpperCase();
};

const PesticideGroupPage = () => {
  const { groupCode } = useParams();
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const extractGroupCode = (item, category) => {
    if (!item) return '';
    switch (category) {
      case 'fungicides': return item.frac_group_id || '';
      case 'insecticides': return item.irac_group_id || '';
      case 'herbicides': return item.hrac_group_id || '';
      case 'nematicides': return item.nematicide_group_id || '';
      case 'bactericides': return item.bactericide_group_id || '';
      case 'publicHealth': return item.group_code || item.code || item.id || '';
      default: return item.group_code || item.code || item.id || '';
    }
  };

  const normalizeItem = (item, category, group) => ({
    ...item,
    name_ar: item.ar_name || item.name_ar || item.name || 'غير معروف',
    name_en: item.name_en || item.name || '',
    type_ar: item.type_ar || item.ar_type || (item.systemic ? 'جهازي' : 'ملامسي'),
    chemical_class_ar: item.chemical_class_en || item.chemical_class_ar || '—',
    group_code_display: extractGroupCode(item, category) || group?.code,
    group_name_ar: item.group_name_ar || group?.name_ar || group?.ar_name,
    resistance_risk: item.resistance?.risk_ar || item.resistance?.ar_risk || item.resistance_risk,
    resistance_risk_level: item.resistance?.risk_level,
    resistance_mechanism: item.resistance?.mechanism_ar || item.resistance?.ar_mechanism,
    target_pests: item.target_pests || item.target_diseases || item.target_nematodes || item.target_weeds || [],
    spectrum_ar: item.spectrum_ar || item.ar_spectrum || '—',
    activity_ar: item.activity_ar || item.ar_activity,
    application: item.application || {},
    safety_notes: item.safety_notes_ar || item.ar_notes_safety,
    special_use: item.special_use_ar || item.ar_use_special,
    regulatory: item.regulatory_ar || item.ar_regulatory,
    isPublicHealth: category === 'publicHealth',
    target_crops: item.target_crops || [],
  });

  const loadItems = useCallback(async (category, rawGroupCode, group) => {
    setLoading(true);
    const targetCode = normalizeGroupCode(rawGroupCode);
    try {
      let allItems = [];
      switch (category) {
        case 'fungicides': {
          const mod = await import('../pesticides-folder/pesti-items/frac.json');
          allItems = mod.default?.items || [];
          break;
        }
        case 'insecticides': {
          const mod = await import('../pesticides-folder/pesti-items/irac.json');
          allItems = mod.default?.items || [];
          break;
        }
        case 'herbicides': {
          const mod = await import('../pesticides-folder/pesti-items/hrac.json');
          allItems = mod.default?.items || [];
          break;
        }
        case 'nematicides': {
          const mod = await import('../pesticides-folder/pesti-items/nema.json');
          allItems = mod.default?.items || [];
          break;
        }
        case 'bactericides': {
          const mod = await import('../pesticides-folder/pesti-items/bact.json');
          allItems = mod.default?.items || [];
          break;
        }
        case 'publicHealth': {
          const mod = await import('../pesticides-folder/pesti-items/phg.json');
          const targetGroup = mod.default?.groups?.find(g =>
            normalizeGroupCode(g.code) === targetCode || normalizeGroupCode(g.id) === targetCode
          );
          if (targetGroup?.active_ingredients) {
            const normalized = targetGroup.active_ingredients.map(item =>
              normalizeItem({ ...item, group_name_ar: targetGroup.ar_name }, category, group)
            );
            setItems(normalized);
            setGroupData(prev => ({ ...prev, group: group }));
            setLoading(false);
            return;
          }
          setItems([]);
          setLoading(false);
          return;
        }
        default: break;
      }
      const filtered = allItems.filter(item => {
        const itemCode = extractGroupCode(item, category);
        return normalizeGroupCode(itemCode) === targetCode;
      });
      const normalizedItems = filtered.map(item => normalizeItem(item, category, group));
      setItems(normalizedItems);
    } catch (error) {
      console.error(`Error loading ${category}:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('selectedPesticideGroup');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const codeToUse = parsed.group?.id || parsed.group?.code || groupCode;
      setGroupData(parsed);
      loadItems(parsed.category, codeToUse, parsed.group);
    } else {
      navigate('/knowledge-base/pesticides');
    }
  }, [groupCode, navigate, loadItems]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name_ar?.toLowerCase().includes(q) ||
      item.name_en?.toLowerCase().includes(q) ||
      item.chemical_class_ar?.toLowerCase().includes(q) ||
      item.type_ar?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-gray-900" dir="rtl">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">جاري تحميل المواد الفعالة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-gray-900" dir="rtl">
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
          <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">خطأ في تحميل البيانات</h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">لم يتم العثور على بيانات المجموعة المطلوبة</p>
          <button
            onClick={() => navigate('/knowledge-base/pesticides')}
            className="rounded-full bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-600"
          >
            العودة إلى المبيدات
          </button>
        </div>
      </div>
    );
  }

  const currentGroup = groupData.group || groupData;
  const currentCategory = groupData.category;
  const catMeta = categoryMeta[currentCategory] || categoryMeta.insecticides;
  const CatIcon = catMeta.Comp;
  const isPublicHealth = currentCategory === 'publicHealth';

  const modalTabs = [
    { id: 'info', label: 'معلومات' },
    { id: 'application', label: 'تطبيق' },
    { id: 'targets', label: 'أهداف وسلامة' },
  ];

  const categoryNames = {
    insecticides: 'مبيدات حشرية',
    fungicides: 'مبيدات فطرية',
    herbicides: 'مبيدات أعشاب',
    nematicides: 'مبيدات نيماتودا',
    bactericides: 'مبيدات بكتيرية',
    publicHealth: 'مبيدات صحة عامة',
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900" dir="rtl">
      <SEO
        title={categoryNames[currentCategory] || currentCategory || 'مجموعة مبيدات'}
        description={`دليل مجموعة ${categoryNames[currentCategory] || currentCategory || 'المبيدات'} — قائمة شاملة بالمبيدات وتصنيفاتها وطرق استخدامها.`}
        url={`/knowledge-base/pesticides/group/${groupCode}`}
        keywords={`${categoryNames[currentCategory] || currentCategory}, مبيدات, مجموعة مبيدات, مكافحة الآفات, المبيدات الزراعية`}
        breadcrumbs={makeBreadcrumbs(`/knowledge-base/pesticides/group/${groupCode}`)}
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pt-24">
        {/* Back Button */}
        <button
          onClick={() => navigate('/knowledge-base/pesticides')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/80"
        >
          <ChevronRight size={16} />
          <span>العودة إلى المجموعات</span>
        </button>

        {/* Group Header */}
        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${catMeta.gradient} text-white shadow-lg shrink-0`}
            >
              <CatIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{currentGroup.chemical_class_en || currentGroup.name_ar || currentGroup.ar_name}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentGroup.name_en || currentGroup.chemical_class_ar}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold"
                  style={{ background: `${catMeta.color}15`, color: catMeta.color }}
                >
                  {currentGroup.code || currentGroup.id}
                </span>
                <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-[11px] text-gray-600 dark:text-gray-300">
                  {currentGroup.chemical_class_en || currentGroup.chemical_class_ar || 'Pesticide'}
                </span>
                <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-[11px] text-gray-600 dark:text-gray-300">
                  {items.length} مادة فعالة
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Group Description */}
        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
            <BookOpen size={16} className="text-emerald-500" />
            عن هذه المجموعة
          </h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {currentGroup.MoA_ar || currentGroup.ar_MoA || 'لا يوجد وصف متاح'}
          </p>
          {isPublicHealth && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 text-xs text-blue-700 dark:text-blue-300">
              <Hospital size={14} className="mt-0.5 shrink-0" />
              <span>مبيدات الصحة العامة - تستخدم لمكافحة ناقلات الأمراض (البعوض، الذباب، الصراصير، القوارض)</span>
            </div>
          )}
          {currentGroup.ar_rule_rotation && (
            <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <RefreshCw size={12} className="mt-0.5 shrink-0" />
              <span>{currentGroup.ar_rule_rotation}</span>
            </div>
          )}
          {currentGroup.ar_spectrum && (
            <div className="mt-2 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Shield size={12} className="mt-0.5 shrink-0" />
              <span>{currentGroup.ar_spectrum}</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 px-4 py-3 shadow-sm">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="ابحث عن مادة فعالة بالاسم العربي أو الإنجليزي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <FlaskConical size={14} />
            {filteredItems.length} مادة فعالة
          </span>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => {
                setSelectedItem(item);
                setShowModal(true);
                setModalTab(0);
              }}
              className="group cursor-pointer rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between">
                <h4 className="text-base font-bold text-gray-900 dark:text-white">{item.name_en}</h4>
              </div>

              {item.trade_names_ar?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.trade_names_ar.map((tn, i) => (
                    <span key={i} className="rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400">{tn}</span>
                  ))}
                </div>
              )}

              <div className="mb-2 space-y-1.5 border-t border-gray-100 dark:border-gray-700 pt-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">النوع:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{item.type_ar}</span>
                </div>
                {item.chemical_class_ar && item.chemical_class_ar !== '—' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">التركيب:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.chemical_class_ar}</span>
                  </div>
                )}
                {item.application?.dose_feddan_ar && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      <Droplets size={10} className="ml-1 inline" />
                      الجرعة:
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.application.dose_feddan_ar}</span>
                  </div>
                )}
                {item.resistance_risk && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">مخاطر المقاومة:</span>
                    <span className="font-bold" style={{ color: getRiskColor(item.resistance_risk) }}>
                      {getRiskText(item.resistance_risk)}
                    </span>
                  </div>
                )}
                {item.spectrum_ar && item.spectrum_ar !== '—' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">المكافحة:</span>
                    <span className="text-gray-700 dark:text-gray-300 line-clamp-1">{item.spectrum_ar}</span>
                  </div>
                )}
              </div>

              {/* Targets */}
              {item.target_pests && item.target_pests.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {isPublicHealth ? 'الآفات المستهدفة:' :
                     currentCategory === 'fungicides' ? 'الأمراض المستهدفة:' :
                     currentCategory === 'herbicides' ? 'الحشائش المستهدفة:' :
                     currentCategory === 'nematicides' ? 'النيماتودا المستهدفة:' : 'الأهداف:'}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.target_pests.slice(0, 3).map((pest, i) => (
                      <span key={i} className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-[10px] text-gray-600 dark:text-gray-300">
                        {typeof pest === 'string' ? pest : pest.ar_name || pest.name_ar}
                      </span>
                    ))}
                    {item.target_pests.length > 3 && (
                      <span className="rounded-full bg-gray-200 dark:bg-gray-600 px-2 py-0.5 text-[10px] text-gray-500">
                        +{item.target_pests.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  عرض التفاصيل
                  <ArrowLeft size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-12 text-center shadow-sm">
            <Search size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">لا توجد مواد فعالة</h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              لم يتم العثور على مواد فعالة تطابق "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-600 shadow-md"
            >
              مسح البحث
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all disabled:opacity-30 enabled:hover:bg-emerald-50 dark:enabled:hover:bg-emerald-900/30 text-gray-600 dark:text-gray-400"
            >
              <ChevronRight size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all disabled:opacity-30 enabled:hover:bg-emerald-50 dark:enabled:hover:bg-emerald-900/30 text-gray-600 dark:text-gray-400"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-900 shadow-2xl animate-modal-in"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-5 py-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${catMeta.gradient} text-white shadow-lg shrink-0`}
                >
                  <CatIcon size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">{selectedItem.name_en}</h2>
                  {selectedItem.who_class && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">تصنيف منظمة الصحة العالمية: {selectedItem.who_class}</p>
                  )}
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    {selectedItem.chemical_class_ar || selectedItem.group_name_ar || currentGroup.name_ar}
                  </p>
                  {selectedItem.trade_names_ar?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedItem.trade_names_ar.map((tn, i) => (
                        <span key={i} className="rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400">{tn}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex gap-1 border-b border-gray-100 dark:border-gray-800 px-5 pt-2">
                {modalTabs.map((tab, i) => (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(i)}
                    className={`px-4 py-2 text-[11px] font-bold transition-all rounded-t-xl ${
                      modalTab === i
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="p-5">
                {/* Tab 0: Info */}
                {modalTab === 0 && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">المجموعة الكيميائية:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedItem.chemical_class_ar}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">نوع المادة:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedItem.type_ar}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">رمز المجموعة:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{selectedItem.group_code_display || '—'}</span>
                        </div>
                        {selectedItem.activity_ar && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">آلية التأثير:</span>
                            <span className="font-bold text-gray-900 dark:text-white">{selectedItem.activity_ar}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedItem.special_use && (
                      <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4">
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <Star size={12} />
                          استخدامات خاصة
                        </h4>
                        <p className="text-xs leading-relaxed text-amber-600 dark:text-amber-400">{selectedItem.special_use}</p>
                      </div>
                    )}

                    {selectedItem.regulatory && (
                      <div className="rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 p-4">
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                          <ClipboardList size={12} />
                          معلومات تنظيمية
                        </h4>
                        <p className="text-xs leading-relaxed text-blue-600 dark:text-blue-400">{selectedItem.regulatory}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 1: Application + Resistance */}
                {modalTab === 1 && (
                  <div className="space-y-4">
                    {selectedItem.application && Object.keys(selectedItem.application).length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Droplets size={12} />
                          معلومات التطبيق
                        </h4>
                        <div className="space-y-2">
                          {selectedItem.application.dose_feddan_ar && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">الجرعة للفدان:</span>
                              <span className="font-bold text-gray-900 dark:text-white">{selectedItem.application.dose_feddan_ar}</span>
                            </div>
                          )}
                          {selectedItem.application.dose_spray_ar && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">الجرعة للرش:</span>
                              <span className="font-bold text-gray-900 dark:text-white">{selectedItem.application.dose_spray_ar}</span>
                            </div>
                          )}
                          {selectedItem.application.methods_ar && selectedItem.application.methods_ar.length > 0 && (
                            <div className="text-xs">
                              <span className="text-gray-500 dark:text-gray-400">طريقة التطبيق: </span>
                              <span className="text-gray-900 dark:text-white">{selectedItem.application.methods_ar.join('، ')}</span>
                            </div>
                          )}
                          {selectedItem.application.timing_ar && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">توقيت التطبيق:</span>
                              <span className="text-gray-900 dark:text-white">{selectedItem.application.timing_ar}</span>
                            </div>
                          )}
                          {selectedItem.application.preharvest_interval_ar && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">فترة التحريم:</span>
                              <span className="text-gray-900 dark:text-white">{selectedItem.application.preharvest_interval_ar}</span>
                            </div>
                          )}
                          {selectedItem.application.max_applications_season && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">الحد الأقصى للرشات:</span>
                              <span className="font-bold text-gray-900 dark:text-white">{selectedItem.application.max_applications_season} رشات/موسم</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedItem.resistance_risk && (
                      <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4">
                        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <AlertTriangle size={12} />
                          معلومات المقاومة
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">مخاطر المقاومة:</span>
                            <span className="font-bold" style={{ color: getRiskColor(selectedItem.resistance_risk) }}>
                              {getRiskText(selectedItem.resistance_risk)}
                            </span>
                          </div>
                          {selectedItem.resistance_mechanism && (
                            <div className="text-xs">
                              <span className="text-gray-500 dark:text-gray-400">آلية المقاومة: </span>
                              <span className="text-amber-700 dark:text-amber-400">{selectedItem.resistance_mechanism}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Targets + Safety */}
                {modalTab === 2 && (
                  <div className="space-y-4">
                    {selectedItem.target_pests && selectedItem.target_pests.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                          {isPublicHealth ? <Bug size={12} /> :
                           currentCategory === 'fungicides' ? <Shield size={12} /> :
                           currentCategory === 'herbicides' ? <Leaf size={12} /> :
                           currentCategory === 'nematicides' ? <Shield size={12} /> : <Shield size={12} />}
                          {isPublicHealth ? 'الآفات المستهدفة' :
                           currentCategory === 'fungicides' ? 'الأمراض المستهدفة' :
                           currentCategory === 'herbicides' ? 'الحشائش المستهدفة' :
                           currentCategory === 'nematicides' ? 'النيماتودا المستهدفة' : 'الأهداف'}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedItem.target_pests.map((pest, i) => (
                            <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">
                              {typeof pest === 'string' ? pest : pest.ar_name || pest.name_ar}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedItem.target_crops && selectedItem.target_crops.length > 0 && (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-4">
                        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Wheat size={12} />
                          المحاصيل
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedItem.target_crops.map((crop, i) => (
                            <span key={i} className="rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedItem.safety_notes && (
                      <div className="rounded-xl border border-red-200/60 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4">
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300">
                          <AlertTriangle size={12} />
                          تحذيرات السلامة
                        </h4>
                        <p className="text-xs leading-relaxed text-red-600 dark:text-red-400">{selectedItem.safety_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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
  );
};

export default PesticideGroupPage;
