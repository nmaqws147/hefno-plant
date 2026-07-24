import { useNavigate } from 'react-router-dom';
import SEO from '../component/SEO';
import { makeBreadcrumbs } from '../component/structuredData';
import { Bug, Shield, Leaf, Sprout, FlaskConical, Hospital, ChevronLeft, Layers, ChevronRight } from 'lucide-react';
import { getGroups } from '../pesticides-folder/buildGroups';

const categories = [
  { id: 'insecticides', nameAr: 'المبيدات الحشرية', nameEn: 'Insecticides', emoji: '🐛', desc: 'مبيدات مكافحة الحشرات الضارة التي تصيب المحاصيل الزراعية — تصنيف IRAC لآلية العمل', color: 'red', count: getGroups('irac-grp').length },
  { id: 'fungicides', nameAr: 'المبيدات الفطرية', nameEn: 'Fungicides', emoji: '🍄', desc: 'مبيدات مكافحة الأمراض الفطرية التي تصيب النباتات — تصنيف FRAC لآلية العمل', color: 'purple', count: getGroups('frac-grp').length },
  { id: 'herbicides', nameAr: 'مبيدات الحشائش', nameEn: 'Herbicides', emoji: '🌿', desc: 'مبيدات مكافحة الحشائش والنباتات غير المرغوب فيها — تصنيف HRAC لآلية العمل', color: 'emerald', count: getGroups('hrac-grp').length },
  { id: 'nematicides', nameAr: 'المبيدات النيماتودية', nameEn: 'Nematicides', emoji: '🪱', desc: 'مبيدات مكافحة النيماتودا المتطفلة على جذور النباتات — آلية العمل', color: 'amber', count: getGroups('nema-grp').length },
  { id: 'bactericides', nameAr: 'المبيدات البكتيرية', nameEn: 'Bactericides', emoji: '🦠', desc: 'مبيدات مكافحة الأمراض البكتيرية التي تصيب المحاصيل الزراعية', color: 'cyan', count: getGroups('bact-grp').length },
  { id: 'publicHealth', nameAr: 'مبيدات الصحة العامة', nameEn: 'Public Health Pesticides', emoji: '🏥', desc: 'مبيدات تستخدم في مكافحة ناقلات الأمراض والحشرات ذات الأهمية الصحية العامة', color: 'amber', count: 6 },
];

const categoryColors = {
  red: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-500', gradient: 'from-red-500 to-red-600', badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-500', gradient: 'from-purple-500 to-purple-600', badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500', gradient: 'from-emerald-500 to-emerald-600', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500', gradient: 'from-amber-500 to-amber-600', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-500', gradient: 'from-cyan-500 to-cyan-600', badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' },
};

const PesticidesHub = () => {
  const navigate = useNavigate();
  const totalGroups = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <SEO title="مركز المبيدات الزراعية" description="دليل المبيدات الزراعية الشامل — مبيدات حشرية وفطرية وأعشاب، الجرعات وطرق الاستخدام." url="/knowledge-base/pesticides" keywords="دليل المبيدات, مبيدات زراعية, مبيدات حشرية, مبيدات فطرية, مبيدات أعشاب, مكافحة الآفات" breadcrumbs={makeBreadcrumbs('/knowledge-base/pesticides')} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/knowledge-base')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/80"
        >
          <ChevronRight size={16} />
          <span>العودة</span>
        </button>

        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 shrink-0">
              <span className="text-2xl">🧪</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">مركز المبيدات الزراعية</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">Pesticides Center</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">دليل شامل للمبيدات الزراعية، مقسمة حسب النوع والتصنيف الكيميائي</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Layers size={14} />
                  {categories.length} تصنيفات
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100/40 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <FlaskConical size={14} />
                  {totalGroups}+ مجموعة مبيدات
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const c = categoryColors[cat.color];
            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/knowledge-base/pesticides/${cat.id}`)}
                className={`group cursor-pointer rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border-r-[3px] ${c.border}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${c.badge}`}>
                      <span>{cat.emoji}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{cat.nameAr}</h3>
                      <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{cat.nameEn}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">{cat.count} مجموعة</span>
                </div>

                <p className="text-xs leading-relaxed line-clamp-2 text-gray-500 dark:text-gray-400 mb-3">{cat.desc}</p>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3 mt-2">
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1"><FlaskConical size={12} /> {cat.count} مجموعة</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    عرض التفاصيل <ChevronLeft size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PesticidesHub;
