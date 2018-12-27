import mongoose, { Document, Model } from 'mongoose'
import { dUser } from '../../types/data'
import { User } from 'discord.js'

const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema(
  {
    user_id: String,
    guild_id: String,
    username: String,
    money: {
      type: Number,
      default: 500
    },
    bank: {
      type: ObjectId,
      ref: 'bank'
    },
    robbed_at: {
      type: Date,
      default: new Date()
    },
    first_count: {
      type: Number,
      default: 0
    },
    social_score: {
      type: Number,
      default: 0
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

userSchema.statics = {
  findByDiscordId(author: User, guildId: string) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: author.id, username: author.username },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  findByGuild(guildId: string, query: {}) {
    return this.find({ guild_id: guildId }).sort(query)
  },
  updateByDiscordId(author: User, guildId: string, query: Object) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: author.id, username: author.username },
      query,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  pay(author: User, guildId: string, amount: number) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: author.id, username: author.username },
      {
        $inc: {
          money: amount
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
          money: -amount
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('bank')
  },
  didFirst(author: User, guildId: string) {
    return this.findOneAndUpdate(
      { guild_id: guildId, user_id: author.id, username: author.username },
      { $inc: { first_count: 1, money: 1000 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  },
  findAll() {
    return this.find({}).populate('bank')
  }
}

export interface IUser extends Document {}

export interface IUserModel extends Model<IUser> {
  findByDiscordId(author: User, guildId: string): Promise<dUser>
  findByGuild(guildId: string, query: {}): Promise<dUser[]>
  updateByDiscordId(
    author: User,
    guildId: string,
    query: Object
  ): Promise<dUser>
  pay(author: User, guildId: string, amount: number): Promise<dUser>
  withdraw(author: User, guildId: string, amount: number): Promise<dUser>
  didFirst(author: User, guildId: string): Promise<dUser>
  findAll(): Promise<dUser[]>
}

const user: IUserModel = mongoose.model<IUser, IUserModel>('user', userSchema)

export default user
