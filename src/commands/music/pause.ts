import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import Messages from '../../modules/messages'

class PauseCommand extends Commando.Command {
  messages: Messages

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

    this.messages = new Messages()
  }

  async run(message: CommandMessage): Promise<any> {
    const { voiceChannel } = message.member

    if (!voiceChannel) {
      // Not in voice chan
      this.messages.addError({
        name: 'Musique',
        value: 'Rejoinds un channel'
      })

      return message.channel.sendEmbed(this.messages.get(message))
    }

    if (!voiceChannel.connection) {
      // No bot started
      this.messages.addError({
        name: 'Musique',
        value: 'Le bot n\'est pas démarré'
      })

      return message.channel.sendEmbed(this.messages.get(message))
    }

    // We can pause, we are in channel and bot is there already
    message.member.voiceChannel.connection.dispatcher.pause()
  }
}

module.exports = PauseCommand
