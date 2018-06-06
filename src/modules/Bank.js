// @flow
import type { dBank } from '../types/data'

const UserBank = require('../database/models/bank')
const DiscordUser = require('../database/models/user')

class Bank {
  checkBankExists(authorId: string, guildId: string): Promise<dBank> {
    return DiscordUser.findByDiscordId(authorId, guildId).then(async (user) => {
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

  checkIfCanWithdraw(authorId: string, guildId: string, amount: number): Promise<dBank> {
    return this.checkBankExists(authorId, guildId).then((bank) => {
      if (this.canWithdraw(amount, bank.amount)) {
        return UserBank.withdrawById(bank.id, amount)
      }

      return Promise.reject(null)
    })
  }

  canWithdraw(amount: number, available: number): boolean {
    return available > amount
  }
}

module.exports = Bank
