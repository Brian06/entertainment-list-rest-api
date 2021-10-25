const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    throw error;
  }

  const { email, password, username } = req.body;
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email,
        username,
        password: hashedPassword,
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'user created!', userId: result._id });
    })
    .catch(err => {
      const error = err;
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
