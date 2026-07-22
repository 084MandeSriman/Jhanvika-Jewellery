import { Router } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  refundPayment,
  listTransactions,
} from "../controllers/paymentController.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

// Note: the /payments/razorpay/webhook route is registered separately in app.js
// (before the global express.json() middleware) since it needs the raw request
// body for HMAC signature verification.
const router = Router();

router.post("/payments/razorpay/create-order", requireAuth, createRazorpayOrder);
router.post("/payments/razorpay/verify", requireAuth, verifyRazorpayPayment);
router.post("/payments/razorpay/refund/:orderId", requireAdmin, refundPayment);
router.get("/payments/transactions", requireAdmin, listTransactions);

export default router;
