/* eslint-env node, jest */
const Rob = require('../src/modules/rob')

const rob = new Rob()
const message = {
  author: {
    id: 1
  },
  guild: {
    id: 1
  }
}

describe('Rob module', () => {
  describe('workers modules', () => {
    it('expect workers to be a map', () => {
      expect(rob.workers.entries).toBeDefined()
    })

    it('expect to find itself in a worker', () => {
      expect(rob.getInWorker).toBeDefined()

      const worker = rob.getInWorker(message.guild.id, message.author.id)
      expect(worker).toBe(null)
    })

    it('expect to create a worker', () => {
      expect(rob.createWorker).toBeDefined()

      rob.createWorker(message.guild.id, message.author.id, 2)
      const worker = rob.getInWorker(message.guild.id, message.author.id)

      expect(worker).toEqual({
        from: message.author.id,
        to: 2
      })
    })

    it('expect to delete a worker', () => {
      expect(rob.deleteWorker).toBeDefined()

      rob.deleteWorker(message.guild.id, message.author.id)
      const worker = rob.getInWorker(message.guild.id, message.author.id)

      expect(worker).toBe(null)
    })

    it('expect to check if worker exists', () => {
      expect(rob.workerExists).toBeDefined()
      const isInWorker = rob.workerExists(message.guild.id, message.author.id)
      expect(isInWorker).toBe(false)

      rob.createWorker(message.guild.id, message.author.id)
      const shouldBeInWorker = rob.workerExists(message.guild.id, message.author.id)
      expect(shouldBeInWorker).toBe(true)
    })
  })

  it('expect to steal someone from bank')
  it('expect to refuse a steal if not enough money')
  it('expect accept concurrent steals')
  it('expect to display the timer')
})
