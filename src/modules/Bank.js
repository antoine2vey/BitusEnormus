// @flow
import type { Guild, User, Message } from 'discord.js'
import type { dBank, UserPayload } from '../types/data'

const UserBank = require('../database/models/bank')
const DiscordUser = require('../database/models/user')

class Bank {
  guild: Guild
  author: User

  constructor(message: Message) {
    this.guild = message.guild
    this.author = message.author
  }

  get payload(): UserPayload {
    return {
      guildId: this.guild.id,
      userId: this.author.id
    }
  }

  checkBankExists(): Promise<dBank> {
    return DiscordUser.findByDiscordId(this.payload)
      .then(async (user) => {
        const client = user
        if (!user.bank) {
          const newBank = new UserBank({ belongs_to: client.id })
          client.bank = newBank

          await newBank.save()
          await client.save()

          return Promise.resolve(newBank)
        }

        return Promise.resolve(client.bank)
      })
  }

  checkIfCanWithdraw(amount: number): Promise<dBank> {
    return this.checkBankExists()
      .then((bank) => {
        if (bank.amount > amount) {
          return UserBank.withdrawById(bank.id, amount)
        }

        return Promise.reject()
      })
  }
}

module.exports = Bank
