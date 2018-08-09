import Commando, { CommandMessage } from 'discord.js-commando'

class RegisterCommand extends Commando.Command {
  constructor(client: any) {
    super(client, {
      name: 'clear',
      aliases: ['clear'],
      group: 'music',
      memberName: 'clear',
      description: 'Clear musics',
      details: 'Clear bot musics',
      examples: ['!clear'],
      argsCount: 0
    })
  }

  async run(message: CommandMessage): Promise<any> {
    const channel = message.member.voiceChannel

    channel.leave()
  }
}

module.exports = RegisterCommand
