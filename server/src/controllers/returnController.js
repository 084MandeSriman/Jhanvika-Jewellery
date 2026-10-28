import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/returns  { orderItemId, reason }
export const requestReturn = asyncHandler(async (req, res) => {
  const { orderItemId, reason } = req.body;
  const [rows] = await pool.query(
    `SELECT oi.id, o.order_status
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.id = ? AND o.user_id = ?`,
    [orderItemId, req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ success: false, message: "Order item not found" });

  if (rows[0].order_status !== "delivered") {
    return res.status(400).json({ success: false, message: "Returns can only be requested for delivered orders" });
  }
  if (typeof reason !== "string" || !reason.trim() || reason.trim().length > 255) {
    return res.status(400).json({ success: false, message: "Please provide a return reason of up to 255 characters" });
  }

  const [existing] = await pool.query(
    "SELECT id FROM return_requests WHERE order_item_id = ? LIMIT 1",
    [orderItemId]
  );
  if (existing.length > 0) {
    return res.status(409).json({ success: false, message: "A return request already exists for this item" });
  }

  const [result] = await pool.query(
    "INSERT INTO return_requests (order_item_id, reason) VALUES (?, ?)",
    [orderItemId, reason.trim()]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

// GET /api/returns (customer's own)
export const listMyReturns = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT rr.*, oi.product_id, oi.product_name, oi.unit_price, oi.quantity,
            o.id AS order_id, o.order_number, p.theme, c.art_type AS category_type,
            (SELECT image_url FROM product_images pi
             WHERE pi.product_id = oi.product_id
             ORDER BY pi.is_primary DESC, pi.sort_order ASC
             LIMIT 1) AS product_image
     FROM return_requests rr
     JOIN order_items oi ON oi.id = rr.order_item_id
     JOIN orders o ON o.id = oi.order_id
     LEFT JOIN products p ON p.id = oi.product_id
     LEFT JOIN categories c ON c.id = p.category_id
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
