import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import DiscordUser from '../../modules/user'
import Messages from '../../modules/messages'
import NumberValidation from '../../modules/number'
import Helpers from '../../modules/helpers'

type Kwargs = {
  value: string
}

class BankSaveCommand extends Commando.Command {
  private user: DiscordUser
  private messages: Messages
  private numberValidation: NumberValidation
  private helpers: Helpers

  constructor(client: CommandoClient) {
    super(client, {
      name: 'bank save',
      aliases: ['bank-save'],
      group: 'bank',
      memberName: 'save',
      description: 'Information banquaires',
      details: "Rajouter de l'argent dans ton compte avec interet par jour",
      examples: ['!bank-save 100'],
      argsCount: 0,
      args: [
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
    this.helpers = new Helpers()
    this.numberValidation = new NumberValidation()
  }

  async run(message: CommandMessage, { value }: Kwargs): Promise<any> {
    const { author, guild, client } = message
    const emoji = this.helpers.getMoneyEmoji(client)
    const kebabs = this.helpers.getRoundedValue(value)

    if (this.numberValidation.isValid(kebabs)) {
      const user = await this.user.get(author, guild)

      try {
        const bank = await this.user.increaseBank(user, author, guild, kebabs)

        this.messages.addValid({
          name: 'Banque',
          value: `Argent bien envoyé ! (actuellement ${
            bank.amount
          }${emoji} dans ta banque)`
        })
      } catch (e) {
        this.messages.addError({
          name: 'Banque',
          value: `Il te manque ${kebabs - user.money}${emoji} :cry:`
        })
      }
    } else {
      this.messages.addError({
        name: 'Banque',
        value: "Le chiffre entré n'est pas valide !"
      })
    }

    return message.channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = BankSaveCommand
