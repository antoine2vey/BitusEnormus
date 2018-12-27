import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import search, { YouTubeSearchResults } from 'youtube-search'
import ytdl from 'ytdl-core'
import ypi from 'youtube-playlist-info'
import music from '../../modules/music'
import { VoiceConnection, Snowflake } from 'discord.js'

class PlayCommand extends Commando.Command {
  opts: search.YouTubeSearchOptions
  isPlaying: boolean

  constructor(client: CommandoClient) {
    super(client, {
      name: 'play',
      aliases: ['play'],
      group: 'music',
      memberName: 'play',
      description: 'Play music',
      details: 'Play a Youtube music',
      examples: ['!play <recherche>'],
      argsCount: 1,
      args: [
        {
          key: 'term',
          label: 'Link',
          prompt: 'Quelle vidéo Youtube?',
          type: 'string'
        }
      ]
    })

    this.opts = {
      maxResults: 10,
      key: process.env.YOUTUBE_API_KEY as string
    }

    this.isPlaying = false
  }

  private getPlaylistId(term: string): string {
    const [_, id] = term.split('=')

    return id
  }

  private isPlaylist(term: string): boolean {
    return term.includes('playlist?list=')
  }

  private playNextMusic(
    connection: VoiceConnection,
    guildId: Snowflake,
    message: CommandMessage
  ): void {
    const song = music.getNextMusic(guildId)

    if (song) {
      const readable = ytdl(song.link, {
        quality: 'highestaudio',
        filter: 'audioonly'
      })

      const dispatcher = connection.playStream(readable)
      dispatcher.setVolume(0.2)

      dispatcher.on('start', () => {
        this.isPlaying = true
        music.shiftQueue(guildId)
      })

      dispatcher.on('end', () => {
        this.isPlaying = false
        // Recurse it to consume queue
        this.playNextMusic(connection, guildId, message)
      })
    }
  }

  /**
   * Return the first video found in an array of search results
   * (returns the first video that has kind === youtube#video)
   */
  private tryGetVideo(
    videos: Array<YouTubeSearchResults>
  ): YouTubeSearchResults {
    return (
      videos.filter(video => video.kind === 'youtube#video')[0] || undefined
    )
  }

  async run(message: CommandMessage, { term }: { term: string }): Promise<any> {
    const { id } = message.guild
    const channel = message.member.voiceChannel
    let video

    if (!this.isPlaylist(term)) {
      const { results } = await search(term, this.opts)
      video = this.tryGetVideo(results)

      if (!results.length || !video) {
        return message.reply('Musique inconnue')
      }
    }

    /**
     * If queue is empty, join channel and add current music to queue
     * if command issuer is in a voice channel
     */
    if (music.isQueueEmpty(id) && !this.isPlaying) {
      if (message.member.voiceChannel) {
        if (this.isPlaylist(term)) {
          const playlist = await ypi(
            <string>this.opts.key,
            this.getPlaylistId(term)
          )
          music.multipleEnqueue(id, playlist)
        } else {
          if (video) {
            music.enqueue(id, video)
          }
        }

        channel
          .join()
          .then(connection => {
            this.playNextMusic(connection, id, message)
          })
          .catch(console.error)
      } else {
        return message.reply('Tu dois rejoindre un channel')
      }
    } else {
      // Queue is already bound, just append to playlist
      if (this.isPlaylist(term)) {
        const playlist = await ypi(
          <string>this.opts.key,
          this.getPlaylistId(term)
        )
        music.multipleEnqueue(id, playlist)
      } else {
        if (video) {
          music.enqueue(id, video)
        }
      }
    }

    if (this.isPlaylist(term)) {
      const queue = music.getQueue(id)

      return message.channel.send(
        `Contenu de la playlist ajouté ! (${
          queue.length
        } éléments dans la liste)`
      )
    }

    return (
      video &&
      message.channel.send(
        `${video.title} (by ${video.channelTitle}) ajouté à la playlist`
      )
    )
  }
}

module.exports = PlayCommand
