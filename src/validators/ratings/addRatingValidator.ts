import { body } from 'express-validator';

export const addRatingValidator = [
  body('stars').notEmpty().withMessage('stars is required'),
  body('attractionId').notEmpty().withMessage('Attraction id is required')
];