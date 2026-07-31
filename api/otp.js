import { Redis } from '@upstash/redis';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { buildForgotEmail, RESET_URL } from './_lib/resetEmail.js';
import firebaseAdmin from './_lib/firebaseAdmin.js';

const redis = new Redis({ url: process.env.REDIS_URL, token: process.env.TOKEN });
const OTP_TTL = 300;
const COOLDOWN_TTL = 60;
const MAX_ATTEMPTS = 5;
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function log(step, data = {}) {
  console.log(JSON.stringify({ step, timestamp: new Date().toISOString(), ...data }));
}

function getTransporter() {
  return nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendEmail(to, subject, html) {
  if (process.env.RESEND_API_KEY) {
    try {
      const from = `Hefno-Plant <${process.env.RESEND_FROM || process.env.EMAIL_USER || 'noreply@hefnoplant.site'}>`;
      const resend = getResend();
      const result = await resend.emails.send({ from, to, subject, html });
      if (result.error) throw new Error(typeof result.error === 'string' ? result.error : result.error.message || 'Resend error');
      log('resend_sent', { to, messageId: result?.data?.id });
      return;
    } catch (err) {
      log('resend_failed', { to, error: err.message });
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) throw err;
    }
  }
  const transporter = getTransporter();
  const info = await transporter.sendMail({ from: `"Hefno-Plant" <${process.env.EMAIL_USER}>`, to, subject, html });
  log('gmail_sent', { to, messageId: info.messageId });
}

function buildOtpEmail(otp) {
  return `<div style="font-family:Cairo,sans-serif;direction:rtl;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
    <div style="text-align:center;margin-bottom:24px;"><div style="background:#fff;border-radius:12px;padding:12px;display:inline-block;">
    <img src="https://hefnoplant.site/images/logo.webp" alt="Hefno-Plant" style="width:120px;height:auto;display:block"/></div></div>
    <h1 style="font-size:20px;color:#1e352f;text-align:center;margin:0 0 8px;">مرحباً بك في Hefno-Plant</h1>
    <p style="font-size:14px;color:#6b7280;text-align:center;margin:0 0 24px;">استخدم الرمز أدناه لتأكيد حسابك</p>
    <div style="background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e5e7eb;">
    <p style="font-size:13px;color:#6b7280;margin:0 0 12px;">رمز التحقق</p>
    <div style="font-size:36px;font-weight:800;letter-spacing:12px;color:#059669;direction:ltr;font-family:monospace;">${otp}</div>
    <p style="font-size:12px;color:#9ca3af;margin:16px 0 0;">صالح لمدة 5 دقائق</p></div>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:24px 0 0;">إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.</p></div>`;
}

const FORGOT_COOLDOWN_TTL = 60;
const FORGOT_HOURLY_TTL = 3600;
const FORGOT_HOURLY_LIMIT = 5;

async function handleForgotPassword(req, res) {
  const { email } = req.body;
  if (!email || !VALID_EMAIL.test(email)) {
    return res.status(400).json({ success: false, message: 'البريد الإلكتروني غير صالح' });
  }
  const normalizedEmail = email.toLowerCase().trim();

  const remaining = await redis.ttl(`forgot_cooldown:${normalizedEmail}`);
  if (remaining > 0) {
    return res.status(429).json({ success: false, message: `انتظر ${remaining} ثانية قبل طلب رابط جديد` });
  }

  const hourCount = await redis.incr(`forgot_hour:${normalizedEmail}`);
  if (hourCount === 1) await redis.expire(`forgot_hour:${normalizedEmail}`, FORGOT_HOURLY_TTL);
  if (hourCount > FORGOT_HOURLY_LIMIT) {
    return res.status(429).json({ success: false, message: 'لقد تجاوزت الحد المسموح، حاول لاحقاً' });
  }

  try {
    const fb = firebaseAdmin.init();
    if (!fb) throw new Error('Firebase Admin not initialized');
    const resetLink = await fb.auth().generatePasswordResetLink(normalizedEmail, {
      url: RESET_URL,
      handleCodeInApp: true,
    });
    await sendEmail(normalizedEmail, 'إعادة تعيين كلمة المرور - Hefno-Plant', buildForgotEmail(resetLink));
  } catch (err) {
    log('forgot_link_failed', { to: normalizedEmail, error: err.message });
  }

  await redis.set(`forgot_cooldown:${normalizedEmail}`, '1', { ex: FORGOT_COOLDOWN_TTL });
  return res.status(200).json({ success: true });
}

async function handleSend(req, res) {
  const { email } = req.body;
  if (!email || !VALID_EMAIL.test(email)) return res.status(400).json({ success: false, message: 'البريد الإلكتروني غير صالح' });
  const normalizedEmail = email.toLowerCase().trim();
  const remaining = await redis.ttl(`otp_cooldown:${normalizedEmail}`);
  if (remaining > 0) return res.status(429).json({ success: false, message: `انتظر ${remaining} ثانية قبل طلب رمز جديد` });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(`otp:${normalizedEmail}`, otp, { ex: OTP_TTL });
  await redis.set(`otp_cooldown:${normalizedEmail}`, '1', { ex: COOLDOWN_TTL });
  await sendEmail(normalizedEmail, 'رمز التحقق - Hefno-Plant', buildOtpEmail(otp));
  return res.status(200).json({ success: true });
}

async function handleVerify(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'البريد الإلكتروني ورمز التحقق مطلوبان' });
  const normalizedEmail = email.toLowerCase().trim();
  const userOtp = String(otp).trim();
  if (!VALID_EMAIL.test(normalizedEmail) || !/^\d{6}$/.test(userOtp)) return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح' });
  const attemptsKey = `otp_attempts:${normalizedEmail}`;
  const attempts = await redis.get(attemptsKey);
  const attemptCount = attempts ? parseInt(String(attempts), 10) : 0;
  if (attemptCount >= MAX_ATTEMPTS) {
    await redis.del(`otp:${normalizedEmail}`);
    return res.status(400).json({ success: false, message: 'انتهت صلاحية رمز التحقق — الرجاء طلب رمز جديد' });
  }
  const stored = await redis.get(`otp:${normalizedEmail}`);
  if (!stored) return res.status(400).json({ success: false, message: 'انتهت صلاحية رمز التحقق — الرجاء طلب رمز جديد' });
  if (String(stored).trim() !== userOtp) {
    await redis.set(attemptsKey, String(attemptCount + 1), { ex: 300 });
    return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح' });
  }
  await redis.del(`otp:${normalizedEmail}`);
  await redis.del(attemptsKey);
  await redis.del(`otp_cooldown:${normalizedEmail}`);
  return res.status(200).json({ success: true });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname;
    if (path === '/api/forgot-password') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
      return await handleForgotPassword(req, res);
    }
    if (path === '/api/send-otp' || path === '/api/otp/send') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
      return await handleSend(req, res);
    }
    if (path === '/api/verify-otp' || path === '/api/otp/verify') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
      return await handleVerify(req, res);
    }
    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    log('otp_error', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
}