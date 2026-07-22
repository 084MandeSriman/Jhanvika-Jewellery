import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../controllers/cartController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = Router();

router.use(optionalAuth);
router.get("/cart", getCart);
router.post("/cart", addToCart);
router.patch("/cart/:productId", updateCartItem);
router.delete("/cart/:productId", removeCartItem);

export default router;
