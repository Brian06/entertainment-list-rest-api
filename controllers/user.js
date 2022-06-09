const { validationResult } = require('express-validator');

const User = require('../models/user');
const Utils = require('../utils/utils');

/**
 * @description Add an item in any of the list
 * @param itemId
 * @param status
 * @param type
 * @method PUT
 * @example /user/add-item
 */
exports.addItem = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  const { userId } = req;
  const { itemId, status, type } = req.body;
  const listName = `${type}List`;

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Could not find an user');
      error.statusCode = 404;
      throw error;
    }

    const itemObject = { item: itemId, status };
    user[listName].push(itemObject);

    const updatedUser = await user.save();
    res.status(200).json({ message: 'Item inserted', updatedUser });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

// TODO order by general rate
/**
 * @description Get items of any list and any status or all list and all status if type and status are undefined
 * @param status
 * @param type
 * @method GET
 * @example /user/get-items?status=watching&type=movie
 */
exports.getItems = async (req, res, next) => {
  const { userId } = req;
  const { status, type } = req.query;
  const listName = `${type}List`;
  let filteredList;

  try {
    const user = await User.findById(userId).populate({
      path: listName,
      populate: { path: 'item' }
    });
    if (!user) {
      const error = new Error('Could not find an user');
      error.statusCode = 404;
      throw error;
    }

    filteredList = user[listName];
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }

  if (status) {
    filteredList = filteredList.filter((objectItem) => objectItem.status === status);
  }

  res.status(200).json({ message: 'fetched items', items: filteredList });
};

/**
 * @description Remove an item from any list
 * @param itemId
 * @param type
 * @method PUT
 * @example /user/remove-item/6296e275138c81ead836cc59
 */
exports.removeItem = async (req, res, next) => {
  try {
    const { userId } = req;
    const { itemId } = req.params;
    const { type } = req.body;
    const listName = `${type}List`;

    const user = await User.findById(userId).populate({
      path: listName,
      populate: { path: 'item' }
    });

    if (!user) {
      const error = new Error('Could not find an user');
      error.statusCode = 404;
      throw error;
    }

    const itemIndex = user[listName].findIndex((item) => item._id.toString() === itemId);

    if (itemIndex === -1) {
      const error = new Error('Could not find an item to remove');
      error.statusCode = 404;
      throw error;
    }

    user[listName].splice(itemIndex, 1);
    const updatedUser = await user.save();
    res.status(200).json({ message: 'Removed Item', list: updatedUser[listName] });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};

/**
 * @description Update an item from any list
 * @param itemId
 * @param status
 * @param type
 * @method PUT
 * @example /user/update-item-status/61493bde918656f2aae57f6d
 */
exports.updateItemStatus = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validations fails, entered data is incorrect');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  try {
    const { userId } = req;
    const { itemId } = req.params;
    const { status, type } = req.body;
    const listName = `${type}List`;

    const user = await User.findById(userId).populate({
      path: listName,
      populate: { path: 'item' }
    });

    if (!user) {
      const error = new Error('Could not find an user');
      error.statusCode = 404;
      throw error;
    }

    const selectedItem = user[listName].find((item) => item._id.toString() === itemId);

    if (!selectedItem) {
      const error = new Error('Could not find an item to update');
      error.statusCode = 404;
      throw error;
    } else {
      selectedItem.status = status;
    }

    const updatedUser = await user.save();
    res.status(200).json({ message: 'Status updated', updatedItem: selectedItem, updatedUser });
  } catch (err) {
    Utils.catchHandleFunction(err, next);
  }
};
