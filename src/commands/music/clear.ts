import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import Music from '../../modules/music'

class ClearCommand extends Commando.Command {
  music: typeof Music

  constructor(client: CommandoClient) {
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

    this.music = Music
  }

  async run(message: CommandMessage): Promise<any> {
    const { member, guild } = message
    const channel = member.voiceChannel
    const { id } = guild

    this.music.clearQueue(id)
    channel.leave()
  }
}

module.exports = ClearCommand
