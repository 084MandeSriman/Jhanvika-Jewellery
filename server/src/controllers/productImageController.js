import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import sharp from "sharp";
import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads", "products");

async function ensureDir() {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });
}

// POST /api/admin/products/:id/images  (multipart/form-data, field name "images", up to 8)
// Compresses every upload and converts it to WebP for fast page loads.
export const uploadProductImages = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No images uploaded" });
  }

  await ensureDir();

  const [[{ maxOrder }]] = await pool.query(
    "SELECT COALESCE(MAX(sort_order), -1) as maxOrder FROM product_images WHERE product_id = ?",
    [productId]
  );
  const [[{ hasPrimary }]] = await pool.query(
    "SELECT COUNT(*) as hasPrimary FROM product_images WHERE product_id = ? AND is_primary = 1",
    [productId]
  );

  const saved = [];
  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const filename = `${productId}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.webp`;
    const outPath = path.join(UPLOAD_ROOT, filename);

    // Resize to a sensible max dimension and convert to WebP for compression + modern format support
    await sharp(file.buffer)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);

    const isPrimary = hasPrimary === 0 && i === 0 ? 1 : 0;
    const sortOrder = maxOrder + 1 + i;
    const imageUrl = `/uploads/products/${filename}`;

    const [result] = await pool.query(
      "INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)",
      [productId, imageUrl, req.body.altText || null, sortOrder, isPrimary]
    );
    saved.push({ id: result.insertId, imageUrl, sortOrder, isPrimary: !!isPrimary });
  }

  res.status(201).json({ success: true, data: saved });
});

// GET /api/products/:id/images (public)
export const listProductImages = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, image_url, alt_text, sort_order, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order",
    [req.params.id]
  );
  res.json({ success: true, data: rows });
});

// PATCH /api/admin/products/:id/images/reorder  { order: [imageId, imageId, ...] }
export const reorderProductImages = asyncHandler(async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ success: false, message: "order array is required" });
  for (let i = 0; i < order.length; i++) {
    await pool.query("UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?", [i, order[i], req.params.id]);
  }
  res.json({ success: true });
});

// PATCH /api/admin/products/:id/images/:imageId/primary
export const setPrimaryImage = asyncHandler(async (req, res) => {
  await pool.query("UPDATE product_images SET is_primary = 0 WHERE product_id = ?", [req.params.id]);
  await pool.query("UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?", [req.params.imageId, req.params.id]);
  res.json({ success: true });
});

// DELETE /api/admin/products/:id/images/:imageId
export const deleteProductImage = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT image_url FROM product_images WHERE id = ? AND product_id = ?", [
    req.params.imageId,
    req.params.id,
  ]);
  if (rows.length) {
    const filePath = path.join(__dirname, "..", "..", rows[0].image_url.replace(/^\//, ""));
    await fs.unlink(filePath).catch(() => {}); // ignore if file already missing
  }
  await pool.query("DELETE FROM product_images WHERE id = ? AND product_id = ?", [req.params.imageId, req.params.id]);
  res.json({ success: true });
});
