import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../component/SEO';
import { makeBreadcrumbs } from '../component/structuredData';
import {
  BookMarked, Sprout, FunctionSquare, Library, Zap,
  Search, X, FileText, Link2, Tag, ClipboardList, BarChart3,
  Globe, BookCopy, ChevronLeft, ChevronRight, ArrowLeft,
  BookOpen, ScrollText
} from 'lucide-react';
import academicData from '../knowledge_base/academic/data.json';
import './academic.css';

const ITEMS_PER_PAGE = 5;

const tabs = [
  { id: 'glossary', label: 'قاموس المصطلحات', icon: BookMarked },
  { id: 'plants', label: 'البيانات الأكاديمية للنباتات', icon: Sprout },
  { id: 'equations', label: 'المعادلات الأساسية', icon: FunctionSquare },
  { id: 'references', label: 'المراجع العلمية', icon: Library },
  { id: 'quickref', label: 'مراجع سريعة', icon: Zap },
];

const Modal = ({ isOpen, onClose, icon: Icon, title, subtitle, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/80 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-t-2xl">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const SectionHeading = ({ icon: Icon, title, sub }) => (
  <div className="relative mb-6">
    <div className="flex items-center gap-3 mb-1">
      {Icon && (
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
    </div>
    {sub && <p className="mr-12 text-sm text-gray-500 dark:text-gray-400">{sub}</p>}
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-w-[36px] h-9 px-2 rounded-xl text-sm font-bold transition-all ${
            page === currentPage
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
              : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
};

const AcademicPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedRef, setSelectedRef] = useState(null);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [showRefModal, setShowRefModal] = useState(false);
  const [activeTab, setActiveTab] = useState('glossary');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [termPage, setTermPage] = useState(1);
  const [plantPage, setPlantPage] = useState(1);

  useEffect(() => {
    setData(academicData);
    if (academicData?.glossary?.terms) {
      setFilteredTerms(academicData.glossary.terms);
    }
  }, []);

  useEffect(() => {
    if (data?.glossary?.terms) {
      const filtered = data.glossary.terms.filter(term =>
        term.arabic.includes(searchQuery) ||
        term.english.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTerms(filtered);
      setTermPage(1);
    }
  }, [searchQuery, data]);

  const termTotalPages = Math.ceil(filteredTerms.length / ITEMS_PER_PAGE);
  const paginatedTerms = filteredTerms.slice(
    (termPage - 1) * ITEMS_PER_PAGE,
    termPage * ITEMS_PER_PAGE
  );

  const plantTotalPages = Math.ceil((data?.plant_academic_data?.plants?.length || 0) / ITEMS_PER_PAGE);
  const paginatedPlants = (data?.plant_academic_data?.plants || []).slice(
    (plantPage - 1) * ITEMS_PER_PAGE,
    plantPage * ITEMS_PER_PAGE
  );

  const handleTermClick = (term) => {
    setSelectedTerm(term);
    setShowTermModal(true);
  };

  const handlePlantClick = (plant) => {
    setSelectedPlant(plant);
    setShowPlantModal(true);
  };

  const handleRefClick = (ref) => {
    setSelectedRef(ref);
    setShowRefModal(true);
  };

  const closeModals = () => {
    setShowTermModal(false);
    setShowPlantModal(false);
    setShowRefModal(false);
    setSelectedTerm(null);
    setSelectedPlant(null);
    setSelectedRef(null);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white dark:bg-gray-900" dir="rtl">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">جاري تحميل البيانات الأكاديمية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <SEO title="المصطلحات الأكاديمية" description="قاموس المصطلحات الأكاديمية في العلوم الزراعية — تعريفات ومفاهيم بأسلوب مبسط." url="/knowledge-base/academic" keywords="مصطلحات زراعية, مصطلحات أكاديمية, علوم زراعية, تعريفات زراعية, مفاهيم زراعية" breadcrumbs={makeBreadcrumbs('/knowledge-base/academic')} />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/knowledge-base')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة</span>
          </button>

          <div className="mt-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 shrink-0">
                <Library className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{data.metadata.name_ar}</h1>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">{data.metadata.name_en}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{data.metadata.description_ar}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
                    <BookMarked className="w-3.5 h-3.5" />
                    {data.glossary?.terms?.length} مصطلح
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
                    <Sprout className="w-3.5 h-3.5" />
                    {data.plant_academic_data?.plants?.length} نبات
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
                    <BookCopy className="w-3.5 h-3.5" />
                    {data.key_references_general?.books?.length} مرجع
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1.5 mb-6 overflow-x-auto bg-gray-100 dark:bg-gray-800/60 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setTermPage(1); setPlantPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200/60 dark:border-gray-600/60'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Glossary Tab */}
        {activeTab === 'glossary' && (
          <div>
            <SectionHeading icon={BookMarked} title={data.glossary.title_ar} sub={data.glossary.description_ar} />
            <div className="relative max-w-md mb-6">
              <input
                type="text"
                placeholder="ابحث عن مصطلح..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 px-1">
              عرض {paginatedTerms.length} من أصل {filteredTerms.length} مصطلح
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedTerms.map((term) => (
                <div
                  key={term.id}
                  onClick={() => handleTermClick(term)}
                  className="group p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {term.arabic}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic truncate">{term.english}</p>
                    {term.latin && <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">{term.latin}</p>}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
                    {term.definition_ar.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/60">
                    <span className="inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
                      {term.field_ar}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                      عرض التفاصيل
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {paginatedTerms.length === 0 && (
              <div className="max-w-md mx-auto text-center mt-10 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm">
                <div className="inline-flex p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-400 rounded-xl mb-3">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">لا توجد نتائج مطابقة</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  لم نجد أي تطابق للمصطلح "<span className="text-emerald-600 dark:text-emerald-400 font-semibold">{searchQuery}</span>"
                </p>
                <button onClick={() => setSearchQuery('')} className="mt-4 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl transition-colors">
                  إعادة تعيين
                </button>
              </div>
            )}

            <Pagination currentPage={termPage} totalPages={termTotalPages} onPageChange={setTermPage} />
          </div>
        )}

        {/* Plants Tab */}
        {activeTab === 'plants' && (
          <div>
            <SectionHeading icon={Sprout} title={data.plant_academic_data.title_ar} sub={data.plant_academic_data.description_ar} />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedPlants.map((plant) => (
                <div
                  key={plant.plant_id}
                  onClick={() => handlePlantClick(plant)}
                  className="group p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {plant.name_ar}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">{plant.name_en}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 mb-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 dark:text-gray-500">الفصيلة:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{plant.taxonomy.family_ar}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 dark:text-gray-500">الجنس:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{plant.taxonomy.genus_ar}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/60">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                      عرض التصنيف الكامل
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Pagination currentPage={plantPage} totalPages={plantTotalPages} onPageChange={setPlantPage} />
          </div>
        )}

        {/* Equations Tab */}
        {activeTab === 'equations' && (
          <div>
            <SectionHeading icon={FunctionSquare} title={data.essential_equations.title_ar} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.essential_equations.equations.map((eq) => (
                <div key={eq.id} className="p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <div className="mb-3">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{eq.name_ar}</h3>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{eq.name_en}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 text-center mb-3">
                    <code className="text-sm font-mono text-emerald-700 dark:text-emerald-400 leading-relaxed" dir="ltr">{eq.formula}</code>
                  </div>
                  {eq.example_ar && (
                    <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/40 dark:border-amber-900/30 mb-2">
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mb-1">مثال:</span>
                      <p className="text-xs text-amber-600/90 dark:text-amber-400/80 leading-relaxed">{eq.example_ar}</p>
                    </div>
                  )}
                  {eq.note_ar && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">ملاحظة:</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{eq.note_ar}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References Tab */}
        {activeTab === 'references' && (
          <div>
            <SectionHeading icon={Library} title={data.key_references_general.title_ar} />

            {/* Books */}
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-gray-100 mb-4 pr-1 border-r-[3px] border-emerald-500 pr-3">
                <BookCopy className="w-4 h-4 text-emerald-500" />
                الكتب المرجعية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.key_references_general.books.map((book, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleRefClick(book)}
                    className="p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">{book.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{book.authors}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mb-2">{book.year} | {book.publisher}</p>
                    {book.isbn && <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">ISBN: {book.isbn}</p>}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 dark:border-gray-700/60">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        عرض التفاصيل
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Journals */}
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-gray-100 mb-4 pr-1 border-r-[3px] border-emerald-500 pr-3">
                <ScrollText className="w-4 h-4 text-emerald-500" />
                المجلات العلمية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.key_references_general.key_journals_ar.map((journal, idx) => (
                  <div key={idx} className="p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-300">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">{journal.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{journal.publisher}</p>
                    <span className="inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
                      {journal.focus_ar}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Online Databases */}
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-gray-100 mb-4 pr-1 border-r-[3px] border-emerald-500 pr-3">
                <Globe className="w-4 h-4 text-emerald-500" />
                قواعد البيانات الإلكترونية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.key_references_general.online_databases_ar.map((db, idx) => (
                  <div key={idx} className="p-5 bg-white dark:bg-gray-800/70 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-300">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">{db.name}</h4>
                    <a href={`https://${db.url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline break-all block mb-2">
                      {db.url}
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{db.note_ar}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Reference Tab */}
        {activeTab === 'quickref' && (
          <div>
            <SectionHeading icon={Zap} title={data.academic_quick_reference.title_ar} />

            {/* Elements Table */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/70 shadow-sm">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700/60">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{data.academic_quick_reference.essential_elements_table.title_ar}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-900/40">
                      <th className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300">الرمز</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300">العنصر</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300">المصدر</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300 hidden md:table-cell">الوظيفة</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300 hidden lg:table-cell">أعراض النقص</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.academic_quick_reference.essential_elements_table.elements.slice(0, 10).map((el, idx) => (
                      <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{el.symbol}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{el.name_ar}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{el.source_ar}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{el.function_ar}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">{el.deficiency_ar}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Soil Indicators Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/70 shadow-sm">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700/60">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{data.academic_quick_reference.soil_fertility_indicators_ar.title_ar}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-900/40">
                      <th className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300">المؤشر</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300">المدى الأمثل</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300">النموذجي في مصر</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300">التأثير</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.academic_quick_reference.soil_fertility_indicators_ar.indicators.map((ind, idx) => (
                      <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{ind.parameter_ar}</td>
                        <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">{ind.optimal_ar}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{ind.egypt_typical_ar}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{ind.impact_ar}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Term Modal */}
      <Modal
        isOpen={showTermModal}
        onClose={closeModals}
        icon={BookMarked}
        title={selectedTerm?.arabic}
        subtitle={selectedTerm?.english}
      >
        {selectedTerm && (
          <>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                <FileText className="w-4 h-4 text-emerald-500" />
                التعريف
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selectedTerm.definition_ar}</p>
              {selectedTerm.definition_en && (
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500 italic leading-relaxed border-t border-gray-100 dark:border-gray-700/60 pt-2">{selectedTerm.definition_en}</p>
              )}
            </div>
            {selectedTerm.equation && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                  <FunctionSquare className="w-4 h-4 text-emerald-500" />
                  المعادلة
                </h3>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 text-center" dir="ltr">
                  <code className="text-sm font-mono text-emerald-700 dark:text-emerald-400">{selectedTerm.equation}</code>
                </div>
              </div>
            )}
            {selectedTerm.formula_ar && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  الصيغة
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{selectedTerm.formula_ar}</p>
              </div>
            )}
            {selectedTerm.related_terms && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                  <Link2 className="w-4 h-4 text-emerald-500" />
                  مصطلحات مرتبطة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTerm.related_terms.map((term, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100/40 dark:border-emerald-900/40">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                <Tag className="w-4 h-4 text-emerald-500" />
                المجال
              </h3>
              <span className="inline-flex px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
                {selectedTerm.field_ar}
              </span>
            </div>
          </>
        )}
      </Modal>

      {/* Plant Modal */}
      <Modal
        isOpen={showPlantModal}
        onClose={closeModals}
        icon={Sprout}
        title={selectedPlant?.name_ar}
        subtitle={selectedPlant?.name_en}
      >
        {selectedPlant && (
          <>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                <ClipboardList className="w-4 h-4 text-emerald-500" />
                التصنيف العلمي
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                {[
                  ['المملكة', selectedPlant.taxonomy.kingdom_ar],
                  ['الشعبة', selectedPlant.taxonomy.division_ar],
                  ['الصف', selectedPlant.taxonomy.class_ar],
                  ['الرتبة', selectedPlant.taxonomy.order_ar],
                  ['الفصيلة', selectedPlant.taxonomy.family_ar],
                  ['الجنس', selectedPlant.taxonomy.genus_ar],
                  ['النوع', selectedPlant.taxonomy.species_ar],
                  ['الكروموسومات', selectedPlant.taxonomy.chromosome_number],
                ].map(([label, value], idx) => (
                  <div key={idx} className="flex justify-between items-baseline py-1.5 px-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/40 last:border-0 gap-2">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300 text-left">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            {selectedPlant.academic_terms_ar && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  مصطلحات أكاديمية
                </h3>
                <div className="space-y-2">
                  {Object.entries(selectedPlant.academic_terms_ar).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">{value.split(' ')[0]}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedPlant.key_references && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                  <BookCopy className="w-4 h-4 text-emerald-500" />
                  المراجع العلمية
                </h3>
                <div className="space-y-2">
                  {selectedPlant.key_references.map((ref, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        <strong className="text-gray-800 dark:text-gray-200">{ref.authors}</strong> ({ref.year}). {ref.title}. <em className="text-emerald-600 dark:text-emerald-400">{ref.journal || ref.book}</em>
                        {ref.volume && `, ${ref.volume}`}{ref.pages && `, ${ref.pages}`}.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Reference Modal */}
      <Modal
        isOpen={showRefModal}
        onClose={closeModals}
        icon={Library}
        title={selectedRef?.title}
        subtitle={selectedRef?.authors}
      >
        {selectedRef && (
          <>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
              {[
                ['السنة', selectedRef.year],
                ['الناشر', selectedRef.publisher],
                ...(selectedRef.isbn ? [['ISBN', selectedRef.isbn]] : []),
                ...(selectedRef.relevance_ar ? [['الأهمية', selectedRef.relevance_ar]] : []),
              ].map(([label, value], idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 min-w-[60px]">{label}:</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 pr-1 border-r-[3px] border-emerald-500 pr-3">
                <FileText className="w-4 h-4 text-emerald-500" />
                كيفية الاستشهاد (APA 7th)
              </h3>
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/40 dark:border-emerald-900/30" dir="ltr">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-left">
                  {selectedRef.authors} ({selectedRef.year}). <em className="text-emerald-700 dark:text-emerald-400">{selectedRef.title}</em>. {selectedRef.publisher}.
                </p>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AcademicPage;
