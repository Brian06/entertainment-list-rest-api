const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Utils = require('../utils/utils');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  const { email, password, username } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      username,
      password: hashedPassword,
    });
    const result = await user.save();
    res.status(201).json({ message: 'user created!', userId: result._id });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};
