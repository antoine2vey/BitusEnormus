// @flow
import type { Guild } from 'discord.js'
import type { dFirst } from '../types/data'

const First = require('../database/models/first')

class Server {
  getByGuildId(guild: Guild): Promise<dFirst> {
    return First.findByGuildId(guild.id)
  }

  resetGuilds(): Promise<boolean> {
    return First.resetAll()
      .then(() => true)
      .catch(() => false)
  }

  doFirst(guild: Guild): Promise<dFirst> {
    return First.setFirst(guild.id)
  }
}

module.exports = Server
