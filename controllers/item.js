const { validationResult } = require('express-validator');

const Item = require('../models/item');
const User = require('../models/user');
const Utils = require('../utils/utils');

// TODO order by general rate
/**
 * @description Get all items, can be filter by type and if we send currentPage works with pagination
 * @param type
 * @param currentPage
 * @method GET
 * @example /items/items
 */
exports.getItems = async (req, res, next) => {
  try {
    const { type, currentPage } = req.query;
    const perPage = 2;
    const totalItems = await Item.countDocuments();
    let items;
    let filterObject;

    if (!totalItems) {
      const error = new Error('Could not find a items');
      error.statusCode = 404;
      throw error;
    }

    if (type) {
      filterObject = { type };
    }

    if (currentPage) {
      items = await Item.find(filterObject)
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
      res.status(200).json({ message: 'Fetched Items successfully', items, totalItems });
    } else {
      items = await Item.find(filterObject);
      res.status(200).json({ message: 'Fetched Items successfully', items });
    }
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
