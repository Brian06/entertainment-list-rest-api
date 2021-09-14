const { validationResult } = require('express-validator');

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
  const { title, type, duration, description } = req.body;
  res.status(201).json({
    message: 'Item created successfully',
    title,
    duration,
    description,
    type,
  });
};
