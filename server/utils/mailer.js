const nodemailer = require('nodemailer');

let cachedTransporter;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  const host = process.env.MAIL_HOST || undefined;
  const port = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : undefined;
  const secure = process.env.MAIL_SECURE === 'true' ? true : false;

  if (process.env.MAIL_SERVICE === 'gmail' || (!host && !port)) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  } else {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }
  return cachedTransporter;
}

async function sendMail({ to, subject, text, html }) {
  const transporter = getTransporter();
  const from = process.env.MAIL_FROM || process.env.MAIL_USER;
  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
}

async function sendOtpEmail(to, otp) {
  const subject = 'Your Witex OTP Code';
  const text = `Your OTP code is ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`;
  const html = `<p>Your OTP code is <strong>${otp}</strong>.</p><p>This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>`;
  return sendMail({ to, subject, text, html });
}

module.exports = { sendMail, sendOtpEmail };
