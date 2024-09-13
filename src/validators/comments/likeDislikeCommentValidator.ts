import { body } from 'express-validator';

export const likeDislikeCommentValidator = [
  body('commentId').notEmpty().withMessage('Comment id is required')
];