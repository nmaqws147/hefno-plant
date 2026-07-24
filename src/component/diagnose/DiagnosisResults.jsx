import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Bug, FlaskConical, Activity, AlertCircle,
  Leaf, Sprout, Apple, Flower2, Check, Ban, Info,
  Lightbulb, Wheat, Search, Shield, ChevronDown, Clock, X
} from 'lucide-react';
import { fadeUp, fadeUpStagger } from './motionVariants';
import { safeArray, getHealthStatusClass, severityBadge } from './DiagnosisUtils';

const IconMap = {
  'ورق': Leaf, 'ساق': Sprout, 'ثمر': Apple,
  'جذر': Sprout, 'زهرة': Flower2, 'برعم': Sprout,
};

const ProblemIconMap = {
  'فطر': AlertTriangle, 'حشرة': Bug, 'بكتيريا': FlaskConical,
  'فيروس': Activity, 'من': Bug, 'تربس': Bug, 'بق': Bug,
  'دودة': Bug, 'سوسة': Bug, 'نقص': AlertCircle, 'نيماتودا': AlertTriangle,
};

const SymptomIconMap = {
  'ثقوب': AlertTriangle, 'اصفرار': AlertTriangle,
  'ذبول': Activity, 'تجعيد': Activity, 'بقع': AlertCircle,
};

function getIcon(text, map) {
  if (!text) return null;
  for (const [key, Icon] of Object.entries(map)) {
    if (text.includes(key)) return <Icon size={14} className="text-emerald-500 shrink-0 mt-0.5" />;
  }
  return null;
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
      {open && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </motion.div>
  );
}

function HealthBadge({ result }) {
  const cls = getHealthStatusClass(result.healthStatus);
  let Icon;
  if (cls === 'good') Icon = Check;
  else if (cls === 'warning') Icon = AlertTriangle;
  else if (cls === 'critical') Icon = Ban;
  else Icon = Info;

  const colorMap = {
    good: 'bg-green-50/80 dark:bg-green-900/15 border-green-300 dark:border-green-700',
    warning: 'bg-amber-50/80 dark:bg-amber-900/15 border-amber-300 dark:border-amber-700',
    critical: 'bg-red-50/80 dark:bg-red-900/15 border-red-300 dark:border-red-700',
  };

  const iconBgMap = {
    good: 'bg-gradient-to-br from-green-400 to-green-600',
    warning: 'bg-gradient-to-br from-amber-400 to-amber-600',
    critical: 'bg-gradient-to-br from-red-400 to-red-600',
  };

  const badgeMap = {
    good: 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200',
    warning: 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200',
    critical: 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200',
  };

  return (
    <div className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 backdrop-blur ${colorMap[cls] || ''}`}>
      <div className="absolute top-0 left-0 size-32 rounded-full bg-white/20 dark:bg-white/5 blur-3xl" />
      <div className="relative flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className={`size-14 sm:size-16 rounded-2xl grid place-items-center shadow-lg text-white ${iconBgMap[cls] || 'bg-gray-400'}`}>
            <Icon size={20} />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{result.plantName || 'غير معروف'}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeMap[cls] || ''}`}>{result.healthStatus || 'غير معروف'}</span>
            </div>
          </div>
        </div>
        <div className="text-left">
          <div className={`text-3xl sm:text-4xl font-black ${result.confidence > 90 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {result.confidence || 0}%
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">دقة التشخيص</div>
          <div className="mt-1.5 w-28 h-1.5 rounded-full bg-white/60 dark:bg-gray-700 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${result.confidence > 90 ? 'bg-green-500' : result.confidence > 70 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${result.confidence || 0}%` }} />
          </div>
        </div>
      </div>
      {(result.severity || result.problemType) && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/40 dark:border-gray-700/40">
          {result.problemType && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border border-white dark:border-gray-600">
              {result.problemType === 'حشري' ? <Bug size={11} className="inline ml-1 -mt-0.5" /> : <FlaskConical size={11} className="inline ml-1 -mt-0.5" />}
              {result.problemType}
            </span>
          )}
          {result.severity && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${severityBadge(result.severity)}`}>
              {result.severity}
            </span>
          )}
          {result.diseaseName?.common && result.healthStatus !== 'سليم' && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border border-white dark:border-gray-600">
              {result.diseaseName.common}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, children, className = '' }) {
  return (
    <motion.div variants={fadeUp} className={`p-4 sm:p-5 bg-white dark:bg-gray-800/50 dark:backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm dark:shadow-none transition-all hover:shadow-lg ${className}`}>
      <h5 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3 border-r-[3px] border-emerald-500 pr-3">
        {Icon && <Icon size={15} className="text-emerald-500" />} {title}
      </h5>
      {children}
    </motion.div>
  );
}

function ItemList({ items, emptyText = 'لا توجد' }) {
  if (safeArray(items).length === 0) {
    return <li className="text-xs text-gray-400 py-2">{emptyText}</li>;
  }
  return safeArray(items).map((item, i) => (
    <li key={i} className="flex items-center gap-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
      {item}
    </li>
  ));
}

export default function DiagnosisResults({ result }) {
  if (!result || result.error) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpStagger}
      className="space-y-4"
    >
      <HealthBadge result={result} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          {result.diseaseName && (
            <InfoCard icon={FlaskConical} title={result.problemType === 'حشري' ? 'الاسم العلمي للحشرة' : 'الاسم العلمي للمرض'}>
              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-white/[0.04]">
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">الاسم العلمي</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 text-left">{result.diseaseName.scientific || 'غير معروف'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">الاسم الشائع</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{result.diseaseName.common || 'غير معروف'}</span>
                </div>
              </div>
            </InfoCard>
          )}

          <InfoCard icon={Activity} title="الأعراض">
            <ul className="space-y-1">
              {safeArray(result.symptoms).length > 0 ? safeArray(result.symptoms).map((s, i) => (
                <li key={i} className="flex items-center gap-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                  {getIcon(s, SymptomIconMap) || <Info size={12} className="text-gray-400" />} {s}
                </li>
              )) : <li className="text-xs text-gray-400 py-2">لا توجد أعراض محددة</li>}
            </ul>
          </InfoCard>

          <InfoCard icon={result.problemType === 'حشري' ? Bug : AlertTriangle}
            title={result.problemType === 'حشري' ? 'الآفات المكتشفة' : 'المشاكل الأساسية'}>
            {safeArray(result.affectedParts).length > 0 && (
              <>
                <h6 className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  <Leaf size={12} className="text-emerald-500" /> الأجزاء المصابة
                </h6>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {safeArray(result.affectedParts).map((part, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-100/40 dark:border-green-900/40">
                      {getIcon(part, IconMap) || <Leaf size={12} className="text-emerald-500" />} {part}
                    </span>
                  ))}
                </div>
              </>
            )}
            <ul className="space-y-1">
              {safeArray(result.mainProblems).length > 0 ? safeArray(result.mainProblems).map((p, i) => (
                <li key={i} className="flex items-center gap-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                  {getIcon(p, ProblemIconMap) || <AlertCircle size={12} className="text-gray-400" />} {p}
                </li>
              )) : <li className="text-xs text-gray-400 py-2">لا توجد مشاكل محددة</li>}
            </ul>
          </InfoCard>
        </div>

        <div className="space-y-4">
          <InfoCard icon={FlaskConical} title={result.problemType === 'حشري' ? 'خطة المكافحة' : 'العلاج المقترح'}>
            <ul className="space-y-1.5">
              {safeArray(result.treatment).length > 0 ? safeArray(result.treatment).map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 py-2 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                  <span className="size-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[10px] font-bold grid place-items-center shrink-0 mt-0.5 shadow-sm">{i + 1}</span>
                  {t}
                </li>
              )) : <li className="text-xs text-gray-400 py-2">استشر مهندساً زراعياً مصنفاً</li>}
            </ul>
          </InfoCard>

          <InfoCard icon={FlaskConical} title={result.problemType === 'حشري' ? 'المبيدات الحشرية' : 'المبيدات المقترحة'}>
            {safeArray(result.pesticides).length > 0 ? (
              <div className="space-y-2">
                {safeArray(result.pesticides).map((pest, i) => (
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
          </InfoCard>

          {safeArray(result.organicControl).length > 0 && (
            <InfoCard icon={Leaf} title="المكافحة العضوية">
              <div className="space-y-2">
                {safeArray(result.organicControl).map((organic, i) => (
                  <div key={i} className="p-3 bg-green-50/80 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/40">
                    <strong className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
                      <Sprout size={12} className="text-green-500" /> {organic.method}
                    </strong>
                    {organic.preparation && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 mr-5">التحضير: {organic.preparation}</p>}
                    {organic.application && <p className="text-[11px] text-gray-500 dark:text-gray-400 mr-5">التطبيق: {organic.application}</p>}
                  </div>
                ))}
              </div>
            </InfoCard>
          )}
        </div>
      </div>

      <InfoCard icon={Lightbulb} title="نصائح العناية">
        <ul className="space-y-1">
          {safeArray(result.careTips).length > 0 ? safeArray(result.careTips).map((tip, i) => (
            <li key={i} className="flex items-start gap-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
              <Sprout size={12} className="text-emerald-500 shrink-0 mt-0.5" /> {tip}
            </li>
          )) : <li className="text-xs text-gray-400 py-2">حافظ على تنظيم الري للفترات المقبلة</li>}
        </ul>
      </InfoCard>

      {result.environmentalConditions && (
        <CollapsibleSection title="الظروف البيئية" icon={Info} delay={0.3}>
          <div className="space-y-2">
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-white/[0.04]">
              <span className="text-[11px] text-gray-400 dark:text-gray-500">الظروف المساعدة</span>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">{result.environmentalConditions.favorable || 'غير محددة'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[11px] text-gray-400 dark:text-gray-500">الظروف غير المساعدة</span>
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">{result.environmentalConditions.unfavorable || 'غير محددة'}</span>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {result.integratedPestManagement && (
        <CollapsibleSection title="المكافحة المتكاملة IPM" icon={Shield} delay={0.35}>
          <div className="space-y-3">
            {safeArray(result.integratedPestManagement.preventive).length > 0 && (
              <div>
                <strong className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-1">إجراءات وقائية:</strong>
                <ul className="space-y-1 mr-4">
                  {safeArray(result.integratedPestManagement.preventive).map((item, i) => (
                    <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {safeArray(result.integratedPestManagement.curative).length > 0 && (
              <div>
                <strong className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-1">إجراءات علاجية:</strong>
                <ul className="space-y-1 mr-4">
                  {safeArray(result.integratedPestManagement.curative).map((item, i) => (
                    <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {safeArray(result.integratedPestManagement.biological).length > 0 && (
              <div>
                <strong className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-1">أعداء طبيعيون:</strong>
                <ul className="space-y-1 mr-4">
                  {safeArray(result.integratedPestManagement.biological).map((item, i) => (
                    <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {result.problemType === 'حشري' && result.lifeCycleNotes && (
        <CollapsibleSection title="دورة حياة الحشرة" icon={Activity} delay={0.4}>
          <div className="text-xs text-gray-600 dark:text-gray-300">{result.lifeCycleNotes}</div>
        </CollapsibleSection>
      )}

      {safeArray(result.resistantVarieties).length > 0 && (
        <CollapsibleSection title={result.problemType === 'حشري' ? 'أصناف مقاومة للحشرات' : 'الأصناف المقاومة'} icon={Wheat} delay={0.45}>
          <ul className="space-y-1">
            {safeArray(result.resistantVarieties).map((variety, i) => (
              <li key={i} className="flex items-center gap-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                <Check size={12} className="text-emerald-500" /> {variety}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {safeArray(result.references).length > 0 && (
        <CollapsibleSection title="المصادر العلمية" icon={Search} delay={0.5}>
          <ul className="space-y-1">
            {safeArray(result.references).map((ref, i) => (
              <li key={i} className="flex items-start gap-2 py-1.5 text-[11px] text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                {ref}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}
    </motion.div>
  );
}
