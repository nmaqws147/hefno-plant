import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import SEO from '../component/SEO';
import pathogensData from '../disease-folder/fungi.json';

const classConfig = {
  oomy: {
    emoji: '💧',
    border: 'border-r-[3px] border-blue-500',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    borderLight: 'border-blue-200/60 dark:border-blue-900/40',
    hover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
  },
  zygo: {
    emoji: '🧫',
    border: 'border-r-[3px] border-purple-500',
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    borderLight: 'border-purple-200/60 dark:border-purple-900/40',
    hover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
  },
  asco: {
    emoji: '🍄',
    border: 'border-r-[3px] border-orange-500',
    badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-600 dark:text-orange-400',
    borderLight: 'border-orange-200/60 dark:border-orange-900/40',
    hover: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
  },
  basi: {
    emoji: '🌿',
    border: 'border-r-[3px] border-red-500',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-600 dark:text-red-400',
    borderLight: 'border-red-200/60 dark:border-red-900/40',
    hover: 'group-hover:text-red-600 dark:group-hover:text-red-400',
  },
};

const FungalClassificationPage = () => {
  const navigate = useNavigate();

  const classGroups = [
    { ...pathogensData.oomyPro, key: 'oomy' },
    { ...pathogensData.zygoPro, key: 'zygo' },
    { ...pathogensData.ascoPro, key: 'asco' },
    { ...pathogensData.basiPro, key: 'basi' },
  ];

  const totalDiseases = classGroups.reduce((sum, g) => sum + (g.pathogens_count || 0), 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <SEO title="تصنيف الفطريات الممرضة" description="دليل تصنيف الفطريات الممرضة للنبات — الفطريات البيضية، الأسكية، البازيدية، والزيجية." url="/knowledge-base/diseases/fungi" />

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
              <span className="text-3xl">🍄</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">تصنيف الفطريات الممرضة</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">Fungal Classification</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="text-sm">🦠</span>
                  {totalDiseases} مرض
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100/40 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <span className="text-sm">🧬</span>
                  {classGroups.length} شعب رئيسية
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 shadow-sm">
          <div>
            <h2 className="text-base font-black text-emerald-700 dark:text-emerald-400">مسببات الأمراض الفطرية</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fungal Plant Pathogens</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            الفطريات من أهم مسببات الأمراض النباتية. تنقسم إلى عدة شعب رئيسية تختلف في تركيبها وطرق تكاثرها واستجابتها للمبيدات. فهم التصنيف يساعد في اختيار استراتيجية المكافحة المناسبة.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {classGroups.map((group) => {
            const cc = classConfig[group.key];
            const totalInClass = pathogensData[group.key]?.length || 0;
            return (
              <div
                key={group.key}
                onClick={() => navigate(`/knowledge-base/diseases/fungi/${group.key}`)}
                className={`group cursor-pointer rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${cc.border}`}
              >
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${cc.bg} ${cc.text}`}>
                  {totalInClass} مرض
                </span>

                <div className="flex items-center gap-3 mt-2 mb-1">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cc.bg} text-xl shrink-0`}>
                    <span>{cc.emoji}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{group.group_ar}</h3>
                    <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{group.group_en}</p>
                  </div>
                </div>

                <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                  {group.group_description?.substring(0, 120)}...
                </p>

                  {group.causalAgents && (
                    <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-700 pt-3 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <span className="text-sm">🔬</span>
                          الأجناس:
                        </span>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-left line-clamp-1 max-w-[60%]">
                          {group.causalAgents.split(',').slice(0, 3).join('، ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <span className="text-sm">📋</span>
                          المميزات:
                        </span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {group.distinguishing_features?.length || 0} صفة
                        </span>
                      </div>
                    </div>
                  )}

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                  <span className={`flex items-center gap-1 text-[11px] font-bold ${cc.text}`}>
                    عرض التفاصيل
                    <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FungalClassificationPage;
