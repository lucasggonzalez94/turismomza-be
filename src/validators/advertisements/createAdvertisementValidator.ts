import { body } from "express-validator";

export const createAdvertisementValidator = [
  body("attractionId").notEmpty().withMessage("Attraction id is required"),
  body("startDate")
    .isISO8601()
    .notEmpty()
    .withMessage("Start date must be a valid date"),
  body("endDate")
    .isISO8601()
    .notEmpty()
    .withMessage("Start date must be a valid date"),
  body("amountPaid")
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("Amount must be a valid number greater than or equal to 0"),
];
