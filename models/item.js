const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemSchema = new Schema(
  {
    title: {
      type: String,
      require: true
    },
    type: {
      type: String,
      enum: {
        values: ['movie', 'serie', 'anime', 'game'],
        message: '{VALUE} is not allowed'
      },
      require: true
    },
    description: String,
    durationMinutes: {
      type: Number,
      min: [0, 'cant be a negative value']
    },
    episodes: {
      type: Number,
      required: true,
      min: [1, 'cant be a negative value']
    },
    genres: {
      type: [String],
      enum: {
        // prettier-ignore
        values: ['horror', 'short', 'mystery', 'fantasy', 'action', 'adventure', 'arime', 'family', 'reality-tv', 'history ', 'western', 'musical', 'game-show', 'thriller', 'drama', 'comedy', 'sci-fi', 'animation', 'romance', 'talk-show', 'documentary', 'music', 'news', 'biography', 'war', 'sport', 'sandbox', 'real-time strategy', 'shooters', 'multiplayer online battle arena', 'role-playing', 'simulation and sports', 'puzzlers and party games', 'action-adventure', 'survival and horror', 'platformer', 'action role-playing', 'japan role-playing'],
        message: '{VALUE} is not allowed'
      }
    },
    imgURL: String,
    rates: [
      {
        userId: {
          type: mongoose.ObjectId,
          required: true
        },
        rate: {
          type: Number,
          required: true,
          min: [1, 'cant be a negative value, got {VALUE}'],
          max: [10, 'cant most than a 10, got {VALUE}']
        }
      }
    ],
    likes: [
      {
        userId: {
          type: mongoose.ObjectId,
          required: true
        },
        like: Boolean
      }
    ],
    comments: [
      {
        userId: {
          type: mongoose.ObjectId,
          required: true
        },
        username: {
          type: String,
          required: true
        },
        comment: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          default: Date.now
        },
        likes: [
          {
            userId: {
              type: mongoose.ObjectId,
              required: true
            },
            like: Boolean
          }
        ]
      }
    ]
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

itemSchema.virtual('likesAmount').get(function () {
  if (this.likes) {
    const likes = this.likes.filter((obj) => obj.like === true);
    return likes.length;
  }
  return 0;
});

itemSchema.virtual('dislikesAmount').get(function () {
  if (this.likes) {
    const likes = this.likes.filter((obj) => obj.like === false);
    return likes.length;
  }
  return 0;
});

itemSchema.virtual('generalRate').get(function () {
  if (this.rates) {
    const sum = this.rates.reduce((accumulator, obj) => {
      return accumulator + obj.rate;
    }, 0); // initial value is 0
    return sum / this.rates.length;
  }
});

module.exports = mongoose.model('Item', itemSchema);
