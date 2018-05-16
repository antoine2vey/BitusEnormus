// @flow
import type { Guild } from 'discord.js'
import type { dFirst } from '../types/data'

const First = require('../database/models/first')

class Server {
  getByGuildId(guild: Guild): Promise<dFirst> {
    return new Promise((resolve, reject) => {
      First
        .findByGuildId(guild.id)
        .then((firstServer) => {
          if (!firstServer) {
            const server = new First({
              guild_id: guild.id,
              has_done_first: true
            })

            return server.save()
              .then(guild => resolve(guild))
              .catch(err => reject(err))
          }

          resolve(firstServer)
        })
    })
  }

  resetGuilds(): Promise<boolean> {
    return First
      .update({}, { has_done_first: false }, { multi: true, new: true })
      .then(() => true)
      .catch(() => false)
  }

  doFirst(guild: Guild): Promise<dFirst> {
    return First
      .setFirst(guild.id)
      .then(server => server)
  }
}

module.exports = Server
