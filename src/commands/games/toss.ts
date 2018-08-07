import Commando, { CommandMessage } from 'discord.js-commando'
import DiscordUser from '../../modules/user'
import Messages from '../../modules/messages'
import NumberValidation from '../../modules/number'

class TossCommand extends Commando.Command {
  user: DiscordUser

  messages: Messages

  validation: NumberValidation

  key: string

  constructor(client) {
    super(client, {
      name: 'toss',
      aliases: ['toss'],
      group: 'games',
      memberName: 'game',
      description: 'Pile ou face',
      details: 'Pile ou face',
      examples: ['!toss pile'],
      argsCount: 2,
      args: [
        {
          key: 'value',
          label: 'Pile ou Face',
          prompt: 'Choisi pile ou face',
          type: 'string',
        },
        {
          key: 'amount',
          label: 'Kebabs',
          prompt: 'Nombre de kebabs',
          type: 'string',
        },
      ],
    })

    this.user = new DiscordUser()
    this.messages = new Messages()
    this.validation = new NumberValidation()
    this.key = 'Toss'
  }

  private isInputValid(value: string): boolean {
    return value.toLowerCase().trim() === 'pile' || value.toLowerCase().trim() === 'face'
  }

  private hasWon(val: number, choice: string): boolean {
    const faceWon = val < 0.5 && choice === 'face'
    const pileWon = val >= 0.5 && choice === 'pile'

    return faceWon || pileWon
  }

  async run(
    message: CommandMessage,
    { value, amount }: { value: string; amount: string },
  ): Promise<any> {
    const { author, guild } = message
    const kebabs = parseInt(amount, 10)
    const random = Math.random()

    const isValueValid = this.isInputValid(value)
    const isAmountValid = this.validation.isValid(amount)

    if (!isValueValid) {
      this.messages.addError({
        name: this.key,
        value: 'Choisi pile ou face!',
      })
    }

    if (!isAmountValid) {
      this.messages.addError({
        name: this.key,
        value: "Le nombre entre n'est pas valide",
      })
    }

    if (!isValueValid || !isAmountValid) {
      return message.channel.sendEmbed(this.messages.get(message))
    }

    if (this.hasWon(random, value)) {
      await this.user.pay(author, guild, kebabs)

      this.messages.addValid({
        name: this.key,
        value: `Tu as gagné ${kebabs}$ !`,
      })
    } else {
      try {
        await this.user.withdraw(author, guild, kebabs)

        this.messages.addError({
          name: this.key,
          value: `Tu as perdu ${kebabs}$ :sob:`,
        })
      } catch (client) {
        this.messages.addError({
          name: this.key,
          value: `Tu n'as pas assez d'argent, il te manque ${kebabs - client.money}$ !`,
        })
      }
    }

    return message.channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = TossCommand
