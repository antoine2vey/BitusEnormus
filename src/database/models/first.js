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
    return this.findOneAndUpdate(
      { guild_id: guildId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  },
  setFirst(guildId) {
    return this.findOneAndUpdate(
      { guild_id: guildId },
      { has_done_first: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  },
  resetAll() {
    return this.update({}, { has_done_first: false }, { multi: true, new: true })
  }
}

module.exports = mongoose.model('first', FirstSchema)
