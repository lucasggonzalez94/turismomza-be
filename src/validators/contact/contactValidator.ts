import { body } from "express-validator";

export const contactValidator = [
  body("name").isString().withMessage("Name must be an string"),
  body("email").isEmail().notEmpty().withMessage("Please enter a valid email"),
  body("subject").isString().withMessage("Subject must be an string"),
  body("message").isString().withMessage("Message must be an string"),
];
