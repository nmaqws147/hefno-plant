import { motion } from 'framer-motion';
import { Ban, AlertCircle } from 'lucide-react';

export default function DiagnosisError({ analysisResult, onReset }) {
  if (!analysisResult?.error) return null;

  if (analysisResult.isRateLimit) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-red-50/80 dark:bg-red-900/15 border border-red-200 dark:border-red-800 rounded-2xl sm:rounded-3xl mb-4 backdrop-blur"
      >
        <div className="size-14 rounded-2xl bg-red-100 dark:bg-red-900/30 grid place-items-center mx-auto mb-4">
          <Ban size={28} className="text-red-500" />
        </div>
        <h4 className="text-base font-bold text-red-600 dark:text-red-400">تم تجاوز الحد اليومي</h4>
        <p className="text-sm text-red-500 dark:text-red-400 mt-1 max-w-xs mx-auto">{analysisResult.message}</p>
        {analysisResult.resetInHours && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">يمكنك المحاولة مرة أخرى بعد {analysisResult.resetInHours} ساعة</p>
        )}
        <button onClick={onReset} className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-white text-sm font-bold shadow-md hover:shadow-lg hover:brightness-110 transition-all">
          رفع صورة جديدة غداً
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center p-8 bg-red-50/80 dark:bg-red-900/15 border border-red-200 dark:border-red-800 rounded-2xl sm:rounded-3xl mb-4 backdrop-blur"
    >
      <div className="size-14 rounded-2xl bg-red-100 dark:bg-red-900/30 grid place-items-center mx-auto mb-4">
        <AlertCircle size={28} className="text-red-500" />
      </div>
      <h4 className="text-base font-bold text-red-600 dark:text-red-400">فشل التحليل</h4>
      <p className="text-sm text-red-500 dark:text-red-400 mt-1">{analysisResult.message}</p>
      {analysisResult.details && <p className="text-xs text-gray-500 mt-2">{analysisResult.details}</p>}
    </motion.div>
  );
}
