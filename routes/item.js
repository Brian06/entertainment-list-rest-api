const express = require('express');
const { body, query } = require('express-validator');

const itemController = require('../controllers/item');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// Enhanced items endpoint with search and filtering
router.get(
  '/items',
  isAuth,
  [
    query('type')
      .optional()
      .isString()
      .isIn(['movie', 'serie', 'anime', 'game'])
      .withMessage('Invalid type'),
    query('search')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    query('genre').optional().isString().withMessage('Genre must be a string'),
    query('minRating')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Minimum rating must be between 0 and 10'),
    query('maxRating')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Maximum rating must be between 0 and 10'),
    query('status')
      .optional()
      .isString()
      .isIn(['ongoing', 'completed', 'upcoming', 'cancelled'])
      .withMessage('Invalid status'),
    query('sort')
      .optional()
      .isString()
      .isIn(['title', 'rating', 'date', 'reviews'])
      .withMessage('Invalid sort option'),
    query('order')
      .optional()
      .isString()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be asc or desc'),
    query('currentPage')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Current page must be a positive integer')
  ],
  itemController.getItems
);

router.post(
  '/item',
  isAuth,
  [
    body('title').notEmpty().isString().trim().isLength({ min: 1, max: undefined }),
    body('type').notEmpty().isString().isIn(['movie', 'serie', 'anime', 'game']),
    body('episodes').notEmpty().isInt({ min: 1 }),
    body('description').isString(),
    body('durationMinutes').isInt({ min: 0 }),
    body('genres').isArray(),
    body('imgURL').isString()
  ],
  itemController.createItem
);

router.put(
  '/item/:itemId',
  isAuth,
  [
    body('title').notEmpty().isString().trim().isLength({ min: 1, max: undefined }),
    body('type').notEmpty().isString().isIn(['movie', 'serie', 'anime', 'game']),
    body('episodes').notEmpty().isInt({ min: 1 }),
    body('description').isString(),
    body('durationMinutes').isInt({ min: 0 }),
    body('genres').isArray(),
    body('imgURL').isString()
  ],
  itemController.updateItem
);

router.get('/item/:itemId', isAuth, itemController.getItem);
router.delete('/item/:itemId', isAuth, itemController.deleteItem);

router.put(
  '/rate/:itemId',
  isAuth,
  [
    body('rate').notEmpty().isInt({ min: 1, max: 10 }).withMessage('just valid from 1 to 10'),
    body('remove').notEmpty().isBoolean()
  ],
  itemController.updateRate
);

router.put(
  '/likes/:itemId',
  isAuth,
  [body('like').notEmpty().isBoolean(), body('remove').notEmpty().isBoolean()],
  itemController.updateLikes
);

router.get('/comments/:itemId', isAuth, itemController.getComments);

router.put(
  '/comments/:itemId',
  isAuth,
  [body('comment').notEmpty().isString()],
  itemController.addComment
);

router.put(
  '/comments/:itemId/:commentId',
  isAuth,
  [body('comment').notEmpty().isString()],
  itemController.editComment
);

router.delete('/comments/:itemId/:commentId', isAuth, itemController.removeComment);

module.exports = router;
