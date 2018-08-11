import MusicModule from '../src/modules/music'

const music = MusicModule
const guildId = '1'
const ytPayload = {
  link: 'http://foo.bar',
  title: 'foobar',
}

const secondYtPayload = {
  link: 'http://quz.qux',
  title: 'quzqux',
}

describe('Music module', () => {
  it('should create a map containing all servers currently playing musics', () => {
    expect(typeof music.queues).toBe('object')
    expect(music.queues.size).toBe(0)
  })

  it('should return empty if no queue for guild', () => {
    const queue = music.getQueue(guildId)
    expect(queue.length).toBe(0)
  })

  it('should add a music to queue', () => {
    const queue = music.enqueue(guildId, <any>ytPayload)

    expect(queue.length).toBe(1)
    expect(queue[0].link).toBe(ytPayload.link)
  })

  it('should unshift a music from queue', () => {
    music.enqueue(guildId, <any>secondYtPayload)
    const queue = music.shiftQueue(guildId)

    expect(queue.length).toBe(1)
    expect(queue[0].link).toBe(secondYtPayload.link)
  })

  it('should add multiple musics from a queue', () => {
    const queue = music.multipleEnqueue(guildId, [<any>ytPayload, <any>secondYtPayload])

    expect(queue.length).toBe(3)
  })

  it('should empty playlist when bot is cleared', () => {
    const queue = music.clearQueue(guildId)

    expect(queue.length).toBe(0)
  })

  it('should return next music in queue', () => {
    const queue = music.multipleEnqueue(guildId, [<any>ytPayload, <any>secondYtPayload])

    expect(queue.length).toBe(2)

    const nextMusic = music.getNextMusic(guildId)
    expect(nextMusic.link).toBe(ytPayload.link)
  })

  it('should tell if queue is empty', () => {
    const notEmpty = music.isQueueEmpty(guildId)
    expect(notEmpty).toBe(false)

    music.clearQueue(guildId)

    const empty = music.isQueueEmpty(guildId)
    expect(empty).toBe(true)
  })
})
