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
