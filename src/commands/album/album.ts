import Commando, { CommandMessage } from 'discord.js-commando';
import Album, { IAlbumModel } from '../../database/models/album';

class AlbumCommand extends Commando.Command {
  private readonly album: IAlbumModel

  constructor(client) {
    super(client, {
      name: 'album',
      aliases: ['mappa', 'album'],
      group: 'album',
      memberName: 'add',
      description: "Affiche une image au hasard de l'album",
      details: "Affiche une image au hasard de l'album",
      examples: ['!mappa'],
      argsCount: 0,
    })

    this.album = Album
  }

  async run(message: CommandMessage) {
    const total = await this.album.getTotalPictures()
    const photo = await this.album.getRandomPicture(total)

    await message.channel.messages.last().delete()
    return message.channel.sendMessage('', { file: photo.link })
  }
}

module.exports = AlbumCommand