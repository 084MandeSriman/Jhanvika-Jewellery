import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/admin/inventory/purchase  { productId, quantity, costPrice, supplierName, invoiceRef }
export const recordPurchase = asyncHandler(async (req, res) => {
  const { productId, quantity, costPrice, supplierName, invoiceRef } = req.body;
  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ success: false, message: "productId and a positive quantity are required" });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      "INSERT INTO purchase_entries (product_id, quantity, cost_price, supplier_name, invoice_ref, admin_id) VALUES (?, ?, ?, ?, ?, ?)",
      [productId, quantity, costPrice || null, supplierName || null, invoiceRef || null, req.user.id]
    );
    await conn.query("UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?", [quantity, productId]);
    await conn.query("INSERT INTO stock_history (product_id, change_qty, reason, admin_id) VALUES (?, ?, 'purchase_entry', ?)", [
      productId,
      quantity,
      req.user.id,
    ]);
    await conn.commit();
    res.status(201).json({ success: true });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// POST /api/admin/inventory/adjust  { productId, changeQty, reason }  — manual correction (+/-)
export const adjustStock = asyncHandler(async (req, res) => {
  const { productId, changeQty, reason } = req.body;
  if (!productId || !changeQty) return res.status(400).json({ success: false, message: "productId and changeQty are required" });

  await pool.query("UPDATE products SET stock_qty = GREATEST(0, stock_qty + ?) WHERE id = ?", [changeQty, productId]);
  await pool.query("INSERT INTO stock_history (product_id, change_qty, reason, admin_id) VALUES (?, ?, ?, ?)", [
    productId,
    changeQty,
    reason || "manual_adjustment",
    req.user.id,
  ]);
  res.json({ success: true });
});

// PATCH /api/admin/inventory/bulk  { updates: [{ productId, stockQty }] }
export const bulkUpdateStock = asyncHandler(async (req, res) => {
  const { updates } = req.body;
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ success: false, message: "updates array is required" });
  }
  for (const u of updates) {
    await pool.query("UPDATE products SET stock_qty = ? WHERE id = ?", [u.stockQty, u.productId]);
    await pool.query("INSERT INTO stock_history (product_id, change_qty, reason, admin_id) VALUES (?, 0, 'bulk_update', ?)", [
      u.productId,
      req.user.id,
    ]);
  }
  res.json({ success: true, data: { updated: updates.length } });
});

// GET /api/admin/inventory/low-stock?threshold=10
export const lowStock = asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold) || 10;
  const [rows] = await pool.query(
    "SELECT id, name, stock_qty FROM products WHERE stock_qty < ? AND is_active = 1 ORDER BY stock_qty ASC",
    [threshold]
  );
  res.json({ success: true, data: rows });
});

// GET /api/admin/inventory/out-of-stock
export const outOfStock = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT id, name FROM products WHERE stock_qty = 0 AND is_active = 1");
  res.json({ success: true, data: rows });
});

// GET /api/admin/inventory/history/:productId
export const stockHistory = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT sh.*, a.name as admin_name FROM stock_history sh LEFT JOIN admin_users a ON a.id = sh.admin_id
     WHERE sh.product_id = ? ORDER BY sh.created_at DESC LIMIT 50`,
    [req.params.productId]
  );
  res.json({ success: true, data: rows });
});
