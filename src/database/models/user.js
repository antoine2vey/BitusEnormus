const mongoose = require('mongoose')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

const userSchema = new Schema({
  user_id: String,
  guild_id: String,
  username: String,
  kebabs: {
    type: Number,
    default: 500,
  },
  bank: {
    type: ObjectId,
    ref: 'bank',
  },
  is_getting_rob: {
    type: Boolean,
    default: false,
  },
  robbed_at: Date,
  first_count: {
    type: Number,
    default: 0,
  },
}, { timestamps: true })

module.exports = mongoose.model('user', userSchema)
