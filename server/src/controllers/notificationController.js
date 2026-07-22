import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/notifications
export const listNotifications = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30", [req.user.id]);
  res.json({ success: true, data: rows });
});

// PATCH /api/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res) => {
  await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  res.json({ success: true });
});

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await pool.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.user.id]);
  res.json({ success: true });
});
