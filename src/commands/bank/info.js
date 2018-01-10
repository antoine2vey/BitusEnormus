const Commando = require('discord.js-commando');
const { bank } = require('../../modules/Bank');
const { user, message, emoji } = require('../../modules');

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
    });
  }

  async run(msg) {
    const { id, username } = msg.author;
    const guildId = msg.guild.id;

    const { client } = await user.get(id, guildId, username);

    if (!client.bank) {
      await bank.create(client);
      message.addError({
        name: 'Banque',
        value: "Tu n'as pas de banque ... Je t'en ai crée une ! .. :robot: (refait `!bank`)",
      });
    } else {
      message.addValid({
        name: 'Banque',
        value: `Tu possèdes ${client.bank.amount} ${emoji.kebab} dans ta banque`,
      });
    }

    message.send(msg);
  }
};
