import {
  User, Guild, TextChannel, DMChannel, GroupDMChannel,
} from 'discord.js'
import { EventEmitter } from 'events'
import DiscordUser from '../modules/user'
import {pubSub} from './pubsub'
import { CommandMessage } from 'discord.js-commando';

type WorkerElement = {
  from: string
  to: string
  timer: NodeJS.Timer
}

class Rob {
  guilds: Map<string, Map<string, WorkerElement>>
  event: EventEmitter
  DEFAULT_ROB_TIME: number
  DEFAULT_COOLDOWN_IN_HOURS: number
  ROB_DONE: string
  ROB_STOPPED: string
  user: DiscordUser

  constructor() {
    this.guilds = new Map()
    this.DEFAULT_ROB_TIME = 5 * 60 * 1000
    this.DEFAULT_COOLDOWN_IN_HOURS = 3
    this.event = new EventEmitter()
    this.user = new DiscordUser()
    this.ROB_DONE = 'ROB_DONE'
    this.ROB_STOPPED = 'ROB_STOPPED'
  }

  /**
   * Create worker that launch a timer that will steal money from target's bank.
   * Also emits ROB_DONE event on pubsub channel
   * @param guild Guild
   * @param author User
   * @param target User
   * @param channel TextChannel
   */
  public createWorker(guild: Guild, author: User, target: User, message: CommandMessage): void {
    const guildMap = this.getGuild(guild.id)

    guildMap.set(target.id, {
      from: author.id,
      to: target.id,
      timer: setTimeout(async () => {
        /**
         * We enter only here if the timer has come to his own end,
         * so that mean we do not have to clear it.
         * 
         * Here we do:
         *  - User steal from target bank
         *  - Emit to pubsub that rob has been done so we can send an alert to channel
         */
        const t = await this.user.get(target, guild)
        const bank = t.bank.amount
        const amount = Math.round(bank / 100 * 5) // Get 5% from bank

        await this.user.bankExchange(author, guild, target, amount)
        pubSub.emit(this.ROB_DONE, { author, guild, target, message })
      }, this.DEFAULT_ROB_TIME)
    })
  }

  /**
   * Return a worker in a given guild
   * @deprecated
   * @param guildId string
   * @param authorId string
   */
  public getWorker(guildId: string, authorId: string): WorkerElement | null {
    return this.getGuild(guildId).get(authorId) || null
  }

  /**
   * Delete a worker from a given guild, also clears timer to prevent bank exchange
   * @param guildId string
   * @param authorId string
   */
  public deleteWorker(guildId: string, authorId: string): void {
    const guild = this.getGuild(guildId)
    const user = guild.get(authorId)

    clearTimeout(user.timer)
    guild.delete(authorId)
  }

  /**
   * Start a worker for a given guild, checks done :
   *  - If date is between 1H00 and 9H00 (aka being too late)
   *  - If target is ourself or a bot
   *  - If we are in cooldown (3 hours)
   *  - If user has more than 500 in his bank
   * Else steals 5% of his bank. 
   * @param guild Guild
   * @param author User
   * @param target User
   * @param channel TextChannel
   */
  public start(guild: Guild, author: User, target: User, message: CommandMessage): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const [initiator, targettedUser] = await Promise.all([
          this.user.get(author, guild),
          this.user.get(target, guild)
        ])
  
        if (this.isTooLate()) {
          return reject('Tu ne peut pas voler entre 1h00 et 9h00. :smiling_imp:')
        }
  
        // If target ourself or bot
        if (target.id === author.id || target.bot) {
          return reject('Cible invalide.')
        }
  
        // If in cooldown
        if (this.isInCooldown(initiator.robbed_at)) {
          return reject('Tu dois encore attendre pour voler.')
        }
  
        // If target has more than 1000 money in bank, we can proceed stealing
        if (targettedUser.bank.amount >= 1000) {
          await this.user.setRobDate(author, guild)
          this.createWorker(guild, author, target, message)
  
          resolve(`<@${author.id}> est en train de voler <@${target.id}> :smiling_imp:`)
        } else {
          reject(`<@${author.id}> n'a pas assez d'argent`)
        }
      } catch (error) {
        reject(`Utilisateur inconnu ...`)
      }
    })
  }

  /**
   * Stops a rob, checks if user is in a worker.
   * @param guildId string
   * @param userId string
   */
  public stop(guildId: string, userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.isInWorker(guildId, userId)) {
        this.deleteWorker(guildId, userId)

        resolve('Vol stoppé')
      } else {
        reject('Tu ne subis actuellement aucun vol')
      }
    })
  }

  /**
   * Return a map of worker for a given guild, creates it if
   * it does not exist
   * @param guildId string
   */
  public getGuild(guildId: string): Map<string, WorkerElement> {
    // Create if not exists
    if (!this.guilds.has(guildId)) {
      this.guilds.set(guildId, new Map())
    }

    return this.guilds.get(guildId)
  }

  /**
   * Check if user is in this worker in a given guild
   * @param guildId string
   * @param userId string
   */
  private isInWorker(guildId: string, userId: string): boolean {
    return this.getGuild(guildId).has(userId)
  }

  /**
   * Check if user is in cooldown (3 hours wait for a rob)
   * @param d Date
   */
  private isInCooldown(d: Date): boolean {
    const offset = 60 * 60 * this.DEFAULT_COOLDOWN_IN_HOURS
    const date = d.getTime() / 1000
    const now = new Date().getTime() / 1000

    return date + offset > now
  }

  /**
   * Check if actual date is between 1H00 and 9H00
   */
  private isTooLate(): boolean {
    const date = new Date().getTime()
    const offset = 60 * 60 * 2 * 1000 // 2 hours offset with docker
    const now = new Date(date + offset)
    const hour = now.getHours()

    // TODO: Check this boolean
    return !(hour >= 9 || hour < 1)
  }
}

export default new Rob()