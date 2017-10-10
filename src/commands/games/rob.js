const Commando = require('discord.js-commando');
const moment = require('moment');
const { rob, message } = require('../../modules');

module.exports = class RobCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'rob',
      aliases: ['rob'],
      group: 'rob',
      memberName: 'rob',
      description: 'Vol',
      details: "Voler du fric à quelqu'un",
      examples: ['!rob @Antoine'],
      argsCount: 1,
      args: [
        {
          key: 'userId',
          label: 'User',
          prompt: 'Quel utilisateur voler?',
          type: 'string',
        },
      ],
    });

    this.flashLight = 0;
  }

  get flashlight() {
    return `:oncoming_police_car: ${this.flashLight % 2 === 0
      ? ':large_blue_circle:'
      : ':red_circle:'} :oncoming_police_car:`;
  }

  getPercentage(start, end) {
    const now = moment();
    const totalMillisInRange = end.valueOf() - start.valueOf();
    const elapsedMillis = now.valueOf() - start.valueOf();
    // eslint-disable-next-line
    return (
      Math.round(Math.max(0, Math.min(100, 100 * (elapsedMillis / totalMillisInRange))) * 100) / 100
    );
  }

  async run(msg) {
    const { id } = msg.mentions.users.first();
    const guildId = msg.guild.id;
    const start = moment();
    const end = moment().add(rob.time, 'ms');

    try {
      await rob.do(id, guildId);
      msg.channel.send(`Vol en cours ( de <@${id}> )`);
      const message_ = await msg.channel.send(`Completé à ${this.getPercentage(start, end)}%`);

      const timer = setInterval(() => {
        message_.edit(`Completé à ${this.getPercentage(start, end)}% ${this.flashlight}`);

        this.flashLight += 1;
        if (this.getPercentage(start, end) === 100) {
          message_.edit('Vol completé :thinking:');
          clearInterval(timer);
        }
      }, 1000);
    } catch (e) {
      message.addError({
        name: 'Error',
        value: e,
      });

      message.send(msg);
    }
  }
};
