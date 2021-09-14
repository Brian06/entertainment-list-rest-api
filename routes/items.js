const express = require('express');
const itemsController = require('../controllers/items');

const router = express.Router();

// GET /items/items/
router.get('/items', itemsController.getItems);

// POST /items/item
router.post('/item', itemsController.createItem);

module.exports = router;
