import { Emoji } from 'discord.js'
import { CronJob } from 'cron'
import mongoose from 'mongoose'
import { CommandoClient } from 'discord.js-commando'

class Helpers {
  kebabId?: string

  makeTask(pattern: string, callback: () => void): CronJob {
    return new CronJob(pattern, callback, undefined, false, 'Europe/Paris')
  }

  bootDatabase(): Promise<typeof mongoose> {
    return mongoose.connect(
      'mongodb://mongo:27017/mappabot',
      { useNewUrlParser: true }
    )
  }

  getMoneyEmoji(client: CommandoClient): string {
    const emoji = client.emojis.find('name', 'kebab')

    if (emoji) {
      return `<:kebab:${emoji.id}>`
    } else {
      return `:moneybag:`
    }
  }

  getRoundedValue(value: string): number {
    return Math.round(parseFloat(value))
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
