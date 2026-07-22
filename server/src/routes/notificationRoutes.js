import { Router } from "express";
import { listNotifications, markNotificationRead, markAllRead } from "../controllers/notificationController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/notifications", listNotifications);
router.patch("/notifications/:id/read", markNotificationRead);
router.patch("/notifications/read-all", markAllRead);
export default router;
