import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /sitemap.xml - dynamically includes every active product & category
export const getSitemap = asyncHandler(async (req, res) => {
  const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const [products] = await pool.query("SELECT id, updated_at FROM products WHERE is_active = 1");
  const [categories] = await pool.query("SELECT id FROM categories WHERE is_active = 1");

  const staticUrls = ["/", "/shop", "/about", "/contact", "/wishlist", "/cart"];
  const urls = [
    ...staticUrls.map((u) => `<url><loc>${origin}${u}</loc></url>`),
    ...categories.map((c) => `<url><loc>${origin}/shop/${c.id}</loc></url>`),
    ...products.map(
      (p) => `<url><loc>${origin}/product/${p.id}</loc><lastmod>${new Date(p.updated_at).toISOString()}</lastmod></url>`
    ),
  ];

  res.set("Content-Type", "application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`);
});

export const getRobotsTxt = (req, res) => {
  const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  res.set("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /account
Disallow: /admin

Sitemap: ${origin.replace("5173", "5000")}/sitemap.xml`);
};
