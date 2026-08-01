import { motion } from 'framer-motion';
import { Scan, Zap, ShieldCheck } from 'lucide-react';
import { fadeUp } from './motionVariants';
import { useAuth } from '../../context/AuthContext';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';

export default function DiagnosisHeader({ rateLimit }) {
  const { isAdmin, isElite } = useAuth();
  const { remaining, limit, loading } = useFeatureAccess('disease_diagnosis');

  const used = limit > 0 ? limit - remaining : 0;
  const percent = limit > 0 ? Math.round((used / limit) * 100) : 0;

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

          {isAdmin ? (
            <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/40">
              <ShieldCheck size={12} /> Administrator / Unlimited Plant Disease Diagnoses
            </div>
          ) : isElite ? (
            <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-100/40 dark:border-violet-900/40">
              <Zap size={12} /> تشخيص غير محدود
            </div>
          ) : !loading && limit > 0 ? (
            <div className="mt-4 max-w-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-700 dark:text-emerald-400">
                  متبقي: {remaining} من {limit} تشخيص / الشهر
                </span>
                <span className="text-gray-500 dark:text-gray-400">{percent}% مستخدم</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden" dir="ltr">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${percent >= 100 ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          ) : null}

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
