import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/emailService.js";
import { welcomeEmail } from "../services/templates/index.js";

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email and password are required" });
  }

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length > 0) {
    return res.status(409).json({ success: false, message: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
    [name, email, phone || null, passwordHash]
  );

  const user = { id: result.insertId, name, email };
  const token = signToken(user);
  sendEmail({ to: email, subject: "Welcome to Jhanvika Jewelleries", html: welcomeEmail(name) }).catch(() => {});
  res.status(201).json({ success: true, data: { user, token } });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  await pool.query("INSERT INTO login_history (user_id, ip_address, user_agent) VALUES (?, ?, ?)", [
    user.id,
    req.ip,
    req.headers["user-agent"] || null,
  ]);

  const token = signToken(user);
  res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email }, token } });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT id, name, email, phone, created_at FROM users WHERE id = ?", [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: rows[0] });
});

// POST /api/auth/forgot-password  { email }  — sends an OTP via the shared otp system
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const [rows] = await pool.query("SELECT id, name FROM users WHERE email = ?", [email]);
  // Always return success (don't leak whether an email is registered)
  if (rows.length === 0) {
    return res.json({ success: true, message: "If that email is registered, a reset code has been sent." });
  }
  const crypto = await import("crypto");
  const otp = String(crypto.randomInt(100000, 999999));
  const codeHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await pool.query(
    "INSERT INTO otp_codes (identifier, channel, purpose, code_hash, expires_at) VALUES (?, 'email', 'password_reset', ?, ?)",
    [email, codeHash, expiresAt]
  );
  const { forgotPasswordEmail } = await import("../services/templates/index.js");
  await sendEmail({ to: email, subject: "Reset Your Password", html: forgotPasswordEmail(rows[0].name, otp) });
  const devMode = !process.env.SMTP_HOST;
  res.json({ success: true, message: "If that email is registered, a reset code has been sent.", ...(devMode ? { devOtp: otp } : {}) });
});

// POST /api/auth/reset-password  { email, code, newPassword } — verifies the OTP then updates the password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }
  const [rows] = await pool.query(
    "SELECT * FROM otp_codes WHERE identifier = ? AND purpose = 'password_reset' AND consumed = 0 ORDER BY created_at DESC LIMIT 1",
    [email]
  );
  if (rows.length === 0 || new Date(rows[0].expires_at) < new Date()) {
    return res.status(400).json({ success: false, message: "Reset code is invalid or expired" });
  }
  const valid = await bcrypt.compare(code, rows[0].code_hash);
  if (!valid) return res.status(400).json({ success: false, message: "Incorrect reset code" });

  await pool.query("UPDATE otp_codes SET consumed = 1 WHERE id = ?", [rows[0].id]);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE users SET password_hash = ? WHERE email = ?", [passwordHash, email]);
  res.json({ success: true, message: "Password updated successfully" });
});
