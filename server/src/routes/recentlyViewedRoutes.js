import { Router } from "express";
import { trackView, listRecentlyViewed } from "../controllers/recentlyViewedController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
router.use(requireAuth);
router.post("/recently-viewed", trackView);
router.get("/recently-viewed", listRecentlyViewed);
export default router;
