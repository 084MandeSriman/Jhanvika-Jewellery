import { Router } from "express";
import { submitContact, subscribeNewsletter } from "../controllers/miscController.js";

const router = Router();
router.post("/contact", submitContact);
router.post("/newsletter", subscribeNewsletter);
export default router;
