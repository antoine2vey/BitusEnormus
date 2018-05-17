// @flow
import type { Emoji } from 'discord.js'

const { CronJob } = require('cron')
const mongoose = require('mongoose')

class Helpers {
  kebabId: string

  constructor(): void {
    this.kebabId = ''
  }

  makeTask(pattern: string, fn: Function): void {
    new CronJob(pattern, fn, null, true, 'Europe/Paris')
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
