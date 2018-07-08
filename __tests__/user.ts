/* eslint-env node, jest */
import expect from 'expect';
import mongoose from 'mongoose';
import Member from '../src/database/models/user';
import First from '../src/database/models/first';
import DiscordUser from '../src/modules/user';
import { User, Guild, GuildMember } from 'discord.js';

const user = new DiscordUser()
const author = <User> {
  id: '1',
  username: 'John'
}
const author2 = <User> {
  id: '3',
  username: 'Foobar'
}
const guild = <Guild> {
  id: '1'
}
const target = <GuildMember> {
  user: {
    id: '2',
    username: 'Foo'
  }
}

describe('Suite for user commands', () => {
  beforeAll((done) => {
    mongoose.connect('mongodb://mongodb:27017/mappabot_test')

    const guild = new First({ guild_id: 1 })
    guild.save(done)
  })

  afterEach((done) => {
    Member.remove({ guild_id: '1' }, done)
  })

  afterAll((done) => {
    First.remove({ guild_id: '1' }, done)
    mongoose.disconnect(done)
  })

  it('expect to get a user', () => {
    return user.get(author, guild)
      .then((client) => {
        expect(client).toBeTruthy()
        expect(client.user_id).toEqual('1')
        expect(client.bank).toBeTruthy()  
      })
  })

  it('expect to get all users in a guild', async () => {
    await user.get(author2, guild)

    return user
      .getInGuild(author, guild)
      .then((clients) => {
        console.log(clients)
        expect(clients.length).toBe(2)
        expect(clients[0].guild_id).toBe('1')
        expect(clients[0].bank).toBeTruthy()
      })
  })

  it('expect user to get paid', () => {
    
    return user
      .pay(author, guild, 200)
      .then((client) => {
        expect(client.kebabs).toEqual(700)
        expect(client.bank).toBeTruthy()
      })
  })

  it('expect user to get withdrawn', () => {
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
    return user
      .withdraw(author, guild, 700)
      .then((client) => {
        expect(client).toNotHaveBeenCalled()
      })
      .catch((err) => {
        expect(err).toBeNull()
      })
  })

  it('expect user `first_count` to be 1', () => {
    return user
      .doFirst(author, guild)
      .then((client) => {
        expect(client.first_count).toBe(1)
        expect(client.kebabs).toBe(1500)
      })
  })

  it('expect to exchange money between users if enough money from `me`', async () => {
    return user.exchange(author, guild, target, 300)
      .then((client) => {
        expect(client.user_id).toBe('2')
        expect(client.kebabs).toEqual(500 + 300)
      })
  })

  it('expect to not exchange money between users if not enough money from `me`', async () => {
    return user.exchange(author, guild, target, 600)
      .then((client) => {
        expect(client).toBeFalsy()
      })
      .catch((err) => {
        expect(err).toBeNull()
      })
  })
})
