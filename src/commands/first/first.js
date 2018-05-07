const Commando = require('discord.js-commando')
const { user, message, emoji, first } = require('../../modules')

module.exports = class FirstCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'first',
      aliases: ['first'],
      group: 'first',
      memberName: 'add',
      description: 'MAIS FIRST PUTAIN',
      details: 'FIRST BORDEL LA',
      examples: ['!first'],
      argsCount: 0,
    })
  }

  async run() {
  }
}
