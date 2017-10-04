const Commando = require('discord.js-commando');
const { user, message, emoji } = require('../../modules');

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
    });
  }

  async run(msg) {
    const userId = msg.author.id;
    const guildId = msg.guild.id;
    try {
      const client = await user.get(userId, guildId);

      message.addValid({
        name: 'Nombre de kebabs',
        value: `${client.kebabs} ${emoji.kebab} !`,
      });
    } catch (e) {
      message.addError({
        name: 'Kebabs',
        value: `Tu n'as pas de ${emoji.kebab} ..`,
      });
    }

    message.send(msg);
  }
};
