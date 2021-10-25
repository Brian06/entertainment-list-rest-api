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
      .custom((value, { req }) => {
        return user.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email address already exists!');
          }
        });
      }),
    body('username')
      .notEmpty()
      .isString()
      .withMessage('Please enter a valid username.')
      .custom((value, { req }) => {
        return user.findOne({ username: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('Username already exists');
          }
        });
      }),
    body('password').trim().isLength({ min: 5 }),
  ],
  userController.signup
);

module.exports = router;
