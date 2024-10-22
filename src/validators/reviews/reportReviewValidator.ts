import { body } from 'express-validator';

export const reportReviewValidator = [
  body('reviewId').notEmpty().withMessage('Comment id is required'),
  body('reason').notEmpty().withMessage('Reason is required')
];