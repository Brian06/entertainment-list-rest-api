const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');

const itemsRoutes = require('./routes/item');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  fileName: (req, file, cb) => {
    cb(null, `${new Date().toISOString()} - ${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
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
app.get('/', (req, res) => res.send({ hello: 'World' }));

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
