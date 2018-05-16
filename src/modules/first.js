// @flow
import type { Message } from 'discord.js'
import type { dFirst } from '../types/data'

const DiscordUser = require('./user')
const Server = require('./server')

const server = new Server()

class ModuleFirst extends DiscordUser {
  constructor(message: Message) {
    super(message)

    this.handle()
  }

  handle() {
    server.getByGuildId(this.message.guild)
      .then((guild) => {
        console.log(guild)
      })
      .catch((err) => {
        console.log(err)
        this.send('err')
      })
  }
}

module.exports = ModuleFirst
