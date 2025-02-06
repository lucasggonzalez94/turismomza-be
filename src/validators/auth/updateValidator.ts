import { body } from "express-validator";

export const updateValidator = [
  body("email").isEmail().optional().withMessage("Please enter a valid email"),
  body("currentPassword")
    .isLength({ min: 8 })
    .withMessage("Current password must be at least 8 characters long"),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
  body("name").notEmpty().optional().withMessage("Name is required"),
];
