import { validatePassword } from '../passwordRules';

describe('validatePassword', () => {
  test('accepts a strong password', () => {
    const result = validatePassword('Abcdefg1!');
    expect(result.valid).toBe(true);
    expect(result.failed).toEqual([]);
  });

  test.each([
    ['too short', 'Ab1!'],
    ['no uppercase', 'abcdefg1!'],
    ['no lowercase', 'ABCDEFG1!'],
    ['no digit', 'Abcdefg!'],
    ['no special', 'Abcdefg1'],
    ['empty', ''],
  ])('rejects password missing requirement: %s', (_label, password) => {
    const result = validatePassword(password);
    expect(result.valid).toBe(false);
    expect(result.failed.length).toBeGreaterThan(0);
  });

  test('reports all failed rules', () => {
    const result = validatePassword('a');
    expect(result.failed.sort()).toEqual(['digit', 'length', 'special', 'upper'].sort());
  });
});
