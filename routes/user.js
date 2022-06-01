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
    body('status').notEmpty().isString().isIn(['watching', 'completed', 'plan to watch', 'dropped'])
  ],
  userController.addItem
);

router.get('/get-items', isAuth, userController.getItems);

router.put('/remove-item/:itemId', isAuth, userController.removeItem);

router.put(
  '/update-item-status/:itemId',
  isAuth,
  [
    body('status').notEmpty().isString().isIn(['watching', 'completed', 'plan to watch', 'dropped'])
  ],
  userController.updateItemStatus
);

module.exports = router;
