import { body } from 'express-validator';

export const reportCommentValidator = [
  body('commentId').notEmpty().withMessage('Comment id is required'),
  body('reason').notEmpty().withMessage('Reason is required')
];