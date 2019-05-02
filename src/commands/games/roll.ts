import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import NumberValidation from '../../modules/number'
import Messages from '../../modules/messages'
import DiscordUser from '../../modules/user'
import Helpers from '../../modules/helpers'

type Kwargs = {
  value: string
  stack: string
}

class RollCommands extends Commando.Command {
  min: number
  max: number
  validator: NumberValidation
  messages: Messages
  user: DiscordUser
  helpers: Helpers

  constructor(client: CommandoClient) {
    super(client, {
      name: 'roll',
      aliases: ['roll'],
      group: 'games',
      memberName: 'roll',
      description: 'Roll',
      details: 'Roll, plus la fourchette est petite, plus tu gagne de fric',
      examples: ['!roll 100 0-50'],
      throttling: {
        usages: 5,
        duration: 60
      },
      argsCount: 2,
      args: [
        {
          key: 'value',
          label: 'Kebabs',
          prompt: 'Nombre de kebabs',
          type: 'string'
        },
        {
          key: 'stack',
          label: 'fourchette',
          prompt: 'Ta fourchette ([min]-[max])',
          type: 'string'
        }
      ]
    })

    this.min = 0
    this.max = 100
    this.validator = new NumberValidation()
    this.messages = new Messages()
    this.user = new DiscordUser()
    this.helpers = new Helpers()
  }

  private getRandomIntInclusive(min: number, max: number): number {
    return (
      Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
      Math.ceil(min)
    )
  }

  private get randomNumber(): number {
    return this.getRandomIntInclusive(0, 100)
  }

  private hasWon(random: number): boolean {
    return random <= this.max && random >= this.min
  }

  private getAmountByThreshold(value: number): number {
    if (this.min === this.max) {
      /**
       * Its a 15* coefficient to prevent 1 value spam
       * For !roll 1 50-50 (aiming to spam for 50)
       * It gives you 150 kebabs
       * Same command, but 100 kebabs,
       * it gives you 15000 kebabs
       */
      return Math.floor(15000 * (1 / 100) * value)
    }

    // eslint-disable-next-line
    return Math.floor((1 / (this.max - this.min)) * value * 100)
  }

  private get isSpaceValid(): boolean {
    return this.max - this.min <= 65
  }

  async run(message: CommandMessage, { value, stack }: Kwargs): Promise<any> {
    // Safe to use since we control in validStack method
    const { guild, author, client } = message
    const [min, max] = stack.split('-')
    const emoji = this.helpers.getMoneyEmoji(client)

    const isCommandValid =
      this.validator.isValid(value) && this.validator.isValidStack(stack)

    this.min = parseInt(min)
    this.max = parseInt(max)

    if (!this.isSpaceValid) {
      this.messages.addError({
        name: 'Kebabs',
        value: 'Il te faut un écart de plus de 35% (0-65 minimum)'
      })
    }

    if (!isCommandValid) {
      this.messages.addError({
        name: 'Mauvais format de commande',
        value: '!roll <kebabs> [min]-[max]'
      })
    }

    if (!this.isSpaceValid || !isCommandValid) {
      return message.channel.sendEmbed(this.messages.get(message))
    }

    const user = await this.user.get(author, guild)

    if (user.money < parseInt(value)) {
      this.messages.addError({
        name: 'Attention',
        value: `Tu n'as pas assez de ${emoji}, il t'en manque ${parseInt(
          value
        ) - user.money}!`
      })
    } else {
      const randomNumber = this.randomNumber

      if (this.hasWon(randomNumber)) {
        const amountWon = this.getAmountByThreshold(parseInt(value))
        this.user.pay(author, guild, amountWon)

        this.messages.addValid({
          name: `Gagné! (:game_die: ${randomNumber})`,
          value: `Tu as gagné ${amountWon} ${emoji} !`
        })
      } else {
        this.user.withdraw(author, guild, parseInt(value))

        this.messages.addError({
          name: `Perdu... (:game_die: ${randomNumber})`,
          value: `Tu as perdu ${value} ${emoji} !`
        })
      }
    }

    return message.channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = RollCommands
