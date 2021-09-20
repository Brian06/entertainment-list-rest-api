const { validationResult } = require('express-validator');
const Item = require('../models/item');

exports.getItems = (req, res, next) => {
  res.status(200).json({
    items: [
      {
        type: 'Movie',
        title: 'Avengers',
        duration: '90',
        description: 'super heros movie',
      },
    ],
  });
};

exports.createItem = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Validations fails', errors: errors.array() });
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
      console.log(result);
      res.status(201).json({
        message: 'Item created successfully',
        item: result,
      });
    })
    .catch(err => console.log(err));
};
