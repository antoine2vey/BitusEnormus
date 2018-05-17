/* eslint-env node, jest */
const expect = require('expect')
const mongoose = require('mongoose')
const User = require('../src/database/models/user')
const First = require('../src/database/models/first')
const DiscordUser = require('../src/modules/user')

const user = new DiscordUser({
  author: {
    id: 1
  },
  guild: {
    id: 1
  }
})

describe('Suite for user commands', () => {
  beforeAll((done) => {
    mongoose.connect('mongodb://127.0.0.1:27017/mappabot_test')

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
    return user.get()
      .then((client) => {
        expect(client).toBeTruthy()
        expect(client.user_id).toEqual('1')
        expect(client.bank).toBeTruthy()
      })
  })

  it('expect to get all users in a guild', async () => {
    const client = new User({ guild_id: 1, user_id: 1 })
    await client.save()

    return user
      .getInGuild()
      .then((clients) => {
        expect(clients.length).toBe(1)
        expect(clients[0].guild_id).toBe('1')
        expect(clients[0].bank).toBeTruthy()
      })
  })

  it('expect user to get paid', () => {
    return user
      .pay(200)
      .then((client) => {
        expect(client.kebabs).toEqual(700)
        expect(client.bank).toBeTruthy()
      })
  })

  it('expect user to get withdrawn', () => {
    return user
      .withdraw(200)
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
    return user
      .withdraw(700)
      .then((client) => {
        expect(client).toNotHaveBeenCalled()
      })
      .catch((err) => {
        expect(err).toBe('Not enough money')
      })
  })

  it('expect user `first_count` to be 1', () => {
    return user
      .hasDoneFirst()
      .then((client) => {
        expect(client.first_count).toBe(1)
      })
  })
})
