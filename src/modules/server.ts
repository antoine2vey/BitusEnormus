import { Guild } from 'discord.js'
import { dFirst } from '../types/data'

import First from '../database/models/first'

class Server {
  public getByGuildId(guild: Guild): Promise<dFirst> {
    return First.findByGuildId(guild.id)
  }

  public resetGuilds(): Promise<boolean> {
    return First.resetAll().then(() => true)
  }

  public doFirst(guild: Guild): Promise<dFirst> {
    return First.setFirst(guild.id)
  }
}

export default Server
