import mongoose, { Document, Model } from 'mongoose'
import { dFirst } from '../../types/data'

const FirstSchema = new mongoose.Schema({
  guild_id: String,
  has_done_first: {
    type: Boolean,
    default: false
  }
})

FirstSchema.statics = {
  findByGuildId(guildId: string) {
    return this.findOneAndUpdate(
      { guild_id: guildId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  },
  setFirst(guildId: string) {
    return this.findOneAndUpdate(
      { guild_id: guildId },
      { has_done_first: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  },
  resetAll() {
    return this.update(
      {},
      { has_done_first: false },
      { multi: true, new: true }
    )
  }
}

export interface IFirst extends Document {}

export interface IFirstModel extends Model<IFirst> {
  findByGuildId(guildId: string): Promise<dFirst>
  setFirst(guildId: string): Promise<dFirst>
  resetAll(): Promise<dFirst[]>
}

const First: IFirstModel = mongoose.model<IFirst, IFirstModel>(
  'first',
  FirstSchema
)

export default First
