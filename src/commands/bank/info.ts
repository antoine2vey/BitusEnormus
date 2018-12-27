import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import DiscordUser from '../../modules/user'
import Messages from '../../modules/messages'
import Helpers from '../../modules/helpers'

class BankInfoCommand extends Commando.Command {
  private user: DiscordUser
  private messages: Messages
  private helpers: Helpers

  constructor(client: CommandoClient) {
    super(client, {
      name: 'bank info',
      aliases: ['bank'],
      group: 'bank',
      memberName: 'info',
      description: 'Information banquaires',
      details: 'Toutes les infos de ta banque Mappa',
      examples: ['!bank', '!bank info'],
      argsCount: 0
    })

    this.user = new DiscordUser()
    this.messages = new Messages()
    this.helpers = new Helpers()
  }

  async run(message: CommandMessage): Promise<any> {
    const { author, guild, client } = message
    const { bank } = await this.user.get(author, guild)
    const emoji = this.helpers.getMoneyEmoji(client)

    this.messages.addValid({
      name: 'Banque',
      value: `Tu as ${bank.amount}${emoji} dans ta banque !`
    })

    return message.channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = BankInfoCommand
