import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function recomputeRating(productId) {
  const [[agg]] = await pool.query(
    "SELECT COUNT(*) as cnt, COALESCE(AVG(rating),0) as avgRating FROM reviews WHERE product_id = ? AND moderation_status = 'approved'",
    [productId]
  );
  await pool.query("UPDATE products SET rating = ?, review_count = ? WHERE id = ?", [
    Number(agg.avgRating).toFixed(1),
    agg.cnt,
    productId,
  ]);
}

// GET /api/products/:id/reviews  — approved reviews + rating summary
export const listProductReviews = asyncHandler(async (req, res) => {
  const [reviews] = await pool.query(
    `SELECT r.id, r.rating, r.title, r.comment, r.created_at, u.name as user_name
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ? AND r.moderation_status = 'approved'
     ORDER BY r.created_at DESC`,
    [req.params.id]
  );
  const ids = reviews.map((r) => r.id);
  const [images] = ids.length
    ? await pool.query(`SELECT * FROM review_images WHERE review_id IN (${ids.map(() => "?").join(",")})`, ids)
    : [[]];

  const [[summary]] = await pool.query(
    `SELECT COUNT(*) as total, COALESCE(AVG(rating),0) as average,
       SUM(rating=5) as five, SUM(rating=4) as four, SUM(rating=3) as three, SUM(rating=2) as two, SUM(rating=1) as one
     FROM reviews WHERE product_id = ? AND moderation_status = 'approved'`,
    [req.params.id]
  );

  res.json({
    success: true,
    data: {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        userName: r.user_name,
        createdAt: r.created_at,
        images: images.filter((i) => i.review_id === r.id).map((i) => i.image_url),
      })),
      summary: {
        total: summary.total,
        average: Number(summary.average).toFixed(1),
        breakdown: { 5: summary.five, 4: summary.four, 3: summary.three, 2: summary.two, 1: summary.one },
      },
    },
  });
});

// POST /api/products/:id/reviews  { rating, title, comment, images: [urls] }
export const createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, images = [] } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be 1-5" });

  const [existing] = await pool.query("SELECT id FROM reviews WHERE product_id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (existing.length) return res.status(409).json({ success: false, message: "You've already reviewed this product. Edit your existing review instead." });

  const [result] = await pool.query(
    "INSERT INTO reviews (product_id, user_id, rating, title, comment, moderation_status) VALUES (?, ?, ?, ?, ?, 'pending')",
    [req.params.id, req.user.id, rating, title || null, comment || null]
  );
  for (const url of images) {
    await pool.query("INSERT INTO review_images (review_id, image_url) VALUES (?, ?)", [result.insertId, url]);
  }
  res.status(201).json({ success: true, data: { id: result.insertId }, message: "Review submitted and pending approval" });
});

// PATCH /api/reviews/:reviewId  (owner only)
export const updateReview = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM reviews WHERE id = ? AND user_id = ?", [req.params.reviewId, req.user.id]);
  if (rows.length === 0) return res.status(404).json({ success: false, message: "Review not found" });

  const { rating, title, comment } = req.body;
  await pool.query(
    "UPDATE reviews SET rating = COALESCE(?,rating), title = COALESCE(?,title), comment = COALESCE(?,comment), moderation_status = 'pending' WHERE id = ?",
    [rating, title, comment, req.params.reviewId]
  );
  await recomputeRating(rows[0].product_id);
  res.json({ success: true, message: "Review updated and pending re-approval" });
});

// DELETE /api/reviews/:reviewId (owner only)
export const deleteReview = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT product_id FROM reviews WHERE id = ? AND user_id = ?", [req.params.reviewId, req.user.id]);
  if (rows.length === 0) return res.status(404).json({ success: false, message: "Review not found" });
  await pool.query("DELETE FROM reviews WHERE id = ?", [req.params.reviewId]);
  await recomputeRating(rows[0].product_id);
  res.json({ success: true });
});

// ---------- Admin moderation ----------

// GET /api/admin/reviews?status=pending
export const adminListReviews = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where = status ? "WHERE r.moderation_status = ?" : "";
  const params = status ? [status] : [];
  const [rows] = await pool.query(
    `SELECT r.*, u.name as user_name, p.name as product_name
     FROM reviews r JOIN users u ON u.id = r.user_id JOIN products p ON p.id = r.product_id
     ${where} ORDER BY r.created_at DESC`,
    params
  );
  res.json({ success: true, data: rows });
});

// PATCH /api/admin/reviews/:reviewId/moderate  { status: 'approved'|'rejected', adminNote }
export const adminModerateReview = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  if (!["approved", "rejected"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

  const [rows] = await pool.query("SELECT product_id FROM reviews WHERE id = ?", [req.params.reviewId]);
  if (rows.length === 0) return res.status(404).json({ success: false, message: "Review not found" });

  await pool.query("UPDATE reviews SET moderation_status = ?, admin_note = ? WHERE id = ?", [status, adminNote || null, req.params.reviewId]);
  await recomputeRating(rows[0].product_id);
  res.json({ success: true });
});
