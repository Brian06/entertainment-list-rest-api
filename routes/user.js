const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/user');
const user = require('../models/user');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom(async value => {
        const userDoc = await user.findOne({ email: value });
        if (userDoc) {
          return Promise.reject(new Error('Email address already exists!'));
        }
      }),
    body('username')
      .notEmpty()
      .isString()
      .withMessage('Please enter a valid username.')
      .custom(async value => {
        const userDoc = await user.findOne({ username: value });
        if (userDoc) {
          return Promise.reject(new Error('Username already exists'));
        }
      }),
    body('password').trim().isLength({ min: 5 }),
  ],
  userController.signup
);

router.post('/login', userController.login);

module.exports = router;
