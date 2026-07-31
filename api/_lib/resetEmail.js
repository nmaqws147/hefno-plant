const RESET_URL = 'https://hefnoplant.site/reset-password';

function buildForgotEmail(resetLink) {
  return `<div style="font-family:Cairo,sans-serif;direction:rtl;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
    <div style="text-align:center;margin-bottom:24px;"><div style="background:#fff;border-radius:12px;padding:12px;display:inline-block;">
    <img src="https://hefnoplant.site/images/logo.webp" alt="Hefno-Plant" style="width:120px;height:auto;display:block"/></div></div>
    <h1 style="font-size:20px;color:#1e352f;text-align:center;margin:0 0 8px;">إعادة تعيين كلمة المرور</h1>
    <p style="font-size:14px;color:#6b7280;text-align:center;margin:0 0 24px;">مرحباً بك في Hefno-Plant</p>
    <div style="background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e5e7eb;">
    <p style="font-size:13px;color:#6b7280;margin:0 0 16px;">اضغط على الزر أدناه لإعادة تعيين كلمة المرور</p>
    <a href="${resetLink}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 32px;border-radius:12px;">إعادة تعيين كلمة المرور</a>
    <p style="font-size:12px;color:#9ca3af;margin:16px 0 0;">الرابط صالح لمدة ساعة واحدة</p></div>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:16px 0 0;word-break:break-all;direction:ltr;">${resetLink}</p>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:24px 0 0;">إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة بأمان.</p></div>`;
}

module.exports = { buildForgotEmail, RESET_URL };
