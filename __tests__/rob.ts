/* eslint-env node, jest */
import Rob from '../src/modules/rob'
import mongoose from 'mongoose'
import Member from '../src/database/models/user'
import DiscordUser from '../src/modules/user'
import { GuildMember, User, Guild } from 'discord.js'

jest.useFakeTimers()

const rob = Rob
const user = new DiscordUser()
const author = <User>{
  id: '1',
  username: 'John',
}
const author2 = <User>{
  id: '2',
  username: 'John2',
}
const guild = <Guild>{
  id: '1',
}
const target = <GuildMember>{
  user: {
    id: '3',
    username: 'Foo',
  },
}

describe('Rob module', () => {
  describe('workers modules', () => {
    afterAll(() => {
      jest.runOnlyPendingTimers()
    })

    it('expect workers to be a map', () => {
      expect(rob.guilds.entries).toBeDefined()
    })

    it('expect to find itself in a worker', () => {
      expect(rob.getWorker).toBeDefined()

      const worker = rob.getWorker(guild.id, author.id)
      expect(worker).toBe(null)
    })

    it('expect to create a worker', () => {
      expect(rob.createWorker).toBeDefined()

      rob.createWorker(guild, author, author2, null)
      const worker = rob.getWorker(guild.id, author.id)

      expect(worker.from).toEqual(author.id)
      expect(worker.to).toEqual('2')
      expect(worker.timer).toBeDefined()
    })

    it('expect to delete a worker', () => {
      expect(rob.deleteWorker).toBeDefined()

      rob.deleteWorker(guild.id, author.id)
      const worker = rob.getWorker(guild.id, author.id)

      expect(worker).toBe(null)
    })

    it('expect to get all workers inside a guild', () => {
      expect(rob.getGuild).toBeDefined()

      const workerMap = rob.getGuild(guild.id)
      const worker = workerMap.get(author.id)

      expect(worker.from).toEqual(author.id)
      expect(worker.to).toEqual('2')
      expect(worker.timer).toBeDefined()
    })
  })

  describe('robbing modules', () => {
    beforeAll(done => {
      mongoose.connect(
        'mongodb://mongo:27017/mappabot_test',
        { useNewUrlParser: true },
        done,
      )
    })

    afterEach(done => {
      Member.remove({ guild_id: 1 }, done)
    })

    afterAll(done => {
      mongoose.disconnect(done)
    })

    it('expect to define a constant for base timing', () => {
      expect(rob.DEFAULT_ROB_TIME).toBeDefined()
      expect(rob.DEFAULT_ROB_TIME).toBe(5 * 60 * 1000) // aka 5 minutes
    })

    it('expect to steal someone from bank', async () => {
      expect(rob.start).toBeDefined()

      await user.get(author, guild)
      await user.get(author2, guild)

      return rob.start(guild, author, author2, null).then(client => {
        expect(client.money).toBe(900)
        expect(client.bank.amount).toBe(1000)
      })
    })

    it('expect to refuse a steal if not enough money', async () => {
      await user.get(author, guild)
      await user.get(author2, guild)

      return rob.steal(author, guild, target, 1000).catch(ex => {
        expect(ex).toBe(null)
      })
    })

    it('expect to accept concurrent steals', async () => {
      expect(rob.start).toBeDefined()

      rob.start(guild.id, author.id, '2')
      rob.start(guild.id, '3', '4')

      const workers = rob.getGuild(guild.id)
      expect(workers.size).toBe(2)

      jest.runOnlyPendingTimers()

      const workerNull = rob.getWorker(guild.id, author.id)
      const workerNull2 = rob.getWorker(guild.id, '3')

      expect(workerNull).toBe(null)
      expect(workerNull2).toBe(null)
    })  

    it('expect to end timers', () => {
      expect(rob.stop).toBeDefined()

      rob.createWorker(guild.id, author.id, '2')
      const worker = rob.getWorker(guild.id, author.id)

      expect(worker).toBeTruthy()

      rob.stop(guild.id, author.id)

      const endedWorker = rob.getWorker(guild.id, author.id)
      expect(endedWorker).toEqual(null)
    })
  })
})
