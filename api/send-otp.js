import { Redis } from '@upstash/redis';
import nodemailer from 'nodemailer';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.TOKEN,
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const OTP_TTL = 300;
const COOLDOWN_TTL = 60;
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { email } = req.body;
    if (!email || !VALID_EMAIL.test(email)) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني غير صالح' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const cooldownKey = `otp_cooldown:${normalizedEmail}`;
    const remaining = await redis.ttl(cooldownKey);
    if (remaining > 0) {
      return res.status(429).json({
        success: false,
        message: `انتظر ${remaining} ثانية قبل طلب رمز جديد`,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(`otp:${normalizedEmail}`, otp, { ex: OTP_TTL });
    await redis.set(cooldownKey, '1', { ex: COOLDOWN_TTL });

    await transporter.sendMail({
      from: `"Hefno-Plant" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'رمز التحقق - Hefno-Plant',
      html: `
        <div style="font-family: 'Cairo', sans-serif; direction: rtl; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="background:#ffffff; border-radius:12px; padding:12px; display:inline-block;">
              <img src="https://hefnoplant.site/images/logo.webp" alt="Hefno-Plant" style="width: 120px; height: auto; display: block;" />
            </div>
          </div>
          <h1 style="font-size: 20px; color: #1e352f; text-align: center; margin: 0 0 8px;">مرحباً بك في Hefno-Plant</h1>
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0 0 24px;">استخدم الرمز أدناه لتأكيد حسابك</p>
          <div style="background: #ffffff; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #e5e7eb;">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 12px;">رمز التحقق</p>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #059669; direction: ltr; font-family: monospace;">${otp}</div>
            <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0;">صالح لمدة 5 دقائق</p>
          </div>
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 24px 0 0;">إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ أثناء إرسال الرمز' });
  }
}