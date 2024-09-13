import { body } from 'express-validator';

export const editCommentValidator = [
  body('content').notEmpty().withMessage('Content is required')
];