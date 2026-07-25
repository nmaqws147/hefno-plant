import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.TOKEN,
});

const MAX_ATTEMPTS = 5;
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_OTP = /^\d{6}$/;

function log(step, data = {}) {
  const entry = { step, timestamp: new Date().toISOString(), ...data };
  console.log(JSON.stringify(entry));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      log('verify_missing_fields', { hasEmail: !!email, hasOtp: !!otp });
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userOtp = String(otp).trim();

    if (!VALID_EMAIL.test(normalizedEmail) || !VALID_OTP.test(userOtp)) {
      log('verify_invalid_format', { email: normalizedEmail });
      return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح' });
    }

    const attemptsKey = `otp_attempts:${normalizedEmail}`;
    const attempts = await redis.get(attemptsKey);
    const attemptCount = attempts ? parseInt(String(attempts), 10) : 0;
    log('verify_attempt', { email: normalizedEmail, attemptCount });

    if (attemptCount >= MAX_ATTEMPTS) {
      log('verify_max_attempts', { email: normalizedEmail });
      await redis.del(`otp:${normalizedEmail}`);
      return res.status(400).json({ success: false, message: 'انتهت صلاحية رمز التحقق — الرجاء طلب رمز جديد' });
    }

    const stored = await redis.get(`otp:${normalizedEmail}`);
    if (!stored) {
      log('verify_no_stored_otp', { email: normalizedEmail });
      return res.status(400).json({ success: false, message: 'انتهت صلاحية رمز التحقق — الرجاء طلب رمز جديد' });
    }

    const storedOtp = String(stored).trim();

    if (storedOtp !== userOtp) {
      const newCount = attemptCount + 1;
      await redis.set(attemptsKey, String(newCount), { ex: 300 });
      log('verify_wrong_otp', { email: normalizedEmail, newAttemptCount: newCount });
      return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح' });
    }

    await redis.del(`otp:${normalizedEmail}`);
    await redis.del(attemptsKey);
    await redis.del(`otp_cooldown:${normalizedEmail}`);
    log('verify_success', { email: normalizedEmail });

    return res.status(200).json({ success: true });
  } catch (error) {
    log('verify_error', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: 'حدث خطأ أثناء التحقق من الرمز' });
  }
}
