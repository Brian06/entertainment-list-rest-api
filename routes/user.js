const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put(
  '/add-item',
  isAuth,
  [
    body('itemId').notEmpty().isString(),
    body('status')
      .notEmpty()
      .isString()
      .isIn(['Watching', 'Completed', 'Plan to Watch', 'Dropped']),
  ],
  userController.addItem
);

module.exports = router;
