const Commando = require('discord.js-commando');
const { user, message, emoji, first } = require('../../modules');

module.exports = class FirstCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'first',
      aliases: ['first'],
      group: 'first',
      memberName: 'add',
      description: 'MAIS FIRST PUTAIN',
      details: 'FIRST BORDEL LA',
      examples: ['!first'],
      argsCount: 0,
    });
  }

  async run(msg) {
    const userId = msg.author.id;
    const guildId = msg.guild.id;

    try {
      const firstAlreadyDone = await first.hasBeenDone(guildId);

      if (firstAlreadyDone) {
        message.addError({
          name: 'Trop tard',
          value: 'Le first à déjà été pris :weary:',
        });

        return message.send(msg);
      }
    } catch (e) {
      return first.do(userId, guildId)
        .then(() => {
          user.didFirst(msg.author.id, guildId);

          message.addValid({
            name: 'FIRST',
            value: `Bien joué! Tu gagne ${user.firstGive} ${emoji.kebab} !`,
          });

          return message.send(msg);
        })
        .catch(() => {
          message.addError({
            name: 'Trop tard',
            value: 'Une erreur est survenue ... :frog:',
          });

          return message.send(msg);
        });
    }
  }
};
