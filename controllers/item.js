const { validationResult } = require('express-validator');

const Item = require('../models/item');
const User = require('../models/user');
const Utils = require('../utils/utils');

// TODO order by general rate
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

exports.addComments = async (req, res, next) => {
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
