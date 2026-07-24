import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Zap, Target, Lightbulb, Smartphone } from 'lucide-react';

export default function ImageUploader({ isDragging, onDragOver, onDragLeave, onDrop, onFileSelect, onCameraClick }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  const handleCameraChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative p-8 sm:p-12 lg:p-16 text-center rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragging
          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 scale-[0.99]'
          : 'border-gray-300 dark:border-white/[0.08] bg-white dark:bg-gray-800/40 dark:backdrop-blur-xl hover:border-emerald-400/60 hover:shadow-lg'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraChange} className="hidden" />

      <div className="absolute -top-16 -right-16 size-32 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 size-32 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl" />

      <div className="relative max-w-md mx-auto">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`size-20 sm:size-24 rounded-2xl sm:rounded-3xl grid place-items-center mx-auto mb-5 transition-all duration-300 ${
            isDragging
              ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/50'
              : 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 text-emerald-500 border border-emerald-200 dark:border-emerald-700/50'
          }`}>
          <Upload size={36} className={isDragging ? 'animate-bounce' : ''} />
        </motion.div>

        <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-1">
          {isDragging ? 'أفلت الصورة هنا' : 'ارفع صورة نباتك للتحليل'}
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
            onClick={(e) => { e.stopPropagation(); onCameraClick(); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm"
          >
            <Camera size={14} className="text-emerald-500" /> تصوير مباشر
          </button>
        </div>
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
        يدعم JPG, PNG, WebP • ضغط تلقائي ذكي
      </p>
    </motion.div>
  );
}
