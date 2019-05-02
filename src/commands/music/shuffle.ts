
import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import Music from '../../modules/music'
import Messages from '../../modules/messages'

class ShuffleCommand extends Commando.Command {
  music: typeof Music
  messages: Messages

  constructor(client: CommandoClient) {
    super(client, {
      name: 'shuffle',
      aliases: ['shuffle', 'random', 'melanger', 'mettredansunordrealeatoire', 'aleatoire'],
      group: 'music',
      memberName: 'shuffle',
      description: 'Shuffle musics',
      details: 'Shuffle bot musics',
      examples: ['!shuffle'],
      argsCount: 0
    })

    this.music = Music
    this.messages = new Messages()
  }

  async run(message: CommandMessage): Promise<any> {
    const { guild } = message
    const { id } = guild

    if (this.music.isQueueEmpty(id)) {
      this.messages.addError({
        name: 'Musique',
        value: 'Pas de musique en cours'
      })

      return message.channel.sendEmbed(this.messages.get(message))
    }

    if (!message.member.voiceChannel) {
      this.messages.addError({
        name: 'Musique',
        value: 'Rejoinds un channel'
      })

      return message.channel.sendEmbed(this.messages.get(message))
    }

    // We have music in queue and user is in a channel, shuffle it
    this.music.shuffleQueue(id)
    this.messages.addValid({
      name: 'Musique',
      value: 'Playlist shuffled'
    })

    return message.channel.send(`Playlist shufflé. Appliqué aux prochaines musiques`)
  }
}

module.exports = ShuffleCommand
