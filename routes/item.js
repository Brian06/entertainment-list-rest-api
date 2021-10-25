const express = require('express');
const { body } = require('express-validator');

const itemController = require('../controllers/item');

const router = express.Router();

// GET /items/items/
router.get('/items', itemController.getItems);

// POST /items/item
router.post(
  '/item',
  [
    body('title').notEmpty().isString().trim().isLength({ min: 1, max: undefined }),
    body('type').notEmpty().isString().isIn(['Movie', 'TV Serie', 'Anime', 'Game']),
    body('episodes').notEmpty().isInt({ min: 1 }),
    body('description').isString(),
    body('durationMinutes').isInt({ min: 0 }),
    body('genres').isArray(),
    body('imgURL').isString(),
  ],
  itemController.createItem
);

router.put(
  '/item/:itemId',
  [
    body('title').notEmpty().isString().trim().isLength({ min: 1, max: undefined }),
    body('type').notEmpty().isString().isIn(['Movie', 'TV Serie', 'Anime', 'Game']),
    body('episodes').notEmpty().isInt({ min: 1 }),
    body('description').isString(),
    body('durationMinutes').isInt({ min: 0 }),
    body('genres').isArray(),
    body('imgURL').isString(),
  ],
  itemController.updateItem
);

router.get('/item/:itemId', itemController.getItem);
router.delete('/item/:itemId', itemController.deleteItem);

module.exports = router;
