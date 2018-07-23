import Commando from 'discord.js-commando'

class BankGetCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'bank take',
      aliases: ['bank-take', 'bank-get'],
      group: 'bank',
      memberName: 'take',
      description: 'Information banquaires',
      details: "Prendre de l'argent dans ton compte avec interet par jour",
      examples: ['!bank-take 100'],
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

  async run(msg) {}
}

module.exports = BankGetCommand
