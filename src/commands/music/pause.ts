import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'

class PauseCommand extends Commando.Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'pause',
      aliases: ['pause'],
      group: 'music',
      memberName: 'pause',
      description: 'Pause current music in queue',
      details: 'Pause bot music',
      examples: ['!pause'],
      argsCount: 0
    })
  }

  async run(message: CommandMessage): Promise<any> {
    message.member.voiceChannel.connection.dispatcher.pause()
  }
}

module.exports = PauseCommand
