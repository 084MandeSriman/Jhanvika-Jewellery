import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/returns  { orderItemId, reason }
export const requestReturn = asyncHandler(async (req, res) => {
  const { orderItemId, reason } = req.body;
  const [rows] = await pool.query(
    `SELECT oi.id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.id = ? AND o.user_id = ?`,
    [orderItemId, req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ success: false, message: "Order item not found" });

  const [result] = await pool.query("INSERT INTO return_requests (order_item_id, reason) VALUES (?, ?)", [orderItemId, reason || null]);
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

// GET /api/returns (customer's own)
export const listMyReturns = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT rr.*, oi.product_name, o.order_number FROM return_requests rr
     JOIN order_items oi ON oi.id = rr.order_item_id JOIN orders o ON o.id = oi.order_id
     WHERE o.user_id = ? ORDER BY rr.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

// GET /api/admin/returns
export const adminListReturns = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT rr.*, oi.product_name, o.order_number, u.name as customer_name FROM return_requests rr
     JOIN order_items oi ON oi.id = rr.order_item_id JOIN orders o ON o.id = oi.order_id JOIN users u ON u.id = o.user_id
     ORDER BY rr.created_at DESC`
  );
  res.json({ success: true, data: rows });
});

// PATCH /api/admin/returns/:id  { status }
export const adminUpdateReturn = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ["requested", "approved", "rejected", "completed"];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });
  await pool.query("UPDATE return_requests SET status = ? WHERE id = ?", [status, req.params.id]);
  res.json({ success: true });
});
