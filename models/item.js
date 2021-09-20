const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemSchema = new Schema(
  {
    title: {
      type: String,
      require: true,
    },
    type: {
      type: String,
      enum: {
        values: ['Movie', 'TV Serie', 'Anime', 'Game'],
        message: '{VALUE} is not allowed',
      },
      require: true,
    },
    description: String,
    durationMinutes: {
      type: Number,
      min: [1, 'cant be a negative value'],
    },
    episodes: {
      type: Number,
      required: true,
      min: [1, 'cant be a negative value'],
      default: 1,
    },
    genres: {
      type: [String],
      enum: {
        // prettier-ignore
        values: ['Horror', 'Short', 'Mystery', 'Fantasy', 'Action', 'Adventure', 'Crime', 'Family', 'Reality-TV', 'History ', 'Western', 'Musical', 'Game-Show', 'Thriller', 'Drama', 'Comedy', 'Sci-Fi', 'Animation', 'Romance', 'Talk-Show', 'Documentary', 'Music', 'News', 'Biography', 'War', 'Sport', 'Sandbox', 'Real-time strategy', 'Shooters', 'Multiplayer online battle arena', 'Role-playing', 'Simulation and sports', 'Puzzlers and party games', 'Action-adventure', 'Survival and horror', 'Platformer', 'Action Role-playing', 'Japan Role-playing'],
        message: '{VALUE} is not allowed',
      },
    },
    imgURL: String,
    rates: [
      {
        userId: {
          type: mongoose.ObjectId,
          required: true,
          unique: true,
        },
        rate: {
          type: Number,
          required: true,
          min: [1, 'cant be a negative value, got {VALUE}'],
          max: [10, 'cant most than a 10, got {VALUE}'],
        },
      },
    ],
    likes: [
      {
        userId: {
          type: mongoose.ObjectId,
          required: true,
          unique: true,
        },
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.ObjectId,
          required: true,
          unique: true,
        },
        username: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        likes: [
          {
            userId: {
              type: mongoose.ObjectId,
              required: true,
              unique: true,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
