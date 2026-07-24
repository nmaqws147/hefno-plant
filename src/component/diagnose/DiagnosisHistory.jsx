import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Trash2, Clock, Leaf, Search, AlertTriangle } from 'lucide-react';
import { getHealthStatusClass } from './DiagnosisUtils';

function HistoryItem({ diagnosis, onView, onDelete }) {
  const healthCls = getHealthStatusClass(diagnosis.healthStatus);

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
          <div className="w-full h-full grid place-items-center"><Leaf size={16} className="text-gray-400" /></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-gray-900 dark:text-white">{diagnosis?.plant || 'نبات غير معروف'}</div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1"><Clock size={10} />{diagnosis?.date}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            healthCls === 'good' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            : healthCls === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
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

export default function DiagnosisHistory({ diagnoses, onView, onDelete, onClearAll }) {
  if (diagnoses.length === 0) {
    return (
      <section className="bg-white dark:bg-gray-800/70 dark:backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700/50 shadow-lg dark:shadow-none p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 grid place-items-center">
            <Clock size={15} className="text-emerald-500" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">سجل التشخيصات (0)</h3>
        </div>
        <div className="text-center py-10">
          <div className="size-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 grid place-items-center mx-auto mb-3">
            <Search size={22} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">لا توجد سجلات تشخيصية سابقة</p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">قم بتحليل نباتك ليظهر هنا</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-800/70 dark:backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700/50 shadow-lg dark:shadow-none p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 grid place-items-center">
            <Clock size={15} className="text-emerald-500" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">سجل التشخيصات ({diagnoses.length})</h3>
        </div>
        <button onClick={onClearAll} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
          <Trash2 size={12} /> حذف الكل
        </button>
      </div>
      <AnimatePresence mode="popLayout">
        <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
          {diagnoses.map((d) => (
            <HistoryItem key={d.id} diagnosis={d} onView={onView} onDelete={onDelete} />
          ))}
        </div>
      </AnimatePresence>
    </section>
  );
}
