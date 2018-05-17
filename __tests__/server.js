/* eslint-env node, jest */
const expect = require('expect')
const mongoose = require('mongoose')
const First = require('../src/database/models/first')
const Server = require('../src/modules/server')

const server = new Server()

describe('Suite for server commands', () => {
  beforeAll(() => {
    mongoose.connect('mongodb://mongodb/mappabot_test')
  })

  afterEach((done) => {
    First.remove({ guild_id: 1 }, done)
    First.remove({ guild_id: 2 }, done)
  })

  afterAll((done) => {
    mongoose.disconnect(done)
  })

  it('expect getByGuildId to return a guild if not exists', () => {
    return server
      .getByGuildId({ id: 1 })
      .then((guild) => {
        expect(guild).toBeTruthy()
        expect(guild.guild_id).toBe('1')
      })
  })

  it('expect getByGuildId to return a guild if exists', () => {
    const guild = new First({ guild_id: 1 })

    return guild.save().then(() => {
      return server
        .getByGuildId({ id: 1 })
        .then((guild) => {
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

    return server
      .resetGuilds()
      .then((res) => {
        expect(res).toBe(true)
      })
      .catch((err) => {
        expect(err).toBe(false)
      })
  })

  it('expect `has_done_first` to be true when we first', () => {
    const guild = new First({ guild_id: 1 })

    return guild.save().then(() => {
      return server
        .doFirst({ id: 1 })
        .then((guild) => {
          expect(guild).toBeTruthy()
          expect(guild.has_done_first).toBe(true)
        })
    })
  })
})
