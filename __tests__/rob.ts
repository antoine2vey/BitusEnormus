/* eslint-env node, jest */
import Rob from '../src/modules/rob';
import mongoose from 'mongoose';
import User from '../src/database/models/user';
import DiscordUser from '../src/modules/user';

jest.useFakeTimers()

const rob = new Rob()
const user = new DiscordUser()
const message = {
  author: {
    id: '1'
  },
  guild: {
    id: '1'
  }
}

describe('Rob module', () => {
  describe('workers modules', () => {
    afterAll(() => {
      rob.deleteWorker('1', '1')
    })

    it('expect workers to be a map', () => {
      expect(rob.workers.entries).toBeDefined()
    })

    it('expect to find itself in a worker', () => {
      const { author, guild } = message

      expect(rob.getInWorker).toBeDefined()

      const worker = rob.getInWorker(guild.id, author.id)
      expect(worker).toBe(null)
    })

    it('expect to create a worker', () => {
      const { author, guild } = message

      expect(rob.createWorker).toBeDefined()

      rob.createWorker(guild.id, author.id, '2')
      const worker = rob.getInWorker(guild.id, author.id)

      expect(worker).toEqual({
        from: author.id,
        to: '2'
      })
    })

    it('expect to delete a worker', () => {
      const { author, guild } = message

      expect(rob.deleteWorker).toBeDefined()

      rob.deleteWorker(guild.id, author.id)
      const worker = rob.getInWorker(guild.id, author.id)

      expect(worker).toBe(null)
    })

    it('expect to check if worker exists', () => {
      const { author, guild } = message

      expect(rob.workerExists).toBeDefined()
      const isInWorker = rob.workerExists(guild.id, author.id)
      expect(isInWorker).toBe(false)
      const workerExists = rob.workerExists('5', author.id)
      expect(workerExists).toBe(false)

      rob.createWorker(guild.id, author.id, '2')
      const shouldBeInWorker = rob.workerExists(guild.id, author.id)
      expect(shouldBeInWorker).toBe(true)

      const noGuildWorker = rob.workerExists('2', author.id)
      expect(noGuildWorker).toBe(false)
    })

    it('expect to get all workers inside a guild', () => {
      const { author, guild } = message

      expect(rob.getWorkers).toBeDefined()

      const workers = rob.getWorkers(guild.id)
      expect(workers).toEqual([{ from: author.id, to: '2' }])
    })
  })

  describe('robbing modules', () => {
    beforeAll((done) => {
      mongoose.connect('mongodb://mongodb/mappabot_test', done)
    })

    afterEach((done) => {
      User.remove({ guild_id: 1 }, done)
    })

    afterAll((done) => {
      mongoose.disconnect(done)
    })

    it('expect to define a constant for base timing', () => {
      expect(rob.DEFAULT_ROB_TIME).toBeDefined()
      expect(rob.DEFAULT_ROB_TIME).toBe(5 * 60 * 1000) // aka 5 minutes
    })

    it('expect to steal someone from bank', async () => {
      expect(rob.steal).toBeDefined()

      const { author, guild } = message

      await user.get(author, <any>guild)
      await user.get({ id: '2' }, <any>guild)

      return rob.steal(<any>author, <any>guild, '2', 400).then((client) => {
        expect(client.kebabs).toBe(900)
        expect(client.bank.amount).toBe(1000)
      })
    })

    it('expect to refuse a steal if not enough money', async () => {
      const { author, guild } = message

      await user.get(author, <any>guild)
      await user.get(<any>{ id: 2 }, <any>guild)

      return rob.steal(<any>author, <any>guild, '2', 1000).catch((ex) => {
        expect(ex).toBe(null)
      })
    })

    it('expect accept concurrent steals', async () => {
      const { author, guild } = message

      expect(rob.start).toBeDefined()
      expect(setTimeout).toHaveBeenCalledTimes(1)

      rob.start(author.id, guild.id, '2')
      rob.start('3', guild.id, '4')

      const worker = rob.getInWorker(guild.id, author.id)
      const worker2 = rob.getInWorker(guild.id, '3')

      expect(worker).toEqual({
        from: author.id,
        to: '2'
      })
      expect(worker2).toEqual({
        from: '3',
        to: '4'
      })
      expect(rob.getWorkers(guild.id).length).toBe(2)

      jest.runOnlyPendingTimers()

      const workerNull = rob.getInWorker(guild.id, author.id)
      const workerNull2 = rob.getInWorker(guild.id, '3')

      expect(workerNull).toBe(null)
      expect(workerNull2).toBe(null)
    })

    it('expect to end timers', () => {
      const { author, guild } = message

      expect(rob.stop).toBeDefined()

      rob.createWorker(guild.id, author.id, '2')
      const worker = rob.getInWorker(guild.id, author.id)
      expect(worker).toBeTruthy()

      rob.stop(guild.id, author.id)

      const endedWorker = rob.getInWorker(guild.id, author.id)
      expect(endedWorker).toEqual(null)
    })
  })
})
