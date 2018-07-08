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
}

export default Helpers