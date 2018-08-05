import { Emoji } from 'discord.js'
import { CronJob } from 'cron'
import mongoose from 'mongoose'

class Helpers {
  kebabId?: string

  constructor() {
    this.kebabId = ''
  }

  makeTask(pattern: string, callback: () => void): CronJob {
    return new CronJob(pattern, callback, undefined, false, 'Europe/Paris')
  }

  setNewEmote(emote: Emoji): void {
    this.kebabId = emote.id
  }

  bootDatabase(): Promise<typeof mongoose> {
    return mongoose.connect('mongodb://mongodb:27017/mappabot')
  }

  get kebab(): string {
    return `<:kebab:${this.kebabId}>`
  }

  getMedal(position: number): string {
    switch (position) {
      case 1:
        return ':first_place:'
      case 2:
        return ':second_place:'
      case 3:
        return ':third_place:'
      default:
        return ':medal:'
    }
  }
}

export default Helpers
