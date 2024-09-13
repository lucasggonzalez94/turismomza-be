import { body } from 'express-validator';

export const createAttractionValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('recomended')
    .optional()
    .isString()
    .withMessage('Recomended must be a string'),
  body('services')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          const parsedValue = JSON.parse(value);
          if (Array.isArray(parsedValue)) {
            return true;
          }
          throw new Error('Services must be an array');
        } catch {
          throw new Error('Services must be a valid JSON array');
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Services must be an array'),
  body('contactNumber')
    .optional()
    .isString()
    .withMessage('Contact number must be a string'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('webSite').optional().isURL().withMessage('Please enter a valid URL'),
  body('instagram')
    .optional()
    .isString()
    .withMessage('Instagram must be a string'),
  body('facebook')
    .optional()
    .isString()
    .withMessage('Facebook must be a string'),
  body('timeOpen')
    .optional()
    .isString()
    .withMessage('Time Open must be a string'),
  body('timeClose')
    .optional()
    .isString()
    .withMessage('Time Close must be a string'),
  body('duration')
    .optional()
    .isString()
    .withMessage('Duration must be a string'),
  body('minAge')
    .toInt()
    .optional()
    .isInt({ min: 0 })
    .withMessage('Min age must be a valid number'),
  body('maxPersons')
    .toInt()
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max persons must be a valid number'),
  body('price')
    .toFloat()
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid number'),
];