import { dBank, dUser } from '../types/data'
import UserBank from '../database/models/bank'
import UserModel from '../database/models/user'
import { User, Guild } from 'discord.js'

class Bank {
  public checkBankExists(author: User, guildId: string): Promise<dBank> {
    return UserModel.findByDiscordId(author, guildId).then(
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
      }
    )
  }

  public checkIfCanWithdraw(
    author: User,
    guild: Guild,
    amount: number
  ): Promise<dBank> {
    return this.checkBankExists(author, guild.id).then(async bank => {
      if (this.canWithdraw(amount, bank.amount)) {
        await UserModel.pay(author, guild.id, amount)
        return UserBank.withdrawById(bank.id, amount)
      }

      return Promise.reject(null)
    })
  }

  public async increaseBank(
    user: dUser,
    author: User,
    guild: Guild,
    amount: number
  ): Promise<dBank> {
    if (this.canIncrease(amount, user.money)) {
      await UserModel.withdraw(author, guild.id, amount)
      return UserBank.increaseById(user.bank.id, amount)
    }

    return Promise.reject(null)
  }

  public async removeFromBank(user: dUser, amount: number): Promise<dBank> {
    return UserBank.withdrawById(user.bank.id, amount)
  }

  public canWithdraw(amount: number, available: number): boolean {
    return available >= amount
  }

  private canIncrease(amount: number, available: number): boolean {
    return this.canWithdraw(amount, available)
  }
}

export default Bank
