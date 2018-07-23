import { Message } from 'discord.js'
import Commando, { CommandMessage } from 'discord.js-commando'
import User from '../../modules/user'
import Server from '../../modules/server'
import Messages from '../../modules/messages'

class FirstCommand extends Commando.Command {
  private server: Server

  private user: User

  private message: Messages

  private readonly embedTitle: string

  constructor(client: any) {
    super(client, {
      name: 'first',
      aliases: ['first'],
      group: 'first',
      memberName: 'add',
      description: 'MAIS FIRST PUTAIN',
      details: 'FIRST BORDEL LA',
      examples: ['!first'],
      argsCount: 0,
    })

    this.server = new Server()
    this.user = new User()
    this.message = new Messages()

    this.embedTitle = 'First'
  }

  async run(message: CommandMessage): Promise<Message> {
    const { guild, author } = message
    const discordGuild = await this.server.getByGuildId(guild)

    if (discordGuild.has_done_first) {
      this.message.addError({
        name: this.embedTitle,
        value: 'Le first est déjà fait',
      })
    } else {
      await this.user.doFirst(author, guild)
      await this.server.doFirst(guild)

      this.message.addValid({
        name: this.embedTitle,
        value: 'Bien joué pour le first!',
      })
    }

    return message.channel.sendEmbed(this.message.get(message))
  }
}

module.exports = FirstCommand
