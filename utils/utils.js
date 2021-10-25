exports.catchHandleFunction = (err, next) => {
  const error = err;
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  next(error);
};
