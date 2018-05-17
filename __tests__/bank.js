/* eslint-env node, jest */
const expect = require('expect')
const mongoose = require('mongoose')
const First = require('../src/database/models/first')
const Bank = require('../src/database/models/bank')
const User = require('../src/database/models/user')
const DiscordUser = require('../src/modules/user')

const user = new DiscordUser({
  author: {
    id: 1
  },
  guild: {
    id: 1
  }
})

describe('Suite for bank commands', () => {
  beforeAll((done) => {
    mongoose.connect('mongodb://127.0.0.1:27017/mappabot_test')

    const guild = new First({ guild_id: 1 })
    guild.save(done)
  })

  afterEach((done) => {
    return User.remove({ guild_id: 1 }, done)
  })

  afterAll((done) => {
    Bank.remove({}, done)
    mongoose.disconnect(done)
  })

  it('expect checkBank() to return bank for user that belongs to him', () => {
    return user.get().then((client) => {
      return user.checkBankExists().then((bank) => {
        expect(client._id.toString()).toBe(bank.belongs_to._id.toString())
        expect(bank._id.toString()).toBe(client.bank._id.toString())
      })
    })
  })
})
