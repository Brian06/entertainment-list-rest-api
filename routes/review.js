const express = require('express');
const { body, query } = require('express-validator');

const reviewController = require('../controllers/review');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// Add a review for an item
router.post(
  '/add/:itemId',
  isAuth,
  [
    body('score')
      .notEmpty()
      .isInt({ min: 1, max: 10 })
      .withMessage('Score is required and must be between 1 and 10'),
    body('reviewText')
      .notEmpty()
      .isString()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Review text is required and must be between 10 and 5000 characters'),
    body('title')
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage('Review title cannot exceed 200 characters'),
    body('pros').optional().isArray().withMessage('Pros must be an array of strings'),
    body('cons').optional().isArray().withMessage('Cons must be an array of strings'),
    body('wouldRecommend').optional().isBoolean().withMessage('wouldRecommend must be a boolean'),
    body('containsSpoilers')
      .optional()
      .isBoolean()
      .withMessage('containsSpoilers must be a boolean')
  ],
  reviewController.addReview
);

// Get all reviews for an item
router.get(
  '/item/:itemId',
  isAuth,
  [
    query('sort')
      .optional()
      .isString()
      .isIn(['date', 'score', 'helpful'])
      .withMessage('Invalid sort option'),
    query('spoilers')
      .optional()
      .isString()
      .isIn(['include', 'exclude'])
      .withMessage('Invalid spoilers option')
  ],
  reviewController.getItemReviews
);

// Update a review
router.put(
  '/update/:itemId/:reviewId',
  isAuth,
  [
    body('score')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Score must be between 1 and 10'),
    body('reviewText')
      .optional()
      .isString()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Review text must be between 10 and 5000 characters'),
    body('title')
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage('Review title cannot exceed 200 characters'),
    body('pros').optional().isArray().withMessage('Pros must be an array of strings'),
    body('cons').optional().isArray().withMessage('Cons must be an array of strings'),
    body('wouldRecommend').optional().isBoolean().withMessage('wouldRecommend must be a boolean'),
    body('containsSpoilers')
      .optional()
      .isBoolean()
      .withMessage('containsSpoilers must be a boolean')
  ],
  reviewController.updateReview
);

// Delete a review
router.delete('/delete/:itemId/:reviewId', isAuth, reviewController.deleteReview);

// Vote on review helpfulness
router.post(
  '/vote/:itemId/:reviewId',
  isAuth,
  [
    body('isHelpful')
      .notEmpty()
      .isBoolean()
      .withMessage('isHelpful is required and must be a boolean')
  ],
  reviewController.voteOnReview
);

// Get user's reviews
router.get(
  '/my-reviews',
  isAuth,
  [query('sort').optional().isString().isIn(['date', 'score']).withMessage('Invalid sort option')],
  reviewController.getUserReviews
);

module.exports = router;
