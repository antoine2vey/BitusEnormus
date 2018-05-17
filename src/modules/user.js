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
      guildId: this.guild.id,
      userId: this.author.id
    }
  }

  async pay(amount: number): Promise<dUser> {
    await this.get()
    return user.pay(this.payload, amount)
  }

  async withdraw(amount: number): Promise<dUser> {
    const client = await this.get()
    if (this.canWithdraw(amount, client.kebabs)) {
      return user.withdraw(this.payload, amount)
    }

    return Promise.reject('Not enough money')
  }

  async get(): Promise<dUser> {
    return this.checkBankExists()
      .then(() => {
        return user.findByDiscordId(this.payload)
      })
  }

  async getInGuild(): Promise<Array<dUser>> {
    await this.get()

    return user.findByGuild(this.guild.id)
  }

  async hasDoneFirst(): Promise<dUser> {
    return user.didFirst(this.payload)
  }

  send(message: any) {
    return this.message.channel.send(message)
  }

  canWithdraw(amount: number, available: number): boolean {
    return available > amount
  }
}

module.exports = DiscordUser
