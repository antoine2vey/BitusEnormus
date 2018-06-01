// @flow
import type { Message } from 'discord.js'

const DiscordUser = require('./user')
const Server = require('./server')

class ModuleFirst extends DiscordUser {
  message: Message
  server: Server

  constructor(message: Message) {
    super()

    this.message = message
    this.server = new Server()
    this.handle()
  }

  handle() {
    const { guild, author } = this.message

    this.server
      .getByGuildId(guild)
      .then(async (discordGuild) => {
        if (discordGuild.has_done_first) {
          return this.message.channel.send('Ton serveur à fait le first déjà pd')
        }

        await this.doFirst(author, guild)
        await this.server.doFirst(guild)

        return this.message.channel.send('Bien joué pour le first connard')
      })
      .catch(() => {
        this.message.channel.send('err')
      })
  }
}

module.exports = ModuleFirst
