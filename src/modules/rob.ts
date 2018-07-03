import { User, Guild } from 'discord.js'
import { dUser } from '../types/data'
import DiscordUser from '../modules/user'

type WorkerElement = {
  from: string,
  to: string
}


const user = new DiscordUser()

class Rob {
  workers: Map<string, Array<WorkerElement>>
  DEFAULT_ROB_TIME: number

  constructor() {
    this.workers = new Map()
    this.DEFAULT_ROB_TIME = 5 * 60 * 1000
  }

  public createWorker(guildId: string, authorId: string, targetId: string): void {
    const workers = this.getWorkers(guildId)
    this.workers.set(guildId, [...workers, { from: authorId, to: targetId }])
  }

  public workerExists(guildId: string, authorId: string): boolean {
    if (this.workers.has(guildId)) {
      const workers = this.getWorkers(guildId)
      const exists = workers.some((worker: WorkerElement) => {
        return worker.from === authorId
      })

      if (exists) {
        return true
      }

      return false
    }

    return false
  }

  public deleteWorker(guildId: string, authorId: string): void {
    const workers = this.getWorkers(guildId)
    // delete worker from guild
    const filteredWorkers = workers.filter((worker: WorkerElement) => {
      return worker.from !== authorId
    })

    this.workers.set(guildId, filteredWorkers)
  }

  public getInWorker(guildId: string, authorId: string): WorkerElement | null {
    const workers = this.getWorkers(guildId)

    // no need to process if no workers in this guild
    if (!workers.length) {
      return null
    }

    // check if worker exists
    const worker = workers.find((worker: WorkerElement) => {
      return worker.from === authorId
    })

    return worker
  }

  public getWorkers(guildId: string): Array<WorkerElement> {
    return this.workers.get(guildId) || []
  }

  public steal(fromUser: User, guild: Guild, targetId: string, amount: number): Promise<dUser> {
    return user.exchange(fromUser, guild, targetId, amount)
  }

  public start(authorId: string, guildId: string, targetId: string) {
    this.createWorker(guildId, authorId, targetId)

    const handleWorkerEvents = setTimeout(() => {
      this.deleteWorker(guildId, authorId)

      clearTimeout(handleWorkerEvents)
    }, this.DEFAULT_ROB_TIME)
  }

  public stop(guildId: string, authorId: string): void {
    this.deleteWorker(guildId, authorId)
  }
}

export default Rob
