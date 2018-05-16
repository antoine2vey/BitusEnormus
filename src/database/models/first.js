const mongoose = require('mongoose')

const Schema = mongoose.Schema

const FirstSchema = new Schema({
  guild_id: String,
  has_done_first: {
    type: Boolean,
    default: true,
  }
})

FirstSchema.statics = {
  findByGuildId(guildId) {
    return this.findOne({ guild_id: guildId })
  },
  setFirst(guildId) {
    return this.findOneAndUpdate(
      { guild_id: guildId },
      { has_done_first: true },
      { upsert: true, setDefaultsOnInsert: true }
    )
  }
}

module.exports = mongoose.model('first', FirstSchema)
