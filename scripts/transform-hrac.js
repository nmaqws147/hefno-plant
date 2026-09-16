#!/usr/bin/env node
/**
 * Transform hefnoplant_active_ingredients(4).json (nested HRAC structure)
 * into flat hrac.json structure expected by buildGroups.js and pesticides-group-page.jsx
 */

const fs = require('fs');
const path = require('path');

const INPUT_PATH = '/home/hassan/Downloads/hefnoplant_active_ingredients(4).json';
const OUTPUT_PATH = '/home/hassan/Downloads/Hefno-Plant-Delivared/src/pesticides-folder/pesti-items/hrac.json';

const data = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));

function transformItem(ai) {
  const hracCode = ai.classification?.hrac_group?.code || '';
  const hracGroupId = hracCode ? `hrac-${hracCode.toLowerCase()}` : '';

  // --- application.application_notes lookup ---
  const notes = ai.application?.application_notes || [];
  const findNote = (type) => notes.find(n => n.type === type)?.arabic || null;

  // --- timing ---
  const timingArr = (ai.application?.timing || [])
    .map(t => t.arabic)
    .filter(Boolean);
  const timingAr = timingArr.join(' — ') || null;

  // --- methods ---
  const methodsAr = (ai.application?.methods || [])
    .map(m => m.arabic)
    .filter(Boolean);

  // --- target_weeds (keep as objects with name_ar for JSX compatibility) ---
  const targetWeeds = (ai.targets?.weeds || [])
    .filter(w => w.arabic)
    .map(w => ({
      id: w.id || null,
      name_ar: w.arabic,
      name_en: w.english || null,
    }));

  // --- target_crops (array of strings) ---
  const targetCrops = (ai.crops || [])
    .map(c => c.arabic)
    .filter(Boolean);

  // --- resistance ---
  const risk = ai.resistance_management?.risk || {};
  const mechanism = ai.resistance_management?.mechanism || {};
  const crGroups = ai.resistance_management?.cross_resistance?.groups || [];
  const crNote = ai.resistance_management?.cross_resistance?.notes_ar || null;
  const resistanceReported = ai.resistance_management?.resistance_reported_in || [];

  // --- rotation ---
  const rotationNotes = ai.resistance_management?.rotation_notes || [];
  const rotationNoteAr = rotationNotes.join(' — ') || null;
  const mustRotate = ai.resistance_management?.must_rotate_after_applications ?? null;
  const compatIds = ai.resistance_management?.rotation_compatible_hrac_ids || [];
  const incompatIds = ai.resistance_management?.rotation_incompatible_hrac_ids || [];

  // --- spectrum / activity_type / special_use / regulatory ---
  const additionalInfo = ai.additional_information || {};
  const spectrumAr = additionalInfo.spectrum_arabic
    || ai.mode_of_action?.summary?.arabic
    || ai.mode_of_action?.target_site
    || null;
  const activityTypeAr = additionalInfo.activity_type_arabic || ai.action_characteristics?.contact_systemic_notes_ar || null;
  const specialUseAr = additionalInfo.special_use_arabic || null;
  const regulatoryAr = additionalInfo.regulatory_status_arabic || null;

  // --- safety ---
  const safetyNotesAr = ai.safety?.safety_notes_ar || null;

  // --- contact_systemic ---
  const contactSystemic = ai.action_characteristics?.systemic ? 'جهازي' : '';

  // --- selectivity ---
  const selectivityAr = additionalInfo.selectivity_arabic || null;

  // --- identification, mode_of_action, environmental_fate, references (pass through) ---
  const identification = ai.identification || {};
  const modeOfAction = ai.mode_of_action || {};
  const environmentalFate = ai.environmental_fate || {};
  const references = ai.references || [];

  return {
    id: ai.legacy_id || ai.id,
    name_ar: ai.name?.arabic || '',
    name_en: ai.name?.english || '',
    hrac_group_id: hracGroupId,
    hrac_code: hracCode,
    chemical_class_ar: ai.classification?.chemical_group?.arabic || '',
    chemical_class_en: ai.classification?.chemical_group?.english || '',
    contact_systemic: contactSystemic,
    selectivity_ar: selectivityAr,
    application: {
      dose_pre_emergence_ar: findNote('dose_pre_emergence'),
      dose_post_emergence_ar: findNote('dose_post_emergence'),
      dose_feddan_ar: findNote('dose_feddan'),
      dose_spray_ar: null,
      methods_ar: methodsAr,
      timing_ar: timingAr,
      max_applications_season: ai.application?.max_applications_per_season ?? null,
      interval_days: null,
      preharvest_interval_ar: findNote('preharvest_interval') || null,
      water_volume_ar: null,
      soil_activity_ar: findNote('soil_activity') || null,
    },
    resistance: {
      risk_ar: risk.arabic || null,
      risk_level: risk.level ?? null,
      risk_color: risk.color || null,
      mechanism_ar: mechanism.arabic || null,
      cross_resistance_groups: crGroups,
      cross_resistance_note_ar: crNote,
      resistance_reported_in: resistanceReported,
    },
    rotation: {
      group_id: hracGroupId,
      must_rotate_after: mustRotate,
      note_ar: rotationNoteAr,
      compatible_hrac_ids: compatIds,
      incompatible_hrac_ids: incompatIds,
    },
    target_weeds: targetWeeds,
    target_crops: targetCrops,
    spectrum_ar: spectrumAr,
    activity_type_ar: activityTypeAr,
    special_use_ar: specialUseAr,
    regulatory_ar: regulatoryAr,
    safety_notes_ar: safetyNotesAr,
    identification: identification,
    mode_of_action: modeOfAction,
    environmental_fate: environmentalFate,
    references: references,
  };
}

// Build output
const items = data.active_ingredients.map(transformItem);

const output = {
  id: 'hrac_active_ingredients',
  name_ar: 'المواد الفعالة لمبيدات الحشائش — تصنيف HRAC',
  name_en: 'Herbicide Active Ingredients — HRAC Classified',
  source: `${data.database?.name || 'HRAC Classification'} ${data.database?.version || '2024'}`,
  version: data.database?.version || '2024',
  total_count: items.length,
  items: items,
  hrac_groups_reference: data.hrac_groups_reference || [],
  weeds_reference: data.weeds_reference || [],
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
console.log(`Wrote ${items.length} items to ${OUTPUT_PATH}`);
console.log('Groups:', [...new Set(items.map(i => i.hrac_group_id))].length);
