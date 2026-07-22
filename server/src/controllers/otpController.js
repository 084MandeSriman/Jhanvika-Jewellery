import crypto from "crypto";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/emailService.js";
import { sendSMS } from "../services/smsService.js";
import { otpEmail } from "../services/templates/index.js";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

// POST /api/otp/send  { identifier, channel: 'email'|'sms', purpose }
export const sendOtp = asyncHandler(async (req, res) => {
  const { identifier, channel, purpose } = req.body;
  if (!identifier || !["email", "sms"].includes(channel) || !["registration", "login", "password_reset"].includes(purpose)) {
    return res.status(400).json({ success: false, message: "identifier, valid channel, and purpose are required" });
  }

  const otp = generateOtp();
  const codeHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await pool.query(
    "INSERT INTO otp_codes (identifier, channel, purpose, code_hash, expires_at) VALUES (?, ?, ?, ?, ?)",
    [identifier, channel, purpose, codeHash, expiresAt]
  );

  if (channel === "email") {
    await sendEmail({ to: identifier, subject: "Your Jhanvika OTP", html: otpEmail(null, otp, purpose) });
  } else {
    await sendSMS(identifier, `Your Jhanvika Jewelleries OTP is ${otp}. Valid for ${OTP_TTL_MINUTES} minutes.`);
  }

  // In dev mode (no real email/SMS provider configured) we also return the OTP
  // in the response so the flow can be tested/demoed without reading server logs.
  const devMode = channel === "email" ? !process.env.SMTP_HOST : process.env.SMS_PROVIDER !== "twilio";
  res.json({ success: true, message: `OTP sent via ${channel}`, ...(devMode ? { devOtp: otp } : {}) });
});

// POST /api/otp/verify  { identifier, purpose, code }
export const verifyOtp = asyncHandler(async (req, res) => {
  const { identifier, purpose, code } = req.body;
  const [rows] = await pool.query(
    "SELECT * FROM otp_codes WHERE identifier = ? AND purpose = ? AND consumed = 0 ORDER BY created_at DESC LIMIT 1",
    [identifier, purpose]
  );
  if (rows.length === 0) {
    return res.status(400).json({ success: false, message: "No pending OTP found. Please request a new one." });
  }

  const record = rows[0];
  if (new Date(record.expires_at) < new Date()) {
    return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return res.status(429).json({ success: false, message: "Too many attempts. Please request a new OTP." });
  }

  const valid = await bcrypt.compare(code, record.code_hash);
  if (!valid) {
    await pool.query("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?", [record.id]);
    return res.status(400).json({ success: false, message: "Incorrect OTP" });
  }

  await pool.query("UPDATE otp_codes SET consumed = 1 WHERE id = ?", [record.id]);

  if (purpose === "registration") {
    const column = record.channel === "email" ? "email_verified_at" : "phone_verified_at";
    const whereColumn = record.channel === "email" ? "email" : "phone";
    await pool.query(`UPDATE users SET ${column} = NOW() WHERE ${whereColumn} = ?`, [identifier]);
  }

  res.json({ success: true, message: "OTP verified" });
});
