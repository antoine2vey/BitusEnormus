const mongoose = require('mongoose')

const Schema = mongoose.Schema

const firstSchema = new Schema({
  guildId: String,
  hasDoneFirst: {
    type: Boolean,
    default: true,
  },
})

module.exports = mongoose.model('first', firstSchema)
