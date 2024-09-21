import { body } from 'express-validator';

export const registerValidator = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  // TODO: Validar password
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("name").notEmpty().withMessage("Name is required"),
];