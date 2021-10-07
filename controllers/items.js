const { validationResult } = require('express-validator');
const Item = require('../models/item');

exports.getItems = async (req, res, next) => {
  try {
    const items = await Item.find();
    res.status(200).json({ message: 'Fetched Items successfully', items });
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    next(error); // TODO: rearch why was an error to have throw error
  }
  const { title, type, description, durationMinutes, episodes, genres, imgURL } = req.body;

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
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getItem = async (req, res, next) => {
  const { itemId } = req.params;
  try {
    const item = await Item.findById(itemId);
    if (!item) {
      const error = new Error('Could not find a post');
      error.statusCode = 404;
      next(error);
    }
    res.status(200).json({ message: 'Item fetched', item });
  } catch (err) {
    const error = err;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// TODO refactor the catch code to a single function
