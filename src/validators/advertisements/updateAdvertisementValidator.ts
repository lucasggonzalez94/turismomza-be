import { body } from "express-validator";

export const updateAdvertisementValidator = [
  body("attractionId").notEmpty().withMessage("Attraction id is required"),
  body("startDate")
    .isDate()
    .notEmpty()
    .withMessage("Start date must be a valid date"),
  body("endDate")
    .isDate()
    .notEmpty()
    .withMessage("Start date must be a valid date"),
  body("price").toFloat().isFloat().withMessage("Price must be a valid number"),
  body("isActive").isBoolean().withMessage("IsActive must be a valid value"),
];
