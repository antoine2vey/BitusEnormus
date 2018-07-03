import { Message } from 'discord.js'
import Commando from 'discord.js-commando';
import User from '../../modules/user';
import Server from '../../modules/server';
import Messages from '../../modules/messages';

class FirstCommand extends Commando.Command {
  private server: Server
  private user: User
  private message: Messages

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

  async run(message: Message): Promise<Message | Message[]> {
    console.log('works')
    const { guild, author } = message
    const discordGuild = await this.server.getByGuildId(guild)

    console.log(discordGuild)

    if (discordGuild.has_done_first) {
      this.message.addError({ name: 'First', value: 'Le first est déjà fait' })
    } else {
      await this.user.doFirst(author, guild)
      await this.server.doFirst(guild)

      this.message.addValid({ name: 'First', value: 'Bien joué pour le first!' })
    }

    const embed = this.message.get(message)
    return message.channel.send('First', embed)
  }
}

module.exports = FirstCommand