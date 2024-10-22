import { body } from 'express-validator';

export const likeDislikeReviewValidator = [
  body('reviewId').notEmpty().withMessage('Comment id is required')
];