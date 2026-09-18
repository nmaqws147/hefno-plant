import iracData from './pesti-items/irac.json';
import fracData from './pesti-items/frac.json';
import hracData from './pesti-items/hrac.json';
import nemaData from './pesti-items/nema.json';
import bactData from './pesti-items/bact.json';

const sources = {
  'frac-grp': null,
  'hrac-grp': hracData.items || [],
  'nema-grp': null,
  'bact-grp': bactData.items || [],
};

const groupIdKeys = {
  'frac-grp': 'id',
  'hrac-grp': 'hrac_group_id',
  'nema-grp': 'id',
  'bact-grp': 'bactericide_group_id',
};

const codeKeys = {
  'frac-grp': 'code',
  'hrac-grp': 'hrac_code',
  'nema-grp': 'code',
  'bact-grp': 'group_code',
};

const buildFracGroups = () => {
  const fracGroups = fracData.frac_groups_reference || [];
  const activeIngredients = fracData.active_ingredients || [];

  const codeToId = {};
  fracGroups.forEach(g => { codeToId[g.code] = g.id; });

  const groupMap = {};

  fracGroups.forEach(g => {
    groupMap[g.id] = {
      id: g.id,
      code: g.code || '',
      subgroup: g.subgroup || '',
      letter: g.letter || '',
      name_ar: g.name?.arabic || '',
      name_en: g.name?.english || '',
      chemical_class_ar: g.chemical_class?.arabic || '',
      chemical_class_en: g.chemical_class?.english || '',
      MoA_ar: g.mode_of_action?.summary?.arabic || '',
      MoA_en: g.mode_of_action?.summary?.english || '',
      target_site: g.mode_of_action?.target_site || '',
      systemic: g.systemic || false,
      spectrum_ar: g.spectrum_arabic || '',
      activity_ar: g.activity_arabic || '',
      target_oomycetes: g.target_oomycetes || false,
      resistance_risk_level: g.resistance_risk?.level,
      resistance_risk_ar: g.resistance_risk?.arabic || '',
      resistance_risk_color: g.resistance_risk?.color || '',
      resistance_mechanism_ar: g.resistance_mechanism_arabic || '',
      rotation_rule_ar: g.rotation_rule_arabic || '',
      rotation_compatible_ids: g.rotation_compatible_ids || [],
      rotation_incompatible_ids: g.rotation_incompatible_ids || [],
      cross_resistance_ar: g.cross_resistance_note_arabic || '',
      importance_egypt: g.importance_in_egypt_arabic || '',
      max_applications_season: g.max_applications_per_season,
      safety_class_ar: '',
      ai_count: 0,
      group_data: g,
    };
  });

  activeIngredients.forEach(ai => {
    const fracGroup = ai.classification?.frac_group || {};
    const gid = fracGroup.id || codeToId[fracGroup.code];
    if (!gid || !groupMap[gid]) return;
    groupMap[gid].ai_count++;
  });

  return Object.values(groupMap);
};

const buildNemaGroups = () => {
  const nemaGroups = nemaData.nematicide_groups_reference || [];
  const activeIngredients = nemaData.active_ingredients || [];

  const groupMap = {};

  nemaGroups.forEach(g => {
    groupMap[g.id] = {
      id: g.id,
      code: g.code || '',
      name_ar: g.name?.arabic || g.name?.english || '',
      name_en: g.name?.english || g.name?.arabic || '',
      chemical_class_ar: g.chemical_class?.arabic || '',
      chemical_class_en: g.chemical_class?.english || '',
      irac_code: undefined,
      resistance_risk_level: g.resistance_risk,
      resistance_risk_ar: g.resistance_mechanism_arabic,
      resistance_mechanism_ar: g.resistance_mechanism_arabic,
      rotation_rule_ar: g.rotation_rule_arabic,
      MoA_ar: g.mode_of_action,
      application_method_ar: g.application_method_arabic,
      spectrum_ar: g.spectrum_arabic,
      max_applications_season: g.max_applications_per_season,
      safety_class_ar: g.safety_class_arabic,
      ai_count: 0,
      group_data: g,
    };
  });

  activeIngredients.forEach(ai => {
    const nemaGroup = ai.classification?.nematicide_group || {};
    const gid = nemaGroup.id || nemaGroup.code;
    if (!gid || !groupMap[gid]) return;
    groupMap[gid].ai_count++;
  });

  return Object.values(groupMap);
};

const buildIracGroups = (data) => {
  const iracGroups = data.irac_groups_reference || [];
  const activeIngredients = data.active_ingredients || [];

  const iracGroupMap = {};
  iracGroups.forEach(g => {
    iracGroupMap[g.code] = g;
    iracGroupMap[g.id] = g;
  });

  const groupMap = {};

  iracGroups.forEach(g => {
    groupMap[g.id] = {
      id: g.id,
      code: g.code || '',
      name_ar: g.name?.arabic || g.name?.english || '',
      name_en: g.name?.english || g.name?.arabic || '',
      chemical_class_ar: g.chemical_class?.arabic || '',
      chemical_class_en: g.chemical_class?.english || '',
      irac_code: g.code || '',
      resistance_risk_level: g.resistance_risk?.level,
      resistance_risk_ar: g.resistance_risk?.arabic || '',
      resistance_mechanism_ar: g.resistance_mechanism_arabic || '',
      rotation_rule_ar: g.rotation_rule_arabic || '',
      MoA_ar: g.mode_of_action?.summary?.arabic || '',
      activity_ar: g.activity_arabic || '',
      application_method_ar: g.application_method_arabic || '',
      spectrum_ar: g.spectrum_arabic || '',
      max_applications_season: g.max_applications_per_season,
      safety_class_ar: g.safety_notes_arabic || '',
      target_organisms_ar: g.target_organisms_arabic || [],
      importance_egypt: g.importance_in_egypt_arabic || '',
      cross_resistance_ar: g.cross_resistance_note_arabic || '',
      ai_count: 0,
      group_data: g,
    };
  });

  activeIngredients.forEach(ai => {
    const iracGroup = ai.classification?.irac_group || {};
    const gid = iracGroup.id || iracGroupMap[iracGroup.code]?.id;
    if (!gid || !groupMap[gid]) return;
    groupMap[gid].ai_count++;
  });

  return Object.values(groupMap);
};

export const getGroups = (key) => {
  if (key === 'irac-grp') {
    return buildIracGroups(iracData);
  }
  if (key === 'frac-grp') {
    return buildFracGroups();
  }
  if (key === 'nema-grp') {
    return buildNemaGroups();
  }
  if (key === 'acar-grp') {
    return buildIracGroups(iracData);
  }

  const items = sources[key];
  if (!items || items.length === 0) return [];

  const gidKey = groupIdKeys[key];
  const codeKey = codeKeys[key];
  const groupMap = {};

  items.forEach(item => {
    const gid = item[gidKey];
    if (!gid) return;
    if (!groupMap[gid]) {
      groupMap[gid] = {
        id: gid,
        code: item[codeKey] || gid.split('-').pop(),
        name_ar: item.chemical_class_ar || gid,
        name_en: item[codeKey] || gid,
        chemical_class_ar: item.chemical_class_en || item.chemical_class_ar || '',
        chemical_class_en: item.chemical_class_en || '',
        irac_code: key === 'irac-grp' ? item[codeKey] : undefined,
        resistance_risk_level: item.resistance?.risk_level,
        resistance_risk_ar: item.resistance?.risk_ar,
        resistance_mechanism_ar: item.resistance?.mechanism_ar,
        rotation_rule_ar: item.rotation?.note_ar,
        MoA_ar: item.type_ar || '',
        application_method_ar: item.application?.methods_ar,
        spectrum_ar: item.spectrum_ar,
        max_applications_season: item.application?.max_applications_season,
        safety_class_ar: item.safety_notes_ar,
        ai_count: 0,
      };
    }
    groupMap[gid].ai_count++;
  });

  return Object.values(groupMap);
};

export const getFracCodeToIdMap = () => {
  const map = {};
  const groups = fracData.frac_groups_reference || [];
  groups.forEach(g => { map[g.code] = g.id; });
  return map;
};
