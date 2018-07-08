import { Guild, User, GuildMember } from 'discord.js'
import { dUser } from '../types/data'

import DiscordBank from './bank';
import discordUser from '../database/models/user';

class DiscordUser extends DiscordBank {
  public async pay(user: User, guild: Guild, amount: number): Promise<dUser> {
    await this.get(user, guild)
    return discordUser.pay(user, guild.id, amount)
  }

  public async withdraw(user: User, guild: Guild, amount: number): Promise<dUser> {
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

  public exchange(user: User, guild: Guild, target: GuildMember, amount: number): Promise<dUser> {
    const toTarget = <User>{ id: target.user.id, username: target.user.username }

    return this.withdraw(user, guild, amount)
      .then(() => this.pay(toTarget, guild, amount))
      .catch(() => Promise.reject(null))
  }
}

export default DiscordUser
