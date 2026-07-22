import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import sharp from "sharp";
import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/emailService.js";
import { shippingUpdateEmail, deliveryConfirmationEmail } from "../services/templates/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATEGORY_UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads", "categories");

async function ensureCategoryUploadDir() {
  await fs.mkdir(CATEGORY_UPLOAD_ROOT, { recursive: true });
}

// ---------- Categories ----------
export const adminCreateCategory = asyncHandler(async (req, res) => {
  const { id, name, tagline, art_type, sort_order } = req.body;
  if (!id || !name || !art_type) return res.status(400).json({ success: false, message: "id, name, art_type required" });
  await pool.query("INSERT INTO categories (id, name, tagline, art_type, sort_order) VALUES (?, ?, ?, ?, ?)", [
    id, name, tagline || null, art_type, sort_order || 0,
  ]);
  res.status(201).json({ success: true, data: { id } });
});

export const adminUpdateCategory = asyncHandler(async (req, res) => {
  const { name, tagline, art_type, sort_order, is_active } = req.body;
  await pool.query(
    "UPDATE categories SET name = COALESCE(?,name), tagline = COALESCE(?,tagline), art_type = COALESCE(?,art_type), sort_order = COALESCE(?,sort_order), is_active = COALESCE(?,is_active) WHERE id = ?",
    [name, tagline, art_type, sort_order, is_active, req.params.id]
  );
  res.json({ success: true });
});

export const adminDeleteCategory = asyncHandler(async (req, res) => {
  await pool.query("UPDATE categories SET is_active = 0 WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

export const adminUploadCategoryImage = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: "Image file is required" });
  }

  const [rows] = await pool.query("SELECT image_url FROM categories WHERE id = ?", [categoryId]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  await ensureCategoryUploadDir();

  const filename = `${categoryId}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.webp`;
  const outPath = path.join(CATEGORY_UPLOAD_ROOT, filename);

  await sharp(file.buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outPath);

  if (rows[0].image_url) {
    const previousPath = path.join(__dirname, "..", "..", rows[0].image_url.replace(/^\//, ""));
    await fs.unlink(previousPath).catch(() => {});
  }

  const imageUrl = `/uploads/categories/${filename}`;
  await pool.query("UPDATE categories SET image_url = ? WHERE id = ?", [imageUrl, categoryId]);
  res.status(201).json({ success: true, data: { image_url: imageUrl } });
});

// ---------- Hero Slides ----------
export const adminListHeroSlides = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM hero_slides ORDER BY sort_order");
  res.json({ success: true, data: rows });
});

export const adminCreateHeroSlide = asyncHandler(async (req, res) => {
  const { eyebrow, title, subtitle, cta_text, cta_link, theme, art_type, sort_order } = req.body;
  const [result] = await pool.query(
    "INSERT INTO hero_slides (eyebrow, title, subtitle, cta_text, cta_link, theme, art_type, sort_order) VALUES (?,?,?,?,?,?,?,?)",
    [eyebrow, title, subtitle, cta_text, cta_link, theme, art_type, sort_order || 0]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

export const adminUpdateHeroSlide = asyncHandler(async (req, res) => {
  const fields = ["eyebrow", "title", "subtitle", "cta_text", "cta_link", "theme", "art_type", "sort_order", "is_active"];
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ success: false, message: "No fields to update" });
  values.push(req.params.id);
  await pool.query(`UPDATE hero_slides SET ${updates.join(", ")} WHERE id = ?`, values);
  res.json({ success: true });
});

export const adminDeleteHeroSlide = asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM hero_slides WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// ---------- Testimonials ----------
export const adminListTestimonials = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM testimonials ORDER BY sort_order");
  res.json({ success: true, data: rows });
});

export const adminCreateTestimonial = asyncHandler(async (req, res) => {
  const { name, location, text_content, rating, sort_order } = req.body;
  if (!name || !text_content) return res.status(400).json({ success: false, message: "name and text_content required" });
  const [result] = await pool.query(
    "INSERT INTO testimonials (name, location, text_content, rating, sort_order) VALUES (?,?,?,?,?)",
    [name, location || null, text_content, rating || 5, sort_order || 0]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

export const adminUpdateTestimonial = asyncHandler(async (req, res) => {
  const fields = ["name", "location", "text_content", "rating", "sort_order", "is_active"];
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ success: false, message: "No fields to update" });
  values.push(req.params.id);
  await pool.query(`UPDATE testimonials SET ${updates.join(", ")} WHERE id = ?`, values);
  res.json({ success: true });
});

export const adminDeleteTestimonial = asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM testimonials WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// ---------- Coupons ----------
export const adminListCoupons = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM coupons ORDER BY created_at DESC");
  res.json({ success: true, data: rows });
});

export const adminCreateCoupon = asyncHandler(async (req, res) => {
  const { code, description, discount_type, discount_value, min_order_value, max_uses, valid_from, valid_until } = req.body;
  if (!code || !discount_value) return res.status(400).json({ success: false, message: "code and discount_value required" });
  const [result] = await pool.query(
    `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_uses, valid_from, valid_until)
     VALUES (?,?,?,?,?,?,?,?)`,
    [code.toUpperCase(), description || null, discount_type || "percent", discount_value, min_order_value || 0, max_uses || null, valid_from || null, valid_until || null]
  );
  res.status(201).json({ success: true, data: { id: result.insertId } });
});

export const adminUpdateCoupon = asyncHandler(async (req, res) => {
  const fields = ["description", "discount_type", "discount_value", "min_order_value", "max_uses", "valid_until", "is_active"];
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ success: false, message: "No fields to update" });
  values.push(req.params.id);
  await pool.query(`UPDATE coupons SET ${updates.join(", ")} WHERE id = ?`, values);
  res.json({ success: true });
});

export const adminDeleteCoupon = asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM coupons WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// ---------- Orders (admin view) ----------
export const adminListOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where = status ? "WHERE o.order_status = ?" : "";
  const params = status ? [status] : [];
  const [rows] = await pool.query(
    `SELECT o.*, u.name as customer_name, u.email as customer_email
     FROM orders o JOIN users u ON u.id = o.user_id ${where} ORDER BY o.created_at DESC`,
    params
  );
  res.json({ success: true, data: rows });
});

export const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });
  await pool.query("UPDATE orders SET order_status = ? WHERE id = ?", [status, req.params.id]);

  const [rows] = await pool.query(
    `SELECT o.order_number, u.name, u.email FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?`,
    [req.params.id]
  );
  if (rows[0]) {
    const { order_number, name, email } = rows[0];
    if (status === "delivered") {
      sendEmail({ to: email, subject: `Delivered — ${order_number}`, html: deliveryConfirmationEmail(name, order_number) }).catch(() => {});
    } else if (["shipped", "processing", "cancelled"].includes(status)) {
      sendEmail({ to: email, subject: `Order Update — ${order_number}`, html: shippingUpdateEmail(name, order_number, status) }).catch(() => {});
    }
  }

  res.json({ success: true });
});
