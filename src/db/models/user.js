const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const userSchema = new Schema({
  userId: String,
  guildId: String,
  username: String,
  kebabs: {
    type: Number,
    default: 500,
  },
  bank: {
    type: ObjectId,
    ref: 'bank',
  },
  isGettingRob: {
    type: Boolean,
    default: false,
  },
  robbedAt: Date,
  firstCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('user', userSchema);
