/* eslint-env node, jest */
import expect from 'expect'
import mongoose from 'mongoose'
import First from '../src/database/models/first'
import Server from '../src/modules/server'

const server = new Server()

describe('Suite for server commands', () => {
  beforeAll(() => {
    mongoose.connect(
      'mongodb://mongodb:27017/mappabot_test',
      { useNewUrlParser: true },
    )
  })

  afterEach(done => {
    First.remove({ guild_id: 1 }, done)
    First.remove({ guild_id: 2 }, done)
  })

  afterAll(done => {
    mongoose.disconnect(done)
  })

  it('expect getByGuildId to return a guild if not exists', () => {
    return server.getByGuildId(<any>{ id: 1 }).then(guild => {
      expect(guild).toBeTruthy()
      expect(guild.guild_id).toBe('1')
      expect(guild.has_done_first).toBe(false)
    })
  })

  it('expect getByGuildId to return a guild if exists', () => {
    const guild = new First({ guild_id: 1 })

    return guild.save().then(() => {
      return server.getByGuildId(<any>{ id: 1 }).then(guild => {
        expect(guild).toBeTruthy()
        expect(guild.guild_id).toBe('1')
      })
    })
  })

  it('expect all guilds to go with `has_done_first` to false', async () => {
    const guild = new First({ guild_id: 1 })
    const guild2 = new First({ guild_id: 2 })

    await guild.save()
    await guild2.save()

    return server.resetGuilds().then(res => {
      expect(res).toBe(true)
    })
  })

  it('expect `has_done_first` to be true when we first', () => {
    const guild = new First({ guild_id: 1 })

    return guild.save().then(() => {
      return server.doFirst(<any>{ id: 1 }).then(guild => {
        expect(guild).toBeTruthy()
        expect(guild.has_done_first).toBe(true)
      })
    })
  })
})
