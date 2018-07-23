import Commando from 'discord.js-commando'

class BankSaveCommand extends Commando.Command {
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

  async run() {}
}

module.exports = BankSaveCommand
