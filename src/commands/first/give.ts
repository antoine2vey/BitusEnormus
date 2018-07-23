import Commando, { CommandMessage } from 'discord.js-commando'
import DiscordUser from '../../modules/user'
import Messages from '../../modules/messages'
import NumberValidation from '../../modules/number'

class GiveCommand extends Commando.Command {
  private readonly user: DiscordUser
  private readonly messages: Messages
  private readonly checker: NumberValidation
  private readonly title: string

  constructor(client) {
    super(client, {
      name: 'give',
      aliases: ['give'],
      group: 'infos',
      memberName: 'give',
      description: 'Give',
      details: "Donner des kebabs a quelqu'un",
      examples: ['!give @Antoine 10'],
      argsCount: 2,
      args: [
        {
          key: 'userId',
          label: 'Donner à',
          prompt: 'Donner à qui?',
          type: 'string',
        },
        {
          key: 'kebabs',
          label: 'Kebabs',
          prompt: 'Nombre de kebabs',
          type: 'string',
        },
      ],
    })

    this.user = new DiscordUser()
    this.messages = new Messages()
    this.checker = new NumberValidation()
    this.title = 'Kebabs'
  }

  async run(message: CommandMessage, { kebabs }) {
    const { author, guild, mentions, channel } = message
    const target = mentions.members.first()

    if (!this.checker.isValid(kebabs)) {
      this.messages.addError({
        name: this.title,
        value: "Ton montant n'est pas valide",
      })
    } else {
      try {
        await this.user.exchange(author, guild, target, kebabs)
        this.messages.addValid({
          name: this.title,
          value: `${kebabs} donné à <@${target.id}>`,
        })
      } catch (e) {
        this.messages.addError({
          name: this.title,
          value: `Tu n'as pas assez d'argent`,
        })
      }
    }

    return channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = GiveCommand
