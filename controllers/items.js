const { validationResult } = require('express-validator');
const Item = require('../models/item');

exports.getItems = (req, res, next) => {
  Item.find()
    .then(items => {
      res.status(200).json({ message: 'Fetched Items successfully', items });
    })
    .catch(err => {
      const error = err;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.createItem = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    throw error;
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

  item
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Item created successfully',
        item: result,
      });
    })
    .catch(err => {
      const error = err;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getItem = (req, res, next) => {
  const { itemId } = req.params;
  Item.findById(itemId)
    .then(item => {
      if (!item) {
        const error = new Error('Could not find a post');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Item fetched', item });
    })
    .catch(err => {
      const error = err;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

// TODO refactor the catch code to a single function
