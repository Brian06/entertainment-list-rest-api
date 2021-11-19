const { validationResult } = require('express-validator');

const User = require('../models/user');
const Utils = require('../utils/utils');

exports.addItem = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  const { userId } = req;
  const { itemId, status } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Could not find an user');
      error.statusCode = 404;
      throw error;
    }

    const itemObject = { item: itemId, status };
    user.itemsList.push(itemObject);

    const updatedUser = await user.save();
    res.status(200).json({ message: 'Item inserted', updatedUser });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

// TODO order by general rate
exports.getItems = async (req, res, next) => {
  const { userId } = req;
  const { status, type } = req.query;
  let filteredList;

  try {
    const user = await User.findById(userId).populate({
      path: 'itemsList',
      populate: { path: 'item' }
    });
    if (!user) {
      const error = new Error('Could not find an user');
      error.statusCode = 404;
      throw error;
    }

    filteredList = user.itemsList;
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }

  if (status) {
    filteredList = filteredList.filter((objectItem) => objectItem.status === status);
  }

  if (type) {
    filteredList = filteredList.filter((objectItem) => {
      return objectItem.item.type === type;
    });
  }

  res.status(200).json({ message: 'fetched items', items: filteredList });
};
