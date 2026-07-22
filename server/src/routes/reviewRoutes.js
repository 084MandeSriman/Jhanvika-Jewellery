import { Router } from "express";
import { listProductReviews, createReview, updateReview, deleteReview } from "../controllers/reviewController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
router.get("/products/:id/reviews", listProductReviews);
router.post("/products/:id/reviews", requireAuth, createReview);
router.patch("/reviews/:reviewId", requireAuth, updateReview);
router.delete("/reviews/:reviewId", requireAuth, deleteReview);
export default router;
