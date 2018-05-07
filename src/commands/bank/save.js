const Commando = require('discord.js-commando')
const { bank } = require('../../modules/Bank')
const { user, message, emoji, first, number } = require('../../modules')

module.exports = class BankSaveCommand extends Commando.Command {
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
  }

  async run(msg, { value }) {
    const { id, username } = msg.author
    const guildId = msg.guild.id

    /**
     * Create a client variable that we first assign to current user.
     * That client is the original client
     *
     * If that client doesn't have a bank, assign client at the fresh client
     * after bank got created, then we can control if he can pay, and if he is
     * allowed to push money to bank
     */
    let client
    const originalClient = await user.get(id, guildId, username)
    client = originalClient.client

    if (!client.bank) {
      const updatedClient = await bank.create(client)
      client = updatedClient.client
    }

    const canPay = await user.canPay(client, value)
    const allowed = await user.allowedTo('push', new Date(), client)

    if (!number.isValid(value)) {
      message.addError({
        name: 'Banque',
        value: 'Ajoute un vrai montant',
      })
    }

    if (!canPay) {
      message.addError({
        name: 'Banque',
        value: "Tu n'as pas assez d'argent pour déposer autant",
      })
    }

    if (!allowed) {
      message.addError({
        name: 'Banque',
        value: "Tu ne peut envoyer qu'une fois tout les 24h",
      })
    }

    if (!number.isValid(value) || !canPay || !allowed) {
      return message.send(msg)
    }

    const updatedBank = await user.updateBank('push', value, client)
    message.addValid({
      name: 'Banque',
      value: `Tu possèdes maintenant ${updatedBank.bank.amount} ${emoji.kebab} dans ta banque`,
    })

    message.send(msg)
  }
}
