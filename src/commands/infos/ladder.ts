import Commando, { CommandMessage } from 'discord.js-commando'
import DiscordUser from '../../modules/user'
import Messages from '../../modules/messages'
import Helpers from '../../modules/helpers'

class LadderCommand extends Commando.Command {
  private user: DiscordUser
  private messages: Messages
  private helpers: Helpers

  constructor(client) {
    super(client, {
      name: 'ladder',
      aliases: ['ladder', 'ladderboard'],
      group: 'infos',
      memberName: 'info',
      description: 'Ladderboard',
      details: 'Classement des kebabs Mappa',
      examples: ['!ladder', '!ladderboard'],
      argsCount: 0
    })

    this.user = new DiscordUser()
    this.messages = new Messages()
    this.helpers = new Helpers()
  }

  async run(message: CommandMessage): Promise<any> {
    const { guild, author, client } = message
    const query = { money: -1 }
    const users = await this.user.getInGuild(author, guild, query)
    const emoji = this.helpers.getMoneyEmoji(client)

    this.messages.addValid({
      name: 'Ladderboard',
      value: users
        .map((user, i) => {
          return `${this.helpers.getMedal(i + 1)} - ${user.username} : ${
            user.money
          } ${emoji}`
        })
        .join('\n')
    })

    return message.channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = LadderCommand
