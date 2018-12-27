import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import rob from '../../modules/rob'
import DiscordUser from '../../modules/user'
import Messages from '../../modules/messages'

class RobStopCommand extends Commando.Command {
  user: DiscordUser
  messages: Messages

  constructor(client: CommandoClient) {
    super(client, {
      name: 'rob-stop',
      aliases: ['robstop', 'rob_stop', 'rob-stop'],
      group: 'rob',
      memberName: 'rob-stop',
      description: 'Vol',
      details: "Voler du fric à quelqu'un",
      examples: ['!rob-stop']
    })

    this.user = new DiscordUser()
    this.messages = new Messages()
  }

  run(message: CommandMessage): any {
    const name = 'Vol'
    const { guild, author, channel } = message

    rob
      .stop(guild.id, author.id)
      .then(value => {
        this.messages.addValid({ name, value })

        channel.sendEmbed(this.messages.get(message))
      })
      .catch(value => {
        this.messages.addError({ name, value })

        channel.sendEmbed(this.messages.get(message))
      })
  }
}

module.exports = RobStopCommand
