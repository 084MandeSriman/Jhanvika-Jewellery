import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.* FROM wishlist_items w JOIN products p ON p.id = w.product_id WHERE w.user_id = ?`,
    [req.user.id]
  );
  res.json({ success: true, data: rows.map((r) => r.id) });
});

// POST /api/wishlist  { productId }
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  await pool.query(
    `INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)`,
    [req.user.id, productId]
  );
  res.status(201).json({ success: true });
});

// DELETE /api/wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  await pool.query(`DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?`, [
    req.user.id,
    req.params.productId,
  ]);
  res.json({ success: true });
});

// GET /api/wishlist/share — returns a shareable public link identifier (the user's id,
// base64-encoded so it isn't a bare sequential integer in the URL)
export const getShareLink = asyncHandler(async (req, res) => {
  const token = Buffer.from(`u${req.user.id}`).toString("base64url");
  res.json({ success: true, data: { token } });
});

// GET /api/wishlist/public/:token — public, no auth required
export const getPublicWishlist = asyncHandler(async (req, res) => {
  let userId;
  try {
    const decoded = Buffer.from(req.params.token, "base64url").toString("utf-8");
    userId = Number(decoded.replace(/^u/, ""));
  } catch {
    return res.status(400).json({ success: false, message: "Invalid share link" });
  }
  if (!userId) return res.status(400).json({ success: false, message: "Invalid share link" });

  const [rows] = await pool.query(
    `SELECT p.*, c.art_type, u.name as owner_name FROM wishlist_items w
     JOIN products p ON p.id = w.product_id JOIN categories c ON c.id = p.category_id
     JOIN users u ON u.id = w.user_id WHERE w.user_id = ?`,
    [userId]
  );
  res.json({
    success: true,
    data: {
      ownerName: rows[0]?.owner_name || "A Jhanvika customer",
      products: rows.map((r) => ({
        id: r.id, name: r.name, category: r.category_id, categoryType: r.art_type,
        price: Number(r.price), mrp: Number(r.mrp), theme: r.theme, rating: Number(r.rating), reviews: r.review_count,
      })),
    },
  });
});
