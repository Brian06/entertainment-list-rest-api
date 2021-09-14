exports.getItems = (req, res, next) => {
  res.status(200).json({
    items: [
      {
        type: 'Movie',
        title: 'Avengers',
        duration: '90',
        description: 'super heros movie',
      },
    ],
  });
};

exports.createItem = (req, res, next) => {
  const { title, type, duration, description } = req.body;
  res.status(201).json({
    message: 'Item created successfully',
  });
};
