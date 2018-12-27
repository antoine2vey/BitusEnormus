import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'

class ResumeCommand extends Commando.Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'resume',
      aliases: ['resume'],
      group: 'music',
      memberName: 'resume',
      description: 'Resume music in queue',
      details: 'Resume bot music',
      examples: ['!resume'],
      argsCount: 0
    })
  }

  async run(message: CommandMessage): Promise<any> {
    // Send event to dispatcher in play.ts
    message.member.voiceChannel.connection.dispatcher.resume()
  }
}

module.exports = ResumeCommand
