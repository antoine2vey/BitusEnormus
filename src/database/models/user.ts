import mongoose, { Document, Model } from 'mongoose';
import { dUser } from '../../types/data';

const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
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
}, { timestamps: true })

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
  // updateByDiscordId(authorId, guildId, query) {
  //   return this.findOneAndUpdate(
  //     { guild_id: guildId, user_id: authorId },
  //     query,
  //     { upsert: true, new: true, setDefaultsOnInsert: true }
  //   ).populate('bank')
  // },
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

export interface IUser extends Document {}

export interface IUserModel extends Model<IUser> {
  findByDiscordId(authorId: string, guildId: string): Promise<dUser>
  findByGuild(guildId: string): Promise<dUser[]>
  // updateByDiscordId(authorId: string, guildId: string, query: Object): Promise<dUser>
  pay(authorId: string, guildId: string, amount: number): Promise<dUser>
  withdraw(authorId: string, guildId: string, amount: number): Promise<dUser>
  didFirst(authorId: string, guildId: string): Promise<dUser>
}

const User: IUserModel = mongoose.model<IUser, IUserModel>('user', userSchema)

export default User
