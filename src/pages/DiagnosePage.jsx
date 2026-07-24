import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import useTracking from '../hooks/useTracking';
import SEO from '../component/SEO';
import { makeBreadcrumbs, makeWebApp } from '../component/structuredData';
import DiagnosisHeader from '../component/diagnose/DiagnosisHeader';
import ImageUploader from '../component/diagnose/ImageUploader';
import CameraCapture from '../component/diagnose/CameraCapture';
import ImagePreview from '../component/diagnose/ImagePreview';
import DiagnosisResults from '../component/diagnose/DiagnosisResults';
import DiagnosisHistory from '../component/diagnose/DiagnosisHistory';
import { fadeUpStagger } from '../component/diagnose/motionVariants';
import { validateImage, compressImage, formatDate } from '../component/diagnose/DiagnosisUtils';

export default function DiagnosePage({ id }) {
  const { trackAction } = useTracking();
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [rateLimit, setRateLimit] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [source, setSource] = useState(null);
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleError = useCallback((message, status = null) => {
    setAnalysisResult({ error: true, message, isRateLimit: status === 429, resetInHours: status === 429 ? 24 : null });
    toast.error(message);
  }, []);

  const saveDiagnosisToLocalStorage = useCallback((diagnosisData) => {
    const now = new Date();
    const newDiagnosis = {
      id: Date.now(),
      timestamp: now.toISOString(),
      date: formatDate(now),
      time: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      image,
      plant: diagnosisData.plantName || 'نبات غير معروف',
      confidence: diagnosisData.confidence || 0,
      healthStatus: diagnosisData.healthStatus || 'غير معروف',
      fullAnalysis: diagnosisData,
      analysisTime: 'فوري',
    };
    setRecentDiagnoses(prev => [newDiagnosis, ...prev].slice(0, 10));
    setTimeout(() => {
      try {
        const stored = localStorage.getItem('plantDiagnoses');
        const diagnoses = stored ? JSON.parse(stored) : [];
        localStorage.setItem('plantDiagnoses', JSON.stringify([newDiagnosis, ...diagnoses].slice(0, 20)));
        toast.success('تم حفظ التشخيص بنجاح');
      } catch {
        toast.error('فشل حفظ التشخيص');
      }
    }, 0);
  }, [image]);

  const handleAnalyze = useCallback(async () => {
    if (!image) { toast.warning('يرجى رفع صورة أولاً'); return; }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setRateLimit(null);
    try {
      const base64Image = image.split(',')[1];
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image }),
      });
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const limit = response.headers.get('X-RateLimit-Limit');
      const reset = response.headers.get('X-RateLimit-Reset');
      if (remaining !== null) {
        setRateLimit({ remaining: parseInt(remaining), limit: parseInt(limit), reset: reset ? parseInt(reset) : null });
      }
      const result = await response.json();
      if (!response.ok) {
        trackAction('image_analysis_failed');
        handleError(result.message || result.error || 'حدث خطأ غير متوقع', response.status);
        return;
      }
      setAnalysisResult(result);
      saveDiagnosisToLocalStorage(result);
      toast.success(remaining !== null ? `تم التحليل! متبقي لك ${remaining} محاولات اليوم` : 'تم تحليل النبات بنجاح!');
      trackAction('image_analysis_success');
    } catch (error) {
      console.error('Critical Error:', error);
      trackAction('image_analysis_failed');
      handleError('يبدو أن هناك ضغطاً مؤقتاً على الشبكة. يرجى المحاولة مرة أخرى');
    } finally {
      setIsAnalyzing(false);
    }
  }, [image, handleError, saveDiagnosisToLocalStorage, trackAction]);

  const handleFileSelect = useCallback(async (file) => {
    if (file) {
      const validation = validateImage(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      const compressionToast = file.size > 1.5 * 1024 * 1024 ? toast.loading('جاري تهيئة وتحسين جودة الصورة...') : null;
      try {
        const compressedBase64 = await compressImage(file);
        if (compressionToast) toast.dismiss(compressionToast);
        requestAnimationFrame(() => {
          setImage(compressedBase64);
          setAnalysisResult(null);
          setRateLimit(null);
          setSource('file');
          setShowCamera(false);
        });
      } catch {
        if (compressionToast) toast.dismiss(compressionToast);
        toast.error('فشل معالجة الصورة، يرجى تجربة التقاط صورة أخرى');
      }
    }
  }, []);

  const handleCameraCapture = useCallback((dataUrl) => {
    setImage(dataUrl);
    setAnalysisResult(null);
    setRateLimit(null);
    setSource('camera');
    setShowCamera(false);
  }, []);

  const resetImage = useCallback(() => {
    setImage(null);
    setAnalysisResult(null);
    setRateLimit(null);
    setSource(null);
    setIsAnalyzing(false);
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

  useEffect(() => { loadRecentDiagnoses(); }, [loadRecentDiagnoses]);

  const deleteDiagnosis = useCallback((diagnosisId) => {
    try {
      const stored = localStorage.getItem('plantDiagnoses');
      if (!stored) return;
      const diagnoses = JSON.parse(stored).filter(d => d.id !== diagnosisId);
      localStorage.setItem('plantDiagnoses', JSON.stringify(diagnoses));
      setRecentDiagnoses(prev => prev.filter(d => d.id !== diagnosisId));
      toast.success('تم حذف التشخيص بنجاح');
    } catch { toast.error('حدث خطأ أثناء حذف التشخيص'); }
  }, []);

  const clearAllDiagnoses = useCallback(() => { setShowClearConfirm(true); }, []);

  const performClearAll = useCallback(() => {
    localStorage.removeItem('plantDiagnoses');
    setRecentDiagnoses([]);
    setShowClearConfirm(false);
    toast.success('تم حذف جميع السجلات بنجاح');
  }, []);

  const handleViewDetails = useCallback((diagnosis) => {
    if (diagnosis?.fullAnalysis) {
      setImage(diagnosis.image);
      setAnalysisResult(diagnosis.fullAnalysis);
      setRateLimit(null);
      setSource(diagnosis.source || null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('بيانات التشخيص تالفة أو غير مكتملة');
    }
  }, []);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const hasError = analysisResult?.error;
  const showResults = analysisResult && !analysisResult.error;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpStagger}
      className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden"
      id={id}
      dir="rtl"
    >
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

      <SEO
        title="تشخيص أمراض النبات"
        description="شخص نباتك بالذكاء الاصطناعي — حمّل صورة ورقة نباتك للحصول على تشخيص فوري للحالة والعلاج المقترح."
        url="/diagnose"
        keywords="تشخيص أمراض النبات, تشخيص النباتات بالصور, ذكاء اصطناعي زراعي, كشف أمراض النباتات, علاج أمراض النبات"
        breadcrumbs={makeBreadcrumbs('/diagnose')}
        jsonLd={makeWebApp('تشخيص أمراض النبات', '/diagnose', 'تشخيص أمراض النباتات بالذكاء الاصطناعي — حمّل صورة واحصل على تشخيص فوري')}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <DiagnosisHeader rateLimit={rateLimit} />

        <motion.section variants={fadeUpStagger}>
          {showCamera ? (
            <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
          ) : image ? (
            <ImagePreview
              image={image}
              isAnalyzing={isAnalyzing}
              analysisResult={analysisResult}
              source={source}
              onReplace={() => setShowCamera(false)}
              onRetake={() => setShowCamera(true)}
              onRemove={resetImage}
              onAnalyze={handleAnalyze}
            />
          ) : (
            <ImageUploader
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              onCameraClick={() => setShowCamera(true)}
            />
          )}
        </motion.section>

        {showResults && (
          <motion.section variants={fadeUpStagger}>
            <DiagnosisResults result={analysisResult} />
          </motion.section>
        )}

        {!image && !hasError && !isAnalyzing && (
          <motion.section variants={fadeUpStagger}>
            <DiagnosisHistory
              diagnoses={recentDiagnoses}
              onView={handleViewDetails}
              onDelete={deleteDiagnosis}
              onClearAll={clearAllDiagnoses}
            />
          </motion.section>
        )}
      </div>

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
}
