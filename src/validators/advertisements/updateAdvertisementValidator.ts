import { body } from "express-validator";

export const updateAdvertisementValidator = [
  body("startDate")
    .isISO8601()
    .optional()
    .notEmpty()
    .withMessage("Start date must be a valid date"),
  body("endDate")
    .isISO8601()
    .optional()
    .notEmpty()
    .withMessage("Start date must be a valid date"),
  body("amountPaid")
    .toFloat()
    .isFloat({ min: 0 })
    .optional()
    .withMessage("Amount must be a valid number greater than or equal to 0"),
  body("isActive")
    .isBoolean()
    .optional()
    .withMessage("IsActive must be a valid value"),
];
