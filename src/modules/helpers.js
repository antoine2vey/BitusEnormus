// @flow
import type { Emoji } from 'discord.js'

const { CronJob } = require('cron')
const mongoose = require('mongoose')

class Helpers {
  kebabId: ?string

  constructor(): void {
    this.kebabId = undefined
  }

  makeTask(pattern: string, callback: Function): any {
    return new CronJob({
      cronTime: pattern,
      start: false,
      timeZone: 'Europe/Paris',
      onTick: callback
    })
  }

  setNewEmote(emote: Emoji): void {
    this.kebabId = emote.id
  }

  bootDatabase(): Promise<void> {
    return mongoose.connect('mongodb://mongodb/mappabot')
  }

  get kebab(): string {
    return `<:kebab:${this.kebabId}>`
  }
}

module.exports = Helpers
