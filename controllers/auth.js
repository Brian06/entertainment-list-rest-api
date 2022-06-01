const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      password: hashedPassword
    });
    const result = await user.save();
    res.status(201).json({ message: 'user created!', userId: result._id });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let user;

  try {
    user = await User.findOne({ email });

    if (!user) {
      const error = new Error('A user with this email could not be found!');
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error('A user with this email could not be found!');
      error.statusCode = 401;
      throw error;
    }
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }

  const token = jwt.sign(
    {
      email: user.email,
      username: user.username,
      userId: user._id.toString()
    },
    'twicebestgroupforsure',
    { expiresIn: '10h' }
  );

  res.status(200).json({ message: 'Logged in user!', token, userId: user._id.toString() });
};
