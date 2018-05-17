// @flow
import type { Guild, User, Message } from 'discord.js'
import type { dBank } from '../types/data'

const UserBank = require('../database/models/bank')
const user = require('../database/models/user')

class Bank {
  guild: Guild
  author: User

  constructor(message: Message) {
    this.guild = message.guild
    this.author = message.author
  }

  get payload() {
    return {
      guildId: this.guild.id,
      userId: this.author.id
    }
  }

  checkBankExists(): Promise<dBank> {
    return user.findByDiscordId(this.payload)
      .then(async (user) => {
        const client = user
        if (!user.bank) {
          const newBank = new UserBank({ belongs_to: client.id })
          client.bank = newBank

          await newBank.save()
          await client.save()

          return Promise.resolve(newBank)
        }

        return Promise.resolve(user.bank)
      })
  }
}

module.exports = Bank
