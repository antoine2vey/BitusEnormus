import Commando from 'discord.js-commando'

class TossCommand extends Commando.Command {
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

  async run() {}
}

module.exports = TossCommand
