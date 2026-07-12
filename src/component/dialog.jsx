import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import useTracking from '../hooks/useTracking';
import { Helmet } from 'react-helmet-async';
import {
  Upload, Camera, Zap, Target, Lightbulb, Smartphone, Scan,
  Leaf, Sprout, Bug, FlaskConical, AlertTriangle, Check,
  Eye, Trash2, X, AlertCircle, Search,
  Info, Activity, Wheat, Apple, Flower2, Ban,
  ChevronDown, Clock, Shield
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  })
};

const fadeUpStagger = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { staggerChildren: 0.06, delayChildren: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

function HistoryItem({ diagnosis, onView, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-emerald-200 dark:hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="size-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-white/[0.06]">
        {diagnosis.image ? (
          <img src={diagnosis.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center">
            <Leaf size={16} className="text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-gray-900 dark:text-white">{diagnosis?.plant || 'نبات غير معروف'}</div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1"><Clock size={10} />{diagnosis?.date}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            diagnosis?.healthStatus?.includes('جيدة') || diagnosis?.healthStatus === 'سليم'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : diagnosis?.healthStatus?.includes('متوسطة')
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}>{diagnosis?.healthStatus || 'غير محدد'}</span>
          <span className="font-semibold text-gray-500 dark:text-gray-400">{diagnosis?.confidence || 0}%</span>
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onView(diagnosis)} className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all grid place-items-center">
          <Eye size={14} />
        </button>
        <button onClick={() => onDelete(diagnosis.id)} className="size-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all grid place-items-center">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false, delay = 0 }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm dark:shadow-none overflow-hidden transition-all hover:shadow-md"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-right hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={15} className="text-emerald-500" />}
          <span className="text-sm font-bold text-gray-900 dark:text-white">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={15} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const IconMap = {
  'ورق': Leaf,
  'ساق': Sprout,
  'ثمر': Apple,
  'جذر': Sprout,
  'زهرة': Flower2,
  'برعم': Sprout,
};

const ProblemIconMap = {
  'فطر': AlertTriangle,
  'حشرة': Bug,
  'بكتيريا': FlaskConical,
  'فيروس': Activity,
  'من': Bug,
  'تربس': Bug,
  'بق': Bug,
  'دودة': Bug,
  'سوسة': Bug,
  'نقص': AlertCircle,
  'نيماتودا': AlertTriangle,
};

const SymptomIconMap = {
  'ثقوب': AlertTriangle,
  'اصفرار': AlertTriangle,
  'ذبول': Activity,
  'تجعيد': Activity,
  'بقع': AlertCircle,
};

const getIcon = (text, map) => {
  if (!text) return null;
  for (const [key, Icon] of Object.entries(map)) {
    if (text.includes(key)) return <Icon size={14} className="text-emerald-500 shrink-0 mt-0.5" />;
  }
  return null;
};

const DiagnoseScreen = ({ id }) => {
  const { trackAction } = useTracking();
  const [uiState, setUiState] = useState({
    image: null,
    isDragging: false,
    isAnalyzing: false,
    analysisResult: null,
    selectedDiagnosis: null,
    showDetailsModal: false,
    rateLimit: null
  });

  const [recentDiagnoses, setRecentDiagnoses] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }, []);

  const safeArray = useCallback((arr) => {
    if (!arr) return [];
    return Array.isArray(arr) ? arr : (typeof arr === 'string' ? [arr] : []);
  }, []);

  const getHealthStatusClass = useCallback((status) => {
    if (!status) return 'unknown';
    const s = status.toLowerCase();
    if (s.includes('جيدة') || s.includes('جيد') || s.includes('سليم')) return 'good';
    if (s.includes('متوسطة') || s.includes('متوسط')) return 'warning';
    if (s.includes('سيئة') || s.includes('سيء') || s.includes('حرجة')) return 'critical';
    return 'unknown';
  }, []);

  const getSeverityClass = useCallback((severity) => {
    if (!severity) return 'unknown';
    const s = severity.toLowerCase();
    if (s.includes('خفيفة') || s.includes('mild')) return 'mild';
    if (s.includes('متوسطة') || s.includes('moderate')) return 'moderate';
    if (s.includes('شديدة') || s.includes('severe')) return 'severe';
    return 'unknown';
  }, []);

  const compressImage = useCallback((file, maxWidth = 1200, maxHeight = 1200) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
          } else {
            if (height > maxHeight) { width = Math.round((width * maxHeight) / height); height = maxHeight; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }, []);

  const loadRecentDiagnoses = useCallback(() => {
    try {
      const stored = localStorage.getItem('plantDiagnoses');
      if (stored) {
        const diagnoses = JSON.parse(stored).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecentDiagnoses(diagnoses.slice(0, 5));
      }
    } catch (error) { console.error('Error loading diagnoses:', error); }
  }, []);

  const saveDiagnosisToLocalStorage = useCallback((diagnosisData) => {
    const now = new Date();
    const newDiagnosis = {
      id: Date.now(), timestamp: now.toISOString(), date: formatDate(now),
      time: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      image: uiState.image, plant: diagnosisData.plantName || 'نبات غير معروف',
      confidence: diagnosisData.confidence || 0, healthStatus: diagnosisData.healthStatus || 'غير معروف',
      fullAnalysis: diagnosisData, analysisTime: 'فوري'
    };
    setRecentDiagnoses(prev => [newDiagnosis, ...prev].slice(0, 10));
    setTimeout(() => {
      try {
        const stored = localStorage.getItem('plantDiagnoses');
        const diagnoses = stored ? JSON.parse(stored) : [];
        localStorage.setItem('plantDiagnoses', JSON.stringify([newDiagnosis, ...diagnoses].slice(0, 20)));
        toast.success('تم حفظ التشخيص بنجاح');
      } catch (error) { toast.error('فشل حفظ التشخيص'); }
    }, 0);
  }, [uiState.image, formatDate]);

  const deleteDiagnosis = useCallback((diagnosisId) => {
    try {
      const stored = localStorage.getItem('plantDiagnoses');
      if (!stored) return;
      const diagnoses = JSON.parse(stored).filter(d => d.id !== diagnosisId);
      localStorage.setItem('plantDiagnoses', JSON.stringify(diagnoses));
      setRecentDiagnoses(prev => prev.filter(d => d.id !== diagnosisId));
      toast.success('تم حذف التشخيص بنجاح');
    } catch (error) { toast.error('حدث خطأ أثناء حذف التشخيص'); }
  }, []);

  const performClearAll = useCallback(() => {
    localStorage.removeItem('plantDiagnoses');
    setRecentDiagnoses([]);
    setShowClearConfirm(false);
    toast.success('تم حذف جميع السجلات بنجاح');
  }, []);

  const clearAllDiagnoses = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const handleError = useCallback((message, status = null) => {
    setUiState(prev => ({ ...prev, analysisResult: { error: true, message, isRateLimit: status === 429, resetInHours: status === 429 ? 24 : null } }));
    toast.error(message);
  }, []);

  const analyzePlant = useCallback(async () => {
    if (!uiState.image) { toast.warning('يرجى رفع صورة أولاً'); return; }
    setUiState(prev => ({ ...prev, isAnalyzing: true, analysisResult: null, rateLimit: null }));
    try {
      const base64Image = uiState.image.split(',')[1];
      const response = await fetch("/api/analyze-image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image }),
      });
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const limit = response.headers.get('X-RateLimit-Limit');
      const reset = response.headers.get('X-RateLimit-Reset');
      if (remaining !== null) {
        setUiState(prev => ({ ...prev, rateLimit: { remaining: parseInt(remaining), limit: parseInt(limit), reset: reset ? parseInt(reset) : null } }));
      }
      const result = await response.json();
      if (!response.ok) {
        trackAction('image_analysis_failed');
        handleError(result.message || result.error || "حدث خطأ غير متوقع", response.status);
        return;
      }
      setUiState(prev => ({ ...prev, analysisResult: result }));
      saveDiagnosisToLocalStorage(result);
      toast.success(remaining !== null ? `تم التحليل! متبقي لك ${remaining} محاولات اليوم` : 'تم تحليل النبات بنجاح!');
      trackAction('image_analysis_success');
    } catch (error) {
      console.error("Critical Error:", error);
      trackAction('image_analysis_failed');
      handleError("يبدو أن هناك ضغطاً مؤقتاً على الشبكة. يرجى المحاولة مرة أخرى");
    } finally {
      setUiState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [uiState.image, handleError, saveDiagnosisToLocalStorage, trackAction]);

  const processImage = useCallback(async (file) => {
    try {
      const compressionToast = file.size > 1.5 * 1024 * 1024 ? toast.loading('جاري تهيئة وتحسين جودة الصورة...') : null;
      const compressedBase64 = await compressImage(file);
      if (compressionToast) toast.dismiss(compressionToast);
      requestAnimationFrame(() => {
        setUiState(prev => ({ ...prev, image: compressedBase64, analysisResult: null, rateLimit: null }));
      });
    } catch (error) {
      console.error("Image compression error:", error);
      toast.error("فشل معالجة الصورة، يرجى تجربة التقاط صورة أخرى");
    }
  }, [compressImage]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { toast.error('حجم الصورة كبير جداً، الحد الأقصى المسموح به 15 ميجابايت'); return; }
      processImage(file);
    }
  }, [processImage]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setUiState(prev => ({ ...prev, isDragging: true })); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setUiState(prev => ({ ...prev, isDragging: false })); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, isDragging: false }));
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 15 * 1024 * 1024) { toast.error('حجم الصورة كبير جداً، الحد الأقصى 15 ميجابايت'); return; }
      processImage(file);
    }
  }, [processImage]);

  const resetImage = useCallback(() => {
    setUiState(prev => ({ ...prev, image: null, analysisResult: null, rateLimit: null }));
  }, []);

  const handleViewDetails = useCallback((diagnosis) => {
    if (diagnosis && diagnosis.fullAnalysis) {
      setUiState(prev => ({ ...prev, image: diagnosis.image, analysisResult: diagnosis.fullAnalysis, selectedDiagnosis: diagnosis, showDetailsModal: true }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else { toast.error("بيانات التشخيص تالفة أو غير مكتملة"); }
  }, []);

  useEffect(() => { loadRecentDiagnoses(); }, [loadRecentDiagnoses]);

  const severityBadge = (severity) => {
    const cls = getSeverityClass(severity);
    if (cls === 'mild') return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    if (cls === 'moderate') return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
    if (cls === 'severe') return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
    return 'bg-gray-50 dark:bg-gray-800 text-gray-500';
  };

  const healthStatusIcon = (status) => {
    const cls = getHealthStatusClass(status);
    if (cls === 'good') return <Check size={20} className="text-green-500" />;
    if (cls === 'warning') return <AlertTriangle size={20} className="text-amber-500" />;
    if (cls === 'critical') return <Ban size={20} className="text-red-500" />;
    return <Info size={20} className="text-gray-400" />;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpStagger}
      className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden"
      id={id}
      dir="rtl"
    >
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 size-[500px] rounded-full bg-gold/5 dark:bg-gold/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[150px]" />
      </div>

      <style>{`
        @keyframes scan { 0% { top: -100%; } 100% { top: 100%; } }
        @keyframes dotPulse { 0%,60%,100% { transform: scale(0.8); opacity: 0.5; } 30% { transform: scale(1.2); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .scan-line { position: absolute; left: 0; width: 100%; height: 100%; background: linear-gradient(180deg, transparent, rgba(16,185,129,0.3), transparent); animation: scan 2s ease-in-out infinite; }
        .dot-anim { width: 8px; height: 8px; background: white; border-radius: 50%; animation: dotPulse 1.4s ease-in-out infinite; }
        .dot-anim:nth-child(2) { animation-delay: 0.2s; }
        .dot-anim:nth-child(3) { animation-delay: 0.4s; }
        .shimmer-bg { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%); background-size: 200% 100%; animation: shimmer 2s ease-in-out infinite; }
        .dark .shimmer-bg { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%); background-size: 200% 100%; }
      `}</style>

      <Helmet>
        <title>تشخيص أمراض النبات | Hefno-Plant</title>
        <meta name="description" content="شخص نباتك بالذكاء الاصطناعي — حمّل صورة ورقة نباتك للحصول على تشخيص فوري للحالة والعلاج المقترح." />
      </Helmet>

      <div className="relative max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">

        {/* ─── Premium Header ─── */}
        <motion.div variants={fadeUp} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 shrink-0">
              <Scan className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">تشخيص النباتات</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">Plant Disease Diagnosis</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">تحليل صحي فوري للنباتات باستخدام الذكاء الاصطناعي</p>
              {uiState.rateLimit && uiState.rateLimit.remaining !== undefined && !uiState.analysisResult?.isRateLimit && (
                <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
                  <Zap size={12} /> متبقي: {uiState.rateLimit.remaining} من {uiState.rateLimit.limit} تحليلات اليوم
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── Upload Section ─── */}
        <motion.section variants={fadeUp}>
          {uiState.image ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white dark:bg-gray-800/70 dark:backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700/50 shadow-lg dark:shadow-none p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 grid place-items-center">
                    <Leaf size={15} className="text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">معاينة الصورة</h3>
                </div>
                <button onClick={resetImage} className="size-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all grid place-items-center">
                  <X size={15} />
                </button>
              </div>

              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-4 bg-gray-50 dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-white/[0.06]">
                <img src={uiState.image} alt="صورة النبات" className="w-full max-h-[400px] object-contain" />
                {uiState.isAnalyzing && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl sm:rounded-2xl">
                    <div className="scan-line" />
                    <div className="shimmer-bg absolute inset-0" />
                    <div className="flex items-center gap-2 text-white text-sm font-semibold z-10">
                      <div className="flex gap-1">
                        <span className="dot-anim" />
                        <span className="dot-anim" />
                        <span className="dot-anim" />
                      </div>
                      جاري تحليل حالة النبات...
                    </div>
                  </div>
                )}
              </div>

              {uiState.analysisResult?.isRateLimit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-8 bg-red-50/80 dark:bg-red-900/15 border border-red-200 dark:border-red-800 rounded-2xl sm:rounded-3xl mb-4 backdrop-blur"
                >
                  <div className="size-14 rounded-2xl bg-red-100 dark:bg-red-900/30 grid place-items-center mx-auto mb-4">
                    <Ban size={28} className="text-red-500" />
                  </div>
                  <h4 className="text-base font-bold text-red-600 dark:text-red-400">تم تجاوز الحد اليومي</h4>
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1 max-w-xs mx-auto">{uiState.analysisResult.message}</p>
                  {uiState.analysisResult.resetInHours && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">يمكنك المحاولة مرة أخرى بعد {uiState.analysisResult.resetInHours} ساعة</p>
                  )}
                  <button onClick={resetImage} className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-b from-emerald-400 to-primary text-white text-sm font-bold shadow-md hover:shadow-lg hover:brightness-110 transition-all">رفع صورة جديدة غداً</button>
                </motion.div>
              )}

              {uiState.analysisResult?.error && !uiState.analysisResult.isRateLimit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-8 bg-red-50/80 dark:bg-red-900/15 border border-red-200 dark:border-red-800 rounded-2xl sm:rounded-3xl mb-4 backdrop-blur"
                >
                  <div className="size-14 rounded-2xl bg-red-100 dark:bg-red-900/30 grid place-items-center mx-auto mb-4">
                    <AlertCircle size={28} className="text-red-500" />
                  </div>
                  <h4 className="text-base font-bold text-red-600 dark:text-red-400">فشل التحليل</h4>
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">{uiState.analysisResult.message}</p>
                  {uiState.analysisResult.details && <p className="text-xs text-gray-500 mt-2">{uiState.analysisResult.details}</p>}
                </motion.div>
              )}

              {uiState.analysisResult && !uiState.analysisResult.error && !uiState.analysisResult.isRateLimit && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUpStagger}
                  className="space-y-4"
                >
                  {/* ── Summary Card ── */}
                  <motion.div variants={fadeUp} className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 backdrop-blur ${
                    getHealthStatusClass(uiState.analysisResult.healthStatus) === 'good'
                      ? 'bg-green-50/80 dark:bg-green-900/15 border-green-300 dark:border-green-700'
                      : getHealthStatusClass(uiState.analysisResult.healthStatus) === 'warning'
                      ? 'bg-amber-50/80 dark:bg-amber-900/15 border-amber-300 dark:border-amber-700'
                      : 'bg-red-50/80 dark:bg-red-900/15 border-red-300 dark:border-red-700'
                  }`}>
                    <div className="absolute top-0 left-0 size-32 rounded-full bg-white/20 dark:bg-white/5 blur-3xl" />
                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`size-14 sm:size-16 rounded-2xl grid place-items-center shadow-lg ${
                          getHealthStatusClass(uiState.analysisResult.healthStatus) === 'good'
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                            : getHealthStatusClass(uiState.analysisResult.healthStatus) === 'warning'
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                            : 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                        }`}>
                          {healthStatusIcon(uiState.analysisResult.healthStatus)}
                        </div>
                        <div>
                          <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{uiState.analysisResult.plantName || 'غير معروف'}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              getHealthStatusClass(uiState.analysisResult.healthStatus) === 'good'
                                ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                                : getHealthStatusClass(uiState.analysisResult.healthStatus) === 'warning'
                                ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                                : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                            }`}>{uiState.analysisResult.healthStatus || 'غير معروف'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className={`text-3xl sm:text-4xl font-black ${
                          uiState.analysisResult.confidence > 90 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>{uiState.analysisResult.confidence || 0}%</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">دقة التشخيص</div>
                        <div className="mt-1.5 w-28 h-1.5 rounded-full bg-white/60 dark:bg-gray-700 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${
                            uiState.analysisResult.confidence > 90 ? 'bg-green-500' : uiState.analysisResult.confidence > 70 ? 'bg-amber-500' : 'bg-red-500'
                          }`} style={{ width: `${uiState.analysisResult.confidence || 0}%` }} />
                        </div>
                      </div>
                    </div>
                    {(uiState.analysisResult.severity || uiState.analysisResult.problemType) && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/40 dark:border-gray-700/40">
                        {uiState.analysisResult.problemType && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border border-white dark:border-gray-600">
                            {uiState.analysisResult.problemType === 'حشري' ? <Bug size={11} className="inline ml-1 -mt-0.5" /> : <FlaskConical size={11} className="inline ml-1 -mt-0.5" />}
                            {uiState.analysisResult.problemType}
                          </span>
                        )}
                        {uiState.analysisResult.severity && (
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${severityBadge(uiState.analysisResult.severity)}`}>
                            {uiState.analysisResult.severity === 'بسيطة' || uiState.analysisResult.severity === 'خفيفة' ? 'شدة: ' : ''}{uiState.analysisResult.severity}
                          </span>
                        )}
                        {uiState.analysisResult.diseaseName?.common && uiState.analysisResult.healthStatus !== 'سليم' && (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border border-white dark:border-gray-600">
                            {uiState.analysisResult.diseaseName.common}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>

                  {/* ── Results Grid ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* LEFT COLUMN: Disease Info */}
                    <div className="space-y-4" variants={fadeUpStagger}>
                      {/* Disease Name */}
                      {uiState.analysisResult.diseaseName && (
                        <motion.div variants={fadeUp} className="p-4 sm:p-5 bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm dark:shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all">
                          <h5 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3 border-r-[3px] border-emerald-500 pr-3">
                            <FlaskConical size={15} className="text-emerald-500" /> {uiState.analysisResult.problemType === 'حشري' ? 'الاسم العلمي للحشرة' : 'الاسم العلمي للمرض'}
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-white/[0.04]">
                              <span className="text-[11px] text-gray-400 dark:text-gray-500">الاسم العلمي</span>
                              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 text-left">{uiState.analysisResult.diseaseName.scientific || 'غير معروف'}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                              <span className="text-[11px] text-gray-400 dark:text-gray-500">الاسم الشائع</span>
                              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{uiState.analysisResult.diseaseName.common || 'غير معروف'}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Symptoms */}
                      <motion.div variants={fadeUp} className="p-4 sm:p-5 bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm dark:shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        <h5 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3 border-r-[3px] border-emerald-500 pr-3">
                          <Activity size={15} className="text-emerald-500" /> الأعراض
                        </h5>
                        <ul className="space-y-1">
                          {safeArray(uiState.analysisResult.symptoms).length > 0 ? safeArray(uiState.analysisResult.symptoms).map((symptom, i) => (
                            <li key={i} className="flex items-center gap-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                              {getIcon(symptom, SymptomIconMap) || <Info size={12} className="text-gray-400" />} {symptom}
                            </li>
                          )) : <li className="text-xs text-gray-400 py-2">لا توجد أعراض محددة</li>}
                        </ul>
                      </motion.div>

                      {/* Affected Parts + Main Problems in one card */}
                      <motion.div variants={fadeUp} className="p-4 sm:p-5 bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm dark:shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        {safeArray(uiState.analysisResult.affectedParts).length > 0 && (
                          <>
                            <h5 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3 border-r-[3px] border-emerald-500 pr-3">
                              <Leaf size={15} className="text-emerald-500" /> الأجزاء المصابة
                            </h5>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {safeArray(uiState.analysisResult.affectedParts).map((part, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-100/40 dark:border-green-900/40">
                                  {getIcon(part, IconMap) || <Leaf size={12} className="text-emerald-500" />} {part}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                        <h5 className={`flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3 border-r-[3px] border-emerald-500 pr-3 ${safeArray(uiState.analysisResult.affectedParts).length > 0 ? 'mt-2' : ''}`}>
                          <Bug size={15} className="text-emerald-500" /> {uiState.analysisResult.problemType === 'حشري' ? 'الآفات المكتشفة' : 'المشاكل الأساسية'}
                        </h5>
                        <ul className="space-y-1">
                          {safeArray(uiState.analysisResult.mainProblems).length > 0 ? safeArray(uiState.analysisResult.mainProblems).map((problem, i) => (
                            <li key={i} className="flex items-center gap-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                              {getIcon(problem, ProblemIconMap) || <AlertCircle size={12} className="text-gray-400" />} {problem}
                            </li>
                          )) : <li className="text-xs text-gray-400 py-2">لا توجد مشاكل محددة</li>}
                        </ul>
                      </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Treatment */}
                    <div className="space-y-4">
                      {/* Treatment Steps */}
                      <motion.div variants={fadeUp} className="p-4 sm:p-5 bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm dark:shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        <h5 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3 border-r-[3px] border-emerald-500 pr-3">
                          <FlaskConical size={15} className="text-emerald-500" /> {uiState.analysisResult.problemType === 'حشري' ? 'خطة المكافحة' : 'العلاج المقترح'}
                        </h5>
                        <ul className="space-y-1.5">
                          {safeArray(uiState.analysisResult.treatment).length > 0 ? safeArray(uiState.analysisResult.treatment).map((treatment, i) => (
                            <li key={i} className="flex items-start gap-2.5 py-2 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                              <span className="size-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[10px] font-bold grid place-items-center shrink-0 mt-0.5 shadow-sm">{i + 1}</span>
                              {treatment}
                            </li>
                          )) : <li className="text-xs text-gray-400 py-2">استشر مهندساً زراعياً مصنفاً</li>}
                        </ul>
                      </motion.div>

                      {/* Pesticides */}
                      <motion.div variants={fadeUp} className="p-4 sm:p-5 bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm dark:shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        <h5 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3 border-r-[3px] border-emerald-500 pr-3">
                          <FlaskConical size={15} className="text-emerald-500" /> {uiState.analysisResult.problemType === 'حشري' ? 'المبيدات الحشرية' : 'المبيدات المقترحة'}
                        </h5>
                        {safeArray(uiState.analysisResult.pesticides).length > 0 ? (
                          <div className="space-y-2">
                            {safeArray(uiState.analysisResult.pesticides).map((pest, i) => (
                              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-white/[0.04]">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <FlaskConical size={12} className="text-emerald-500 shrink-0" />
                                  <strong className="text-[12px] text-gray-800 dark:text-gray-200">{pest.activeIngredient || pest.name || 'مادة فعالة'}</strong>
                                </div>
                                <div className="flex flex-wrap gap-1.5 text-[10px]">
                                  {pest.type && <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">النوع: {pest.type}</span>}
                                  {pest.dosage && <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">الجرعة: {pest.dosage}</span>}
                                  {pest.preHarvestInterval && <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">فترة الأمان: {pest.preHarvestInterval}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">النبات سليم — لا يحتاج مبيدات</p>
                        )}
                      </motion.div>

                      {/* Organic Control */}
                      {safeArray(uiState.analysisResult.organicControl).length > 0 && (
                        <motion.div variants={fadeUp} className="p-4 sm:p-5 bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm dark:shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all">
                          <h5 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3 border-r-[3px] border-emerald-500 pr-3">
                            <Leaf size={15} className="text-emerald-500" /> {uiState.analysisResult.problemType === 'حشري' ? 'المكافحة العضوية' : 'المكافحة العضوية'}
                          </h5>
                          <div className="space-y-2">
                            {safeArray(uiState.analysisResult.organicControl).map((organic, i) => (
                              <div key={i} className="p-3 bg-green-50/80 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/40">
                                <strong className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
                                  <Sprout size={12} className="text-green-500" /> {organic.method}
                                </strong>
                                {organic.preparation && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 mr-5">التحضير: {organic.preparation}</p>}
                                {organic.application && <p className="text-[11px] text-gray-500 dark:text-gray-400 mr-5">التطبيق: {organic.application}</p>}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* ── Care Tips ── */}
                  <motion.div variants={fadeUp} className="p-4 sm:p-5 bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm dark:shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <h5 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3 border-r-[3px] border-emerald-500 pr-3">
                      <Lightbulb size={15} className="text-emerald-500" /> نصائح العناية
                    </h5>
                    <ul className="space-y-1">
                      {safeArray(uiState.analysisResult.careTips).length > 0 ? safeArray(uiState.analysisResult.careTips).map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                          <Sprout size={12} className="text-emerald-500 shrink-0 mt-0.5" /> {tip}
                        </li>
                      )) : <li className="text-xs text-gray-400 py-2">حافظ على تنظيم الري للفترات المقبلة</li>}
                    </ul>
                  </motion.div>

                  {/* ── Collapsible Extras ── */}
                  {uiState.analysisResult.environmentalConditions && (
                    <CollapsibleSection title="الظروف البيئية" icon={Info} delay={0.3}>
                      <div className="space-y-2">
                        <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-white/[0.04]">
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">الظروف المساعدة</span>
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">{uiState.analysisResult.environmentalConditions.favorable || 'غير محددة'}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">الظروف غير المساعدة</span>
                          <span className="text-xs font-semibold text-red-600 dark:text-red-400">{uiState.analysisResult.environmentalConditions.unfavorable || 'غير محددة'}</span>
                        </div>
                      </div>
                    </CollapsibleSection>
                  )}

                  {uiState.analysisResult.integratedPestManagement && (
                    <CollapsibleSection title={uiState.analysisResult.problemType === 'حشري' ? 'المكافحة المتكاملة IPM' : 'المكافحة المتكاملة IPM'} icon={Shield} delay={0.35}>
                      <div className="space-y-3">
                        {safeArray(uiState.analysisResult.integratedPestManagement.preventive).length > 0 && (
                          <div>
                            <strong className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-1">إجراءات وقائية:</strong>
                            <ul className="space-y-1 mr-4">
                              {safeArray(uiState.analysisResult.integratedPestManagement.preventive).map((item, i) => (
                                <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1.5">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {safeArray(uiState.analysisResult.integratedPestManagement.curative).length > 0 && (
                          <div>
                            <strong className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-1">إجراءات علاجية:</strong>
                            <ul className="space-y-1 mr-4">
                              {safeArray(uiState.analysisResult.integratedPestManagement.curative).map((item, i) => (
                                <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1.5">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {safeArray(uiState.analysisResult.integratedPestManagement.biological).length > 0 && (
                          <div>
                            <strong className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-1">أعداء طبيعيون:</strong>
                            <ul className="space-y-1 mr-4">
                              {safeArray(uiState.analysisResult.integratedPestManagement.biological).map((item, i) => (
                                <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1.5">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CollapsibleSection>
                  )}

                  {uiState.analysisResult.problemType === 'حشري' && uiState.analysisResult.lifeCycleNotes && (
                    <CollapsibleSection title="دورة حياة الحشرة" icon={Activity} delay={0.4}>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{uiState.analysisResult.lifeCycleNotes}</div>
                    </CollapsibleSection>
                  )}

                  {safeArray(uiState.analysisResult.resistantVarieties).length > 0 && (
                    <CollapsibleSection title={uiState.analysisResult.problemType === 'حشري' ? 'أصناف مقاومة للحشرات' : 'الأصناف المقاومة'} icon={Wheat} delay={0.45}>
                      <ul className="space-y-1">
                        {safeArray(uiState.analysisResult.resistantVarieties).map((variety, i) => (
                          <li key={i} className="flex items-center gap-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                            <Check size={12} className="text-emerald-500" /> {variety}
                          </li>
                        ))}
                      </ul>
                    </CollapsibleSection>
                  )}

                  {safeArray(uiState.analysisResult.references).length > 0 && (
                    <CollapsibleSection title="المصادر العلمية" icon={Search} delay={0.5}>
                      <ul className="space-y-1">
                        {safeArray(uiState.analysisResult.references).map((ref, i) => (
                          <li key={i} className="flex items-start gap-2 py-1.5 text-[11px] text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                            {ref}
                          </li>
                        ))}
                      </ul>
                    </CollapsibleSection>
                  )}
                </motion.div>
              )}

              <div className="flex gap-3 justify-center mt-4">
                <button onClick={resetImage} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  إعادة الرفع
                </button>
                <button onClick={analyzePlant} disabled={uiState.isAnalyzing} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${uiState.isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-b from-emerald-400 to-primary hover:shadow-lg hover:brightness-110'}`}>
                  {uiState.isAnalyzing ? (
                    <><span className="inline-block size-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> جاري التحليل...</>
                  ) : (
                    <><Zap size={14} /> تحليل النبات</>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              ref={dropZoneRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`relative p-8 sm:p-12 lg:p-16 text-center rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                uiState.isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 scale-[0.99]'
                  : 'border-gray-300 dark:border-white/[0.08] bg-white dark:bg-gray-800/40 dark:backdrop-blur-xl hover:border-emerald-400/60 hover:shadow-lg'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

              {/* Decorative corner blobs */}
              <div className="absolute -top-16 -right-16 size-32 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 size-32 rounded-full bg-gold/5 dark:bg-gold/10 blur-3xl" />

              <div className="relative max-w-md mx-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`size-20 sm:size-24 rounded-2xl sm:rounded-3xl grid place-items-center mx-auto mb-5 transition-all duration-300 ${
                    uiState.isDragging
                      ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/50'
                      : 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 text-emerald-500 border border-emerald-200 dark:border-emerald-700/50'
                  }`}>
                  <Upload size={36} className={uiState.isDragging ? 'animate-bounce' : ''} />
                </motion.div>

                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-1">
                  {uiState.isDragging ? 'أفلت الصورة هنا' : 'ارفع صورة نباتك للتحليل'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  اسحب الصورة وأفلتها هنا أو انقر للاختيار من الجهاز
                </p>

                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="h-px w-12 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                  <span className="text-[11px] text-gray-400">أو</span>
                  <span className="h-px w-12 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                </div>

                <div className="flex justify-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm"
                  >
                    <Upload size={14} className="text-emerald-500" /> اختيار صورة
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm"
                  >
                    <Camera size={14} className="text-emerald-500" /> تصوير مباشر
                  </button>
                </div>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
              </div>

              <div className="flex justify-center gap-4 flex-wrap mt-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800/60 text-[11px] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700/50">
                  <Zap size={12} className="text-emerald-500" /> تحليل فوري
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800/60 text-[11px] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700/50">
                  <Target size={12} className="text-emerald-500" /> دقة عالية
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800/60 text-[11px] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700/50">
                  <Lightbulb size={12} className="text-emerald-500" /> نصائح وعلاجات
                </span>
              </div>

              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-4">
                <Smartphone size={11} className="inline ml-1 -mt-0.5" />
                يدعم الصور الكبيرة • ضغط تلقائي ذكي
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* ─── History Section ─── */}
        <motion.section
          variants={fadeUp}
          className="bg-white dark:bg-gray-800/70 dark:backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700/50 shadow-lg dark:shadow-none p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 grid place-items-center">
                <Clock size={15} className="text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">سجل التشخيصات ({recentDiagnoses.length})</h3>
            </div>
            {recentDiagnoses.length > 0 && (
              <button onClick={clearAllDiagnoses} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
                <Trash2 size={12} /> حذف الكل
              </button>
            )}
          </div>
          {recentDiagnoses.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                {recentDiagnoses.map((diagnosis) => (
                  <HistoryItem key={diagnosis.id} diagnosis={diagnosis} onView={handleViewDetails} onDelete={deleteDiagnosis} />
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <div className="size-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 grid place-items-center mx-auto mb-3">
                <Search size={22} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">لا توجد سجلات تشخيصية سابقة</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">قم بتحليل نباتك ليظهر هنا</p>
            </motion.div>
          )}
        </motion.section>
      </div>

      {/* ─── Clear All Confirmation Modal ─── */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700/50 shadow-2xl p-6 sm:p-8 text-center"
            >
              <div className="size-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 grid place-items-center mx-auto mb-4 shadow-lg shadow-red-500/20">
                <AlertTriangle size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">حذف جميع السجلات</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                هل أنت متأكد من حذف جميع سجلات التشخيص؟<br />
                <span className="text-xs text-gray-400 dark:text-gray-500">لا يمكن التراجع عن هذا الإجراء.</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={performClearAll}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-b from-red-400 to-red-600 text-xs font-bold text-white shadow-md hover:shadow-lg hover:brightness-110 transition-all"
                >
                  نعم، حذف الكل
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiagnoseScreen;
