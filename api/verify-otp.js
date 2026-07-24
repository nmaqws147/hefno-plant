import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.TOKEN,
});

const MAX_ATTEMPTS = 5;
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_OTP = /^\d{6}$/;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userOtp = String(otp).trim();

    if (!VALID_EMAIL.test(normalizedEmail) || !VALID_OTP.test(userOtp)) {
      return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح' });
    }

    const attemptsKey = `otp_attempts:${normalizedEmail}`;
    const attempts = await redis.get(attemptsKey);
    const attemptCount = attempts ? parseInt(String(attempts), 10) : 0;

    if (attemptCount >= MAX_ATTEMPTS) {
      await redis.del(`otp:${normalizedEmail}`);
      return res.status(400).json({ success: false, message: 'انتهت صلاحية رمز التحقق — الرجاء طلب رمز جديد' });
    }

    const stored = await redis.get(`otp:${normalizedEmail}`);
    if (!stored) {
      return res.status(400).json({ success: false, message: 'انتهت صلاحية رمز التحقق — الرجاء طلب رمز جديد' });
    }

    const storedOtp = String(stored).trim();

    if (storedOtp !== userOtp) {
      const newCount = attemptCount + 1;
      await redis.set(attemptsKey, String(newCount), { ex: 300 });
      return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح' });
    }

    await redis.del(`otp:${normalizedEmail}`);
    await redis.del(attemptsKey);
    await redis.del(`otp_cooldown:${normalizedEmail}`);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ أثناء التحقق من الرمز' });
  }
}