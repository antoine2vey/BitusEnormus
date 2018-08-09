import Commando, { CommandMessage } from 'discord.js-commando'

class RegisterCommand extends Commando.Command {
  constructor(client: any) {
    super(client, {
      name: 'next',
      aliases: ['next', 'skip'],
      group: 'music',
      memberName: 'next',
      description: 'Next music in queue',
      details: 'Next bot music',
      examples: ['!next', '!skip'],
      argsCount: 0
    })
  }

  async run(message: CommandMessage): Promise<any> {}
}

module.exports = RegisterCommand
