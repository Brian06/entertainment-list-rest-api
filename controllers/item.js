const { validationResult } = require('express-validator');

const Item = require('../models/item');
const User = require('../models/user');
const Utils = require('../utils/utils');

/**
 * @description Get all items with enhanced filtering, search, and sorting
 * @param type (optional)
 * @param currentPage (optional)
 * @param search (optional) - search in title and description
 * @param genre (optional)
 * @param minRating (optional)
 * @param maxRating (optional)
 * @param status (optional) - ongoing, completed, upcoming, cancelled
 * @param sort (optional) - 'title', 'rating', 'date', 'reviews'
 * @param order (optional) - 'asc', 'desc'
 * @method GET
 * @example /items/items?type=anime&search=naruto&genre=action&sort=rating&order=desc
 */
exports.getItems = async (req, res, next) => {
  try {
    const {
      type,
      currentPage,
      search,
      genre,
      minRating,
      maxRating,
      status,
      sort = 'date',
      order = 'desc'
    } = req.query;

    const perPage = 12;
    const filterObject = {};

    // Build filter object
    if (type) {
      filterObject.type = type;
    }

    if (search) {
      filterObject.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      filterObject.genres = { $in: [genre] };
    }

    if (status) {
      filterObject.status = status;
    }

    // Get items with filtering
    let query = Item.find(filterObject);

    // Apply sorting
    const sortObject = {};
    switch (sort) {
      case 'title':
        sortObject.title = order === 'asc' ? 1 : -1;
        break;
      case 'rating':
        // Note: Virtual fields can't be used in sort, so we'll sort after retrieval
        break;
      case 'reviews':
        // Sort by number of reviews (array length)
        break;
      case 'date':
      default:
        sortObject.createdAt = order === 'asc' ? 1 : -1;
        break;
    }

    if (Object.keys(sortObject).length > 0) {
      query = query.sort(sortObject);
    }

    // Get total count for pagination
    const totalItems = await Item.countDocuments(filterObject);

    if (totalItems === 0) {
      return res.status(200).json({
        message: 'No items found matching your criteria',
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: currentPage ? parseInt(currentPage) : 1
      });
    }

    let items;
    if (currentPage) {
      items = await query.skip((currentPage - 1) * perPage).limit(perPage);
    } else {
      items = await query;
    }

    // Apply rating filter and sorting for virtual fields after retrieval
    if (minRating || maxRating || sort === 'rating' || sort === 'reviews') {
      if (minRating) {
        items = items.filter((item) => (item.overallRating || 0) >= parseFloat(minRating));
      }
      if (maxRating) {
        items = items.filter((item) => (item.overallRating || 0) <= parseFloat(maxRating));
      }

      // Sort by virtual fields
      if (sort === 'rating') {
        items.sort((a, b) => {
          const aRating = a.overallRating || 0;
          const bRating = b.overallRating || 0;
          return order === 'asc' ? aRating - bRating : bRating - aRating;
        });
      } else if (sort === 'reviews') {
        items.sort((a, b) => {
          const aReviews = a.totalReviews || 0;
          const bReviews = b.totalReviews || 0;
          return order === 'asc' ? aReviews - bReviews : bReviews - aReviews;
        });
      }
    }

    const response = {
      message: 'Fetched items successfully',
      items,
      totalItems: items.length,
      filters: {
        type,
        search,
        genre,
        minRating,
        maxRating,
        status,
        sort,
        order
      }
    };

    if (currentPage) {
      response.totalPages = Math.ceil(totalItems / perPage);
      response.currentPage = parseInt(currentPage);
      response.perPage = perPage;
    }

    res.status(200).json(response);
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Add a new item to the database
 * @param title
 * @param type
 * @param description
 * @param durationMinutes
 * @param episodes
 * @param imgURL
 * @param genres
 * @method POST
 * @example /items/item
 */
exports.createItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }
  const { title, type, description, durationMinutes, episodes, imgURL, genres } = req.body;

  const item = new Item({
    title,
    type,
    description,
    durationMinutes,
    episodes,
    genres,
    imgURL
  });

  try {
    const result = await item.save();
    res.status(201).json({
      message: 'Item created successfully',
      item: result
    });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Get an item
 * @param itemId
 * @method GET
 * @example /items/item/61493bc8371a75b8d395475b
 */
exports.getItem = async (req, res, next) => {
  const { itemId } = req.params;
  try {
    const item = await Item.findById(itemId);
    if (!item) {
      const error = new Error('Could not find a item');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: 'Fetched Item', item });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Update the info of an item
 * @param itemId
 * @param title
 * @param type
 * @param description
 * @param durationMinutes
 * @param episodes
 * @param imgURL
 * @param genres
 * @method PUT
 * @example /items/item/61493bc8371a75b8d395475b
 */
exports.updateItem = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  const { itemId } = req.params;
  const { title, type, description, durationMinutes, episodes, imgURL, genres } = req.body;

  try {
    const item = await Item.findById(itemId);
    if (!item) {
      const error = new Error('Could not find a item');
      error.statusCode = 404;
      throw error;
    }

    item.title = title;
    item.type = type;
    item.description = description;
    item.durationMinutes = durationMinutes;
    item.episodes = episodes;
    item.imgURL = imgURL;
    item.genres = genres;

    const updatedItem = await item.save();
    res.status(200).json({ message: 'Updated Item', updatedItem });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Delete an item
 * @param itemId
 * @method DELETE
 * @example /items/item/6161cafd2befe0be7f48963c
 */
exports.deleteItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const deleteItem = await Item.findByIdAndDelete(itemId);

    if (!deleteItem) {
      const error = new Error('Could not find a item');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: 'Deleted Item', deleteItem });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Update rate for a specific item
 * @param userId
 * @param itemId
 * @param rate
 * @param remove
 * @param userId
 * @method PUT
 * @example /items/rate/6148ed414a415a8a46a55b09
 */
exports.updateRate = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  try {
    const { userId } = req;
    const { itemId } = req.params;
    const { rate, remove } = req.body;
    const rateObj = { userId, rate };
    const item = await Item.findById(itemId);
    const index = item.rates.findIndex((currentRate) => currentRate.userId.toString() === userId);

    if (remove && index !== -1) {
      item.rates.splice(index, 1);
    } else if (remove) {
      const error = new Error('rate data not found');
      error.statusCode = 404;
      error.errors = errors.array();
      return next(error);
    } else if (index !== -1) {
      item.rates[index].rate = rate;
    } else {
      item.rates.push(rateObj);
    }

    const updatedItem = await item.save();
    res.status(200).json({ message: 'Updated Item', updatedItem });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Update likes for a specific item
 * @param userId
 * @param itemId
 * @param like
 * @param remove
 * @param userId
 * @method PUT
 * @example /items/likes/6148ed414a415a8a46a55b09
 */
exports.updateLikes = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  try {
    const { userId } = req;
    const { itemId } = req.params;
    const { like, remove } = req.body;
    const likeObj = { userId, like };
    const item = await Item.findById(itemId);
    const index = item.likes.findIndex((currentLike) => currentLike.userId.toString() === userId);

    if (remove && index !== -1) {
      item.likes.splice(index, 1);
    } else if (remove) {
      const error = new Error('like data not found');
      error.statusCode = 404;
      error.errors = errors.array();
      return next(error);
    } else if (index !== -1) {
      item.likes[index].like = like;
    } else {
      item.likes.push(likeObj);
    }

    const updatedItem = await item.save();
    res.status(200).json({ message: 'Updated Item', updatedItem });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Get comments from a specific item
 * @param itemId
 * @method GET
 * @example /items/comments/6148ed414a415a8a46a55b09/
 */
exports.getComments = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item) {
      const error = new Error('Could not find a item');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: 'Fetched comments', comments: item.comments });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Add a comment in a specific item
 * @param userId
 * @param itemId
 * @param comment
 * @method PUT
 * @example /items/comments/6148ed414a415a8a46a55b09
 */
exports.addComment = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  try {
    const { userId } = req;
    const { itemId } = req.params;
    const { comment } = req.body;
    const user = await User.findById(userId);
    const item = await Item.findById(itemId);
    const commentObj = { userId, username: user.username, comment };

    item.comments.push(commentObj);
    const updatedItem = await item.save();
    res.status(200).json({ message: 'Updated Item', comments: updatedItem.comments });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Edit a comment from a specific item
 * @param userId
 * @param itemId
 * @param commentId
 * @param comment
 * @method PUT
 * @example /items/comments/6148ed414a415a8a46a55b09/61d2116f075
 */
exports.editComment = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  try {
    const { userId } = req;
    const { itemId, commentId } = req.params;
    const { comment } = req.body;
    const user = await User.findById(userId);
    const item = await Item.findById(itemId);
    const commentObj = { userId, username: user.username, comment };
    const index = item.comments.findIndex(
      (currentComment) => currentComment._id.toString() === commentId
    );

    if (index === -1) {
      const error = new Error('comment data not found');
      error.statusCode = 404;
      error.errors = errors.array();
      return next(error);
    }

    item.comments.splice(index, 1, commentObj);
    const updatedItem = await item.save();
    res.status(200).json({ message: 'Updated Item', comments: updatedItem.comments });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Remove a comment from a specific item
 * @param userId
 * @param itemId
 * @param commentId
 * @method DELETE
 * @example /items/comments/6148ed414a415a8a46a55b09/61d2116f075
 */
exports.removeComment = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    const { userId } = req;
    const { itemId, commentId } = req.params;
    const item = await Item.findById(itemId);
    const index = item.comments.findIndex(
      (currentComment) => currentComment._id.toString() === commentId
    );

    if (index === -1) {
      const error = new Error('comment data not found');
      error.statusCode = 404;
      error.errors = errors.array();
      return next(error);
    }

    if (item.comments[index].userId.toString() !== userId) {
      const error = new Error('comment is not from this user');
      error.statusCode = 404;
      error.errors = errors.array();
      return next(error);
    }

    item.comments.splice(index, 1);
    const updatedItem = await item.save();
    res.status(200).json({ message: 'Updated Item', comments: updatedItem.comments });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};
