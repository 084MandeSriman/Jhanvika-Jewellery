import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/addresses
export const listAddresses = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC", [req.user.id]);
  res.json({ success: true, data: rows });
});

// POST /api/addresses
export const createAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, line1, line2, city, state, pincode, isDefault } = req.body;
  if (!fullName || !phone || !line1 || !city || !state || !pincode) {
    return res.status(400).json({ success: false, message: "Missing required address fields" });
  }
  if (isDefault) {
    await pool.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [req.user.id]);
  }
  const [result] = await pool.query(
    `INSERT INTO addresses (user_id, full_name, phone, line1, line2, city, state, pincode, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, fullName, phone, line1, line2 || null, city, state, pincode, isDefault ? 1 : 0]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

// DELETE /api/addresses/:id
export const deleteAddress = asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM addresses WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  res.json({ success: true });
});
