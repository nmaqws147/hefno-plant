import {
  normalizeHracItem,
  summarizeEfficacy,
  getApplicationNotes,
  getPrimaryDose,
  getEfficacyColor,
  getHracGroupData,
} from '../pesticides-folder/herbicideFields';
import hracData from '../pesticides-folder/pesti-items/hrac.json';

const firstAi = hracData.active_ingredients[0]; // ai_0001 — Clethodim, HRAC group A

describe('herbicideFields', () => {
  it('labels every application note type in Arabic', () => {
    const notes = getApplicationNotes(firstAi);
    expect(notes.length).toBeGreaterThan(0);
    notes.forEach(note => {
      expect(note.label).not.toBe(note.type);
      expect(note.value).toBeTruthy();
    });
    expect(notes[0].label).toBe('الجرعة ما بعد الإنبات');
    expect(notes[0].value).toBe('0.1–0.25 لتر م.ف/فدان');
  });

  it('picks a primary dose from application notes', () => {
    expect(getPrimaryDose(firstAi)).toBe('0.1–0.25 لتر م.ف/فدان');
  });

  it('summarizes weed efficacy rows', () => {
    const summary = summarizeEfficacy(firstAi.weed_efficacy_relationships);
    expect(summary.total).toBe(6);
    expect(summary.warnings).toBe(6);
    expect(summary.maxLevel).toBe(4);
    expect(summary.topWeed).toBe('الفلاريس — الشوفان الكاذب');
  });

  it('returns a zeroed summary for missing rows', () => {
    expect(summarizeEfficacy(undefined)).toEqual({
      total: 0, warnings: 0, maxLevel: 0, topWeed: '',
    });
  });

  it('normalizes an AI for display', () => {
    const item = normalizeHracItem(firstAi);

    expect(item.name_ar).toBe('كليثوديم');
    expect(item.weed_efficacy.length).toBe(6);
    expect(item.efficacy_summary.total).toBe(6);
    expect(item.application.dose_feddan_ar).toBe('0.1–0.25 لتر م.ف/فدان');
    expect(item.activity_ar).toBe('ما بعد الإنبات — جهازي');
    expect(item.type_ar).toBe('ما بعد الإنبات — جهازي');
    expect(item.selectivity_ar).toContain('انتقائي');
    expect(item.rotation_notes.length).toBeGreaterThan(0);
    expect(item.rotation_compatible_ids).toContain('hrac-b');
    expect(item.cross_resistance_note).toContain('مقاومة متبادلة');
    expect(item.disease_efficacy).toEqual([]);
    expect(item.target_pests.length).toBe(6);
    expect(item.target_crops).toContain('فول');
    expect(item.safety_notes).toBeTruthy();
    expect(item.regulatory).toBeTruthy();
  });

  it('maps efficacy levels to colors', () => {
    expect(getEfficacyColor(4).hex).toBe('#10b981');
    expect(getEfficacyColor(3).hex).toBe('#0ea5e9');
    expect(getEfficacyColor(99).hex).toBe('#0ea5e9');
  });
});

describe('herbicideFields edge cases', () => {
  it('returns no notes when the item or its application notes are missing', () => {
    expect(getApplicationNotes(undefined)).toEqual([]);
    expect(getApplicationNotes({})).toEqual([]);
    expect(getApplicationNotes({ application: {} })).toEqual([]);
    expect(getApplicationNotes({ application: { application_notes: [] } })).toEqual([]);
  });

  it('falls back to the raw type for unknown note types and to an empty string for empty values', () => {
    const notes = getApplicationNotes({
      application: { application_notes: [{ type: 'unknown_type', arabic: '' }] },
    });
    expect(notes).toEqual([{ type: 'unknown_type', label: 'unknown_type', value: '' }]);
  });

  it('prefers the post-emergence dose over the pre-emergence dose', () => {
    const item = {
      application: {
        application_notes: [
          { type: 'dose_pre_emergence', arabic: 'pre' },
          { type: 'dose_post_emergence', arabic: 'post' },
        ],
      },
    };
    expect(getPrimaryDose(item)).toBe('post');
  });

  it('returns an empty dose when no dose note exists', () => {
    expect(getPrimaryDose({})).toBe('');
    expect(getPrimaryDose({
      application: { application_notes: [{ type: 'soil_activity', arabic: 'x' }] },
    })).toBe('');
  });

  it('summarizes an empty row list to zeros', () => {
    expect(summarizeEfficacy([])).toEqual({
      total: 0, warnings: 0, maxLevel: 0, topWeed: '',
    });
  });

  it('ignores null efficacy levels when picking the max level and top weed', () => {
    const summary = summarizeEfficacy([
      { weed_name_arabic: 'أ', efficacy_level: null, resistance_warning: false },
      { weed_name_arabic: 'ب', efficacy_level: null, resistance_warning: true },
    ]);
    expect(summary).toEqual({ total: 2, warnings: 1, maxLevel: 0, topWeed: '' });
  });

  it('falls back to the level-3 color for unknown, null, and boundary levels', () => {
    expect(getEfficacyColor(1).hex).toBe('#ef4444');
    expect(getEfficacyColor(5).hex).toBe('#14b8a6');
    expect(getEfficacyColor(undefined).hex).toBe('#0ea5e9');
    expect(getEfficacyColor(null).hex).toBe('#0ea5e9');
  });

  it('normalizes a minimal item without throwing and with safe defaults', () => {
    const item = normalizeHracItem({});
    expect(item.name_ar).toBe('');
    expect(item.name_en).toBe('');
    expect(item.type_ar).toBe('');
    expect(item.chemical_class_ar).toBe('—');
    expect(item.spectrum_ar).toBe('—');
    expect(item.weed_efficacy).toEqual([]);
    expect(item.efficacy_summary).toEqual({ total: 0, warnings: 0, maxLevel: 0, topWeed: '' });
    expect(item.application_notes_labeled).toEqual([]);
    expect(item.application.dose_feddan_ar).toBe('');
    expect(item.target_crops).toEqual([]);
    expect(item.target_pests).toEqual([]);
    expect(item.disease_efficacy).toEqual([]);
    expect(item.rotation_notes).toEqual([]);
    expect(item.rotation_compatible_ids).toEqual([]);
    expect(item.rotation_incompatible_ids).toEqual([]);
    expect(item.resistance_reported_in).toEqual([]);
  });

  it('exposes HRAC group and weed reference data', () => {
    const { groups, weeds } = getHracGroupData();
    expect(groups.length).toBe(16);
    expect(groups[0].id).toBe('hrac-a');
    expect(groups[0].code).toBe('A');
    expect(weeds.length).toBe(24);
    expect(weeds[0].arabic).toBe('الفلاريس — الشوفان الكاذب');
  });
});
