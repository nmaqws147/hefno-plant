import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, ChevronLeft, Bug, Layers } from 'lucide-react';

const categories = [
  { id: 'bacteria', nameAr: 'بكتيريا', nameEn: 'Bacterial Diseases', symbol: '🦠', desc: 'الأمراض البكتيرية تسببها بكتيريا ممرضة للنبات، وتؤدي إلى أعراض مثل الذبول والتبقع والانحلال', color: 'emerald', count: 28 },
  { id: 'viruses', nameAr: 'فيروسات', nameEn: 'Viral Diseases', symbol: '🧬', desc: 'الأمراض الفيروسية تسببها فيروسات تغزو الخلايا النباتية وتؤثر على نموها وإنتاجها', color: 'purple', count: 28 },
  { id: 'nematodes', nameAr: 'نيماتودا', nameEn: 'Nematode Diseases', symbol: '🪱', desc: 'الأمراض النيماتودية تسببها ديدان نيماتودية مجهرية تهاجم جذور النباتات وتؤثر على امتصاصها', color: 'amber', count: 14 },
  { id: 'parasitic_plants', nameAr: 'طفيليات', nameEn: 'Parasitic Plants', symbol: '🧫', desc: 'النباتات المتطفلة تنمو على حساب النباتات الأخرى وتمتص غذاءها منها مما يضعفها', color: 'red', count: 10 },
  { id: 'physiological_disorders', nameAr: 'فسيولوجية', nameEn: 'Physiological Disorders', symbol: '🍃', desc: 'الاضطرابات الفسيولوجية تنتج عن ظروف بيئية غير مناسبة وليس عن مسببات مرضية حية', color: 'teal', count: 25 },
  { id: 'fungi', nameAr: 'فطريات', nameEn: 'Fungal Diseases', symbol: '🍄', desc: 'الأمراض الفطرية تسببها فطريات ممرضة للنبات وتشمل البياض الدقيقي والصدأ وأعفان الجذور', color: 'orange', count: 90 },
];

const categoryColors = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500', gradient: 'from-emerald-500 to-emerald-600', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-500', gradient: 'from-purple-500 to-purple-600', badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500', gradient: 'from-amber-500 to-amber-600', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  red: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-500', gradient: 'from-red-500 to-red-600', badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-500', gradient: 'from-teal-500 to-teal-600', badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500', gradient: 'from-orange-500 to-orange-600', badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
};

const DiseasesPage = () => {
  const navigate = useNavigate();

  const totalDiseases = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <Helmet>
        <title>الأمراض النباتية | Hefno-Plant</title>
        <meta name="description" content="دليل شامل للأمراض النباتية مقسمة حسب نوع المسبب المرضي - بكتيريا، فيروسات، نيماتودا، فطريات، طفيليات، واضطرابات فسيولوجية" />
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/knowledge-base')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-950/80"
        >
          <ChevronRight size={16} />
          <span>العودة</span>
        </button>

        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200/50 dark:shadow-red-900/30 shrink-0">
              <span className="text-2xl">🦠</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">الأمراض النباتية</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">Plant Diseases</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">دليل شامل للأمراض النباتية، مقسمة حسب نوع المسبب المرضي</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-red-100/40 dark:border-red-900/40 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-400">
                  <Layers size={14} />
                  {categories.length} تصنيفات
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100/40 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Bug size={14} />
                  {totalDiseases}+ مرض
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
                onClick={() => navigate(`/knowledge-base/diseases/${cat.id}`)}
                className={`group cursor-pointer rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border-r-[3px] ${c.border}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${c.badge}`}>
                      <span>{cat.symbol}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{cat.nameAr}</h3>
                      <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{cat.nameEn}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">{cat.count} مرض</span>
                </div>

                <p className="text-xs leading-relaxed line-clamp-2 text-gray-500 dark:text-gray-400 mb-3">{cat.desc}</p>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3 mt-2">
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1"><Bug size={12} /> {cat.count} مرض</span>
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

export default DiseasesPage;
