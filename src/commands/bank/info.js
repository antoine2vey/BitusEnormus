const Commando = require('discord.js-commando')

module.exports = class BankInfoCommand extends Commando.Command {
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
