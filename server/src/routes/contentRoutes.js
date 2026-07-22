import { Router } from "express";
import { listTestimonials, listHeroSlides } from "../controllers/contentController.js";

const router = Router();

router.get("/testimonials", listTestimonials);
router.get("/hero-slides", listHeroSlides);

export default router;
