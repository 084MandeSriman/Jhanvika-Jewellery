import { Router } from "express";
import { getWishlist, addToWishlist, removeFromWishlist, getShareLink, getPublicWishlist } from "../controllers/wishlistController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

// Public route registered first — no auth needed to view a shared wishlist
router.get("/wishlist/public/:token", getPublicWishlist);

router.get("/wishlist", requireAuth, getWishlist);
router.post("/wishlist", requireAuth, addToWishlist);
router.delete("/wishlist/:productId", requireAuth, removeFromWishlist);
router.get("/wishlist/share", requireAuth, getShareLink);

export default router;
