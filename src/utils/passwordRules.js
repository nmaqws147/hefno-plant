export const PASSWORD_RULES = [
  { key: 'length', label: '8 أحرف على الأقل', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'حرف كبير واحد على الأقل', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'حرف صغير واحد على الأقل', test: (p) => /[a-z]/.test(p) },
  { key: 'digit', label: 'رقم واحد على الأقل', test: (p) => /\d/.test(p) },
  { key: 'special', label: 'رمز خاص واحد على الأقل', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const validatePassword = (password) => {
  const value = password || '';
  const failed = PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.key);
  return { valid: failed.length === 0, failed };
};
