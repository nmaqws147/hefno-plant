import iracData from './pesti-items/irac.json';
import fracData from './pesti-items/frac.json';
import hracData from './pesti-items/hrac.json';
import nemaData from './pesti-items/nema.json';
import bactData from './pesti-items/bact.json';

const sources = {
  'irac-grp': iracData.items || [],
  'frac-grp': fracData.items || [],
  'hrac-grp': hracData.items || [],
  'nema-grp': nemaData.items || [],
  'bact-grp': bactData.items || [],
};

const groupIdKeys = {
  'irac-grp': 'irac_group_id',
  'frac-grp': 'frac_group_id',
  'hrac-grp': 'hrac_group_id',
  'nema-grp': 'nematicide_group_id',
  'bact-grp': 'bactericide_group_id',
};

const codeKeys = {
  'irac-grp': 'irac_code',
  'frac-grp': 'frac_code',
  'hrac-grp': 'hrac_code',
  'nema-grp': 'group_code',
  'bact-grp': 'group_code',
};

export const getGroups = (key) => {
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
        chemical_class_ar: item.chemical_class_ar || '',
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
