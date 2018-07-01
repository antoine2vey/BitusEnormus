import Commando from 'discord.js-commando';

export default class AlbumCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'album',
      aliases: ['mappa', 'album'],
      group: 'album',
      memberName: 'add',
      description: "Affiche une image au hasard de l'album",
      details: "Affiche une image au hasard de l'album",
      examples: ['!mappa'],
      argsCount: 0,
    })
  }

  async run() {
  }
}
