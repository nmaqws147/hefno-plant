import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '../component/SEO';
import { makeBreadcrumbs } from '../component/structuredData';
import { Search, X, FlaskConical, Bug, Leaf, Sprout, Shield, AlertTriangle, Droplets, BarChart3, Hospital, ChevronRight, FolderOpen, RefreshCw } from 'lucide-react';
import publicHealthData from '../pesticides-folder/pesti-items/phg.json';
import { getGroups } from '../pesticides-folder/buildGroups';

const categoryMeta = {
  insecticides: { label: 'المبيدات الحشرية', labelEn: 'Insecticides — IRAC Classification', Comp: Bug, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200/60 dark:border-red-900/40', gradient: 'from-red-500 to-red-600', tabBg: 'bg-red-50 dark:bg-red-950/20', emoji: '🐛' },
  fungicides: { label: 'المبيدات الفطرية', labelEn: 'Fungicides — FRAC Classification', Comp: Shield, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200/60 dark:border-purple-900/40', gradient: 'from-purple-500 to-purple-600', tabBg: 'bg-purple-50 dark:bg-purple-950/20', emoji: '🍄' },
  herbicides: { label: 'مبيدات الحشائش', labelEn: 'Herbicides — HRAC Classification', Comp: Leaf, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200/60 dark:border-emerald-900/40', gradient: 'from-emerald-500 to-emerald-600', tabBg: 'bg-emerald-50 dark:bg-emerald-950/20', emoji: '🌿' },
  nematicides: { label: 'المبيدات النيماتودية', labelEn: 'Nematicides — Mode of Action', Comp: Sprout, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200/60 dark:border-amber-900/40', gradient: 'from-amber-500 to-amber-600', tabBg: 'bg-amber-50 dark:bg-amber-950/20', emoji: '🪱' },
  bactericides: { label: 'المبيدات البكتيرية', labelEn: 'Bactericides', Comp: FlaskConical, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200/60 dark:border-cyan-900/40', gradient: 'from-cyan-500 to-cyan-600', tabBg: 'bg-cyan-50 dark:bg-cyan-950/20', emoji: '🦠' },
  publicHealth: { label: 'مبيدات الصحة العامة', labelEn: 'Public Health Pesticides', Comp: Hospital, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200/60 dark:border-amber-900/40', gradient: 'from-amber-600 to-amber-700', tabBg: 'bg-amber-50 dark:bg-amber-950/20', emoji: '🏥' },
};

const getPublicHealthGroups = () => {
  if (!publicHealthData?.groups) return [];
  return publicHealthData.groups.map(group => ({
    id: group.id,
    code: group.code,
    irac_code: group.irac_code,
    name_ar: group.ar_name,
    name_en: group.name_en,
    chemical_class_ar: group.chemical_class_en || group.chemical_class_ar,
    chemical_class_en: group.chemical_class_en,
    MoA_ar: group.ar_MoA,
    application_method_ar: group.ar_method_application,
    spectrum_ar: group.ar_spectrum,
    resistance_risk_ar: group.ar_risk_resistance,
    resistance_risk_level: group.resistance_risk_level,
    resistance_mechanism_ar: group.ar_mechanism_resistance,
    rotation_rule_ar: group.ar_rule_rotation,
    max_applications_season: group.max_applications_season,
    importance_egypt: group.egypt_importance,
    safety_class_ar: group.ar_class_safety,
    ai_count: group.ai_count,
    active_ingredients: group.active_ingredients,
    isPublicHealth: true
  }));
};

const getGroupsForCategory = (catId) => {
  const map = {
    insecticides: () => getGroups('irac-grp'),
    fungicides: () => getGroups('frac-grp'),
    herbicides: () => getGroups('hrac-grp'),
    nematicides: () => getGroups('nema-grp'),
    bactericides: () => getGroups('bact-grp'),
    publicHealth: () => getPublicHealthGroups(),
  };
  return (map[catId] || (() => []))();
};

const getRiskColor = (level) => {
  if (level === 4 || level === 'very high' || level === 'عالٍ جدا') return '#dc2626';
  if (level === 3 || level === 'high' || level === 'عالٍ' || level === 'عالية') return '#f59e0b';
  if (level === 2 || level === 'medium' || level === 'متوسط') return '#eab308';
  if (level === 1 || level === 'low' || level === 'منخفض') return '#10b981';
  return '#10b981';
};

const getRiskText = (risk) => {
  if (risk?.includes('عالٍ جدا') || risk?.includes('عالي جدا') || risk === 'very high') return 'شديد جداً';
  if (risk?.includes('عالٍ') || risk?.includes('عالي') || risk === 'high') return 'شديد';
  if (risk?.includes('متوسط') || risk === 'medium') return 'متوسط';
  if (risk?.includes('منخفض') || risk === 'low') return 'منخفض';
  return 'متوسط';
};

const PesticidesCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const meta = categoryMeta[categoryId];
  const IconComp = meta?.Comp;

  const groups = useMemo(() => getGroupsForCategory(categoryId), [categoryId]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(group =>
      group.name_ar?.toLowerCase().includes(q) ||
      group.name_en?.toLowerCase().includes(q) ||
      group.code?.toLowerCase().includes(q) ||
      group.irac_code?.toLowerCase().includes(q) ||
      group.chemical_class_ar?.toLowerCase().includes(q)
    );
  }, [searchQuery, groups]);

  const handleGroupClick = (group) => {
    localStorage.setItem('selectedPesticideGroup', JSON.stringify({
      category: categoryId,
      group: group,
    }));
    navigate(`/knowledge-base/pesticides/group/${group.id}`);
  };

  if (!meta) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">القسم غير موجود</p>
          <button onClick={() => navigate('/knowledge-base/pesticides')} className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-600 transition-all">العودة إلى مركز المبيدات</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 transition-colors duration-300" dir="rtl">
      <SEO title={meta.label} description={`دليل ${meta.label} — ${meta.labelEn}`} url={`/knowledge-base/pesticides/${categoryId}`} keywords={meta.label} breadcrumbs={makeBreadcrumbs(`/knowledge-base/pesticides/${categoryId}`)} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/knowledge-base/pesticides')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/80"
        >
          <ChevronRight size={16} />
          <span>العودة</span>
        </button>

        <div className="mb-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white shadow-lg shrink-0`}>
              <span className="text-2xl">{meta.emoji}</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{meta.label}</h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">{meta.labelEn}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">اختر مجموعة مبيدات لعرض المواد الفعالة</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-xl border ${meta.border} ${meta.bg} px-3 py-1.5 text-xs font-bold ${meta.color}`}>
                  <FlaskConical size={14} />
                  {groups.length} مجموعة مبيدات
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 px-4 py-3 shadow-sm">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="ابحث عن مجموعة مبيدات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <FolderOpen size={18} className="text-emerald-500" />
          <h3 className="text-base font-black text-gray-900 dark:text-white">مجموعات المبيدات</h3>
          <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            {filteredGroups.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group, idx) => (
            <div
              key={group.id || idx}
              onClick={() => handleGroupClick(group)}
              className="group cursor-pointer rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold"
                  style={{ background: `${meta.color === 'text-red-600 dark:text-red-400' ? '#ef4444' : meta.color === 'text-purple-600 dark:text-purple-400' ? '#8b5cf6' : meta.color === 'text-emerald-600 dark:text-emerald-400' ? '#10b981' : meta.color === 'text-amber-600 dark:text-amber-400' ? '#f59e0b' : meta.color === 'text-cyan-600 dark:text-cyan-400' ? '#06b6d4' : '#8b5a2b'}15`, color: meta.color === 'text-red-600 dark:text-red-400' ? '#ef4444' : meta.color === 'text-purple-600 dark:text-purple-400' ? '#8b5cf6' : meta.color === 'text-emerald-600 dark:text-emerald-400' ? '#10b981' : meta.color === 'text-amber-600 dark:text-amber-400' ? '#f59e0b' : meta.color === 'text-cyan-600 dark:text-cyan-400' ? '#06b6d4' : '#8b5a2b' }}
                >
                  {group.code || group.irac_code || group.id?.split('-').pop()}
                </span>
                <span
                  className="h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-800"
                  style={{ background: getRiskColor(group.resistance_risk_level) }}
                  title={group.resistance_risk_ar || 'مخاطر المقاومة'}
                />
              </div>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{group.chemical_class_en || group.name_en || group.name_ar}</h4>
              <p className="mb-3 text-[11px] text-gray-500 dark:text-gray-400">{group.name_ar}</p>

              <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-bold text-gray-700 dark:text-gray-300">المجموعة الكيميائية:</span>{' '}
                {group.chemical_class_en || group.chemical_class_ar || '—'}
              </div>

              <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                {group.MoA_ar?.substring(0, 100)}...
              </p>

              {group.application_method_ar && (
                <div className="mb-2 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <Droplets size={12} />
                  <span>{group.application_method_ar}</span>
                </div>
              )}

              {group.spectrum_ar && (
                <div className="mb-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <Shield size={12} className="ml-1 inline" />
                  {group.spectrum_ar}
                </div>
              )}

              <div className="mb-2 flex items-center justify-between text-[11px]">
                <span className="text-gray-500 dark:text-gray-400">
                  <AlertTriangle size={11} className="ml-1 inline" />
                  مخاطر المقاومة:
                </span>
                <span className="font-bold" style={{ color: getRiskColor(group.resistance_risk_level) }}>
                  {getRiskText(group.resistance_risk_ar)}
                </span>
              </div>

              {group.resistance_mechanism_ar && (
                <div className="mb-2 text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1">
                  آلية المقاومة: {group.resistance_mechanism_ar.substring(0, 60)}...
                </div>
              )}

              {group.rotation_rule_ar && (
                <div className="mb-2 flex items-start gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <RefreshCw size={11} className="mt-0.5 shrink-0" />
                  <span>{group.rotation_rule_ar}</span>
                </div>
              )}

              <div className="mb-2 space-y-1 text-[11px]">
                {group.max_applications_season && (
                  <div className="text-gray-500 dark:text-gray-400">
                    <BarChart3 size={11} className="ml-1 inline" />
                    الحد الأقصى: {group.max_applications_season} مرة/موسم
                  </div>
                )}
                {group.importance_egypt && (
                  <div className="text-gray-500 dark:text-gray-400">
                    الأهمية في مصر: {group.importance_egypt}
                  </div>
                )}
                {group.safety_class_ar && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={11} />
                    <span>{group.safety_class_ar}</span>
                  </div>
                )}
                {group.isPublicHealth && (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Hospital size={11} />
                    <span>صحة عامة</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <FlaskConical size={12} />
                  {group.ai_count || group.active_ingredients?.length || 'متعدد'} مادة فعالة
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  عرض المواد
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-12 text-center shadow-sm">
            <Search size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">لا توجد نتائج مطابقة</h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              لم نتمكن من العثور على مجموعة تطابق "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-600 shadow-md"
            >
              مسح البحث
            </button>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 px-6 py-4 shadow-sm">
          <div className="text-center">
            <div className="text-xl font-black text-emerald-500">{groups.length}</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">مجموعة مبيدات</div>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <div className="text-xl font-black text-emerald-500">
              {groups.reduce((sum, g) => sum + (g.ai_count || g.active_ingredients?.length || 0), 0)}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">مادة فعالة</div>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-center">
            <FlaskConical size={20} className="mx-auto text-emerald-500" />
            <div className="text-[11px] text-gray-500 dark:text-gray-400">{meta.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PesticidesCategoryPage;
