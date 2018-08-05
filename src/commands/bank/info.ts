import Commando, { CommandMessage } from 'discord.js-commando'
import DiscordUser from '../../modules/user';
import Messages from '../../modules/messages';

class BankInfoCommand extends Commando.Command {
  private user: DiscordUser
  private messages: Messages

  constructor(client) {
    super(client, {
      name: 'bank info',
      aliases: ['bank'],
      group: 'bank',
      memberName: 'info',
      description: 'Information banquaires',
      details: 'Toutes les infos de ta banque Mappa',
      examples: ['!bank', '!bank info'],
      argsCount: 0,
    })

    this.user = new DiscordUser()
    this.messages = new Messages()
  }

  async run(message: CommandMessage): Promise<any> {
    const { author, guild } = message
    const { bank } = await this.user.get(author, guild)

    this.messages.addValid({
      name: 'Banque',
      value: `Tu as ${bank.amount}$ dans ta banque !`
    })

    return message.channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = BankInfoCommand
