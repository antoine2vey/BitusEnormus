import { Guild, User, GuildMember } from 'discord.js'
import { dUser } from '../types/data'

import DiscordBank from './bank'
import discordUser from '../database/models/user'
import { CommandMessage } from 'discord.js-commando'

class DiscordUser extends DiscordBank {
  public readonly BASIC_MESSAGE: number
  public readonly MESSAGE_WITH_MEDIA: number
  public readonly MESSAGE_WITH_PING: number
  public readonly AT_HERE: number
  public readonly AT_EVERYONE: number

  constructor() {
    super()

    this.BASIC_MESSAGE = 5
    this.MESSAGE_WITH_MEDIA = 8
    this.MESSAGE_WITH_PING = 10
    this.AT_HERE = 15
    this.AT_EVERYONE = 20
  }

  public async pay(user: User, guild: Guild, amount: number): Promise<dUser> {
    await this.get(user, guild)
    return discordUser.pay(user, guild.id, amount)
  }

  public async withdraw(
    user: User,
    guild: Guild,
    amount: number,
  ): Promise<dUser> {
    const client = await this.get(user, guild)
    if (this.canWithdraw(amount, client.kebabs)) {
      return discordUser.withdraw(user, guild.id, amount)
    }

    return Promise.reject(null)
  }

  public get(user: User, guild: Guild): Promise<dUser> {
    return this.checkBankExists(user, guild.id).then(() => {
      return discordUser.findByDiscordId(user, guild.id)
    })
  }

  public async getInGuild(user: User, guild: Guild): Promise<Array<dUser>> {
    await this.get(user, guild)

    return discordUser.findByGuild(guild.id)
  }

  public async doFirst(user: User, guild: Guild): Promise<dUser> {
    await this.get(user, guild)

    return discordUser.didFirst(user, guild.id)
  }

  public exchange(
    user: User,
    guild: Guild,
    target: GuildMember,
    amount: number,
  ): Promise<dUser> {
    const toTarget = <User>{
      id: target.user.id,
      username: target.user.username,
    }

    return this.withdraw(user, guild, amount)
      .then(() => this.pay(toTarget, guild, amount))
      .catch(() => Promise.reject(null))
  }

  public getInteractionValue(message: CommandMessage): number {
    const { mentions, content, attachments } = message

    if (mentions.everyone && content.includes('everyone')) {
      return this.AT_EVERYONE
    }

    if (mentions.everyone && content.includes('here')) {
      return this.AT_HERE
    }

    if (mentions.users.first()) {
      return this.MESSAGE_WITH_PING
    }

    if (attachments.first()) {
      return this.MESSAGE_WITH_MEDIA
    }

    return this.BASIC_MESSAGE
  }

  public handleMessage(message: CommandMessage): Promise<dUser> {
    const { author, guild } = message
    const score = this.getInteractionValue(message)
    const query = {
      $inc: {
        social_score: score
      }
    }

    return discordUser.updateByDiscordId(author, guild.id, query)
  }
}

export default DiscordUser
