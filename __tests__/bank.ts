/* eslint-env node, jest */
import expect from 'expect'
import mongoose from 'mongoose'
import First from '../src/database/models/first'
import Bank from '../src/database/models/bank'
import Member from '../src/database/models/user'
import DiscordUser from '../src/modules/user'
import { Guild, User } from 'discord.js'

const user = new DiscordUser()
const author = <User>{
  id: '1',
  username: 'John',
}
const guild = <Guild>{
  id: '1',
}

describe('Suite for bank commands', () => {
  beforeAll(done => {
    mongoose.connect(
      'mongodb://mongodb:27017/mappabot_test',
      { useNewUrlParser: true },
    )

    const guild = new First({ guild_id: 1 })
    guild.save(done)
  })

  afterEach(done => {
    Member.remove({ guild_id: 1 }, done)
  })

  afterAll(done => {
    Bank.remove({}, done)
    mongoose.disconnect(done)
  })

  it('expect checkBank() to return bank for user that belongs to him', () => {
    return user.get(author, guild).then(client => {
      return user.checkBankExists(author, guild.id).then(bank => {
        expect(client.id.toString()).toBe(bank.belongs_to.toString())
        expect(bank.id.toString()).toBe(client.bank.id.toString())
      })
    })
  })

  it('expect to throw when cannot withdraw money', async () => {
    return user.checkIfCanWithdraw(author, guild, 2000).catch(err => {
      expect(err).toBe(null)
    })
  })

  it('expect to not throw when can withdraw money', async () => {
    return user.checkIfCanWithdraw(author, guild, 500).then(async bank => {
      const newUser = await user.get(author, guild)

      expect(bank.amount).toBe(500)
      expect(newUser.money).toBe(1000)
    })
  })

  it('expect to throw when not good input', async () => {
    return user.checkIfCanWithdraw(author, guild, <any>'foo').catch(err => {
      expect(err).toBe(null)
    })
  })

  it('expect to throw when cannot transfer money', async () => {
    const client = await user.get(author, guild)

    return user.increaseBank(client, author, guild, 1000).catch(err => {
      expect(err).toBe(null)
    })
  })

  it('expect to not throw when can transfer money', async () => {
    const client = await user.get(author, guild)

    return user.increaseBank(client, author, guild, 400).then(async bank => {
      const newUser = await user.get(author, guild)

      expect(bank.amount).toBe(1400)
      expect(newUser.money).toBe(100)
    })
  })

  it('expect to throw when not good input', async () => {
    const client = await user.get(author, guild)

    return user.increaseBank(client, author, guild, <any>'foo').catch(err => {
      expect(err).toBe(null)
    })
  })
})
