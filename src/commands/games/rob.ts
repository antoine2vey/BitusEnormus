import Commando from 'discord.js-commando';

class RobCommand extends Commando.Command {
  constructor(client) {
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
  }

  async run() {
  }
}

module.exports = RobCommand