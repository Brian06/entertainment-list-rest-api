const express = require('express');
const { body, query } = require('express-validator');

const entertainmentController = require('../controllers/entertainment');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// Add item to entertainment list
router.post(
  '/add-item',
  isAuth,
  [
    body('itemId').notEmpty().isString().withMessage('Item ID is required'),
    body('status')
      .optional()
      .isString()
      .isIn(['watching', 'completed', 'plan to watch', 'dropped', 'on hold'])
      .withMessage('Invalid status'),
    body('personalScore')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Personal score must be between 1 and 10'),
    body('personalReview')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Personal review cannot exceed 2000 characters'),
    body('currentEpisode')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Current episode must be a non-negative number'),
    body('isFavorite').optional().isBoolean().withMessage('isFavorite must be a boolean'),
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1000 characters')
  ],
  entertainmentController.addToList
);

// Get user's entertainment list
router.get(
  '/list',
  isAuth,
  [
    query('status')
      .optional()
      .isString()
      .isIn(['watching', 'completed', 'plan to watch', 'dropped', 'on hold'])
      .withMessage('Invalid status'),
    query('type')
      .optional()
      .isString()
      .isIn(['movie', 'serie', 'anime', 'game'])
      .withMessage('Invalid type'),
    query('isFavorite').optional().isBoolean().withMessage('isFavorite must be a boolean'),
    query('sort')
      .optional()
      .isString()
      .isIn(['score', 'date', 'title', 'rating'])
      .withMessage('Invalid sort option')
  ],
  entertainmentController.getList
);

// Update item in entertainment list
router.put(
  '/update-item/:itemId',
  isAuth,
  [
    body('status')
      .optional()
      .isString()
      .isIn(['watching', 'completed', 'plan to watch', 'dropped', 'on hold'])
      .withMessage('Invalid status'),
    body('personalScore')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Personal score must be between 1 and 10'),
    body('personalReview')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Personal review cannot exceed 2000 characters'),
    body('currentEpisode')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Current episode must be a non-negative number'),
    body('isFavorite').optional().isBoolean().withMessage('isFavorite must be a boolean'),
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1000 characters')
  ],
  entertainmentController.updateListItem
);

// Remove item from entertainment list
router.delete('/remove-item/:itemId', isAuth, entertainmentController.removeFromList);

// Get user statistics
router.get('/stats', isAuth, entertainmentController.getStats);

module.exports = router;
