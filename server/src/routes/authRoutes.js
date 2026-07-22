import { Router } from "express";
import { register, login, getMe, forgotPassword, resetPassword } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";
import { registerValidators, loginValidators } from "../validators/authValidators.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.post("/auth/register", registerValidators, validate, register);
router.post("/auth/login", loginValidators, validate, login);
router.get("/auth/me", requireAuth, getMe);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

export default router;
