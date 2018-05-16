// @flow
import type { Guild, User, Message } from 'discord.js'
import type { dUser } from '../types/data'

const user = require('../database/models/user')
const Bank = require('./bank')

class DiscordUser extends Bank {
  message: Message
  guild: Guild
  author: User

  constructor(message: Message) {
    super(message)

    this.message = message
    this.guild = this.message.guild
    this.author = this.message.author
  }

  get payload() {
    return {
      guild_id: this.guild.id,
      user_id: this.author.id
    }
  }

  get(): Promise<dUser> {
    return user
      .findOneAndUpdate(this.payload, {}, { upsert: true })
      .populate('bank')
  }

  getInGuild(): Promise<Array<dUser>> {
    return user
      .find({ guild_id: this.guild.id })
      .populate('bank')
  }

  hasDoneFirst(): Promise<dUser> {
    return user
      .findOneAndUpdate(this.payload, {
        first_count: {
          $inc: 1
        }
      }, {
        upsert: true,
        new: true
      })
  }

  send(message: any) {
    return this.message.channel.send(message)
  }
}

module.exports = DiscordUser
