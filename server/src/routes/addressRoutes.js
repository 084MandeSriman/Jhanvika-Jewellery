import { Router } from "express";
import { listAddresses, createAddress, updateAddress, deleteAddress } from "../controllers/addressController.js";
import { requireAuth } from "../middlewares/auth.js";
import { createAddressValidators } from "../validators/orderValidators.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.get("/addresses", requireAuth, listAddresses);
router.post("/addresses", requireAuth, createAddressValidators, validate, createAddress);
router.patch("/addresses/:id", requireAuth, createAddressValidators, validate, updateAddress);
router.delete("/addresses/:id", requireAuth, deleteAddress);

export default router;
