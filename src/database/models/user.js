const mongoose = require('mongoose')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

const userSchema = new Schema(
  {
    user_id: String,
    guild_id: String,
    username: String,
    kebabs: {
      type: Number,
      default: 500
    },
    bank: {
      type: ObjectId,
      ref: 'bank'
    },
    is_getting_rob: {
      type: Boolean,
      default: false
    },
    robbed_at: Date,
    first_count: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

userSchema.statics = {
  findByDiscordId(authorId, guildId) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: authorId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  findByGuild(guildId) {
    return this.find({ guild_id: guildId })
  },
  pay(authorId, guildId, amount) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: authorId },
      {
        $inc: {
          kebabs: amount
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  withdraw(authorId, guildId, amount) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: authorId },
      {
        $inc: {
          kebabs: -amount
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  didFirst(authorId, guildId) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: authorId },
      { $inc: { first_count: 1, kebabs: 1000 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }
}

module.exports = mongoose.model('user', userSchema)
