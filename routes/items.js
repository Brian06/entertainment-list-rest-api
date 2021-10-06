const express = require('express');
const { body } = require('express-validator');

const itemsController = require('../controllers/items');

const router = express.Router();

// GET /items/items/
router.get('/items', itemsController.getItems);

// POST /items/item
router.post(
  '/item',
  [
    body('title').notEmpty().isString().trim().isLength({ min: 1, max: undefined }),
    body('type').notEmpty().isString().isIn(['Movie', 'TV Serie', 'Anime', 'Game']),
    body('episodes').notEmpty().isInt({ min: 0 }),
    // TODO validate optinal properties
  ],
  itemsController.createItem
);

router.get('/item/:itemId', itemsController.getItem);

module.exports = router;
