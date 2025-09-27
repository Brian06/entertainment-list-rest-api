const { validationResult } = require('express-validator');

const Item = require('../models/item');
const User = require('../models/user');
const Utils = require('../utils/utils');

/**
 * @description Add a comprehensive review for an item
 * @param itemId
 * @param score
 * @param reviewText
 * @param title (optional)
 * @param pros (optional)
 * @param cons (optional)
 * @param wouldRecommend (optional)
 * @param containsSpoilers (optional)
 * @method POST
 * @example /reviews/add/:itemId
 */
exports.addReview = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  try {
    const { userId } = req;
    const { itemId } = req.params;
    const {
      score,
      reviewText,
      title,
      pros = [],
      cons = [],
      wouldRecommend,
      containsSpoilers = false
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Could not find user');
      error.statusCode = 404;
      throw error;
    }

    const item = await Item.findById(itemId);
    if (!item) {
      const error = new Error('Could not find item');
      error.statusCode = 404;
      throw error;
    }

    // Check if user already reviewed this item
    const existingReviewIndex = item.reviews.findIndex(
      (review) => review.userId.toString() === userId
    );

    if (existingReviewIndex !== -1) {
      const error = new Error(
        'You have already reviewed this item. Use update endpoint to modify your review.'
      );
      error.statusCode = 409;
      throw error;
    }

    const review = {
      userId,
      username: user.username,
      score,
      reviewText,
      title,
      pros,
      cons,
      wouldRecommend,
      containsSpoilers
    };

    item.reviews.push(review);
    const updatedItem = await item.save();

    const newReview = updatedItem.reviews[updatedItem.reviews.length - 1];

    res.status(201).json({
      message: 'Review added successfully',
      review: newReview,
      itemStats: {
        averageReviewScore: updatedItem.averageReviewScore,
        totalReviews: updatedItem.totalReviews,
        recommendationPercentage: updatedItem.recommendationPercentage
      }
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Get all reviews for an item
 * @param itemId
 * @param sort (optional) - 'date', 'score', 'helpful'
 * @param spoilers (optional) - 'include', 'exclude'
 * @method GET
 * @example /reviews/item/:itemId?sort=helpful&spoilers=exclude
 */
exports.getItemReviews = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { sort = 'date', spoilers = 'include' } = req.query;

    const item = await Item.findById(itemId);
    if (!item) {
      const error = new Error('Could not find item');
      error.statusCode = 404;
      throw error;
    }

    let reviews = [...item.reviews];

    // Filter spoilers if requested
    if (spoilers === 'exclude') {
      reviews = reviews.filter((review) => !review.containsSpoilers);
    }

    // Apply sorting
    switch (sort) {
      case 'score':
        reviews.sort((a, b) => b.score - a.score);
        break;
      case 'helpful':
        reviews.sort((a, b) => {
          const aHelpful = a.helpfulVotes.filter((vote) => vote.isHelpful).length;
          const bHelpful = b.helpfulVotes.filter((vote) => vote.isHelpful).length;
          return bHelpful - aHelpful;
        });
        break;
      case 'date':
      default:
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }

    // Add helpfulness stats to each review
    const reviewsWithStats = reviews.map((review) => ({
      ...review.toObject(),
      helpfulCount: review.helpfulVotes.filter((vote) => vote.isHelpful).length,
      totalVotes: review.helpfulVotes.length
    }));

    res.status(200).json({
      message: 'Reviews retrieved successfully',
      reviews: reviewsWithStats,
      itemStats: {
        averageReviewScore: item.averageReviewScore,
        totalReviews: item.totalReviews,
        recommendationPercentage: item.recommendationPercentage
      }
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Update user's review for an item
 * @param itemId
 * @param reviewId
 * @param score (optional)
 * @param reviewText (optional)
 * @param title (optional)
 * @param pros (optional)
 * @param cons (optional)
 * @param wouldRecommend (optional)
 * @param containsSpoilers (optional)
 * @method PUT
 * @example /reviews/update/:itemId/:reviewId
 */
exports.updateReview = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  try {
    const { userId } = req;
    const { itemId, reviewId } = req.params;
    const { score, reviewText, title, pros, cons, wouldRecommend, containsSpoilers } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      const error = new Error('Could not find item');
      error.statusCode = 404;
      throw error;
    }

    const reviewIndex = item.reviews.findIndex(
      (review) => review._id.toString() === reviewId && review.userId.toString() === userId
    );

    if (reviewIndex === -1) {
      const error = new Error('Review not found or you do not have permission to edit this review');
      error.statusCode = 404;
      throw error;
    }

    const review = item.reviews[reviewIndex];

    // Update fields if provided
    if (score !== undefined) review.score = score;
    if (reviewText !== undefined) review.reviewText = reviewText;
    if (title !== undefined) review.title = title;
    if (pros !== undefined) review.pros = pros;
    if (cons !== undefined) review.cons = cons;
    if (wouldRecommend !== undefined) review.wouldRecommend = wouldRecommend;
    if (containsSpoilers !== undefined) review.containsSpoilers = containsSpoilers;

    const updatedItem = await item.save();

    res.status(200).json({
      message: 'Review updated successfully',
      review: updatedItem.reviews[reviewIndex],
      itemStats: {
        averageReviewScore: updatedItem.averageReviewScore,
        totalReviews: updatedItem.totalReviews,
        recommendationPercentage: updatedItem.recommendationPercentage
      }
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Delete user's review for an item
 * @param itemId
 * @param reviewId
 * @method DELETE
 * @example /reviews/delete/:itemId/:reviewId
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { userId } = req;
    const { itemId, reviewId } = req.params;

    const item = await Item.findById(itemId);
    if (!item) {
      const error = new Error('Could not find item');
      error.statusCode = 404;
      throw error;
    }

    const reviewIndex = item.reviews.findIndex(
      (review) => review._id.toString() === reviewId && review.userId.toString() === userId
    );

    if (reviewIndex === -1) {
      const error = new Error(
        'Review not found or you do not have permission to delete this review'
      );
      error.statusCode = 404;
      throw error;
    }

    item.reviews.splice(reviewIndex, 1);
    const updatedItem = await item.save();

    res.status(200).json({
      message: 'Review deleted successfully',
      itemStats: {
        averageReviewScore: updatedItem.averageReviewScore,
        totalReviews: updatedItem.totalReviews,
        recommendationPercentage: updatedItem.recommendationPercentage
      }
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Vote on review helpfulness
 * @param itemId
 * @param reviewId
 * @param isHelpful
 * @method POST
 * @example /reviews/vote/:itemId/:reviewId
 */
exports.voteOnReview = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  try {
    const { userId } = req;
    const { itemId, reviewId } = req.params;
    const { isHelpful } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      const error = new Error('Could not find item');
      error.statusCode = 404;
      throw error;
    }

    const review = item.reviews.find((review) => review._id.toString() === reviewId);
    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user already voted on this review
    const existingVoteIndex = review.helpfulVotes.findIndex(
      (vote) => vote.userId.toString() === userId
    );

    if (existingVoteIndex !== -1) {
      // Update existing vote
      review.helpfulVotes[existingVoteIndex].isHelpful = isHelpful;
    } else {
      // Add new vote
      review.helpfulVotes.push({ userId, isHelpful });
    }

    await item.save();

    const helpfulCount = review.helpfulVotes.filter((vote) => vote.isHelpful).length;
    const totalVotes = review.helpfulVotes.length;

    res.status(200).json({
      message: 'Vote recorded successfully',
      helpfulCount,
      totalVotes
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Get user's reviews across all items
 * @param sort (optional) - 'date', 'score'
 * @method GET
 * @example /reviews/my-reviews?sort=score
 */
exports.getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req;
    const { sort = 'date' } = req.query;

    // Find all items that contain reviews by this user
    const items = await Item.find({ 'reviews.userId': userId });

    const userReviews = [];

    items.forEach((item) => {
      const userReview = item.reviews.find((review) => review.userId.toString() === userId);
      if (userReview) {
        userReviews.push({
          ...userReview.toObject(),
          item: {
            _id: item._id,
            title: item.title,
            type: item.type,
            imgURL: item.imgURL
          },
          helpfulCount: userReview.helpfulVotes.filter((vote) => vote.isHelpful).length,
          totalVotes: userReview.helpfulVotes.length
        });
      }
    });

    // Apply sorting
    switch (sort) {
      case 'score':
        userReviews.sort((a, b) => b.score - a.score);
        break;
      case 'date':
      default:
        userReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }

    res.status(200).json({
      message: 'User reviews retrieved successfully',
      reviews: userReviews,
      totalReviews: userReviews.length
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};
