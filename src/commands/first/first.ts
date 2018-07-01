import { Message } from 'discord.js'
import Commando from 'discord.js-commando';
import User from '../../modules/user';
import Server from '../../modules/server';
import Messages from '../../modules/messages';

module.exports = class FirstCommand extends Commando.Command {
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

  async run(message: Message) {
    const { guild, author } = message

    this.server
      .getByGuildId(guild)
      .then(async (discordGuild) => {
        if (discordGuild.has_done_first) {
          return message.channel.send('mdr')
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
