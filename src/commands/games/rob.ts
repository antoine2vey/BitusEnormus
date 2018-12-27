import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import rob from '../../modules/rob'
import { MessageMentions, User, Guild } from 'discord.js'
import { pubSub } from '../../modules/pubsub'
import DiscordUser from '../../modules/user'
import Messages from '../../modules/messages'

type PubSubData = {
  author: User
  guild: Guild
  target: User
  message: CommandMessage
}

class RobCommand extends Commando.Command {
  user: DiscordUser
  messages: Messages

  constructor(client: CommandoClient) {
    super(client, {
      name: 'rob',
      aliases: ['rob'],
      group: 'rob',
      memberName: 'rob',
      description: 'Vol',
      details: "Voler du fric à quelqu'un",
      examples: ['!rob @Antoine'],
      argsCount: 1,
      args: [
        {
          key: 'userId',
          label: 'User',
          prompt: 'Quel utilisateur voler?',
          type: 'string'
        }
      ]
    })

    this.user = new DiscordUser()
    this.messages = new Messages()

    pubSub.on(rob.ROB_DONE, async ({ author, target, message }: PubSubData) => {
      this.messages.addValid({
        name: 'Vol',
        value: `<@${author.id}> à volé <@${target.id}> :smiling_imp:`
      })

      rob.deleteWorker(message.guild.id, author.id)
      message.channel.sendEmbed(this.messages.get(message))
    })
  }

  private getIdFromMentions(user: MessageMentions): User {
    return user.users.first()
  }

  run(message: CommandMessage): any {
    const name = 'Vol'
    const { guild, author, channel } = message
    const target = this.getIdFromMentions(author.lastMessage.mentions)

    rob
      .start(guild, author, target, message)
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

module.exports = RobCommand
