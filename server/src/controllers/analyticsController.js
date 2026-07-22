import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/admin/analytics/revenue?days=30
export const revenueOverTime = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;
  const [rows] = await pool.query(
    `SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
     FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND order_status != 'cancelled'
     GROUP BY DATE(created_at) ORDER BY date`,
    [days]
  );
  res.json({ success: true, data: rows.map((r) => ({ date: r.date, revenue: Number(r.revenue), orders: r.orders })) });
});

// GET /api/admin/analytics/best-sellers?limit=10
export const bestSellers = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.theme, SUM(oi.quantity) as unitsSold, SUM(oi.quantity * oi.unit_price) as revenue
     FROM order_items oi JOIN products p ON p.id = oi.product_id
     GROUP BY p.id ORDER BY unitsSold DESC LIMIT ?`,
    [limit]
  );
  res.json({ success: true, data: rows.map((r) => ({ ...r, revenue: Number(r.revenue) })) });
});

// GET /api/admin/analytics/top-categories
export const topCategories = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.name, SUM(oi.quantity) as unitsSold, SUM(oi.quantity * oi.unit_price) as revenue
     FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN categories c ON c.id = p.category_id
     GROUP BY c.id ORDER BY revenue DESC`
  );
  res.json({ success: true, data: rows.map((r) => ({ ...r, revenue: Number(r.revenue) })) });
});

// GET /api/admin/analytics/monthly?months=6
export const monthlyChart = asyncHandler(async (req, res) => {
  const months = Number(req.query.months) || 6;
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_amount) as revenue, COUNT(*) as orders
     FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) AND order_status != 'cancelled'
     GROUP BY month ORDER BY month`,
    [months]
  );
  res.json({ success: true, data: rows.map((r) => ({ month: r.month, revenue: Number(r.revenue), orders: r.orders })) });
});

// GET /api/admin/analytics/summary — revenue, profit estimate, taxes, customer counts
export const analyticsSummary = asyncHandler(async (req, res) => {
  const [[revenue]] = await pool.query("SELECT COALESCE(SUM(total_amount),0) as total, COALESCE(SUM(tax_amount),0) as tax FROM orders WHERE order_status != 'cancelled'");
  const [[cost]] = await pool.query(
    `SELECT COALESCE(SUM(oi.quantity * pe.cost_price),0) as totalCost
     FROM order_items oi
     LEFT JOIN (SELECT product_id, AVG(cost_price) as cost_price FROM purchase_entries GROUP BY product_id) pe ON pe.product_id = oi.product_id`
  );
  const [[customers]] = await pool.query("SELECT COUNT(*) as total FROM users");
  const [[newCustomers]] = await pool.query("SELECT COUNT(*) as total FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
  const [[repeatCustomers]] = await pool.query(
    "SELECT COUNT(*) as total FROM (SELECT user_id FROM orders GROUP BY user_id HAVING COUNT(*) > 1) t"
  );

  res.json({
    success: true,
    data: {
      totalRevenue: Number(revenue.total),
      totalTax: Number(revenue.tax),
      estimatedCost: Number(cost.totalCost) || 0,
      estimatedProfit: Number(revenue.total) - (Number(cost.totalCost) || 0),
      totalCustomers: customers.total,
      newCustomers30d: newCustomers.total,
      repeatCustomers: repeatCustomers.total,
    },
  });
});
