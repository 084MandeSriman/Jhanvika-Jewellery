import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/coupons/validate  { code, subtotal }
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal = 0 } = req.body;
  const [rows] = await pool.query(
    "SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (valid_until IS NULL OR valid_until >= CURDATE())",
    [code]
  );
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: "Invalid or expired coupon" });
  }
  const c = rows[0];
  if (Number(subtotal) < Number(c.min_order_value)) {
    return res.status(400).json({ success: false, message: `Minimum order value ₹${c.min_order_value} required` });
  }
  const discount = c.discount_type === "percent" ? Math.round(subtotal * (Number(c.discount_value) / 100)) : Number(c.discount_value);
  res.json({ success: true, data: { code: c.code, discountType: c.discount_type, discountValue: Number(c.discount_value), discount } });
});
