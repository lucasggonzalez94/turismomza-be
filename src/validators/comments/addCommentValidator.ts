import { body } from 'express-validator';

export const addCommentValidator = [
  body('content').notEmpty().withMessage('Content is required'),
  body('attractionId').notEmpty().withMessage('Attraction id is required')
];