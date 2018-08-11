import Commando from 'discord.js-commando'

class PlayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'sound',
      aliases: ['sound'],
      group: 'sounds',
      memberName: 'add',
      description: 'Joue un son',
      details: 'Joue un son',
      examples: ['!sound hugo', '!sound deukatorz'],
      argsCount: 1,
      args: [
        {
          key: 'soundKey',
          label: 'Son',
          prompt: 'Joue un son en tapant !sound [son]',
          type: 'string'
        }
      ]
    })
  }

  async run(): Promise<any> {}
}

module.exports = PlayCommand
