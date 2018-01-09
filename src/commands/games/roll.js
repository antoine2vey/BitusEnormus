const Commando = require('discord.js-commando');
const { user, emoji, number, message } = require('../../modules');

module.exports = class RollCommands extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'roll',
      aliases: ['roll'],
      group: 'games',
      memberName: 'roll',
      description: 'Roll',
      details: 'Roll, plus la fourchette est petite, plus tu gagne de fric',
      examples: ['!roll 100 0-50'],
      argsCount: 2,
      args: [
        {
          key: 'value',
          label: 'Kebabs',
          prompt: 'Nombre de kebabs',
          type: 'string',
        },
        {
          key: 'stack',
          label: 'fourchette',
          prompt: 'Ta fourchette ([min]-[max])',
          type: 'string',
        },
      ],
    });

    this.min = undefined;
    this.max = undefined;
  }

  getRandomIntInclusive(min, max) {
    return (
      Math.floor(Math.random() * ((Math.floor(max) - Math.ceil(min)) + 1)) +
      Math.ceil(min)
    );
  }

  get randomNumber() {
    return this.getRandomIntInclusive(0, 100);
  }

  hasWon(random) {
    return random <= this.max && random >= this.min;
  }

  getAmountByThreshold(value) {
    if (this.min === this.max) {
      /**
       * Its a 15* coefficient to prevent 1 value spam
       * For !roll 1 50-50 (aiming to spam for 50)
       * It gives you 150 kebabs
       * Same command, but 100 kebabs,
       * it gives you 15000 kebabs
       */
      return Math.floor(15000 * (1 / 100) * value);
    }

    // eslint-disable-next-line
    return Math.floor(1 / (this.max - this.min) * value * 100);
  }

  isSpaceValid(min, max) {
    return max - min <= 90;
  }

  async run(msg, { value, stack }) {
    // Safe to use since we control in validStack method
    const [min, max] = stack.split('-');
    const guildId = msg.guild.id;
    const { username } = msg.author;
    const userId = msg.author.id;
    this.min = min;
    this.max = max;

    if (!this.isSpaceValid(min, max)) {
      message.addError({
        name: 'Kebabs',
        value: 'Il te faut un écart de plus de 20% (0-80 minimum)',
      });

      return message.send(msg);
    }

    try {
      const _user = await user.get(userId, guildId);
      if (value > _user.kebabs) {
        message.addError({
          name: 'Attention',
          value: `Tu n'as pas assez de ${emoji.kebab}, il t'en manque ${value -
            _user.kebabs}!`,
        });

        return message.send(msg);
      }
    } catch (e) {
      const client = await user.create(userId, guildId, username);

      if (value > client.kebabs) {
        message.addError({
          name: 'Attention',
          value: `Tu n'as pas assez de ${emoji.kebab}, il t'en manque ${value -
            client.kebabs}!`,
        });

        return message.send(msg);
      }
    }

    if (number.isValid(value) && number.isValidStack(stack)) {
      const randomNumber = this.randomNumber;
      if (this.hasWon(randomNumber)) {
        const amountWon = this.getAmountByThreshold(value);
        await user.updateMoney(userId, guildId, username, amountWon - value);

        message.addValid({
          name: `Gagné! (${randomNumber})`,
          value: `Tu as gagné ${amountWon} ${emoji.kebab} !`,
        });
      } else {
        await user.updateMoney(userId, guildId, username, -value);

        message.addError({
          name: `Perdu... (${randomNumber})`,
          value: `Tu as perdu ${value} ${emoji.kebab} !`,
        });
      }
    } else {
      message.addError({
        name: 'Mauvais format de commande',
        value: '!roll <kebabs> [min]-[max]',
      });
    }

    return message.send(msg);
  }
};
