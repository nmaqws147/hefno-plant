import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Chart, registerables } from 'chart.js';
import {
  BarChart3, Eye, Users, FileText, Zap, Scan,
  TrendingUp, UserCheck, Globe, PieChart,
  ThumbsUp, Settings, Layout, CalendarDays, RefreshCw,
  Loader2, AlertTriangle
} from 'lucide-react';

Chart.register(...registerables);

const DAYS_OPTIONS = [
  { value: 7, label: 'آخر 7 أيام' },
  { value: 30, label: 'آخر 30 يوم' },
  { value: 60, label: 'آخر 60 يوم' },
  { value: 90, label: 'آخر 90 يوم' },
];

const PAGE_NAMES = {
  home: 'الرئيسية', diagnose: 'التشخيص', weather: 'الطقس', ai_chat: 'المساعد',
  'knowledge-base': 'المعرفة', 'program-planner': 'التسميد', admin_stats: 'لوحة التحكم',
};

const StatCard = ({ icon: Icon, value, label, badge }) => (
  <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
    <div className="size-10 sm:size-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 grid place-items-center shrink-0">
      <Icon className="size-5 text-emerald-600 dark:text-emerald-400" />
    </div>
    <div className="min-w-0">
      <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      {badge && (
        <div className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
          {badge.text}
        </div>
      )}
    </div>
  </div>
);

const ChartCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-4 sm:p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 grid place-items-center">
        <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
    <div className="min-h-[180px]">{children}</div>
  </div>
);

const InteractionCard = ({ icon: Icon, title, items }) => (
  <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-4 sm:p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700/50">
      <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 grid place-items-center">
        <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
    <div className="space-y-1.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <span className="text-xs text-gray-700 dark:text-gray-300">{item.label}</span>
          <span className="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700/30 px-2 py-0.5 rounded-full min-w-[40px] text-center">
            {item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonLine = ({ w = '60%', h = '14px', className = '' }) => (
  <div className={`skeleton-shimmer rounded-lg ${className}`} style={{ width: w, height: h }} />
);

const SkeletonCircle = ({ size = '36px' }) => (
  <div className="skeleton-shimmer rounded-full shrink-0" style={{ width: size, height: size }} />
);

const ActionStatsScreen = ({ inPanel = false }) => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const dailyChartRef = useRef(null);
  const uniqueChartRef = useRef(null);
  const chartsRef = useRef({});

  function initChart(canvas, config) {
    if (!canvas) return null;
    const chart = new Chart(canvas, config);
    requestAnimationFrame(() => { try { chart.resize(); } catch {} });
    return chart;
  }

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stats?action=get&days=${days}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { const i = setInterval(fetchStats, 180000); return () => clearInterval(i); }, [fetchStats]);

  useEffect(() => {
    if (!data || loading) return;
    const dailyDates = Object.keys(data.dailyViews || {}).sort();
    const dailyTotals = dailyDates.map(d => data.dailyViews[d]?.total || 0);
    const dailyUniques = dailyDates.map(d => data.dailyViews[d]?.unique || 0);

    const frame = requestAnimationFrame(() => {
      Object.values(chartsRef.current).forEach(ch => { if (ch) ch.destroy(); });
      chartsRef.current = {};
      const opts = { responsive: true, maintainAspectRatio: true, animation: { duration: 300 }, plugins: { legend: { display: false } } };

      const c1 = dailyChartRef.current;
      if (c1 && dailyDates.length) chartsRef.current.daily = initChart(c1, {
        type: 'line',
        data: { labels: dailyDates.map(d => d.slice(5)), datasets: [{ label: 'الزيارات', data: dailyTotals, borderColor: '#2b7a3e', backgroundColor: 'rgba(43,122,62,0.08)', fill: true, tension: 0.3, borderWidth: 2.5 }] },
        options: opts,
      });

      const c2 = uniqueChartRef.current;
      if (c2 && dailyDates.length) chartsRef.current.unique = initChart(c2, {
        type: 'bar',
        data: { labels: dailyDates.map(d => d.slice(5)), datasets: [{ label: 'زوار فريدين', data: dailyUniques, backgroundColor: '#f39c12', borderRadius: 8 }] },
        options: opts,
      });

      });

      return () => { cancelAnimationFrame(frame); Object.values(chartsRef.current).forEach(ch => { if (ch) ch.destroy(); }); };
  }, [data, loading]);

  const popularPages = data ? Object.entries(data.pages || {}).sort((a, b) => b[1] - a[1]).slice(0, 8) : [];
  const kbCount = data?.pages?.['knowledge-base'] || 0;
  const actionEntries = data ? [
    { label: 'تحليل ناجح', key: 'image_analysis_success', color: '#2d6a4f' },
    { label: 'أمراض', key: 'ai_diseases_success', color: '#f4a261' },
    { label: 'علاج', key: 'ai_treatment_success', color: '#e9c46a' },
    { label: 'استشارة عامة', key: 'ai_general_success', color: '#76b5a0' },
    { label: 'تسميد', key: 'fertilizer_planned', color: '#e76f51' },
  ].filter(e => (data.actions?.[e.key] || 0) > 0) : [];

  const totalActions = data ? Object.values(data.actions || {}).reduce((a, b) => a + b, 0) : 0;
  const imageSuccess = data?.actions?.image_analysis_success || 0;
  const imageFailed = data?.actions?.image_analysis_failed || 0;
  const imageTotal = imageSuccess + imageFailed;
  const imageSuccessRate = imageTotal > 0 ? Math.round((imageSuccess / imageTotal) * 100) : 0;

  if (loading && !data) {
    return (
      <div className={`${inPanel ? 'h-full' : 'h-screen'} overflow-hidden bg-white dark:bg-gray-900`} dir="rtl">
        <style>{`
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          .skeleton-shimmer { position: relative; overflow: hidden; background: #e5e7eb; }
          .dark .skeleton-shimmer { background: #374151; }
          .skeleton-shimmer::after {
            content: ''; position: absolute; inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
            animation: shimmer 1.5s infinite;
          }
          .dark .skeleton-shimmer::after { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }
          .scrollbar-thin::-webkit-scrollbar{width:4px}
          .scrollbar-thin::-webkit-scrollbar-track{background:transparent}
          .scrollbar-thin::-webkit-scrollbar-thumb{background:#94a3b8;border-radius:2px}
        `}</style>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
          <div className="h-16 rounded-2xl skeleton-shimmer" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-72 rounded-2xl skeleton-shimmer" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${inPanel ? 'h-full' : 'min-h-screen'} bg-white dark:bg-gray-900`} dir="rtl">
      {!inPanel && (
        <Helmet>
          <title>إحصائيات HefnoPlant | لوحة التحكم</title>
          <meta name="description" content="لوحة إحصائيات وتفاعلات HefnoPlant — تحليلات الأداء والزيارات." />
        </Helmet>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ─── Header ─── */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="size-10 sm:size-12 rounded-xl bg-white/10 border border-white/20 grid place-items-center">
              <BarChart3 className="size-5 sm:size-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">إحصائيات HefnoPlant</h1>
              <p className="text-[11px] text-emerald-100/70 mt-0.5">
                آخر تحديث: {lastUpdate ? lastUpdate.toLocaleString('ar-EG', { hour12: false }) : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setSelectOpen(!selectOpen)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-medium hover:bg-white/20 transition-all"
              >
                <CalendarDays size={13} />
                {DAYS_OPTIONS.find(d => d.value === days)?.label}
              </button>
              {selectOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[160px] z-50 bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/50 shadow-xl rounded-xl overflow-hidden">
                  {DAYS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setDays(opt.value); setSelectOpen(false); }}
                      className={`w-full text-right px-4 py-2.5 text-xs font-medium transition-all ${days === opt.value ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={fetchStats} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-medium hover:bg-white/20 transition-all">
              <RefreshCw size={13} />
              تحديث
            </button>
          </div>
        </div>

        {error && (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl text-center gap-4">
            <div className="size-14 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 grid place-items-center">
              <AlertTriangle className="size-6 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">تعذر الاتصال بخادم الإحصائيات</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
            <button onClick={fetchStats} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-110 transition-all shadow-md">
              <RefreshCw size={13} />
              إعادة المحاولة
            </button>
          </div>
        )}

        {data && !error && (
          <>
            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <StatCard icon={Eye} value={(data.totalViews || 0).toLocaleString()} label="إجمالي الزيارات" />
              <StatCard icon={Users} value={(data.uniqueVisitors || 0).toLocaleString()} label="زوار فريدين" />
              <StatCard icon={FileText} value={Object.keys(data.pages || {}).length} label="صفحات نشطة" />
              <StatCard icon={Zap} value={totalActions.toLocaleString()} label="إجمالي التفاعلات" />
              <StatCard
                icon={Scan}
                value={imageTotal.toLocaleString()}
                label="تحاليل AI"
                badge={{ text: `${imageSuccessRate}% نجاح`, color: imageSuccessRate > 70 ? 'green' : 'amber' }}
              />
            </div>

            {/* ─── Charts Row 1 ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <ChartCard icon={TrendingUp} title="الزيارات اليومية">
                <canvas ref={dailyChartRef} />
              </ChartCard>
              <ChartCard icon={UserCheck} title="الزوار الفريدين يومياً">
                <canvas ref={uniqueChartRef} />
              </ChartCard>
            </div>

            {/* ─── Charts Row 2 — CSS Bars ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 grid place-items-center">
                    <Globe className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">مقارنة الزيارات</h3>
                  <span className="text-[10px] text-gray-400 mr-auto">المعرفة = المرجع</span>
                </div>
                <div className="space-y-2 min-h-[180px]">
                  {popularPages.length > 0 && kbCount > 0 ? popularPages.map(([page, count], i) => {
                    const isKB = page === 'knowledge-base';
                    const pct = (count / kbCount) * 100;
                    const name = PAGE_NAMES[page] || page.replace(/_/g, ' ');
                    return (
                      <div key={page} className={`flex items-center gap-3 p-2.5 rounded-xl ${isKB ? 'bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-200 dark:ring-amber-700' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-16 sm:w-20 truncate shrink-0">{name}</span>
                        <div className="flex-1 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div className={`h-full rounded-lg bg-gradient-to-l transition-all duration-700 ${isKB ? 'from-amber-400 to-amber-500' : 'from-emerald-400 to-emerald-500'}`}
                               style={{ width: `${Math.max(pct || 0, 5)}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white w-14 text-left shrink-0">{count.toLocaleString()}</span>
                        <span className={`text-[11px] w-14 text-left shrink-0 ${isKB ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-gray-400'}`}>{pct.toFixed(1)}%</span>
                        {isKB && <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-200 dark:bg-amber-800/40 px-1.5 py-0.5 rounded-full">المرجع</span>}
                      </div>
                    );
                  }) : (
                    <div className="flex items-center justify-center h-40 text-xs text-gray-400">لا توجد بيانات كافية بعد</div>
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 grid place-items-center">
                    <PieChart className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">تركيبة التفاعلات</h3>
                </div>
                <div className="space-y-2 min-h-[180px]">
                  {actionEntries.length > 0 ? (
                    <>
                      <div className="flex gap-1 h-10 rounded-xl overflow-hidden mb-4">
                        {actionEntries.map(e => {
                          const total = actionEntries.reduce((s, x) => s + (data.actions?.[x.key] || 0), 0);
                          const pct = total > 0 ? ((data.actions?.[e.key] || 0) / total) * 100 : 0;
                          return <div key={e.key} className="h-full transition-all duration-500 first:rounded-r-xl last:rounded-l-xl" style={{ width: `${pct}%`, backgroundColor: e.color }} title={`${e.label}: ${pct.toFixed(1)}%`} />;
                        })}
                      </div>
                      {actionEntries.map(e => {
                        const count = data.actions?.[e.key] || 0;
                        const total = actionEntries.reduce((s, x) => s + (data.actions?.[x.key] || 0), 0);
                        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                        return (
                          <div key={e.key} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                            <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">{e.label}</span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{count.toLocaleString()}</span>
                            <span className="text-[11px] text-gray-400 w-10 text-left">{pct}%</span>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-40 text-xs text-gray-400">لا توجد تفاعلات بعد</div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Interactions ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <InteractionCard
                icon={ThumbsUp}
                title="تفاعلات المستخدمين الناجحة"
                items={[
                  { label: 'تحليل صور ناجح', value: data.actions?.image_analysis_success || 0 },
                  { label: 'استشارات أمراض', value: data.actions?.ai_diseases_success || 0 },
                  { label: 'استشارات علاج', value: data.actions?.ai_treatment_success || 0 },
                  { label: 'استشارات عامة', value: data.actions?.ai_general_success || 0 },
                  { label: 'مخطط تسميد', value: data.actions?.fertilizer_planned || 0 },
                ]}
              />
              <InteractionCard
                icon={Settings}
                title="النظام والخدمات"
                items={[
                  { label: 'طلبات الطقس', value: data.actions?.weather_loaded || 0 },
                  { label: 'فتح التطبيق', value: data.actions?.app_loaded || 0 },
                  { label: 'فشل تحليل صور', value: data.actions?.image_analysis_failed || 0 },
                ]}
              />
            </div>

            {/* ─── Pages Performance ─── */}
            {data.pages && Object.keys(data.pages).length > 0 && (
              <div className="bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 grid place-items-center">
                    <Layout className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">أداء جميع الصفحات</h3>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {Object.entries(data.pages).sort((a, b) => b[1] - a[1]).map(([page, count]) => {
                    const name = PAGE_NAMES[page] || page.replace(/_/g, ' ');
                    const pct = data.totalViews > 0 ? (count / data.totalViews) * 100 : 0;
                    return (
                      <div key={page} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-xs text-gray-700 dark:text-gray-300 w-[100px] sm:w-[160px] truncate shrink-0">{name}</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-primary transition-all" style={{ width: `${Math.max(pct, 1)}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white w-14 text-left shrink-0">{count.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Footer ─── */}
            <footer className="flex items-center justify-between gap-4 px-1 pt-4 border-t border-gray-100 dark:border-gray-700/50">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <RefreshCw size={10} />
                تحديث تلقائي كل 3 دقائق
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">Hefno-Plant • إحصائيات</span>
            </footer>
          </>
        )}

        {loading && data && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 text-emerald-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionStatsScreen;
