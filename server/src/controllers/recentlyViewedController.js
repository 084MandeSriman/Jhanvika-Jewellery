import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/recently-viewed  { productId }
export const trackView = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  await pool.query(
    `INSERT INTO recently_viewed (user_id, product_id) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE viewed_at = NOW()`,
    [req.user.id, productId]
  );
  res.status(201).json({ success: true });
});

// GET /api/recently-viewed
export const listRecentlyViewed = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.art_type FROM recently_viewed rv
     JOIN products p ON p.id = rv.product_id JOIN categories c ON c.id = p.category_id
     WHERE rv.user_id = ? ORDER BY rv.viewed_at DESC LIMIT 12`,
    [req.user.id]
  );
  res.json({
    success: true,
    data: rows.map((r) => ({
      id: r.id, name: r.name, category: r.category_id, categoryType: r.art_type,
      price: Number(r.price), mrp: Number(r.mrp), theme: r.theme, rating: Number(r.rating), reviews: r.review_count,
    })),
  });
});
