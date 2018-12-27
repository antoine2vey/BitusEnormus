import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import path from 'path'
import fs from 'fs'
import request from 'request'
import Messages from '../../modules/messages'

type Kwargs = {
  soundName: string
}

class AddFileCommand extends Commando.Command {
  private messages: Messages

  constructor(client: CommandoClient) {
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
        }
      ]
    })

    this.messages = new Messages()
  }

  private hasMP3Extension(file: string): boolean {
    const array = file.split('.')
    return array[array.length - 1] === 'mp3'
  }

  async run(message: CommandMessage, { soundName }: Kwargs): Promise<any> {
    if (!message.attachments.first()) {
      this.messages.addError({
        name: 'MP3',
        value: ":rotating_light: Tu n'as pas envoyé de fichier :rotating_light:"
      })

      return message.channel.sendEmbed(this.messages.get(message))
    }

    const { filename, url } = message.attachments.first()

    if (!this.hasMP3Extension(filename)) {
      this.messages.addError({
        name: 'MP3',
        value: ':rotating_light: Envoie un MP3 :rotating_light:'
      })

      return message.channel.sendEmbed(this.messages.get(message))
    }

    const p = path.join(__dirname, 'sounds')
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p)
    }

    await request
      .get(url)
      .on('error', () => {
        this.messages.addError({
          name: 'MP3',
          value:
            ':rotating_light: Erreur dans le téléchargement :rotating_light:'
        })

        return message.channel.sendEmbed(this.messages.get(message))
      })
      .pipe(fs.createWriteStream(path.join(__dirname, 'sounds', filename)))

    // If provided soundname rename synchronously file
    if (soundName) {
      const getFile = (name: string) => path.join(__dirname, 'sounds', name)
      fs.renameSync(getFile(filename), getFile(`${soundName}.mp3`))
    }

    this.messages.addValid({
      name: 'MP3',
      value: `:white_check_mark: Son ajouté! (!sound ${soundName ||
        filename.split('.')[0]})`
    })

    message.channel.sendEmbed(this.messages.get(message))
  }
}

module.exports = AddFileCommand
