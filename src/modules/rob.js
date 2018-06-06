// @flow
import type { User, Guild } from 'discord.js'
import type { dUser } from '../types/data'

type WorkerElement = {
  from: string,
  to: string
}

const DiscordUser = require('../modules/user')

const user = new DiscordUser()

class Rob {
  workers: Map<string, Array<WorkerElement>>
  DEFAULT_ROB_TIME: number

  constructor() {
    this.workers = new Map()
    this.DEFAULT_ROB_TIME = 5 * 60 * 1000
  }

  createWorker(guildId: string, authorId: string, targetId: string): void {
    const workers = this.getWorkers(guildId)
    this.workers.set(guildId, [...workers, { from: authorId, to: targetId }])
  }

  workerExists(guildId: string, authorId: string): boolean {
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

  deleteWorker(guildId: string, authorId: string): void {
    const workers = this.getWorkers(guildId)
    // delete worker from guild
    const filteredWorkers = workers.filter((worker: WorkerElement) => {
      return worker.from !== authorId
    })

    this.workers.set(guildId, filteredWorkers)
  }

  getInWorker(guildId: string, authorId: string): ?WorkerElement {
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

  getWorkers(guildId: string): Array<WorkerElement> {
    return this.workers.get(guildId) || []
  }

  steal(fromUser: User, guild: Guild, targetId: string, amount: number): Promise<dUser | boolean> {
    return user.exchange(fromUser, guild, targetId, amount)
  }

  start(authorId: string, guildId: string, targetId: string) {
    this.createWorker(guildId, authorId, targetId)

    const handleWorkerEvents = setTimeout(() => {
      this.deleteWorker(guildId, authorId)

      clearTimeout(handleWorkerEvents)
    }, this.DEFAULT_ROB_TIME)
  }

  stop(guildId: string, authorId: string): void {
    this.deleteWorker(guildId, authorId)
  }
}

module.exports = Rob
