import { body } from "express-validator";

export const editCommentValidator = [
  body("content").notEmpty().withMessage("Content is required"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 }) // Validar que el rating esté entre 1 y 5
    .withMessage("Rating must be a number between 1 and 5"),
];
