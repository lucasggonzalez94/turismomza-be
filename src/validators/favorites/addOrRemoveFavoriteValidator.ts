import { body } from 'express-validator';

export const addOrRemoveFavoriteValidator = [
  body('placeId').notEmpty().withMessage('Place id is required')
];