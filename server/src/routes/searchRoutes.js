import { Router } from "express";
import { autocomplete, trendingSearches, popularProducts, searchHistory, trackSearch } from "../controllers/searchController.js";
import { requireAuth, optionalAuth } from "../middlewares/auth.js";

const router = Router();
router.get("/search/autocomplete", autocomplete);
router.get("/search/trending", trendingSearches);
router.get("/search/popular-products", popularProducts);
router.get("/search/history", requireAuth, searchHistory);
router.post("/search/track", optionalAuth, trackSearch);
export default router;
