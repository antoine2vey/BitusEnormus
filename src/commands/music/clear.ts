import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import Music from '../../modules/music'
import Messages from '../../modules/messages'

class ClearCommand extends Commando.Command {
  music: typeof Music
  messages: Messages

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
    this.messages = new Messages()
  }

  async run(message: CommandMessage): Promise<any> {
    const { member, guild } = message
    const channel = member.voiceChannel
    const { id } = guild

    if (!message.member.voiceChannel) {
      this.messages.addError({
        name: 'Musique',
        value: 'Rejoinds un channel'
      })

      return message.channel.sendEmbed(this.messages.get(message))
    }

    this.music.clearQueue(id)
    channel.leave()
  }
}

module.exports = ClearCommand
