import mongoose, { Model, Document } from 'mongoose'
import { dBank } from '../../types/data'
import { ObjectID } from 'bson'

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
  withdrawById(bankId: ObjectID, amount: number): Promise<dBank> {
    return this.findByIdAndUpdate(
      bankId,
      { $inc: { amount: -amount } },
      { setDefaultsOnInsert: true, new: true, upsert: true },
    )
  },
  increaseById(bankId: ObjectID, amount: number): Promise<dBank> {
    return this.findByIdAndUpdate(
      bankId,
      { $inc: { amount } },
      { setDefaultsOnInsert: true, new: true, upsert: true }
    )
  }
}

export interface IBank extends Document {}

export interface IBankModel extends Model<IBank> {
  withdrawById(bankId: ObjectID, amount: number): Promise<dBank>
  increaseById(bankId: ObjectID, amount: number): Promise<dBank>
}

const Bank: IBankModel = mongoose.model<IBank, IBankModel>('bank', bankSchema)

export default Bank
