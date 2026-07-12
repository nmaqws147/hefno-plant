import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronRight, ChevronDown, ChevronUp, Sprout, Brain, ClipboardList,
  Search, FlaskConical, Droplets, Wheat, Calendar, Sun,
  Lightbulb, AlertTriangle, AlertCircle, CheckCircle, BarChart3,
  Info, MapPin, Leaf, RefreshCw
} from 'lucide-react';

const FertilizerPlanner = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    crop: '',
    soilType: '',
    irrigationType: '',
    areaFeddan: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedStages, setExpandedStages] = useState({});

  const crops = [
    'قمح', 'أرز', 'ذرة شامية', 'قطن', 'طماطم', 'فلفل', 'خيار', 'بطاطس',
    'بصل', 'ثوم', 'فول بلدي', 'برسيم', 'عنب', 'موز', 'حمضيات', 'فراولة'
  ];

  const soilTypes = [
    'تربة طميية (نيلية)', 'تربة رملية', 'تربة طينية ثقيلة',
    'تربة رملية طميية', 'تربة ملحية', 'تربة كلسية (جيرية)'
  ];

  const irrigationTypes = [
    'ري بالغمر (سيحي)', 'ري بالرش', 'ري بالتنقيط'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/.netlify/functions/fertilizer-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ في الاتصال');
      }

      setResult(data);

      if (data.plan?.schedule) {
        const initialExpanded = {};
        data.plan.schedule.slice(0, 3).forEach((_, idx) => {
          initialExpanded[idx] = true;
        });
        setExpandedStages(initialExpanded);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ crop: '', soilType: '', irrigationType: '', areaFeddan: '', plantingDate: '' });
    setResult(null);
    setError(null);
    setExpandedStages({});
  };

  const handleBack = () => navigate('/knowledge-base');

  const toggleStage = (index) => {
    setExpandedStages(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const formatDose = (dose) => {
    if (!dose) return 'غير محدد';
    return dose;
  };

  const getStageBorderClass = (stageName) => {
    if (stageName.includes('زراعة') || stageName.includes('شتل')) return 'border-r-[3px] border-green-500';
    if (stageName.includes('نمو')) return 'border-r-[3px] border-blue-500';
    if (stageName.includes('تزهير')) return 'border-r-[3px] border-orange-500';
    if (stageName.includes('ثمار') || stageName.includes('نضج')) return 'border-r-[3px] border-purple-500';
    return 'border-r-[3px] border-gray-500';
  };

  const getStageIcon = (stageName) => {
    if (stageName.includes('زراعة') || stageName.includes('شتل')) return <Sprout size={14} />;
    if (stageName.includes('نمو')) return <Leaf size={14} />;
    if (stageName.includes('تزهير')) return <Sun size={14} />;
    if (stageName.includes('ثمار') || stageName.includes('نضج')) return <BarChart3 size={14} />;
    return <Info size={14} />;
  };

  const getStageDotClass = (stageName) => {
    if (stageName.includes('زراعة') || stageName.includes('شتل')) return 'bg-green-500';
    if (stageName.includes('نمو')) return 'bg-blue-500';
    if (stageName.includes('تزهير')) return 'bg-orange-500';
    if (stageName.includes('ثمار') || stageName.includes('نضج')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300" dir="rtl">
      <Helmet>
        <title>مخطط البرامج الزراعية | Hefno-Plant</title>
        <meta name="description" content="خطط برامج التسميد والري والعمليات الزراعية حسب المحصول والمرحلة — خطط مخصصة لنباتاتك." />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/80"
        >
          <ChevronRight size={16} />
          <span>العودة</span>
        </button>

        {/* Header Card */}
        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30">
              <Brain size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">برنامج التسميد الذكي</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                احصل على برنامج تسميد مخصص لمحصولك بناءً على بياناتك المدخلة
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle size={14} />
                  توصيات دقيقة
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Brain size={14} />
                  مدعوم بالذكاء الاصطناعي
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100/40 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <MapPin size={14} />
                  مناسب للظروف المصرية
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shrink-0">
              <ClipboardList size={18} />
            </div>
            <h2 className="text-base font-black text-gray-900 dark:text-white">بيانات المزرعة</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">المحصول *</label>
                <select
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  <option value="">اختر المحصول</option>
                  {crops.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">نوع التربة *</label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  <option value="">اختر نوع التربة</option>
                  {soilTypes.map(soil => (
                    <option key={soil} value={soil}>{soil}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">نظام الري *</label>
                <select
                  name="irrigationType"
                  value={formData.irrigationType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  <option value="">اختر نظام الري</option>
                  {irrigationTypes.map(irr => (
                    <option key={irr} value={irr}>{irr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">المساحة (فدان) *</label>
                <input
                  type="number"
                  name="areaFeddan"
                  value={formData.areaFeddan}
                  onChange={handleChange}
                  placeholder="مثال: 2"
                  step="0.1"
                  min="0.1"
                  required
                  className="w-full rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <RefreshCw size={16} />
                إعادة تعيين
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30 transition-all hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-white" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    احصل على برنامج التسميد
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
              <AlertCircle size={22} />
            </div>
            <h3 className="mb-1 text-sm font-bold text-red-700 dark:text-red-400">حدث خطأ</h3>
            <p className="mb-4 text-xs text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-600"
            >
              حاول مرة أخرى
            </button>
          </div>
        )}

        {/* Results */}
        {result && result.success && result.plan && (
          <div className="space-y-5">
            {/* Results Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shrink-0">
                <BarChart3 size={18} />
              </div>
              <h2 className="text-base font-black text-gray-900 dark:text-white">برنامج التسميد الموصى به</h2>
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <Wheat size={14} />
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">المحصول</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{result.plan.crop}</div>
              </div>
              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Calendar size={14} />
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">مدة الموسم</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{result.plan.duration || 'غير محدد'}</div>
              </div>
              {result.plan.summary && (
                <>
                  <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      <FlaskConical size={14} />
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">إجمالي N-P-K</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {result.plan.summary.total_n}/{result.plan.summary.total_p}/{result.plan.summary.total_k} كجم
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <BarChart3 size={14} />
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">الإنتاج المتوقع</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{result.plan.summary.expectedYield} طن/فدان</div>
                  </div>
                </>
              )}
            </div>

            {/* Fertilizer Recommendations */}
            {result.plan.fertilizers && result.plan.fertilizers.length > 0 && (
              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white">
                  <FlaskConical size={16} className="text-emerald-500" />
                  الأسمدة الموصى بها
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {result.plan.fertilizers.map((fert, idx) => (
                    <div key={idx} className="rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <Droplets size={14} />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{fert.name}</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">الجرعة:</span>
                          <strong className="text-gray-900 dark:text-white">{formatDose(fert.dose)}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">الطريقة:</span>
                          <span className="text-gray-700 dark:text-gray-300">{fert.method}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">التوقيت:</span>
                          <span className="text-gray-700 dark:text-gray-300">{fert.timing}</span>
                        </div>
                        {fert.notes && (
                          <div className="flex items-start gap-1.5 rounded-lg bg-white dark:bg-gray-700/50 p-2 text-[10px] text-gray-500 dark:text-gray-400">
                            <Info size={10} className="mt-0.5 shrink-0" />
                            <span>{fert.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Stages */}
            {result.plan.schedule && result.plan.schedule.length > 0 && (
              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white">
                  <Calendar size={16} className="text-emerald-500" />
                  مراحل النمو والتسميد
                </h3>
                <div className="space-y-3">
                  {result.plan.schedule.map((stage, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 transition-all ${getStageBorderClass(stage.stage)}`}
                    >
                      <button
                        onClick={() => toggleStage(idx)}
                        className="flex w-full items-center justify-between gap-3 p-4 text-right"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-white shrink-0 ${getStageDotClass(stage.stage)}`}>
                            {getStageIcon(stage.stage)}
                          </div>
                          <div className="text-right">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{stage.stage}</h4>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{stage.weeks}</span>
                          </div>
                        </div>
                        <span className="text-gray-400">
                          {expandedStages[idx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </button>

                      {expandedStages[idx] && (
                        <div className="border-t border-gray-200/60 dark:border-gray-700/50 px-4 pb-4 pt-3 space-y-3">
                          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{stage.description}</p>

                          {stage.irrigation && (
                            <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-700/50 p-2.5 text-xs">
                              <Droplets size={12} className="text-blue-500 shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{stage.irrigation}</span>
                            </div>
                          )}

                          {stage.watch && (
                            <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-gray-700/50 p-2.5 text-xs">
                              <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{stage.watch}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips & Warnings */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {result.plan.tips && result.plan.tips.length > 0 && (
                <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-amber-700 dark:text-amber-300">
                    <Lightbulb size={16} />
                    نصائح مهمة
                  </h3>
                  <ul className="space-y-2">
                    {result.plan.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                        <CheckCircle size={12} className="mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.plan.warnings && result.plan.warnings.length > 0 && (
                <div className="rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-red-700 dark:text-red-300">
                    <AlertTriangle size={16} />
                    تحذيرات
                  </h3>
                  <ul className="space-y-2">
                    {result.plan.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Results */}
        {result && !result.success && (
          <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg">
              <AlertCircle size={22} />
            </div>
            <h3 className="mb-1 text-sm font-bold text-gray-900 dark:text-white">لم يتم العثور على برنامج</h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              {result.error || 'عذراً، لم نتمكن من إيجاد برنامج تسميد للمحصول المطلوب'}
            </p>
            {result.availableCrops && (
              <div className="mb-4">
                <strong className="text-xs font-bold text-gray-700 dark:text-gray-300">المحاصيل المتوفرة:</strong>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {result.availableCrops.map(crop => (
                    <span key={crop} className="rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-300">{crop}</span>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
            >
              <RefreshCw size={14} />
              محاولة مرة أخرى
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default FertilizerPlanner;
