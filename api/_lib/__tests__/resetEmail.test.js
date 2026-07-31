const { buildForgotEmail, RESET_URL } = require('../resetEmail');

describe('buildForgotEmail', () => {
  const LINK = `${RESET_URL}?mode=resetPassword&oobCode=abc123&apiKey=key&lang=ar`;

  test('exports RESET_URL as the reset page', () => {
    expect(RESET_URL).toBe('https://hefnoplant.site/reset-password');
  });

  test('renders a branded RTL Arabic layout', () => {
    const html = buildForgotEmail(LINK);
    expect(html).toContain('direction:rtl');
    expect(html).toContain('Cairo,sans-serif');
    expect(html).toContain('https://hefnoplant.site/images/logo.webp');
    expect(html).toContain('إعادة تعيين كلمة المرور');
    expect(html).toContain('مرحباً بك في Hefno-Plant');
  });

  test('embeds the reset link as a clickable button and plain-text fallback', () => {
    const html = buildForgotEmail(LINK);
    expect(html).toContain(`href="${LINK}"`);
    expect(html).toContain(LINK);
  });

  test('includes expiry and security notices', () => {
    const html = buildForgotEmail(LINK);
    expect(html).toContain('الرابط صالح لمدة ساعة واحدة');
    expect(html).toContain('إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة بأمان');
  });
});
