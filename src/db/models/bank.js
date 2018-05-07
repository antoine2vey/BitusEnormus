const mongoose = require('mongoose')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

const bankSchema = new Schema({
  belongsTo: {
    type: ObjectId,
    ref: 'user',
  },
  amount: {
    type: Number,
    required: true,
    default: 1000,
  },
  lastSet: Date,
  lastGet: Date,
})

module.exports = mongoose.model('bank', bankSchema)
