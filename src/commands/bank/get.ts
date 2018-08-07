import Commando, { CommandMessage } from 'discord.js-commando'
import DiscordUser from '../../modules/user'
import Messages from '../../modules/messages';
import NumberValidation from '../../modules/number';

class BankGetCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'bank take',
      aliases: ['bank-take', 'bank-get'],
      group: 'bank',
      memberName: 'take',
      description: 'Information banquaires',
      details: "Prendre de l'argent dans ton compte avec interet par jour",
      examples: ['!bank-take 100'],
      argsCount: 0,
      args: [
        {
          key: 'value',
          label: 'Kebabs',
          prompt: 'Nombre de kebabs',
          type: 'string',
        },
      ],
    })
  }

  async run(message: CommandMessage, { value }): Promise<any> {
  }
}

module.exports = BankGetCommand
