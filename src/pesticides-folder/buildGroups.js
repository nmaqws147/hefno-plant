import iracData from './pesti-items/irac.json';
import fracData from './pesti-items/frac.json';
import hracData from './pesti-items/hrac.json';
import nemaData from './pesti-items/nema.json';
import bactData from './pesti-items/bact.json';
import acarData from './pesti-items/acaricides.json';

const sources = {
  'irac-grp': iracData.items || [],
  'frac-grp': null,
  'hrac-grp': hracData.items || [],
  'nema-grp': null,
  'bact-grp': bactData.items || [],
  'acar-grp': null,
};

const groupIdKeys = {
  'irac-grp': 'irac_group_id',
  'frac-grp': 'id',
  'hrac-grp': 'hrac_group_id',
  'nema-grp': 'id',
  'bact-grp': 'bactericide_group_id',
  'acar-grp': 'id',
};

const codeKeys = {
  'irac-grp': 'irac_code',
  'frac-grp': 'code',
  'hrac-grp': 'hrac_code',
  'nema-grp': 'code',
  'bact-grp': 'group_code',
  'acar-grp': 'code',
};

const buildFracGroups = () => {
  const fracGroups = fracData.frac_groups_reference || [];
  const activeIngredients = fracData.active_ingredients || [];

  const groupMap = {};

  fracGroups.forEach(g => {
    groupMap[g.id] = {
      id: g.id,
      code: g.code || '',
      name_ar: g.name?.arabic || g.name_en || g.chemical_class?.arabic || '',
      name_en: g.name?.english || g.name_en || g.chemical_class?.english || '',
      chemical_class_ar: g.chemical_class?.arabic || '',
      chemical_class_en: g.chemical_class?.english || '',
      irac_code: undefined,
      resistance_risk_level: g.resistance_risk,
      resistance_risk_ar: g.resistance_mechanism_ar,
      resistance_mechanism_ar: g.resistance_mechanism_ar,
      rotation_rule_ar: g.rotation_rule_arabic,
      MoA_ar: g.mode_of_action,
      application_method_ar: g.mode_of_action,
      spectrum_ar: g.spectrum_arabic,
      max_applications_season: g.max_applications_per_season,
      safety_class_ar: '',
      ai_count: 0,
      group_data: g,
    };
  });

  activeIngredients.forEach(ai => {
    const fracGroup = ai.classification?.frac_group || {};
    const gid = fracGroup.id || fracGroup.code;
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

const buildIracGroups = () => {
  const iracGroups = acarData.irac_groups_reference || [];
  const activeIngredients = acarData.active_ingredients || [];

  // Build lookup by code and id
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
    const iracGroup = ai.classification?.irac_group || {};
    const gid = iracGroup.id || iracGroupMap[iracGroup.code]?.id;
    if (!gid || !groupMap[gid]) return;
    groupMap[gid].ai_count++;
  });

  return Object.values(groupMap);
};

export const getGroups = (key) => {
  if (key === 'frac-grp') {
    return buildFracGroups();
  }
  if (key === 'nema-grp') {
    return buildNemaGroups();
  }
  if (key === 'acar-grp') {
    return buildIracGroups();
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
