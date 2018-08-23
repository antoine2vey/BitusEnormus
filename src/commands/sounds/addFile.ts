import Commando, { CommandMessage } from 'discord.js-commando'
import path, { extname } from 'path'
import fs from 'fs'
import request from 'request'
import Messages from '../../modules/messages'

class AddFileCommand extends Commando.Command {
  private messages: Messages
  
  constructor(client) {
    super(client, {
      name: 'add',
      aliases: ['add'],
      group: 'sounds',
      memberName: 'add-sound',
      description: 'Ajouter une musique',
      details: 'Ajoute une musique a la collection',
      examples: ['!add'],
      argsCount: 1,
      args: [
        {
          key: 'soundName',
          label: 'Nom du son',
          prompt: 'Quel nom pour le son ?',
          type: 'string',
          default: ''
        },
      ],
    })
    
    this.messages = new Messages()
  }

  private hasMP3Extension(file): boolean {
    const array = file.split('.');
    return array[array.length - 1] === 'mp3';
  }

  async run(message: CommandMessage, { soundName }): Promise<any> {
    if (!message.attachments.first()) {
      this.messages.addError({
        name: 'MP3',
        value: `:rotating_light: Tu n'as pas envoyé de fichier :rotating_light:`
      })
      
      return message.channel.sendEmbed(this.messages.get(message))
    }

    const { filename, url } = message.attachments.first();

    if (!this.hasMP3Extension(filename)) {
      this.messages.addError({
        name: 'MP3',
        value: ':rotating_light: Envoie un MP3 :rotating_light:'
      })
      
      return message.channel.sendEmbed(this.messages.get(message))
    }

    // TODO: Check mimetype
    console.time('write')
    await request
      .get(url)
      .on('error', () => {
        this.messages.addError({
          name: 'MP3',
          value: ':rotating_light: Erreur dans le téléchargement :rotating_light:'
        })
      
        return message.channel.sendEmbed(this.messages.get(message))
      })
      .pipe(
        fs.createWriteStream(
          path.join(__dirname, 'sounds', filename)
        )
      )
      
    // If provided soundname rename synchronously file
    if (soundName) {
      const getFile = name => path.join(__dirname, 'sounds', name)
      
      fs.renameSync(getFile(filename), getFile(`${soundName}.mp3`))
    }
  }
}

module.exports = AddFileCommand
