import { body } from 'express-validator';

export const updateValidator = [
  body("email").isEmail().optional().withMessage("Please enter a valid email"),
  body("currentPassword")
    .isLength({ min: 6 })
    .withMessage("Current password must be at least 6 characters long"),
  body("password")
    .isLength({ min: 6 })
    .optional()
    .withMessage("Password must be at least 6 characters long"),
  body("name").notEmpty().optional().withMessage("Name is required"),
];