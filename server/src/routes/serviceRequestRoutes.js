import { Router } from "express";
import { createServiceRequest } from "../controllers/serviceRequestController.js";
import { optionalAuth } from "../middlewares/auth.js";

const router = Router();
router.post("/services/request", optionalAuth, createServiceRequest);
export default router;
