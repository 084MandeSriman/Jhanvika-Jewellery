import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/emailService.js";
import { contactAckEmail, newsletterEmail } from "../services/templates/index.js";

// POST /api/contact  { name, email, message }
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "name, email and message are required" });
  }
  await pool.query("INSERT INTO contact_enquiries (name, email, message) VALUES (?, ?, ?)", [name, email, message]);
  await sendEmail({ to: email, subject: "We've received your message", html: contactAckEmail(name) });
  res.status(201).json({ success: true, message: "Thank you — we'll be in touch within 24 hours." });
});

// POST /api/newsletter  { email }
export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "email is required" });
  await pool.query("INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)", [email]);
  await sendEmail({ to: email, subject: "You're subscribed!", html: newsletterEmail() });
  res.status(201).json({ success: true, message: "Subscribed successfully" });
});
