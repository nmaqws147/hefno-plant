import { AlertTriangle, Leaf } from 'lucide-react';
import { getEfficacyColor, summarizeEfficacy } from '../pesticides-folder/herbicideFields';

const WeedEfficacyTable = ({ rows }) => {
  if (!rows || rows.length === 0) return null;

  const summary = summarizeEfficacy(rows);

  return (
    <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20 p-4">
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
        <Leaf size={12} />
        الفعالية ضد الحشائش المستهدفة
      </h4>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
          {summary.total} حشيشة
        </span>
        <span className="rounded-full bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
          أقصى فعالية: {summary.maxLevel}/5
        </span>
        {summary.warnings > 0 && (
          <span className="rounded-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-2.5 py-1 text-[10px] font-bold text-red-700 dark:text-red-400">
            {summary.warnings} تحذير مقاومة
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="border-b border-emerald-200/70 dark:border-emerald-900/50 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              <th className="px-2 py-2">الحشيشة</th>
              <th className="px-2 py-2">الفعالية</th>
              <th className="px-2 py-2">التوقيت</th>
              <th className="px-2 py-2">ملاحظات وتحذيرات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const color = getEfficacyColor(row.efficacy_level);
              return (
                <tr
                  key={row.weed_id || i}
                  className="border-b border-emerald-100/70 dark:border-emerald-900/30 last:border-0 align-top"
                >
                  <td className="px-2 py-2 text-[11px] font-bold text-gray-800 dark:text-gray-100">
                    {row.weed_name_arabic}
                  </td>
                  <td className="px-2 py-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${color.bg} ${color.text}`}>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color.hex }} />
                      {row.efficacy_arabic}
                      {typeof row.efficacy_level === 'number' ? ` (${row.efficacy_level}/5)` : ''}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                    {row.timing_arabic || '—'}
                  </td>
                  <td className="px-2 py-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                    {row.notes_arabic || '—'}
                    {row.resistance_warning && (
                      <span className="mt-1 flex items-start gap-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                        <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                        <span>{row.resistance_note_arabic || 'تحذير مقاومة'}</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeedEfficacyTable;
