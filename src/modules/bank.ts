import { dBank } from '../types/data'
import UserBank from '../database/models/bank'
import DiscordUser from '../database/models/user'
import { User } from 'discord.js'

class Bank {
  public checkBankExists(author: User, guildId: string): Promise<dBank> {
    return DiscordUser.findByDiscordId(author, guildId).then(
      async (user: any) => {
        const client = user
        if (!user.bank) {
          const newBank = new UserBank({ belongs_to: client.id })
          client.bank = newBank

          await newBank.save()
          await client.save()

          return Promise.resolve(newBank)
        }

        return Promise.resolve(client.bank)
      },
    )
  }

  public checkIfCanWithdraw(
    author: User,
    guildId: string,
    amount: number,
  ): Promise<dBank> {
    return this.checkBankExists(author, guildId).then(bank => {
      if (this.canWithdraw(amount, bank.amount)) {
        return UserBank.withdrawById(bank.id, amount)
      }

      return Promise.reject(null)
    })
  }

  public canWithdraw(amount: number, available: number): boolean {
    return available >= amount
  }
}

export default Bank
