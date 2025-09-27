const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: {
        values: ['movie', 'serie', 'anime', 'game'],
        message: '{VALUE} is not allowed'
      },
      required: true
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
    // Additional metadata
    releaseDate: Date,
    status: {
      type: String,
      enum: ['ongoing', 'completed', 'upcoming', 'cancelled'],
      default: 'completed'
    },
    // For series/anime - season information
    season: Number,
    // For games - platform information
    platforms: [String],
    // Studio/Developer/Publisher
    studio: String,
    developer: String,
    publisher: String,
    // Content rating
    contentRating: {
      type: String,
      enum: [
        'G',
        'PG',
        'PG-13',
        'R',
        'NC-17',
        'TV-Y',
        'TV-Y7',
        'TV-G',
        'TV-PG',
        'TV-14',
        'TV-MA',
        'E',
        'E10+',
        'T',
        'M',
        'AO'
      ]
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
    // Enhanced review system
    reviews: [
      {
        userId: {
          type: mongoose.ObjectId,
          required: true
        },
        username: {
          type: String,
          required: true
        },
        // Review score (1-10)
        score: {
          type: Number,
          required: true,
          min: [1, 'Score must be between 1 and 10'],
          max: [10, 'Score must be between 1 and 10']
        },
        // Review text
        reviewText: {
          type: String,
          required: true,
          maxlength: [5000, 'Review cannot exceed 5000 characters']
        },
        // Review title/summary
        title: {
          type: String,
          maxlength: [200, 'Review title cannot exceed 200 characters']
        },
        // Pros and cons
        pros: [String],
        cons: [String],
        // Would recommend?
        wouldRecommend: Boolean,
        // Spoiler warning
        containsSpoilers: {
          type: Boolean,
          default: false
        },
        date: {
          type: Date,
          default: Date.now
        },
        // Helpfulness votes
        helpfulVotes: [
          {
            userId: {
              type: mongoose.ObjectId,
              required: true
            },
            isHelpful: Boolean
          }
        ]
      }
    ],

    // Keep legacy comments for backward compatibility
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
  if (this.rates && this.rates.length > 0) {
    const sum = this.rates.reduce((accumulator, obj) => {
      return accumulator + obj.rate;
    }, 0); // initial value is 0
    return sum / this.rates.length;
  }
  return 0;
});

// Enhanced review system virtuals
itemSchema.virtual('averageReviewScore').get(function () {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((accumulator, review) => {
      return accumulator + review.score;
    }, 0);
    return sum / this.reviews.length;
  }
  return 0;
});

itemSchema.virtual('totalReviews').get(function () {
  return this.reviews ? this.reviews.length : 0;
});

itemSchema.virtual('recommendationPercentage').get(function () {
  if (this.reviews && this.reviews.length > 0) {
    const recommendCount = this.reviews.filter((review) => review.wouldRecommend === true).length;
    return (recommendCount / this.reviews.length) * 100;
  }
  return 0;
});

// Combined rating from both old rates and new reviews
itemSchema.virtual('overallRating').get(function () {
  let totalScore = 0;
  let totalCount = 0;

  // Include legacy rates
  if (this.rates && this.rates.length > 0) {
    totalScore += this.rates.reduce((sum, rate) => sum + rate.rate, 0);
    totalCount += this.rates.length;
  }

  // Include new review scores
  if (this.reviews && this.reviews.length > 0) {
    totalScore += this.reviews.reduce((sum, review) => sum + review.score, 0);
    totalCount += this.reviews.length;
  }

  return totalCount > 0 ? totalScore / totalCount : 0;
});

module.exports = mongoose.model('Item', itemSchema);
