import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import DiscordUser from '../../modules/user'
import Messages from '../../modules/messages'
import Helpers from '../../modules/helpers'

class KebabCommand extends Commando.Command {
  private user: DiscordUser
  private messages: Messages
  private helpers: Helpers

  constructor(client: CommandoClient) {
    super(client, {
      name: 'kebab',
      aliases: ['kebab'],
      group: 'infos',
      memberName: 'add',
      description: 'Mes kebabs',
      details: 'Savoir son nombre de kebab',
      examples: ['!kebab'],
      argsCount: 0
    })

    this.user = new DiscordUser()
    this.messages = new Messages()
    this.helpers = new Helpers()
  }

  async run(message: CommandMessage) {
    const { author, guild, client } = message
    const user = await this.user.get(author, guild)
    const emoji = this.helpers.getMoneyEmoji(client)

    this.messages.addValid({
      name: 'Infos',
      value: `Tu as ${user.money}${emoji} ! (et ${
        user.bank.amount
      }${emoji} dans ta banque)`
    })

    return message.channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = KebabCommand
