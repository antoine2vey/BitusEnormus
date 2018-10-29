import { Snowflake } from 'discord.js'
import { YouTubeSearchResults } from 'youtube-search'
import playlist from 'youtube-playlist-info'

class Music {
  queues: Map<Snowflake, Array<YouTubeSearchResults>>

  constructor() {
    this.queues = new Map()
  }

  /**
   * Replace queue in a guild
   * @param guildId Snowflake
   * @param queue YoutubeSearchResults[]
   */
  private replaceQueue(guildId: Snowflake, queue: Array<YouTubeSearchResults>): void {
    this.queues.set(guildId, queue)
  }

  /**
   * Return a given queue in a guild
   * @param guildId Snowflake
   */
  public getQueue(guildId: Snowflake): Array<YouTubeSearchResults> {
    return this.queues.get(guildId) || []
  }

  /**
   * Add a music to queue
   * @param guildId Snowflake
   * @param ytPayload YoutubeSearchResults
   */
  public enqueue(guildId: Snowflake, ytPayload: YouTubeSearchResults): Array<YouTubeSearchResults> {
    const queueArray = this.getQueue(guildId)
    const queue = [...queueArray, ytPayload]

    this.replaceQueue(guildId, queue)

    return this.getQueue(guildId)
  }

  /**
   * Remove first element in queue
   * @param guildId Snowflake
   */
  public shiftQueue(guildId: Snowflake): Array<YouTubeSearchResults> {
    const queue = this.getQueue(guildId)
    const shiftedQueue = queue.splice(1)

    this.replaceQueue(guildId, shiftedQueue)

    return this.getQueue(guildId)
  }

  /**
   * Add multiple musics to queue
   * @param guildId Snowflake
   * @param playlist 
   */
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

  /**
   * Remove a given queue
   * @param guildId Snowflake
   */
  public clearQueue(guildId: Snowflake): Array<YouTubeSearchResults> {
    this.replaceQueue(guildId, [])

    return this.getQueue(guildId)
  }

  /**
   * Return nex tmusic in queue
   * @param guildId Snowflake
   */
  public getNextMusic(guildId: Snowflake): YouTubeSearchResults {
    return this.getQueue(guildId)[0]
  }

  /**
   * Return true if queue is empty
   * @param guildId Snowflake
   */
  public isQueueEmpty(guildId: Snowflake): boolean {
    return this.getQueue(guildId).length === 0
  }
}

export default new Music()
