import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import Rob from '../../modules/rob';
import { MessageMentions, User } from 'discord.js';
import { EventEmitter } from 'events';

class RobCommand extends Commando.Command {
  rob: Rob
  event: EventEmitter

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
          type: 'string',
        },
      ],
    })

    this.rob = new Rob()
    this.event = new EventEmitter()
  }

  private getIdFromMentions(user: MessageMentions): User {
    return user.users.first()
  }

  run(message: CommandMessage): any {
    // const { guild, author } = message
    // const target = this.getIdFromMentions(author.lastMessage.mentions)

    // this.rob.start(guild.id, author.id, target.id, message.channel)
    return message.channel.send('Soon ...')
  }
}

module.exports = RobCommand
