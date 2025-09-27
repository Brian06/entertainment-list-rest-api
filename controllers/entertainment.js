const { validationResult } = require('express-validator');

const User = require('../models/user');
const Item = require('../models/item');
const Utils = require('../utils/utils');

/**
 * @description Add an item to user's entertainment list with enhanced features
 * @param itemId
 * @param status
 * @param personalScore (optional)
 * @param personalReview (optional)
 * @param currentEpisode (optional)
 * @param isFavorite (optional)
 * @param notes (optional)
 * @method POST
 * @example /entertainment/add-item
 */
exports.addToList = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  try {
    const { userId } = req;
    const {
      itemId,
      status = 'plan to watch',
      personalScore,
      personalReview,
      currentEpisode = 0,
      isFavorite = false,
      notes
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Could not find user');
      error.statusCode = 404;
      throw error;
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      const error = new Error('Could not find item');
      error.statusCode = 404;
      throw error;
    }

    // Check if item already exists in user's list
    const existingItemIndex = user.entertainmentList.findIndex(
      (listItem) => listItem.item.toString() === itemId
    );

    if (existingItemIndex !== -1) {
      const error = new Error('Item already exists in your list');
      error.statusCode = 409;
      throw error;
    }

    const listItem = {
      item: itemId,
      status,
      currentEpisode,
      isFavorite,
      startDate: status === 'watching' ? new Date() : undefined,
      completedDate: status === 'completed' ? new Date() : undefined
    };

    // Add optional fields if provided
    if (personalScore) listItem.personalScore = personalScore;
    if (personalReview) listItem.personalReview = personalReview;
    if (notes) listItem.notes = notes;

    user.entertainmentList.push(listItem);
    const updatedUser = await user.save();

    res.status(201).json({
      message: 'Item added to your entertainment list',
      listItem: updatedUser.entertainmentList[updatedUser.entertainmentList.length - 1]
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Get user's entertainment list with filtering options
 * @param status (optional)
 * @param type (optional)
 * @param isFavorite (optional)
 * @param sort (optional) - 'score', 'date', 'title', 'rating'
 * @method GET
 * @example /entertainment/list?status=watching&type=anime&sort=score
 */
exports.getList = async (req, res, next) => {
  try {
    const { userId } = req;
    const { status, type, isFavorite, sort = 'date' } = req.query;

    const user = await User.findById(userId).populate({
      path: 'entertainmentList.item'
    });

    if (!user) {
      const error = new Error('Could not find user');
      error.statusCode = 404;
      throw error;
    }

    let filteredList = user.entertainmentList;

    // Apply filters
    if (status) {
      filteredList = filteredList.filter((item) => item.status === status);
    }

    if (type) {
      filteredList = filteredList.filter((item) => item.item.type === type);
    }

    if (isFavorite === 'true') {
      filteredList = filteredList.filter((item) => item.isFavorite === true);
    }

    // Apply sorting
    switch (sort) {
      case 'score':
        filteredList.sort((a, b) => (b.personalScore || 0) - (a.personalScore || 0));
        break;
      case 'title':
        filteredList.sort((a, b) => a.item.title.localeCompare(b.item.title));
        break;
      case 'rating':
        filteredList.sort((a, b) => (b.item.overallRating || 0) - (a.item.overallRating || 0));
        break;
      case 'date':
      default:
        filteredList.sort(
          (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
        break;
    }

    res.status(200).json({
      message: 'Entertainment list retrieved successfully',
      items: filteredList,
      totalItems: filteredList.length
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Update an item in user's entertainment list
 * @param itemId
 * @param status (optional)
 * @param personalScore (optional)
 * @param personalReview (optional)
 * @param currentEpisode (optional)
 * @param isFavorite (optional)
 * @param notes (optional)
 * @method PUT
 * @example /entertainment/update-item/:itemId
 */
exports.updateListItem = async (req, res, next) => {
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
    const { status, personalScore, personalReview, currentEpisode, isFavorite, notes } = req.body;

    const user = await User.findById(userId).populate({
      path: 'entertainmentList.item'
    });

    if (!user) {
      const error = new Error('Could not find user');
      error.statusCode = 404;
      throw error;
    }

    const listItemIndex = user.entertainmentList.findIndex(
      (item) => item.item._id.toString() === itemId
    );

    if (listItemIndex === -1) {
      const error = new Error('Item not found in your entertainment list');
      error.statusCode = 404;
      throw error;
    }

    const listItem = user.entertainmentList[listItemIndex];

    // Update fields if provided
    if (status !== undefined) {
      listItem.status = status;

      // Update dates based on status
      if (status === 'watching' && !listItem.startDate) {
        listItem.startDate = new Date();
      } else if (status === 'completed') {
        listItem.completedDate = new Date();
      }
    }

    if (personalScore !== undefined) listItem.personalScore = personalScore;
    if (personalReview !== undefined) listItem.personalReview = personalReview;
    if (currentEpisode !== undefined) listItem.currentEpisode = currentEpisode;
    if (isFavorite !== undefined) listItem.isFavorite = isFavorite;
    if (notes !== undefined) listItem.notes = notes;

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Entertainment list item updated successfully',
      listItem: updatedUser.entertainmentList[listItemIndex]
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Remove an item from user's entertainment list
 * @param itemId
 * @method DELETE
 * @example /entertainment/remove-item/:itemId
 */
exports.removeFromList = async (req, res, next) => {
  try {
    const { userId } = req;
    const { itemId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Could not find user');
      error.statusCode = 404;
      throw error;
    }

    const listItemIndex = user.entertainmentList.findIndex(
      (item) => item.item.toString() === itemId
    );

    if (listItemIndex === -1) {
      const error = new Error('Item not found in your entertainment list');
      error.statusCode = 404;
      throw error;
    }

    user.entertainmentList.splice(listItemIndex, 1);
    await user.save();

    res.status(200).json({
      message: 'Item removed from your entertainment list successfully'
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Get user's statistics
 * @method GET
 * @example /entertainment/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId).populate({
      path: 'entertainmentList.item'
    });

    if (!user) {
      const error = new Error('Could not find user');
      error.statusCode = 404;
      throw error;
    }

    const stats = {
      totalItems: user.entertainmentList.length,
      byStatus: {},
      byType: {},
      favorites: user.entertainmentList.filter((item) => item.isFavorite).length,
      averagePersonalScore: 0,
      totalWatchTime: 0
    };

    // Calculate statistics
    user.entertainmentList.forEach((listItem) => {
      const { status, personalScore, item } = listItem;

      // Count by status
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Count by type
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;

      // Calculate total watch time for completed items
      if (status === 'completed' && item.durationMinutes) {
        stats.totalWatchTime += item.durationMinutes * (item.episodes || 1);
      }
    });

    // Calculate average personal score
    const scoredItems = user.entertainmentList.filter((item) => item.personalScore);
    if (scoredItems.length > 0) {
      const totalScore = scoredItems.reduce((sum, item) => sum + item.personalScore, 0);
      stats.averagePersonalScore = totalScore / scoredItems.length;
    }

    res.status(200).json({
      message: 'User statistics retrieved successfully',
      stats
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};
