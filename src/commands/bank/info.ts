import Commando from 'discord.js-commando';

export default class BankInfoCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'bank info',
      aliases: ['bank'],
      group: 'bank',
      memberName: 'info',
      description: 'Information banquaires',
      details: 'Toutes les infos de ta banque Mappa',
      examples: ['!bank', '!bank info'],
      argsCount: 0,
    })
  }

  async run() {
  }
}
