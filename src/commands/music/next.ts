import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import music from '../../modules/music'

class NextCommand extends Commando.Command {
  constructor(client: CommandoClient) {
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

  async run(message: CommandMessage): Promise<any> {
    const { member, guild } = message

    if (member.voiceChannel) {
      // Send event to dispatcher in play.ts
      if (member.voiceChannel.connection.dispatcher) {
        const song = music.getNextMusic(guild.id)

        if (song) {
          message.channel.send(
            `Prochaine musique : ${song.title} - ${song.channelTitle}`
          )
        } else {
          message.reply(
            'Arrêt de la musique ... (plus de musique dans la playlist)'
          )
        }

        member.voiceChannel.connection.dispatcher.end()
      } else {
        message.reply('Plus de musique dans la playlist')
      }
    }
  }
}

module.exports = NextCommand
