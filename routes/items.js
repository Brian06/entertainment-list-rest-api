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
    body('title').isString().notEmpty().trim().isLength({ max: 100 }),
    body('type').isString().isIn(['Movie', 'TV Serie', 'Anime', 'Game']),
  ],
  itemsController.createItem
);

module.exports = router;
