const Commando = require('discord.js-commando')

module.exports = class GiveCommand extends Commando.Command {
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
  }

  async run() {
  }
}
