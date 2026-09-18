import { getGroups } from '../pesticides-folder/buildGroups';

describe('pesticidesGroups', () => {
  describe('IRAC groups (insecticides)', () => {
    it('should return 20 groups with ai_count totaling 62 (62 AIs have IRAC group classification, 15 are group summaries)', () => {
      const groups = getGroups('irac-grp');
      expect(groups.length).toBe(20);
      
      const totalAiCount = groups.reduce((sum, g) => sum + g.ai_count, 0);
      expect(totalAiCount).toBe(62);
    });

    it('each group should have required fields', () => {
      const groups = getGroups('irac-grp');
      groups.forEach(group => {
        expect(group.id).toBeTruthy();
        expect(group.code).toBeTruthy();
        expect(group.name_ar || group.name_en).toBeTruthy();
        expect(typeof group.ai_count).toBe('number');
      });
    });

    it('groups should have correct IRAC codes', () => {
      const groups = getGroups('irac-grp');
      const codes = groups.map(g => g.code);
      expect(codes).toContain('1A');
      expect(codes).toContain('1B');
      expect(codes).toContain('3A');
      expect(codes).toContain('4A');
    });
  });

  describe('FRAC groups (fungicides)', () => {
    it('should return 19 groups', () => {
      const groups = getGroups('frac-grp');
      expect(groups.length).toBe(19);
    });
  });

  describe('HRAC groups (herbicides)', () => {
    it('should return groups from items', () => {
      const groups = getGroups('hrac-grp');
      expect(groups.length).toBeGreaterThan(0);
    });
  });

  describe('ACAR groups (acaricides)', () => {
    it('should return same as IRAC (identical data)', () => {
      const iracGroups = getGroups('irac-grp');
      const acarGroups = getGroups('acar-grp');
      expect(acarGroups.length).toBe(iracGroups.length);
    });
  });

  describe('group matching', () => {
    it('each IRAC group should have at least one matching AI', () => {
      const groups = getGroups('irac-grp');
      groups.forEach(group => {
        expect(group.ai_count).toBeGreaterThan(0);
      });
    });
  });
});
