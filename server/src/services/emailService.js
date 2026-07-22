import nodemailer from "nodemailer";

// In development (no SMTP_HOST configured), emails are captured with the
// "jsonTransport" so nothing actually goes out — the full rendered email is
// logged to the console instead. This makes every email flow fully testable
// without needing a real mailbox. Set SMTP_HOST/PORT/USER/PASS in .env to
// switch to a real provider (Gmail SMTP, SendGrid, SES, Mailgun, etc.) with
// zero code changes.
function buildTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  // Dev fallback: renders the email and returns it as JSON instead of sending.
  return nodemailer.createTransport({ jsonTransport: true });
}

const transport = buildTransport();
const FROM = process.env.EMAIL_FROM || '"Jhanvika Jewelleries" <no-reply@jhanvikajewelleries.in>';

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transport.sendMail({ from: FROM, to, subject, html });
    if (!process.env.SMTP_HOST) {
      // Dev mode: log what would have been sent so the flow is verifiable end-to-end.
      console.log(`\n📧 [DEV EMAIL] To: ${to} | Subject: ${subject}`);
      console.log(`   (SMTP not configured — email captured, not sent. Set SMTP_HOST in .env to send for real.)`);
    }
    return info;
  } catch (err) {
    console.error("Email send failed:", err.message);
    // Never let an email failure break the calling request (e.g. order placement)
    return null;
  }
}
