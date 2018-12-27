import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import DiscordUser from '../../modules/user'
import Messages from '../../modules/messages'
import NumberValidation from '../../modules/number'
import Helpers from '../../modules/helpers'

type Kwargs = {
  userId: string
  value: string
}

class GiveCommand extends Commando.Command {
  private readonly user: DiscordUser
  private readonly messages: Messages
  private readonly checker: NumberValidation
  private readonly title: string
  private readonly helpers: Helpers

  constructor(client: CommandoClient) {
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
          type: 'string'
        },
        {
          key: 'value',
          label: 'Kebabs',
          prompt: 'Nombre de kebabs',
          type: 'string'
        }
      ]
    })

    this.user = new DiscordUser()
    this.messages = new Messages()
    this.checker = new NumberValidation()
    this.helpers = new Helpers()
    this.title = 'Kebabs'
  }

  async run(message: CommandMessage, { value }: Kwargs) {
    const { author, guild, mentions, channel, client } = message
    const target = mentions.members.first()
    const emoji = this.helpers.getMoneyEmoji(client)
    const kebabs = this.helpers.getRoundedValue(value)

    if (!this.checker.isValid(kebabs)) {
      this.messages.addError({
        name: this.title,
        value: "Ton montant n'est pas valide"
      })
    } else {
      try {
        await this.user.exchange(author, guild, target, kebabs)
        this.messages.addValid({
          name: this.title,
          value: `${kebabs} ${emoji} donné à <@${target.id}>`
        })
      } catch (e) {
        this.messages.addError({
          name: this.title,
          value: `Tu n'as pas assez d'argent`
        })
      }
    }

    return channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = GiveCommand
