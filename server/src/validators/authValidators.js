import { body } from "express-validator";

export const registerValidators = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 150 }),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("phone").optional().isMobilePhone("any").withMessage("Invalid phone number"),
];

export const loginValidators = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
