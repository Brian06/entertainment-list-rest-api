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
    body('title').notEmpty().isString().trim(),
    body('type').notEmpty().isString().isIn(['Movie', 'TV Serie', 'Anime', 'Game']),
    body('description').isString().trim(),
    body('durationMinutes').isInt({ min: 0 }),
    body('episodes').notEmpty().isInt({ min: 0 }),
    body('genres').isArray(),
    body('imgURL').isString(),
  ],
  itemsController.createItem
);

module.exports = router;
