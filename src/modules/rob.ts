import { User, Guild, GuildMember } from 'discord.js'
import { EventEmitter } from 'events'
import { dUser } from '../types/data'
import DiscordUser from '../modules/user'

type WorkerElement = {
  from: string
  to: string
  timer: NodeJS.Timer
}

type WorkerSocket = {
  authorId: string,
  guildId: string
}

const user = new DiscordUser()

class Rob {
  guilds: Map<string, Map<string, WorkerElement>>
  event: EventEmitter
  DEFAULT_ROB_TIME: number

  constructor() {
    this.guilds = new Map()
    this.DEFAULT_ROB_TIME = 5 * 60 * 1000
    this.event = new EventEmitter()

    this.event.on('clear_timer', ({ authorId, guildId }: WorkerSocket) => {
      const worker = this.getGuild(guildId).get(authorId)

      this.deleteWorker(guildId, authorId)
      clearTimeout(worker.timer)
    })
  }

  public createWorker(guildId: string, authorId: string, targetId: string): void {
    let guild = this.getGuild(guildId)

    guild.set(authorId, {
      from: authorId,
      to: targetId,
      timer: setTimeout(() => {
        // clear timer itself
        this.event.emit('clear_timer', { authorId, guildId })
      }, this.DEFAULT_ROB_TIME)
    })
  }

  public getWorker(guildId: string, authorId: string): WorkerElement | null {
    return this.getGuild(guildId).get(authorId) || null
  }

  public deleteWorker(guildId: string, authorId: string): void {
    this.getGuild(guildId).delete(authorId)
  }

  public workerExists(guildId: string, authorId: string): boolean {
    return this.getGuild(guildId).has(authorId)
  }

  public steal(
    fromUser: User,
    guild: Guild,
    target: GuildMember,
    amount: number,
  ): Promise<dUser> {
    return user.exchange(fromUser, guild, target, amount)
  }

  public start(guildId: string, authorId: string, targetId: string): void {
    this.createWorker(guildId, authorId, targetId)
  }

  public stop(guildId: string, targetId: string): void {
    this.deleteWorker(guildId, targetId)
  }

  public getGuild(guildId: string): Map<string, WorkerElement> {
    // Create if not exists
    if (!this.guilds.has(guildId)) {
      this.guilds.set(guildId, new Map())
    }

    return this.guilds.get(guildId)
  }
}

export default Rob
