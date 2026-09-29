import hracData from './pesti-items/hrac.json';

export const APPLICATION_NOTE_LABELS = {
  dose_pre_emergence: 'الجرعة ما قبل الإنبات',
  dose_post_emergence: 'الجرعة ما بعد الإنبات',
  preharvest_interval: 'فترة ما قبل الحصاد',
  soil_activity: 'النشاط في التربة',
};

const EFFICACY_COLORS = {
  1: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', hex: '#ef4444' },
  2: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', hex: '#f59e0b' },
  3: { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-300', hex: '#0ea5e9' },
  4: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', hex: '#10b981' },
  5: { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-300', hex: '#14b8a6' },
};

export const getEfficacyColor = (level) => EFFICACY_COLORS[level] || EFFICACY_COLORS[3];

export const getApplicationNotes = (item) =>
  (item?.application?.application_notes || []).map(note => ({
    type: note.type,
    label: APPLICATION_NOTE_LABELS[note.type] || note.type,
    value: note.arabic ?? note.value ?? '',
  }));

export const getPrimaryDose = (item) => {
  const notes = getApplicationNotes(item);
  const dose = notes.find(n => n.type === 'dose_post_emergence')
    || notes.find(n => n.type === 'dose_pre_emergence');
  return dose ? dose.value : '';
};

export const summarizeEfficacy = (rows = []) => {
  let maxLevel = 0;
  rows.forEach(row => {
    if ((row.efficacy_level || 0) > maxLevel) maxLevel = row.efficacy_level;
  });
  const best = rows.find(row => row.efficacy_level === maxLevel);
  return {
    total: rows.length,
    warnings: rows.filter(row => row.resistance_warning).length,
    maxLevel,
    topWeed: best ? best.weed_name_arabic : '',
  };
};

export const normalizeHracItem = (raw) => {
  const weedEfficacy = raw?.weed_efficacy_relationships || [];
  const activity = raw?.additional_information?.activity_type_arabic
    || raw?.action_characteristics?.contact_systemic_notes_ar
    || '';

  return {
    ...raw,
    name_ar: raw?.name?.arabic || raw?.name_ar || '',
    name_en: raw?.name?.english || raw?.name_en || '',
    type_ar: activity,
    activity_ar: activity,
    chemical_class_ar: raw?.classification?.chemical_group?.arabic || '—',
    chemical_class_en: raw?.classification?.chemical_group?.english || '',
    spectrum_ar: raw?.additional_information?.spectrum_arabic || '—',
    selectivity_ar: raw?.additional_information?.selectivity_arabic || '',
    special_use: raw?.additional_information?.special_use_arabic || '',
    regulatory: raw?.additional_information?.regulatory_status_arabic || '',
    safety_notes: raw?.safety?.safety_notes_ar || '',
    identification: raw?.identification || {},
    mode_of_action: raw?.mode_of_action || {},
    environmental_fate: raw?.environmental_fate || {},
    disease_efficacy: [],
    application: {
      ...(raw?.application || {}),
      dose_feddan_ar: getPrimaryDose(raw),
    },
    target_crops: (raw?.crops || []).map(c => (typeof c === 'string' ? c : c.arabic || c.english || '')),
    target_pests: (raw?.targets?.weeds || []).map(w => ({
      ...w,
      ar_name: w.arabic || '',
      name_ar: w.arabic || '',
    })),
    resistance_risk: raw?.resistance_management?.risk?.arabic || '',
    resistance_risk_level: raw?.resistance_management?.risk?.level,
    resistance_mechanism: raw?.resistance_management?.mechanism?.arabic || '',
    rotation_notes: raw?.resistance_management?.rotation_notes || [],
    resistance_reported_in: raw?.resistance_management?.resistance_reported_in || [],
    rotation_compatible_ids: raw?.resistance_management?.rotation_compatible_hrac_ids || [],
    rotation_incompatible_ids: raw?.resistance_management?.rotation_incompatible_hrac_ids || [],
    cross_resistance_note: raw?.resistance_management?.cross_resistance?.notes_ar || '',
    weed_efficacy: weedEfficacy,
    efficacy_summary: summarizeEfficacy(weedEfficacy),
    application_notes_labeled: getApplicationNotes(raw),
  };
};

export const getHracGroupData = () => ({
  groups: hracData.hrac_groups_reference || [],
  weeds: hracData.weeds_reference || [],
});
