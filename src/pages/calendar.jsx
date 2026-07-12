import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronRight, CalendarDays, Calendar, Wheat, Sprout, Apple, Leaf,
  FlaskConical, AlertTriangle, Lightbulb, Wrench, Sun, Droplets,
  Info, AlertCircle, Thermometer, MapPin
} from 'lucide-react';
import calendarData from '../calender/calender.json';

const AgriculturalCalendarPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [activeTab, setActiveTab] = useState('planting');

  useEffect(() => {
    try {
      setData(calendarData);
      if (calendarData.months?.length > 0) {
        setSelectedMonth(calendarData.months[0]);
      }
    } catch (err) {
      setError('حدث خطأ في عرض بيانات التقويم الزراعي');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setActiveTab('planting');
  };

  const getSeasonClass = (season) => {
    switch (season) {
      case 'شتاء': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'ربيع': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
      case 'صيف': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
      case 'خريف': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'عالية': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'متوسطة': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
      case 'منخفضة': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
      default: return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
    }
  };

  const tabs = [
    { id: 'planting', label: 'الزراعة', icon: Sprout },
    { id: 'harvesting', label: 'الحصاد', icon: Wheat },
    { id: 'operations', label: 'العمليات', icon: Wrench },
    { id: 'fertilization', label: 'التسميد', icon: FlaskConical },
    { id: 'alerts', label: 'تنبيهات', icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-gray-900" dir="rtl">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">جاري تحميل التقويم الزراعي...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-gray-900" dir="rtl">
        <div className="rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-8 text-center max-w-md">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
            <AlertCircle size={22} />
          </div>
          <h3 className="mb-1 text-sm font-bold text-red-700 dark:text-red-400">حدث خطأ</h3>
          <p className="mb-4 text-xs text-red-600 dark:text-red-300">{error || 'لا توجد بيانات'}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <Helmet>
        <title>التقويم الزراعي | Hefno-Plant</title>
        <meta name="description" content="التقويم الزراعي الشهري — مواعيد الزراعة والحصاد والعمليات الزراعية حسب كل شهر." />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Back Button */}
        <button
          onClick={() => navigate('/knowledge-base')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/80"
        >
          <ChevronRight size={16} />
          <span>العودة</span>
        </button>

        {/* Header */}
        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30">
              <CalendarDays size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{data.metadata.name_ar}</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">{data.metadata.name_en}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{data.metadata.description_ar}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Info size={14} />
                  {data.metadata.source_ar}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <MapPin size={14} />
                  {data.metadata.regions_covered_ar.join(' • ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Months Grid */}
        <div className="mb-6 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {data.months.map((month) => (
            <button
              key={month.month_number}
              onClick={() => handleMonthSelect(month)}
              className={`rounded-xl border p-3 text-center transition-all ${
                selectedMonth?.month_number === month.month_number
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30'
                  : 'border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="text-sm font-black">{month.month_number}</div>
              <div className="mt-0.5 text-[10px] font-medium">{month.name_ar}</div>
              <div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[8px] font-bold ${getSeasonClass(month.season_ar)}`}>
                {month.season_ar}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Month Content */}
        {selectedMonth && (
          <div className="space-y-5">
            {/* Month Info */}
            <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 dark:text-white">
                    {selectedMonth.name_ar} — {selectedMonth.name_en}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Thermometer size={12} className="text-blue-500" />
                    <span className="text-gray-500 dark:text-gray-400">الدلتا</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{selectedMonth.avg_temp_delta}</div>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Sun size={12} className="text-amber-500" />
                    <span className="text-gray-500 dark:text-gray-400">الوجه القبلي</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{selectedMonth.avg_temp_upper_egypt}</div>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Droplets size={12} className="text-blue-400" />
                    <span className="text-gray-500 dark:text-gray-400">الأمطار</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{selectedMonth.rainfall_ar}</div>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100/60 dark:border-gray-700/30 p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Info size={12} className="text-emerald-500" />
                    <span className="text-gray-500 dark:text-gray-400">ملخص</span>
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-gray-700 dark:text-gray-300">{selectedMonth.summary_ar}</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-gray-100 dark:border-gray-800 pb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-t-xl px-3 py-2.5 text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-500'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
              {/* Planting */}
              {activeTab === 'planting' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-gray-900 dark:text-white">
                        <Wheat size={14} className="text-amber-500" />
                        المحاصيل الحقلية
                      </h3>
                      <ul className="space-y-1.5">
                        {selectedMonth.planting?.field_crops_ar?.map((crop, idx) => (
                          <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                            {crop}
                          </li>
                        ))}
                        {(!selectedMonth.planting?.field_crops_ar || selectedMonth.planting.field_crops_ar.length === 0) && (
                          <li className="text-xs italic text-gray-400 dark:text-gray-500">لا توجد زراعات حقلية هذا الشهر</li>
                        )}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-gray-900 dark:text-white">
                        <Sprout size={14} className="text-emerald-500" />
                        الخضروات
                      </h3>
                      <ul className="space-y-1.5">
                        {selectedMonth.planting?.vegetables_ar?.map((veg, idx) => (
                          <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                            {veg}
                          </li>
                        ))}
                        {(!selectedMonth.planting?.vegetables_ar || selectedMonth.planting.vegetables_ar.length === 0) && (
                          <li className="text-xs italic text-gray-400 dark:text-gray-500">لا توجد زراعات خضروات هذا الشهر</li>
                        )}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-gray-900 dark:text-white">
                        <Apple size={14} className="text-orange-500" />
                        الفاكهة
                      </h3>
                      <ul className="space-y-1.5">
                        {selectedMonth.planting?.fruits_ar?.map((fruit, idx) => (
                          <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-orange-500 shrink-0" />
                            {fruit}
                          </li>
                        ))}
                        {(!selectedMonth.planting?.fruits_ar || selectedMonth.planting.fruits_ar.length === 0) && (
                          <li className="text-xs italic text-gray-400 dark:text-gray-500">لا توجد زراعات فاكهة هذا الشهر</li>
                        )}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-gray-900 dark:text-white">
                        <Leaf size={14} className="text-purple-500" />
                        النباتات الطبية والعطرية
                      </h3>
                      <ul className="space-y-1.5">
                        {selectedMonth.planting?.medicinal_ar?.map((med, idx) => (
                          <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                            {med}
                          </li>
                        ))}
                        {(!selectedMonth.planting?.medicinal_ar || selectedMonth.planting.medicinal_ar.length === 0) && (
                          <li className="text-xs italic text-gray-400 dark:text-gray-500">لا توجد زراعات طبية هذا الشهر</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {selectedMonth.planting?.notes_ar && (
                    <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/20 p-4 border-r-[3px] border-emerald-500">
                      <div className="flex items-start gap-2">
                        <Lightbulb size={14} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">{selectedMonth.planting.notes_ar}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Harvesting */}
              {activeTab === 'harvesting' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-gray-900 dark:text-white">
                      <Wheat size={14} className="text-amber-500" />
                      المحاصيل الحقلية
                    </h3>
                    <ul className="space-y-1.5">
                      {selectedMonth.harvesting?.field_crops_ar?.map((crop, idx) => (
                        <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                          {crop}
                        </li>
                      ))}
                      {(!selectedMonth.harvesting?.field_crops_ar || selectedMonth.harvesting.field_crops_ar.length === 0) && (
                        <li className="text-xs italic text-gray-400 dark:text-gray-500">لا توجد محاصيل حقلية للحصاد هذا الشهر</li>
                      )}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-gray-900 dark:text-white">
                      <Sprout size={14} className="text-emerald-500" />
                      الخضروات
                    </h3>
                    <ul className="space-y-1.5">
                      {selectedMonth.harvesting?.vegetables_ar?.map((veg, idx) => (
                        <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                          {veg}
                        </li>
                      ))}
                      {(!selectedMonth.harvesting?.vegetables_ar || selectedMonth.harvesting.vegetables_ar.length === 0) && (
                        <li className="text-xs italic text-gray-400 dark:text-gray-500">لا توجد خضروات للحصاد هذا الشهر</li>
                      )}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-gray-900 dark:text-white">
                      <Apple size={14} className="text-orange-500" />
                      الفاكهة
                    </h3>
                    <ul className="space-y-1.5">
                      {selectedMonth.harvesting?.fruits_ar?.map((fruit, idx) => (
                        <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-orange-500 shrink-0" />
                          {fruit}
                        </li>
                      ))}
                      {(!selectedMonth.harvesting?.fruits_ar || selectedMonth.harvesting.fruits_ar.length === 0) && (
                        <li className="text-xs italic text-gray-400 dark:text-gray-500">لا توجد فاكهة للحصاد هذا الشهر</li>
                      )}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-black text-gray-900 dark:text-white">
                      <Leaf size={14} className="text-purple-500" />
                      النباتات الطبية والعطرية
                    </h3>
                    <ul className="space-y-1.5">
                      {selectedMonth.harvesting?.medicinal_ar?.map((med, idx) => (
                        <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                          {med}
                        </li>
                      ))}
                      {(!selectedMonth.harvesting?.medicinal_ar || selectedMonth.harvesting.medicinal_ar.length === 0) && (
                        <li className="text-xs italic text-gray-400 dark:text-gray-500">لا توجد نباتات طبية للحصاد هذا الشهر</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Operations */}
              {activeTab === 'operations' && (
                <div className="space-y-3">
                  {selectedMonth.key_operations_ar?.map((op, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="mb-2 flex items-center gap-2 flex-wrap">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getPriorityClass(op.priority)}`}>
                          {op.priority}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{op.operation_ar}</h3>
                      </div>
                      <p className="pr-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{op.details_ar}</p>
                    </div>
                  ))}
                  {(!selectedMonth.key_operations_ar || selectedMonth.key_operations_ar.length === 0) && (
                    <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-8 text-center shadow-sm">
                      <p className="text-xs italic text-gray-400 dark:text-gray-500">لا توجد عمليات زراعية مسجلة هذا الشهر</p>
                    </div>
                  )}
                </div>
              )}

              {/* Fertilization */}
              {activeTab === 'fertilization' && (
                <div className="space-y-3">
                  {selectedMonth.fertilization_tips_ar?.map((tip, idx) => (
                    <div key={idx} className="rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/20 p-4 border-r-[3px] border-emerald-500">
                      <div className="flex items-start gap-2">
                        <FlaskConical size={14} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">{tip}</p>
                      </div>
                    </div>
                  ))}
                  {(!selectedMonth.fertilization_tips_ar || selectedMonth.fertilization_tips_ar.length === 0) && (
                    <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-8 text-center shadow-sm">
                      <p className="text-xs italic text-gray-400 dark:text-gray-500">لا توجد نصائح تسميد هذا الشهر</p>
                    </div>
                  )}
                </div>
              )}

              {/* Alerts */}
              {activeTab === 'alerts' && (
                <div className="space-y-3">
                  {selectedMonth.weather_alerts_ar?.map((alert, idx) => (
                    <div key={idx} className="rounded-xl border border-red-200/60 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4 border-r-[3px] border-red-500">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                        <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">{alert}</p>
                      </div>
                    </div>
                  ))}
                  {(!selectedMonth.weather_alerts_ar || selectedMonth.weather_alerts_ar.length === 0) && (
                    <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-8 text-center shadow-sm">
                      <p className="text-xs italic text-gray-400 dark:text-gray-500">لا توجد تنبيهات جوية هذا الشهر</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default AgriculturalCalendarPage;
