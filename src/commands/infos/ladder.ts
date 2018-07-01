import Commando from 'discord.js-commando';

export default class LadderCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'ladder',
      aliases: ['ladder', 'ladderboard'],
      group: 'infos',
      memberName: 'info',
      description: 'Ladderboard',
      details: 'Classement des kebabs Mappa',
      examples: ['!ladder', '!ladderboard'],
      argsCount: 0,
    })
  }

  async run() {
  }
}
