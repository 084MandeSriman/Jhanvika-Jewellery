import { Router } from "express";
import { createOrder, listMyOrders, getMyOrder, downloadInvoice } from "../controllers/orderController.js";
import { requireAuth } from "../middlewares/auth.js";
import { createOrderValidators } from "../validators/orderValidators.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.post("/orders", requireAuth, createOrderValidators, validate, createOrder);
router.get("/orders", requireAuth, listMyOrders);
router.get("/orders/:id", requireAuth, getMyOrder);
router.get("/orders/:id/invoice", requireAuth, downloadInvoice);

export default router;
