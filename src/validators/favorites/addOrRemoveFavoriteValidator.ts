import { body } from 'express-validator';

export const addOrRemoveFavoriteValidator = [
  body('attractionId').notEmpty().withMessage('Attraction id is required')
];