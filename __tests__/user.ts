/* eslint-env node, jest */
import expect from 'expect'
import mongoose from 'mongoose'
import Member from '../src/database/models/user'
import First from '../src/database/models/first'
import DiscordUser from '../src/modules/user'
import Bank from '../src/database/models/bank'
import { User, Guild, GuildMember, Message } from 'discord.js'

const user = new DiscordUser()
const author = <User>{
  id: '1',
  username: 'John',
}
const author2 = <User>{
  id: '3',
  username: 'Foobar',
}
const guild = <Guild>{
  id: '1',
}
const target = <GuildMember>{
  user: {
    id: '2',
    username: 'Foo',
  },
}

describe('Suite for user commands', () => {
  beforeAll(done => {
    mongoose.connect(
      'mongodb://mongo:27017/mappabot_test',
      { useNewUrlParser: true },
    )

    const guild = new First({ guild_id: 1 })
    guild.save(done)
  })

  afterEach(done => {
    Member.remove({ guild_id: '1' }, done)
  })

  afterAll(done => {
    First.remove({ guild_id: '1' }, done)
    mongoose.disconnect(done)
  })

  it('expect to get a user', () => {
    return user.get(author, guild).then(client => {
      expect(client).toBeTruthy()
      expect(client.user_id).toEqual('1')
      expect(client.bank).toBeTruthy()
    })
  })

  it('expect to get all users in a guild', async () => {
    await user.get(author2, guild)

    return user.getInGuild(author, guild).then(clients => {
      expect(clients.length).toBe(2)
      expect(clients[0].guild_id).toBe('1')
      expect(clients[0].bank).toBeTruthy()
    })
  })

  it('expect user to get paid', () => {
    return user.pay(author, guild, 200).then(client => {
      expect(client.money).toEqual(700)
      expect(client.bank).toBeTruthy()
    })
  })

  it('expect user to get withdrawn', () => {
    return user.withdraw(author, guild, 200).then(client => {
      expect(client.money).toEqual(300)
      expect(client.bank).toBeTruthy()
    })
  })

  it('expect canWithdraw to return false is asking for too much', () => {
    const cannotWithdraw = user.canWithdraw(700, 500)

    expect(cannotWithdraw).toBe(false)
  })

  it('expect user to not get withdrawn', () => {
    return user.withdraw(author, guild, 700).catch(client => {
      expect(client).toBeTruthy()
      expect(client.money).toBe(500)
    })
  })

  it('expect user `first_count` to be 1', () => {
    return user.doFirst(author, guild).then(client => {
      expect(client.first_count).toBe(1)
      expect(client.money).toBe(1500)
    })
  })

  it('expect to exchange money between users if enough money from `me`', async () => {
    return user.exchange(author, guild, target, 300).then(client => {
      expect(client.user_id).toBe('2')
      expect(client.money).toEqual(500 + 300)
    })
  })

  it('expect to not exchange money between users if not enough money from `me`', async () => {
    return user
      .exchange(author, guild, target, 600)
      .then(client => {
        expect(client).toBeFalsy()
      })
      .catch(err => {
        expect(err).toBeNull()
      })
  })

  it('expect to update user on any message', async () => {
    const withEmbed = {
      guild,
      author,
      attachments: {
        first() {
          return true
        },
      },
      content: 'foo',
      mentions: {
        users: {
          first() {
            return false
          },
        },
        everyone: false,
      },
    }
    const client = await user.get(author, guild)
    const updatedClient = await user.handleMessage(<any>withEmbed)

    expect(client.social_score).toEqual(0)
    expect(updatedClient.social_score).toEqual(user.MESSAGE_WITH_MEDIA)

    const checkAdd = await user.handleMessage(<any>withEmbed)
    expect(checkAdd.social_score).toEqual(0 + user.MESSAGE_WITH_MEDIA + user.MESSAGE_WITH_MEDIA)
  })

  it('expect to pass sorting query in getInGuild', async () => {
    const query = { money: -1 }
    await user.get(author2, guild)
    await user.pay(author, guild, 1000)

    return user.getInGuild(author, guild, query).then(clients => {
      const [first, second] = clients

      expect(first.money > second.money).toBe(true)
    })
  })

  describe('possible interactions', () => {
    it('expect all interaction to have a value', () => {
      expect(user.BASIC_MESSAGE).toEqual(5)
      expect(user.MESSAGE_WITH_MEDIA).toEqual(8)
      expect(user.MESSAGE_WITH_PING).toEqual(10)
      expect(user.AT_HERE).toEqual(15)
      expect(user.AT_EVERYONE).toEqual(20)
    })

    it('expect to return message with media', () => {
      const withEmbed = {
        attachments: {
          first() {
            return true
          },
        },
        content: 'foo',
        mentions: {
          users: {
            first() {
              return false
            },
          },
          everyone: false,
        },
      }
      expect(user.getInteractionValue(<any>withEmbed)).toEqual(user.MESSAGE_WITH_MEDIA)
    })

    it('expect to return message with message only', () => {
      const withMessage = {
        attachments: {
          first() {
            return false
          },
        },
        content: 'foo',
        mentions: {
          users: {
            first() {
              return false
            },
          },
          everyone: false,
        },
      }
      expect(user.getInteractionValue(<any>withMessage)).toEqual(user.BASIC_MESSAGE)
    })

    it('expect to ping @everyone', () => {
      const withEveryone = {
        attachments: {
          first() {
            return false
          },
        },
        content: 'foobar @everyone',
        mentions: {
          users: {
            first() {
              return false
            },
          },
          everyone: true,
        },
      }
      expect(user.getInteractionValue(<any>withEveryone)).toEqual(user.AT_EVERYONE)
    })

    it('expect to ping @here', () => {
      const withHere = {
        attachments: {
          first() {
            return false
          },
        },
        content: 'foobar @here',
        mentions: {
          users: {
            first() {
              return false
            },
          },
          everyone: true,
        },
      }
      expect(user.getInteractionValue(<any>withHere)).toEqual(user.AT_HERE)
    })

    it('expect to ping someone', () => {
      const withPing = {
        attachments: {
          first() {
            return false
          },
        },
        content: 'foo @Antoine',
        mentions: {
          users: {
            first() {
              return true
            },
          },
          everyone: false,
        },
      }
      expect(user.getInteractionValue(<any>withPing)).toEqual(user.MESSAGE_WITH_PING)
    })
  })

  it('expect to return all users from any guilds', async () => {
    await user.get(author, guild)
    await user.get(author2, guild)
    
    const users = await user.getAll()
    expect(users.length).toBe(2)
  })
})
