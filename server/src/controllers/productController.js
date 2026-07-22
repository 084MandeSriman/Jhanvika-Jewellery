import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Shapes a raw product row + its details into exactly what the frontend's
// data/products.js used to export, so components need zero UI changes.
function shapeProduct(row, details = []) {
  return {
    id: row.id,
    name: row.name,
    category: row.category_id,
    categoryType: row.art_type, // e.g. 'necklace' - lets ProductCard/JewelArt skip a categories lookup
    image: row.primary_image || null, // relative path e.g. '/uploads/products/xxx.webp' - null falls back to procedural jewel art
    metal: row.metal,
    gemstone: row.gemstone,
    price: Number(row.price),
    mrp: Number(row.mrp),
    rating: Number(row.rating),
    reviews: row.review_count,
    badge: row.badge || undefined,
    theme: row.theme,
    description: row.description,
    details: details.map((d) => d.detail_text),
    specs: {
      sku: row.sku,
      hsnCode: row.hsn_code,
      goldPurity: row.gold_purity,
      goldWeight: row.gold_weight ? Number(row.gold_weight) : null,
      netWeight: row.net_weight ? Number(row.net_weight) : null,
      grossWeight: row.gross_weight ? Number(row.gross_weight) : null,
      diamondWeight: row.diamond_weight ? Number(row.diamond_weight) : null,
      diamondClarity: row.diamond_clarity,
      diamondColor: row.diamond_color,
      stoneWeight: row.stone_weight ? Number(row.stone_weight) : null,
      hallmarkNumber: row.hallmark_number,
      bisHallmark: !!row.bis_hallmark,
      certificateNumber: row.certificate_number,
      makingCharges: row.making_charges ? Number(row.making_charges) : 0,
      gstPercent: row.gst_percent ? Number(row.gst_percent) : 3,
      sizeType: row.size_type,
      availableSizes: row.available_sizes ? row.available_sizes.split(",") : [],
    },
  };
}

const PRODUCT_SELECT = `
  SELECT p.*, c.art_type,
    (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id
       ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) as primary_image
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

async function attachDetails(rows) {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const [detailRows] = await pool.query(
    `SELECT * FROM product_details WHERE product_id IN (${ids.map(() => "?").join(",")}) ORDER BY sort_order`,
    ids
  );
  return rows.map((row) => shapeProduct(row, detailRows.filter((d) => d.product_id === row.id)));
}

// GET /api/products?category=necklaces&search=kundan&theme=gold,ruby&maxPrice=20000&badge=Bestseller&sort=price-asc&page=1&limit=24
export const listProducts = asyncHandler(async (req, res) => {
  const { category, search, theme, maxPrice, badge, sort = "featured", page = 1, limit = 60 } = req.query;

  const where = ["p.is_active = 1"];
  const params = {};

  if (category) {
    where.push("p.category_id = :category");
    params.category = category;
  }
  if (search) {
    where.push("(MATCH(p.name, p.gemstone, p.metal) AGAINST(:search IN NATURAL LANGUAGE MODE) OR p.name LIKE :searchLike)");
    params.search = search;
    params.searchLike = `%${search}%`;
  }
  if (theme) {
    const themes = String(theme).split(",");
    where.push(`p.theme IN (${themes.map((_, i) => `:theme${i}`).join(",")})`);
    themes.forEach((t, i) => (params[`theme${i}`] = t));
  }
  if (maxPrice) {
    where.push("p.price <= :maxPrice");
    params.maxPrice = Number(maxPrice);
  }
  if (badge) {
    where.push("p.badge = :badge");
    params.badge = badge;
  }

  let orderBy = "p.created_at DESC";
  if (sort === "price-asc") orderBy = "p.price ASC";
  if (sort === "price-desc") orderBy = "p.price DESC";
  if (sort === "rating") orderBy = "p.rating DESC";

  const offset = (Number(page) - 1) * Number(limit);

  const [rows] = await pool.query(
    `${PRODUCT_SELECT} WHERE ${where.join(" AND ")} ORDER BY ${orderBy} LIMIT :limit OFFSET :offset`,
    { ...params, limit: Number(limit), offset }
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM products p WHERE ${where.join(" AND ")}`,
    params
  );

  const data = await attachDetails(rows);
  res.json({ success: true, data, pagination: { total, page: Number(page), limit: Number(limit) } });
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${PRODUCT_SELECT} WHERE p.id = :id AND p.is_active = 1`, { id: req.params.id });
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  const [details] = await pool.query("SELECT * FROM product_details WHERE product_id = ? ORDER BY sort_order", [req.params.id]);
  res.json({ success: true, data: shapeProduct(rows[0], details) });
});

// GET /api/products/:id/related
export const getRelated = asyncHandler(async (req, res) => {
  const [current] = await pool.query("SELECT category_id FROM products WHERE id = ?", [req.params.id]);
  if (current.length === 0) return res.json({ success: true, data: [] });

  const [rows] = await pool.query(
    `${PRODUCT_SELECT} WHERE p.category_id = :categoryId AND p.id != :id AND p.is_active = 1 LIMIT 4`,
    { categoryId: current[0].category_id, id: req.params.id }
  );
  const data = await attachDetails(rows);
  res.json({ success: true, data });
});

// GET /api/categories
export const listCategories = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order");
  res.json({
    success: true,
    data: rows.map((c) => ({
      id: c.id,
      name: c.name,
      tagline: c.tagline,
      type: c.art_type,
      sort_order: c.sort_order,
      image_url: c.image_url || null,
    })),
  });
});
