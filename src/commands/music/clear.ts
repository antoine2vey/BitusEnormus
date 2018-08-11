import Commando, { CommandMessage } from 'discord.js-commando'
import Music from '../../modules/music'

class ClearCommand extends Commando.Command {
  music

  constructor(client: any) {
    super(client, {
      name: 'clear',
      aliases: ['clear'],
      group: 'music',
      memberName: 'clear',
      description: 'Clear musics',
      details: 'Clear bot musics',
      examples: ['!clear'],
      argsCount: 0,
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
