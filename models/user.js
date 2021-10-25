const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    itemsList: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: 'Item',
        },
        yourRate: Number,
        status: {
          type: String,
          enum: {
            values: ['Watching', 'Completed', 'Plan to Watch', 'Dropped'],
            message: '{VALUE} is not allowed',
          },
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
