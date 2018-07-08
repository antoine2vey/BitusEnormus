import mongoose, { Document, Model } from 'mongoose';
import { dUser } from '../../types/data';
import { User } from 'discord.js';

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
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

userSchema.statics = {
  findByDiscordId(author: User, guildId: string) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: author.id, username: author.username },
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
  pay(author: User, guildId: string, amount: number) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: author.id, username: author.username },
      {
        $inc: {
          kebabs: amount
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  withdraw(author: User, guildId: string, amount: number) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: author.id, username: author.username },
      {
        $inc: {
          kebabs: -amount
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  didFirst(author: User, guildId: string) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: author.id, username: author.username },
      { $inc: { first_count: 1, kebabs: 1000 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }
}

export interface IUser extends Document {}

export interface IUserModel extends Model<IUser> {
  findByDiscordId(author: User, guildId: string): Promise<dUser>
  findByGuild(guildId: string): Promise<dUser[]>
  // updateByDiscordId(authorId: string, guildId: string, query: Object): Promise<dUser>
  pay(author: User, guildId: string, amount: number): Promise<dUser>
  withdraw(author: User, guildId: string, amount: number): Promise<dUser>
  didFirst(author: User, guildId: string): Promise<dUser>
}

const user: IUserModel = mongoose.model<IUser, IUserModel>('user', userSchema)

export default user
