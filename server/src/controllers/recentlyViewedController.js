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
    `SELECT p.*, c.art_type,
       (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) as primary_image
     FROM recently_viewed rv
     JOIN products p ON p.id = rv.product_id JOIN categories c ON c.id = p.category_id
     WHERE rv.user_id = ? ORDER BY rv.viewed_at DESC LIMIT 12`,
    [req.user.id]
  );
  res.json({
    success: true,
    data: rows.map((r) => ({
      id: r.id, name: r.name, category: r.category_id, categoryType: r.art_type,
      image: r.primary_image || null, gemstone: r.gemstone, badge: r.badge || undefined,
      price: Number(r.price), mrp: Number(r.mrp), stockQty: Number(r.stock_qty ?? 0),
      theme: r.theme, rating: Number(r.rating), reviews: r.review_count,
    })),
  });
});
