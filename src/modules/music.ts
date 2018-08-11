import { Snowflake } from 'discord.js'
import { YouTubeSearchResults } from 'youtube-search'
import playlist from 'youtube-playlist-info'

class Music {
  queues: Map<Snowflake, Array<YouTubeSearchResults>>

  constructor() {
    this.queues = new Map()
  }

  private replaceQueue(guildId: Snowflake, queue: Array<YouTubeSearchResults>): void {
    this.queues.set(guildId, queue)
  }

  public getQueue(guildId: Snowflake): Array<YouTubeSearchResults> {
    return this.queues.get(guildId) || []
  }

  public enqueue(guildId: Snowflake, ytPayload: YouTubeSearchResults): Array<YouTubeSearchResults> {
    const queueArray = this.getQueue(guildId)
    const queue = [...queueArray, ytPayload]

    this.replaceQueue(guildId, queue)

    return this.getQueue(guildId)
  }

  public shiftQueue(guildId: Snowflake): Array<YouTubeSearchResults> {
    const queue = this.getQueue(guildId)
    const shiftedQueue = queue.splice(1)

    this.replaceQueue(guildId, shiftedQueue)

    return this.getQueue(guildId)
  }

  public multipleEnqueue(
    guildId: Snowflake,
    playlist: Array<any>,
  ): Array<YouTubeSearchResults> {
    const queue = this.getQueue(guildId)
    const newQueue = [...queue, ...playlist.map(song => {
      return {
        ...song,
        link: `https://www.youtube.com/watch?v=${song.resourceId.videoId}`
      }
    })]

    this.replaceQueue(guildId, newQueue)

    return this.getQueue(guildId)
  }

  public clearQueue(guildId: Snowflake): Array<YouTubeSearchResults> {
    this.replaceQueue(guildId, [])

    return this.getQueue(guildId)
  }

  public getNextMusic(guildId: Snowflake): YouTubeSearchResults {
    return this.getQueue(guildId)[0]
  }

  public isQueueEmpty(guildId: Snowflake): boolean {
    return this.getQueue(guildId).length === 0
  }
}

const musicModule = new Music()
export default musicModule
