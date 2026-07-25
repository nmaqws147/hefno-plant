import nodemailer from 'nodemailer';
import { Resend } from 'resend';

function log(step, data = {}) {
  const entry = { step, timestamp: new Date().toISOString(), ...data };
  console.log(JSON.stringify(entry));
}

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendViaResend(to, replyTo, subject, html) {
  const resend = getResend();
  const from = `Hefno-Plant <${process.env.RESEND_FROM || 'noreply@hefnoplant.site'}>`;
  const result = await resend.emails.send({ from, to, replyTo, subject, html });
  log('resend_sent', { to, messageId: result?.data?.id });
  return result;
}

async function sendViaGmail(to, replyTo, subject, html) {
  const transporter = getTransporter();
  const from = `"Hefno Contact" <${process.env.EMAIL_USER}>`;
  const info = await transporter.sendMail({ from, to, replyTo, subject, html });
  log('gmail_sent', { to, accepted: info.accepted, rejected: info.rejected, messageId: info.messageId });
  return info;
}

async function sendEmail(to, replyTo, subject, html) {
  if (process.env.RESEND_API_KEY) {
    try {
      log('resend_attempt', { to });
      return await sendViaResend(to, replyTo, subject, html);
    } catch (err) {
      log('resend_failed', { to, error: err.message, stack: err.stack });
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) throw err;
      log('gmail_fallback', { to });
    }
  }
  log('gmail_attempt', { to });
  return await sendViaGmail(to, replyTo, subject, html);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, message } = req.body;
    log('contact_received', { name, email });

    const html = `
      <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #00695c;">رسالة جديدة من الموقع</h2>
        <p><strong>الاسم:</strong> ${name}</p>
        <p><strong>الإيميل:</strong> ${email}</p>
        <hr />
        <p><strong>الرسالة:</strong></p>
        <p>${message}</p>
      </div>
    `;

    await sendEmail(
      process.env.CONTACT_RECIPIENT || 'Elhfnaweedowidar21@gmail.com',
      email,
      `New Contact from ${name}`,
      html,
    );

    log('contact_email_sent', { name, email });
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully!',
    });
  } catch (error) {
    log('contact_email_failed', { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      detail: error.message,
    });
  }
}
