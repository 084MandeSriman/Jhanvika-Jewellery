import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// GET /api/admin/products  (includes inactive, for management)
export const adminListProducts = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name as category_name,
       (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) as primary_image
     FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.created_at DESC`
  );
  res.json({ success: true, data: rows });
});

// POST /api/admin/products
export const adminCreateProduct = asyncHandler(async (req, res) => {
  const {
    id, name, category_id, metal, gemstone, theme, price, mrp, badge, description, stock_qty, details,
    sku, hsn_code, gold_purity, gold_weight, net_weight, gross_weight, diamond_weight, diamond_clarity,
    diamond_color, stone_weight, hallmark_number, bis_hallmark, certificate_number, making_charges,
    gst_percent, size_type, available_sizes,
  } = req.body;
  if (!id || !name || !category_id || !theme || !price || !mrp) {
    return res.status(400).json({ success: false, message: "Missing required product fields" });
  }
  await pool.query(
    `INSERT INTO products
      (id, name, slug, category_id, metal, gemstone, theme, price, mrp, badge, description, stock_qty,
       sku, hsn_code, gold_purity, gold_weight, net_weight, gross_weight, diamond_weight, diamond_clarity,
       diamond_color, stone_weight, hallmark_number, bis_hallmark, certificate_number, making_charges,
       gst_percent, size_type, available_sizes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, name, slugify(name), category_id, metal || null, gemstone || null, theme, price, mrp, badge || null, description || null, stock_qty ?? 100,
      sku || null, hsn_code || null, gold_purity || null, gold_weight || null, net_weight || null, gross_weight || null,
      diamond_weight || null, diamond_clarity || null, diamond_color || null, stone_weight || null, hallmark_number || null,
      bis_hallmark ? 1 : 0, certificate_number || null, making_charges || 0, gst_percent || 3, size_type || "none", available_sizes || null,
    ]
  );
  if (Array.isArray(details)) {
    for (let i = 0; i < details.length; i++) {
      await pool.query("INSERT INTO product_details (product_id, detail_text, sort_order) VALUES (?, ?, ?)", [id, details[i], i]);
    }
  }
  res.status(201).json({ success: true, data: { id } });
});

// PATCH /api/admin/products/:id
export const adminUpdateProduct = asyncHandler(async (req, res) => {
  const fields = [
    "name", "category_id", "metal", "gemstone", "theme", "price", "mrp", "badge", "description", "stock_qty", "is_active",
    "sku", "hsn_code", "gold_purity", "gold_weight", "net_weight", "gross_weight", "diamond_weight", "diamond_clarity",
    "diamond_color", "stone_weight", "hallmark_number", "bis_hallmark", "certificate_number", "making_charges",
    "gst_percent", "size_type", "available_sizes",
  ];
  const nullableDecimalFields = new Set([
    "gold_weight", "net_weight", "gross_weight", "diamond_weight", "stone_weight",
  ]);
  const decimalDefaults = { making_charges: 0, gst_percent: 3 };
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      const value = req.body[f];
      if (typeof value === "string" && value.trim() === "") {
        values.push(nullableDecimalFields.has(f) ? null : (decimalDefaults[f] ?? value));
      } else {
        values.push(value);
      }
    }
  }
  if (updates.length === 0) return res.status(400).json({ success: false, message: "No fields to update" });
  values.push(req.params.id);
  await pool.query(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`, values);

  if (Array.isArray(req.body.details)) {
    await pool.query("DELETE FROM product_details WHERE product_id = ?", [req.params.id]);
    for (let i = 0; i < req.body.details.length; i++) {
      await pool.query("INSERT INTO product_details (product_id, detail_text, sort_order) VALUES (?, ?, ?)", [
        req.params.id,
        req.body.details[i],
        i,
      ]);
    }
  }
  res.json({ success: true });
});

// DELETE /api/admin/products/:id (soft delete)
export const adminDeleteProduct = asyncHandler(async (req, res) => {
  await pool.query("UPDATE products SET is_active = 0 WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});
