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
    // Unified entertainment list supporting all types
    entertainmentList: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: 'Item',
          required: true
        },
        status: {
          type: String,
          enum: {
            values: ['watching', 'completed', 'plan to watch', 'dropped', 'on hold'],
            message: '{VALUE} is not allowed'
          },
          required: true,
          default: 'plan to watch'
        },
        // User's personal score for this item (1-10)
        personalScore: {
          type: Number,
          min: [1, 'Score must be between 1 and 10'],
          max: [10, 'Score must be between 1 and 10']
        },
        // User's personal review
        personalReview: {
          type: String,
          maxlength: [2000, 'Review cannot exceed 2000 characters']
        },
        // Progress tracking
        currentEpisode: {
          type: Number,
          min: [0, 'Current episode cannot be negative'],
          default: 0
        },
        // When the user started/completed this item
        startDate: Date,
        completedDate: Date,
        // User's favorite status
        isFavorite: {
          type: Boolean,
          default: false
        },
        // Private notes
        notes: {
          type: String,
          maxlength: [1000, 'Notes cannot exceed 1000 characters']
        }
      }
    ],

    // Keep legacy lists for backward compatibility (deprecated)
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
