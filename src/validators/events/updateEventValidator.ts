import { body } from "express-validator";

export const updateEventValidator = [
  body("title").optional().trim().notEmpty().withMessage("Title is required"),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Description is required"),
  body("location").optional().notEmpty().withMessage("Location is required"),
  body("category").optional().notEmpty().withMessage("Category is required"),
  body("services")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        try {
          const parsedValue = JSON.parse(value);
          if (Array.isArray(parsedValue)) {
            return true;
          }
          throw new Error("Services must be an array");
        } catch {
          throw new Error("Services must be a valid JSON array");
        }
      }
      return Array.isArray(value);
    })
    .withMessage("Services must be an array"),
  body("contactNumber")
    .optional()
    .isString()
    .withMessage("Contact number must be a string"),
  body("email").optional().isEmail().withMessage("Please enter a valid email"),
  body("webSite").optional().isURL().withMessage("Please enter a valid URL"),
  body("instagram")
    .optional()
    .isString()
    .withMessage("Instagram must be a string"),
  body("facebook")
    .optional()
    .isString()
    .withMessage("Facebook must be a string"),
  body("schedule")
    .optional()
    .isString()
    .withMessage("Schedule must be a string"),
  body("price")
    .toFloat()
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a valid number"),
  body("currencyPrice")
    .optional()
    .custom((value) => {
      const validCurrencies = ["ars", "usd"]; // Los valores de tu enum en Prisma
      if (!validCurrencies.includes(value)) {
        throw new Error("Currency must be either 'ars' or 'usd'");
      }
      return true;
    })
    .withMessage("Currency must be either 'ars' or 'usd'"),
];
