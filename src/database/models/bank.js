const mongoose = require('mongoose')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

const bankSchema = new Schema({
  belongs_to: {
    type: ObjectId,
    ref: 'user',
  },
  amount: {
    type: Number,
    required: true,
    default: 1000,
  },
  last_set: Date,
  last_get: Date,
})

bankSchema.statics = {
  findByUserId(userId) {
    return this.findOneAndUpdate(
      { belongs_to: userId },
      {},
      { new: true, setDefaultsOnInsert: true, upsert: true }
    )
  },
  withdrawById(bankId, amount) {
    return this.findByIdAndUpdate(
      bankId,
      { $inc: { amount: -amount } },
      { setDefaultsOnInsert: true, new: true, upsert: true }
    )
  },
  payById(bankId, amount) {
    return this.findByIdAndUpdate(
      bankId,
      { $inc: { amount } },
      { setDefaultsOnInsert: true, new: true, upsert: true }
    )
  }
}

module.exports = mongoose.model('bank', bankSchema)
