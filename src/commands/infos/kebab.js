const Commando = require('discord.js-commando')

module.exports = class KebabCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'kebab',
      aliases: ['kebab'],
      group: 'infos',
      memberName: 'add',
      description: 'Mes kebabs',
      details: 'Savoir son nombre de kebab',
      examples: ['!kebab'],
      argsCount: 0,
    })
  }

  async run() {
  }
}
