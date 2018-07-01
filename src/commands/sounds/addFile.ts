import Commando from 'discord.js-commando';

export default class AddFileCommand extends Commando.Command {
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
