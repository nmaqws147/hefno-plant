import { motion } from 'framer-motion';
import { Leaf, X, Upload, Camera, Zap } from 'lucide-react';
import DiagnosisLoader from './DiagnosisLoader';
import DiagnosisError from './DiagnosisError';

export default function ImagePreview({
  image, isAnalyzing, analysisResult, source,
  onReplace, onRetake, onRemove, onAnalyze,
}) {
  if (!image) return null;

  return (
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
        <button onClick={onRemove} className="size-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all grid place-items-center">
          <X size={15} />
        </button>
      </div>

      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-4 bg-gray-50 dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-white/[0.06]">
        <img src={image} alt="صورة النبات" className="w-full max-h-[400px] object-contain" />
        {isAnalyzing && <DiagnosisLoader />}
      </div>

      <DiagnosisError analysisResult={analysisResult} onReset={onRemove} />

      {!isAnalyzing && !analysisResult && (
        <div className="flex gap-3 justify-center mt-4 flex-wrap">
          {source === 'camera' ? (
            <button onClick={onRetake} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <Camera size={14} /> إعادة التصوير
            </button>
          ) : (
            <button onClick={onReplace} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <Upload size={14} /> استبدال الصورة
            </button>
          )}
          <button onClick={onAnalyze} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-b from-emerald-400 to-emerald-600 hover:shadow-lg hover:brightness-110 transition-all shadow-md">
            <Zap size={14} /> تحليل النبات
          </button>
        </div>
      )}

      {!isAnalyzing && analysisResult?.error && (
        <div className="flex gap-3 justify-center mt-4">
          {source === 'camera' ? (
            <button onClick={onRetake} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <Camera size={14} /> إعادة التصوير
            </button>
          ) : (
            <button onClick={onReplace} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <Upload size={14} /> استبدال الصورة
            </button>
          )}
          <button onClick={onAnalyze} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-b from-emerald-400 to-emerald-600 hover:shadow-lg hover:brightness-110 transition-all shadow-md">
            <Zap size={14} /> إعادة المحاولة
          </button>
        </div>
      )}
    </motion.div>
  );
}
