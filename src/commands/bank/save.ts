import Commando, { CommandMessage } from 'discord.js-commando'
import DiscordUser from '../../modules/user';
import Messages from '../../modules/messages';
import NumberValidation from '../../modules/number';

class BankSaveCommand extends Commando.Command {
  private user: DiscordUser
  private messages: Messages
  private numberValidation: NumberValidation

  constructor(client) {
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
          type: 'string',
        },
      ],
    })

    this.user = new DiscordUser()
    this.messages = new Messages()
    this.numberValidation = new NumberValidation()
  }

  async run(message: CommandMessage, { value }): Promise<any> {
    const { author, guild } = message

    if (this.numberValidation.isValid(value)) {
      const user = await this.user.get(author, guild)

      try {
        const bank = await this.user.increaseBank(user, author, guild, value)

        this.messages.addValid({
          name: 'Banque',
          value: `Argent bien envoyé ! (actuellement ${bank.amount}$ dans ta banque)`
        })
      } catch (e) {
        this.messages.addError({
          name: 'Banque',
          value: `Il te manque ${value - user.money}$ :cry:`
        })
      }
    } else {
      this.messages.addError({
        name: 'Banque',
        value: 'Le chiffre entré n\'est pas valide !'
      })
    }
    
    return message.channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = BankSaveCommand
