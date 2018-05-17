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

userSchema.statics = {
  findByDiscordId({ userId, guildId }) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: userId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  findByGuild(guildId) {
    return this.find({ guild_id: guildId })
  },
  updateByDiscordId({ userId, guildId }, query) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: userId },
      query,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  pay({ userId, guildId }, amount) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: userId },
      { $inc: {
        kebabs: amount
      } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  withdraw({ userId, guildId }, amount) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: userId },
      { $inc: {
        kebabs: -amount
      } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  didFirst({ userId, guildId }) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: userId },
      { $inc: { first_count: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }
}

module.exports = mongoose.model('user', userSchema)
