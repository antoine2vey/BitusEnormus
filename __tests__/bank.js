/* eslint-env node, jest */
const expect = require('expect')
const mongoose = require('mongoose')
const First = require('../src/database/models/first')
const Bank = require('../src/database/models/bank')
const User = require('../src/database/models/user')
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

describe('Suite for bank commands', () => {
  beforeAll((done) => {
    mongoose.connect('mongodb://mongodb/mappabot_test')

    const guild = new First({ guild_id: 1 })
    guild.save(done)
  })

  afterEach((done) => {
    User.remove({ guild_id: 1 }, done)
  })

  afterAll((done) => {
    Bank.remove({}, done)
    mongoose.disconnect(done)
  })

  it('expect checkBank() to return bank for user that belongs to him', () => {
    const { author, guild } = message

    return user.get(author, guild).then((client) => {
      return user.checkBankExists(client.user_id, guild.id).then((bank) => {
        expect(client.id.toString()).toBe(bank.belongs_to.toString())
        expect(bank.id.toString()).toBe(client.bank.id.toString())
      })
    })
  })

  it('expect to throw when cannot withdraw money', () => {
    const { author, guild } = message

    return user.checkIfCanWithdraw(author.id, guild.id, 2000)
      .then((res) => {
        expect(res).toBeNull()
      })
      .catch((err) => {
        expect(err).toBeUndefined()
      })
  })

  it('expect to not throw when can withdraw money', () => {
    const { author, guild } = message

    return user.checkIfCanWithdraw(author.id, guild.id, 500)
      .then((bank) => {
        expect(bank.amount).toBe(500)
      })
  })

  it('expect to throw when not good input', () => {
    const { author, guild } = message

    return user.checkIfCanWithdraw(author.id, guild.id, 'foo')
      .then((res) => {
        expect(res).toBeNull()
      })
      .catch((err) => {
        expect(err).toBeUndefined()
      })
  })
})
