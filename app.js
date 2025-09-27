const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const itemsRoutes = require('./routes/item');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const entertainmentRoutes = require('./routes/entertainment');
const reviewRoutes = require('./routes/review');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/items', itemsRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/entertainment', entertainmentRoutes);
app.use('/reviews', reviewRoutes);
app.get('/', (req, res) =>
  res.send({
    message: 'Entertainment List REST API',
    version: '2.0.0',
    endpoints: {
      auth: '/auth',
      items: '/items',
      user: '/user (legacy)',
      entertainment: '/entertainment (new unified lists)',
      reviews: '/reviews (enhanced review system)'
    }
  })
);

app.use((error, req, res, next) => {
  const { message } = error;
  const status = error.statusCode || 500;
  const errors = error.errors || [];
  res.status(status).json({ message, errors });
});

mongoose
  .connect(
    'mongodb+srv://bsalazar:paramore100@cluster0.jeeb4.mongodb.net/entertainmentList?retryWrites=true&w=majority'
  )
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
