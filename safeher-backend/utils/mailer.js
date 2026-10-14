// Sends email with SMTP (e.g. Gmail App Password). If SMTP is not configured
// (local dev) the message is printed to the console instead.
let transporter = null;

function getTransporter() {
  if (transporter !== null) return transporter || null;
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) { transporter = false; return null; }
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: (process.env.SMTP_PORT || '465') === '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  } catch (e) {
    console.warn('nodemailer not installed; run `npm install` in safeher-backend.');
    transporter = false;
  }
  return transporter || null;
}

async function sendMail(to, subject, text) {
  const t = getTransporter();
  if (!t) {
    console.log(`\n[DEV MAIL] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return { sent: false, dev: true };
  }
  await t.sendMail({ from: process.env.MAIL_FROM || `SafeHer <${process.env.SMTP_USER}>`, to, subject, text });
  return { sent: true };
}

module.exports = sendMail;
