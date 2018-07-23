import Commando from 'discord.js-commando'

class PlayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'sound',
      aliases: ['play', 'sound'],
      group: 'sounds',
      memberName: 'add',
      description: 'Joue un son',
      details: 'Joue un son',
      examples: ['!play hugo', '!play deukatorz'],
      argsCount: 1,
      args: [
        {
          key: 'soundKey',
          label: 'Son',
          prompt: 'Joue un son en tapant !play [son]',
          type: 'string',
        },
      ],
    })
  }

  async run() {}
}

module.exports = PlayCommand
