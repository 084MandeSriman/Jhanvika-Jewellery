import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/admin/login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query("SELECT * FROM admin_users WHERE email = ? AND is_active = 1", [email]);
  if (rows.length === 0) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const admin = rows[0];
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name, role: "admin", adminRole: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({ success: true, data: { admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }, token } });
});

// GET /api/admin/dashboard
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [[productCount]] = await pool.query("SELECT COUNT(*) as c FROM products WHERE is_active = 1");
  const [[orderCount]] = await pool.query("SELECT COUNT(*) as c FROM orders");
  const [[userCount]] = await pool.query("SELECT COUNT(*) as c FROM users");
  const [[revenue]] = await pool.query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE order_status != 'cancelled'");
  const [recentOrders] = await pool.query("SELECT id, order_number, total_amount, order_status, created_at FROM orders ORDER BY created_at DESC LIMIT 5");
  const [lowStock] = await pool.query("SELECT id, name, stock_qty FROM products WHERE stock_qty < 10 AND is_active = 1 ORDER BY stock_qty ASC LIMIT 5");

  res.json({
    success: true,
    data: {
      products: productCount.c,
      orders: orderCount.c,
      users: userCount.c,
      revenue: Number(revenue.total),
      recentOrders,
      lowStock,
    },
  });
});
