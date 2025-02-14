import { body } from "express-validator";

export const editReviewValidator = [
  body("content").optional().notEmpty().withMessage("Content is required"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be a number between 1 and 5"),
  body("placeId").notEmpty().withMessage("Place id is required"),
];
