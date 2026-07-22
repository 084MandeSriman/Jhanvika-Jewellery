import { body } from "express-validator";

export const createOrderValidators = [
  body("addressId").isInt({ min: 1 }).withMessage("Valid addressId is required"),
  body("paymentMethod").optional().isIn(["cod", "upi", "card"]).withMessage("Invalid payment method"),
];

export const createAddressValidators = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("line1").trim().notEmpty().withMessage("Address line 1 is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("pincode").trim().isPostalCode("IN").withMessage("Valid 6-digit pincode is required"),
];
