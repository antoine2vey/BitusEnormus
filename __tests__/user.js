/* eslint-env node, jest */
const expect = require('expect')
const mongoose = require('mongoose')
const User = require('../src/database/models/user')
const First = require('../src/database/models/first')
const DiscordUser = require('../src/modules/user')

const user = new DiscordUser()
const message = {
  author: {
    id: 1
  },
  guild: {
    id: 1
  }
}

describe('Suite for user commands', () => {
  beforeAll((done) => {
    mongoose.connect('mongodb://mongodb/mappabot_test')

    const guild = new First({ guild_id: 1 })
    guild.save(done)
  })

  afterEach((done) => {
    User.remove({ guild_id: 1 }, done)
  })

  afterAll((done) => {
    First.remove({ guild_id: 1 }, done)
    mongoose.disconnect(done)
  })

  it('expect to get a user', () => {
    const { author, guild } = message

    return user.get(author, guild)
      .then((client) => {
        expect(client).toBeTruthy()
        expect(client.user_id).toEqual('1')
        expect(client.bank).toBeTruthy()
      })
  })

  it('expect to get all users in a guild', async () => {
    const { author, guild } = message
    const client = new User({ guild_id: 1, user_id: 1 })
    await client.save()

    return user
      .getInGuild(author, guild)
      .then((clients) => {
        expect(clients.length).toBe(1)
        expect(clients[0].guild_id).toBe('1')
        expect(clients[0].bank).toBeTruthy()
      })
  })

  it('expect user to get paid', () => {
    const { author, guild } = message

    return user
      .pay(author, guild, 200)
      .then((client) => {
        expect(client.kebabs).toEqual(700)
        expect(client.bank).toBeTruthy()
      })
  })

  it('expect user to get withdrawn', () => {
    const { author, guild } = message

    return user
      .withdraw(author, guild, 200)
      .then((client) => {
        expect(client.kebabs).toEqual(300)
        expect(client.bank).toBeTruthy()
      })
  })

  it('expect canWithdraw to return false is asking for too much', () => {
    const cannotWithdraw = user.canWithdraw(700, 500)

    expect(cannotWithdraw).toBe(false)
  })

  it('expect user to not get withdrawn', () => {
    const { author, guild } = message

    return user
      .withdraw(author, guild, 700)
      .then((client) => {
        expect(client).toNotHaveBeenCalled()
      })
      .catch((err) => {
        expect(err).toBeUndefined()
      })
  })

  it('expect user `first_count` to be 1', () => {
    const { author, guild } = message

    return user
      .doFirst(author, guild)
      .then((client) => {
        expect(client.first_count).toBe(1)
        expect(client.kebabs).toBe(1500)
      })
  })

  it('expect to exchange money between users if enough money from `me`', async () => {
    const { author, guild } = message

    return user.exchange(author, guild, 2, 300)
      .then((client) => {
        expect(client.user_id).toBe('1')
        expect(client.kebabs).toEqual(500 + 300)
      })
  })

  it('expect to not exchange money between users if not enough money from `me`', async () => {
    const { author, guild } = message

    return user.exchange(author, guild, 2, 600)
      .then((client) => {
        expect(client).toBeFalsy()
      })
      .catch((err) => {
        expect(err).toBeUndefined()
      })
  })
})
