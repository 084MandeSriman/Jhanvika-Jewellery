import { Router } from "express";
import { requestReturn, listMyReturns } from "../controllers/returnController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
router.use(requireAuth);
router.post("/returns", requestReturn);
router.get("/returns", listMyReturns);
export default router;
