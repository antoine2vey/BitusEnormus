const Commando = require('discord.js-commando')
const { user, message, emoji, number } = require('../../modules')

module.exports = class TossCommand extends Commando.Command {
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
          key: 'kebabs',
          label: 'Kebabs',
          prompt: 'Nombre de kebabs',
          type: 'string',
        },
      ],
    })
  }

  randomNumber() {
    return Math.random()
  }

  hasWon(val, choice) {
    const faceWon = val <= 0.5 && choice === 'face'
    const pileWon = val > 0.5 && choice === 'pile'

    if (faceWon || pileWon) {
      return true
    }

    return false
  }

  async run(msg, { value, kebabs }) {
    const normalize = str => str.toLowerCase().trim()
    const valid = normalize(value) === 'pile' || normalize(value) === 'face'
    const randomValue = this.randomNumber()
    const userId = msg.author.id
    const { username } = msg.author
    const guildId = msg.guild.id
    const validNumber = number.isValid(kebabs)

    if (!valid) {
      message.addError({
        name: 'Invalide',
        value: 'Utilise sois `pile` ou `face`',
      })
    }

    if (kebabs <= 0) {
      message.addError({
        name: 'Kebabs',
        value: `Tu dois mettre un nombre de ${emoji.kebab} positif`,
      })
    }

    if (!validNumber) {
      message.addError({
        name: 'Kebab',
        value: 'Tu dois mettre un chiffre valide..',
      })
    }

    /**
     * Send error message if one of them isn't satisfied
     */
    if (!valid || kebabs <= 0 || !validNumber) {
      return message.send(msg)
    }

    // Get the user and pass it into canPay() method to check
    const { client } = await user.get(userId, guildId, username)
    const canPay = await user.canPay(client, kebabs)

    if (!canPay) {
      // User cannot pay, we throw an error
      message.addError({
        name: 'Attention',
        value: `Tu n'as pas assez de ${emoji.kebab}, il t'en manque ${kebabs - client.kebabs}!`,
      })

      return message.send(msg)
    }

    if (this.hasWon(randomValue, value)) {
      // If user has won
      await user.pay(userId, guildId, kebabs)
      message.addValid({
        name: 'Gagné',
        value: `Tu as gagné ${kebabs} ${emoji.kebab}`,
      })
    } else {
      // If user has lost
      await user.withdraw(userId, guildId, kebabs)
      message.addError({
        name: 'Perdu',
        value: `Tu as perdu ${kebabs} ${emoji.kebab}`,
      })
    }

    return message.send(msg)
  }
}
