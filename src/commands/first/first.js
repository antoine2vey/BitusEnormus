// @flow

import type { Message } from 'discord.js'

const Commando = require('discord.js-commando')
const User = require('../../modules/user')
const Server = require('../../modules/server')
const Messages = require('../../modules/messages')

module.exports = class FirstCommand extends Commando.Command {
  constructor(client: any) {
    super(client, {
      name: 'first',
      aliases: ['first'],
      group: 'first',
      memberName: 'add',
      description: 'MAIS FIRST PUTAIN',
      details: 'FIRST BORDEL LA',
      examples: ['!first'],
      argsCount: 0
    })

    this.server = new Server()
    this.user = new User()
    this.message = new Messages()
  }

  async run(message: Message) {
    const { guild, author } = message

    this.server
      .getByGuildId(guild)
      .then(async (discordGuild) => {
        if (discordGuild.has_done_first) {
          return
        }

        await this.user.doFirst(author, guild)
        await this.server.doFirst(guild)

        return message.channel.send('Bien joué pour le first connard')
      })
      .catch(() => {
        message.channel.send('err')
      })
  }
}
