const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    movieList: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: 'Item'
        },
        status: {
          type: String,
          enum: {
            values: ['watching', 'completed', 'plan to watch', 'dropped'],
            message: '{VALUE} is not allowed'
          },
          required: true
        }
      }
    ],
    serieList: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: 'Item'
        },
        status: {
          type: String,
          enum: {
            values: ['watching', 'completed', 'plan to watch', 'dropped'],
            message: '{VALUE} is not allowed'
          },
          required: true
        }
      }
    ],
    animeList: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: 'Item'
        },
        status: {
          type: String,
          enum: {
            values: ['watching', 'completed', 'plan to watch', 'dropped'],
            message: '{VALUE} is not allowed'
          },
          required: true
        }
      }
    ],
    gameList: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: 'Item'
        },
        status: {
          type: String,
          enum: {
            values: ['watching', 'completed', 'plan to watch', 'dropped'],
            message: '{VALUE} is not allowed'
          },
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
