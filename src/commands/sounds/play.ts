import Commando, { CommandMessage } from 'discord.js-commando'
import path from 'path'
import fs from 'fs'

class PlayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'sound',
      aliases: ['sound'],
      group: 'sounds',
      memberName: 'add',
      description: 'Joue un son',
      details: 'Joue un son',
      examples: ['!sound hugo', '!sound deukatorz'],
      argsCount: 1,
      args: [
        {
          key: 'soundKey',
          label: 'Son',
          prompt: 'Joue un son en tapant !sound [son]',
          type: 'string',
          default: ''
        }
      ]
    })
  }

  async run(message: CommandMessage, { soundKey }): Promise<any> {
    const soundDir = path.join(__dirname, 'sounds')
    const { voiceChannel } = message.member

    // Commands are based on striped filenames minus mp3 extension
    const availableCommands = fs
      .readdirSync(soundDir)
      .map(sound => sound.slice(0, -4));

    /**
     * @description If not in a voice channel
     */
    if (!voiceChannel) {
      return await message.reply('tu dois rejoindre un channel :triumph:');
    }

    /**
     * @description If desired sound does not exist in folder
     */
    if (availableCommands.indexOf(soundKey) === -1) {
      return await message.reply(
        `ce son n'existe pas, mais voici ceux disponibles :
        ${availableCommands.map(command => `\n**${command}**`)}
      `,
      );
    }

    /**
     * @description Join voice channel to play selected file
     */
    voiceChannel
      .join()
      .then(connection => {
        const dispatcher = connection.playFile(
          path.join(__dirname, 'sounds', `${soundKey}.mp3`)
        );
        dispatcher.setVolume(0.5);
        dispatcher.on('end', () => {
          voiceChannel.leave();
        });
      })
      .catch(console.error);
  }
}

module.exports = PlayCommand
