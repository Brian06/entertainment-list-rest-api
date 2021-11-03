const { validationResult } = require('express-validator');

const Item = require('../models/item');
const Utils = require('../utils/utils');

exports.getItems = async (req, res, next) => {
  try {
    let items;
    const currentPage = req.query.page;
    const perPage = 2;
    const totalItems = await Item.countDocuments();
    if (!totalItems) {
      const error = new Error('Could not find a items');
      error.statusCode = 404;
      throw error;
    }

    if (currentPage) {
      items = await Item.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
      res.status(200).json({ message: 'Fetched Items successfully', items, totalItems });
    } else {
      items = await Item.find();
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
    imgURL,
  });

  try {
    const result = await item.save();
    res.status(201).json({
      message: 'Item created successfully',
      item: result,
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
