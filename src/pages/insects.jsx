import { useNavigate } from 'react-router-dom';
import SEO from '../component/SEO';
import { makeBreadcrumbs } from '../component/structuredData';
import { ChevronRight, ChevronLeft, Bug, Layers } from 'lucide-react';
import data from '../knowledge_base/insects/insects-folder/data.json';

const orderColors = {
  Lepidoptera: { border: 'border-lime-500', badge: 'bg-lime-100 dark:bg-lime-900/40 text-lime-600 dark:text-lime-400' },
  Coleoptera: { border: 'border-red-500', badge: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' },
  Hemiptera: { border: 'border-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  Thysanoptera: { border: 'border-purple-500', badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' },
  Orthoptera: { border: 'border-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
  Diptera: { border: 'border-blue-500', badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
};

const orderEmojis = {
  Lepidoptera: '🦋', Coleoptera: '🐞', Hemiptera: '🦟',
  Thysanoptera: '🐜', Orthoptera: '🦗', Diptera: '🪰',
};

const InsectsPage = () => {
  const navigate = useNavigate();

  const extraCards = [
    {
      id: 'nematoda',
      order_ar: 'النيماتودا (الديدان الثعبانية)',
      order_en: 'Nematoda & Soil Diseases',
      order_description: 'دليل شامل لتشخيص ومكافحة النيماتودا في التربة المصرية وأعراضها على الجذور والنمو الخضري',
      pathogens_count: 8,
      families_count: '-',
      isExtra: true,
      colors: { border: 'border-orange-500', badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' },
      emoji: '🐛',
    },
    {
      id: 'public-health-pests',
      order_ar: 'آفات الصحة العامة',
      order_en: 'Public Health Pests',
      order_description: 'دليل مكافحة الآفات العامة والمنزلية المرتبطة بالبيئة الزراعية: القوارض، الحشرات الطائرة، والزاحفة',
      pathogens_count: 25,
      families_count: '-',
      isExtra: true,
      colors: { border: 'border-rose-500', badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' },
      emoji: '🦟',
    },
  ];

  const insectsData = data || {};
  const baseOrders = Object.keys(insectsData).map(key => ({
    id: key,
    order_ar: insectsData[key].order_ar,
    order_en: insectsData[key].order_en,
    order_description: insectsData[key].order_description,
    pathogens_count: insectsData[key].pathogens_count,
    families_count: insectsData[key].families_count,
    emoji: orderEmojis[key] || '🐛',
    colors: orderColors[key] || { border: 'border-gray-500', badge: 'bg-gray-100 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400' },
  }));

  const allOrders = [...baseOrders, ...extraCards];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <SEO title="آفات الحشرات والديدان" description="دليل شامل للآفات الحشرية والنيماتودا وآفات الصحة العامة وطرق إدارتها." url="/knowledge-base/insects" keywords="آفات حشرية, الحشرات الزراعية, ديدان النباتات, النيماتودا, مكافحة الحشرات" breadcrumbs={makeBreadcrumbs('/knowledge-base/insects')} />

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
              <span className="text-2xl">🦋</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">آفات الحشرات والديدان</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">Insect & Pest Guide</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">دليل شامل للآفات الحشرية والنيماتودا وآفات الصحة العامة وطرق إدارتها</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Layers size={14} />
                  {allOrders.length} قسم
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100/40 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Bug size={14} />
                  60+ نوع
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {allOrders.map((order) => {
            const colors = order.colors;
            const emoji = order.emoji;
            const isExtra = order.isExtra;

            return (
              <div
                key={order.id}
                onClick={() => navigate(`/knowledge-base/insects/${order.id}`)}
                className={`group cursor-pointer rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${colors.border}`}
              >
                {isExtra && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 mb-2">
                    قسم إضافي
                  </span>
                )}

                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-lg shrink-0 ${colors.badge}`}>
                      <span>{emoji}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{order.order_ar}</h3>
                      <p className="text-[11px] italic text-gray-500 dark:text-gray-400">{order.order_en}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">
                    {order.pathogens_count || 0} نوع
                  </span>
                </div>

                <p className="text-xs leading-relaxed line-clamp-2 text-gray-500 dark:text-gray-400 mb-3">
                  {order.order_description?.substring(0, 120)}...
                </p>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3 mt-2">
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1"><Bug size={12} /> {order.pathogens_count || 0}</span>
                    <span className="inline-flex items-center gap-1"><Layers size={12} /> {order.families_count || '-'}</span>
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

export default InsectsPage;
