const Commando = require('discord.js-commando');
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
    const { id } = msg.author;
    const guildId = msg.guild.id;
    try {
      const client = await user.get(id, guildId);
      if (!client.bank) {
        message.addError({
          name: 'Banque',
          value: "Tu n'as pas de banque ...",
        });
      } else {
        message.addValid({
          name: 'Banque',
          value: `Tu possèdes ${client.bank
            .amount} ${emoji.kebab} dans ta banque`,
        });
      }
    } catch (e) {
      message.addError({
        name: 'Banque',
        value: "Tu n'as pas de banque ...",
      });
    }

    message.send(msg);
  }
};
