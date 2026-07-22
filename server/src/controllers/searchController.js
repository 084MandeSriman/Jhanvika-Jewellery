import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/search/autocomplete?q=kun  — fast name-prefix suggestions
export const autocomplete = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, data: [] });
  const [rows] = await pool.query(
    "SELECT id, name, theme, category_id FROM products WHERE name LIKE ? AND is_active = 1 LIMIT 8",
    [`%${q}%`]
  );
  res.json({ success: true, data: rows.map((r) => ({ id: r.id, name: r.name, category: r.category_id })) });
});

// GET /api/search/trending — most searched terms in the last 30 days
export const trendingSearches = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT query, COUNT(*) as count FROM search_queries
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY query ORDER BY count DESC LIMIT 8`
  );
  res.json({ success: true, data: rows.map((r) => r.query) });
});

// GET /api/search/popular-products — best-selling products by order volume
export const popularProducts = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.theme, SUM(oi.quantity) as sold
     FROM order_items oi JOIN products p ON p.id = oi.product_id
     GROUP BY p.id ORDER BY sold DESC LIMIT 8`
  );
  res.json({ success: true, data: rows });
});

// GET /api/search/history  (logged in) — user's last 10 searches
export const searchHistory = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT DISTINCT query FROM search_queries WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
    [req.user.id]
  );
  res.json({ success: true, data: rows.map((r) => r.query) });
});

// POST /api/search/track  { query, resultCount }  — called by the frontend after a search
export const trackSearch = asyncHandler(async (req, res) => {
  const { query, resultCount = 0 } = req.body;
  if (!query) return res.status(400).json({ success: false, message: "query is required" });
  await pool.query("INSERT INTO search_queries (user_id, query, result_count) VALUES (?, ?, ?)", [
    req.user?.id || null,
    query,
    resultCount,
  ]);
  res.status(201).json({ success: true });
});
