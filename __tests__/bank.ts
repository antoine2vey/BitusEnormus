/* eslint-env node, jest */
import expect from 'expect';
import mongoose from 'mongoose';
import First from '../src/database/models/first';
import Bank from '../src/database/models/bank';
import User from '../src/database/models/user';
import DiscordUser from '../src/modules/user';
import { Guild } from 'discord.js';

const user = new DiscordUser()
const message = {
  author: {
    id: '1'
  },
  guild: {
    id: '1'
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

    return user.get(author, <Guild>guild).then((client) => {
      return user.checkBankExists(client.user_id, guild.id).then((bank) => {
        expect(client.id.toString()).toBe(bank.belongs_to.toString())
        expect(bank.id.toString()).toBe(client.bank.id.toString())
      })
    })
  })

  it('expect to throw when cannot withdraw money', () => {
    const { author, guild } = message

    return user.checkIfCanWithdraw(author.id, guild.id, 2000).catch((err) => {
      expect(err).toBe(null)
    })
  })

  it('expect to not throw when can withdraw money', () => {
    const { author, guild } = message

    return user.checkIfCanWithdraw(author.id, guild.id, 500).then((bank) => {
      expect(bank.amount).toBe(500)
    })
  })

  it('expect to throw when not good input', () => {
    const { author, guild } = message

    return user.checkIfCanWithdraw(author.id, guild.id, <any>'foo').catch((err) => {
      expect(err).toBe(null)
    })
  })
})
