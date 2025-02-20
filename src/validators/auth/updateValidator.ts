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
  body("bio").isString().notEmpty().optional().withMessage("Bio is required"),
  body("location").isString().notEmpty().optional().withMessage("Location is required"),
  body("website").isURL().notEmpty().optional().withMessage("Website is required"),
  body("language").isArray().notEmpty().optional().withMessage("Language is required"),
  body("verified").isBoolean().notEmpty().optional().withMessage("Verified is required"),
];
