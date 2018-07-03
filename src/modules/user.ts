import { Guild, User } from 'discord.js'
import { dUser } from '../types/data'

import DiscordBank from './bank';
import discordUser from '../database/models/user';

class DiscordUser extends DiscordBank {
  public async pay(user: User, guild: Guild, amount: number): Promise<dUser> {
    await this.get(user, guild)
    return discordUser.pay(user.id, guild.id, amount)
  }

  public async withdraw(user: User | { id: string }, guild: Guild, amount: number): Promise<dUser> {
    const client = await this.get(user, guild)
    if (this.canWithdraw(amount, client.kebabs)) {
      return discordUser.withdraw(user.id, guild.id, amount)
    }

    return Promise.reject(null)
  }

  public get(user: User | { id: string }, guild: Guild): Promise<dUser> {
    return this.checkBankExists(user.id, guild.id).then(() => {
      return discordUser.findByDiscordId(user.id, guild.id)
    })
  }

  public async getInGuild(user: User, guild: Guild): Promise<Array<dUser>> {
    await this.get(user, guild)

    return discordUser.findByGuild(guild.id)
  }

  public async doFirst(user: User, guild: Guild): Promise<dUser> {
    await this.get(user, guild)

    return discordUser.didFirst(user.id, guild.id)
  }

  public exchange(user: User, guild: Guild, targetId: string, amount: number): Promise<dUser> {
    const target = { id: targetId }

    return this.withdraw(target, guild, amount)
      .then(() => this.pay(user, guild, amount))
      .catch(() => Promise.reject(null))
  }
}

export default DiscordUser
