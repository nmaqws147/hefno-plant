import { motion } from 'framer-motion';
import { Scan, Zap } from 'lucide-react';
import { fadeUp } from './motionVariants';

export default function DiagnosisHeader({ rateLimit }) {
  return (
    <motion.div variants={fadeUp} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/50 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 shrink-0">
          <Scan className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">تشخيص النباتات</h1>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">Plant Disease Diagnosis</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">تحليل صحي فوري للنباتات باستخدام الذكاء الاصطناعي</p>
          {rateLimit && rateLimit.remaining !== undefined && (
            <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/40">
              <Zap size={12} /> متبقي: {rateLimit.remaining} من {rateLimit.limit} تحليلات اليوم
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
