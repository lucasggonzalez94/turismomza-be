import { body } from 'express-validator';

export const markAsReadValidator = [
  body('notificationId').notEmpty().withMessage('Notification id is required')
];