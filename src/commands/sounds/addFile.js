const Commando = require('discord.js-commando')

module.exports = class AddFileCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'add',
      aliases: ['add'],
      group: 'sounds',
      memberName: 'add-sound',
      description: 'Ajouter une musique',
      details: 'Ajoute une musique a la collection',
      examples: ['!add'],
      argsCount: 0,
    })
  }

  async run() {
  }
}
