import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import music from '../../modules/music'
import Messages from '../../modules/messages'

class NextCommand extends Commando.Command {
  messages: Messages

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

    this.messages = new Messages()
  }

  async run(message: CommandMessage): Promise<any> {
    const { member, guild } = message
    const { voiceChannel } = message.member

    if (voiceChannel) {
      // Send event to dispatcher in play.ts
      if (voiceChannel.connection) {
        const song = music.getNextMusic(guild.id)

        if (song) {
          // If we have another song to play
          this.messages.addValid({
            name: 'Musique',
            value: `Prochaine musique : ${song.title} - ${song.channelTitle}`
          })
        } else {
          // No songs to play anymore
          this.messages.addError({
            name: 'Musique',
            value: 'Plus de musique dans la playlist'
          })
        }

        voiceChannel.connection.dispatcher.end()
      } else {
        // Bot not in channel
        this.messages.addError({
          name: 'Musique',
          value: 'Le bot n\'a pas démarré'
        })
      }
    } else {
      this.messages.addError({
        name: 'Musique',
        value: 'Rejoinds un channel'
      })
    }

    return message.channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = NextCommand
