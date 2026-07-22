import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listTestimonials = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order");
  res.json({
    success: true,
    data: rows.map((t) => ({
      id: `t${t.id}`,
      name: t.name,
      location: t.location,
      text: t.text_content,
      rating: t.rating,
    })),
  });
});

export const listHeroSlides = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY sort_order");
  res.json({
    success: true,
    data: rows.map((h) => ({
      id: `h${h.id}`,
      eyebrow: h.eyebrow,
      title: h.title,
      subtitle: h.subtitle,
      cta: h.cta_text,
      link: h.cta_link,
      theme: h.theme,
      type: h.art_type,
    })),
  });
});
