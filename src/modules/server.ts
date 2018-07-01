import { Guild } from 'discord.js'
import { dFirst } from '../types/data'

import First from '../database/models/first';

class Server {
  getByGuildId(guild: Guild): Promise<dFirst> {
    return First.findByGuildId(guild.id)
  }

  resetGuilds(): Promise<boolean> {
    return First.resetAll().then(() => true)
  }

  doFirst(guild: Guild): Promise<dFirst> {
    return First.setFirst(guild.id)
  }
}

export default Server
