const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom(async (value) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject(new Error('Email address already exists!'));
        }
      }),
    body('username')
      .notEmpty()
      .isString()
      .withMessage('Please enter a valid username.')
      .custom(async (value) => {
        const userDoc = await User.findOne({ username: value });
        if (userDoc) {
          return Promise.reject(new Error('Username already exists'));
        }
      }),
    body('password').trim().isLength({ min: 5 })
  ],
  authController.signup
);

router.post('/login', authController.login);

module.exports = router;
