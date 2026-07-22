import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_TYPES = ["try_at_home", "appointment", "video_shopping", "custom_jewellery", "engraving", "repair", "gold_exchange", "insurance"];

// POST /api/services/request
export const createServiceRequest = asyncHandler(async (req, res) => {
  const { serviceType, productId, fullName, phone, email, preferredDate, preferredTime, notes } = req.body;
  if (!VALID_TYPES.includes(serviceType) || !fullName || !phone) {
    return res.status(400).json({ success: false, message: "serviceType, fullName and phone are required" });
  }
  const [result] = await pool.query(
    `INSERT INTO service_requests (user_id, service_type, product_id, full_name, phone, email, preferred_date, preferred_time, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user?.id || null, serviceType, productId || null, fullName, phone, email || null, preferredDate || null, preferredTime || null, notes || null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

// GET /api/admin/service-requests
export const adminListServiceRequests = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM service_requests ORDER BY created_at DESC");
  res.json({ success: true, data: rows });
});

// PATCH /api/admin/service-requests/:id  { status }
export const adminUpdateServiceRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ["new", "contacted", "scheduled", "completed", "cancelled"];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });
  await pool.query("UPDATE service_requests SET status = ? WHERE id = ?", [status, req.params.id]);
  res.json({ success: true });
});
