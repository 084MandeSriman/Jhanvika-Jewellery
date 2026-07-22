import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { categories, products, testimonials, heroSlides } from "./seedData.js";

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log("Seeding database...");

    // Clean existing data (order matters due to FKs) — safe to re-run
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE product_details");
    await conn.query("TRUNCATE TABLE product_images");
    await conn.query("TRUNCATE TABLE products");
    await conn.query("TRUNCATE TABLE categories");
    await conn.query("TRUNCATE TABLE testimonials");
    await conn.query("TRUNCATE TABLE hero_slides");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    // Categories
    for (const c of categories) {
      await conn.query(
        `INSERT INTO categories (id, name, tagline, art_type, sort_order) VALUES (?, ?, ?, ?, ?)`,
        [c.id, c.name, c.tagline, c.art_type, c.sort_order]
      );
    }
    console.log(`  ✓ ${categories.length} categories`);

    // Products + details
    for (const p of products) {
      await conn.query(
        `INSERT INTO products
          (id, name, slug, category_id, metal, gemstone, theme, price, mrp, rating, review_count, badge, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.name,
          slugify(p.name),
          p.category_id,
          p.metal,
          p.gemstone,
          p.theme,
          p.price,
          p.mrp,
          p.rating,
          p.review_count,
          p.badge,
          p.description,
        ]
      );
      for (let i = 0; i < p.details.length; i++) {
        await conn.query(
          `INSERT INTO product_details (product_id, detail_text, sort_order) VALUES (?, ?, ?)`,
          [p.id, p.details[i], i]
        );
      }
    }
    console.log(`  ✓ ${products.length} products with details`);

    // Testimonials
    for (const t of testimonials) {
      await conn.query(
        `INSERT INTO testimonials (name, location, text_content, rating, sort_order) VALUES (?, ?, ?, ?, ?)`,
        [t.name, t.location, t.text_content, t.rating, t.sort_order]
      );
    }
    console.log(`  ✓ ${testimonials.length} testimonials`);

    // Hero slides
    for (const h of heroSlides) {
      await conn.query(
        `INSERT INTO hero_slides (eyebrow, title, subtitle, cta_text, cta_link, theme, art_type, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [h.eyebrow, h.title, h.subtitle, h.cta_text, h.cta_link, h.theme, h.art_type, h.sort_order]
      );
    }
    console.log(`  ✓ ${heroSlides.length} hero slides`);

    // Admin user (for /admin panel login)
    await conn.query("DELETE FROM admin_users WHERE email = 'admin@jhanvika.in'");
    const adminHash = await bcrypt.hash("Admin@123", 10);
    await conn.query(
      "INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      ["Jhanvika Admin", "admin@jhanvika.in", adminHash, "super_admin"]
    );
    console.log("  ✓ Admin user (admin@jhanvika.in / Admin@123)");

    // Default coupon matching what the storefront already advertises
    await conn.query("DELETE FROM coupons WHERE code = 'JHANVIKA10'");
    await conn.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, is_active)
       VALUES ('JHANVIKA10', '10% off your order', 'percent', 10, 0, 1)`
    );
    console.log("  ✓ Coupon JHANVIKA10 (10% off)");

    console.log("✅ Seed complete. Your database now mirrors the original dummy data exactly.");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

seed();
