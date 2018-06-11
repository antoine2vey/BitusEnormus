/* eslint-env node, jest */
const expect = require('expect')
const Helpers = require('../src/modules/helpers')

const helpers = new Helpers()

describe('Checks for helpers', () => {
  describe('Checks for crontasks', () => {
    it('expect method to be defined', () => {
      expect(helpers.makeTask).toBeDefined()
    })

    it('expect crontask to not be launched', () => {
      const task = helpers.makeTask('0 0 * * *', () => {})

      expect(task.running).toBe(undefined)
    })

    it('expect crontask length to be 2 after defining another task', () => {
      const task = helpers.makeTask('0 0 * * *', () => {})
      task.start()

      expect(task.running).toBe(true)
    })

    it('expect to return a database connector', () => {
      expect(helpers.bootDatabase).toBeDefined()

      const promise = helpers.bootDatabase()
      expect(promise.then).toBeDefined()
    })
  })

  describe('Checks for emojis set', () => {
    it('expect kebab id to not be empty on startup', () => {
      expect(helpers.kebabId).toBe('')
    })

    it('expect set method to be defined', () => {
      expect(helpers.setNewEmote).toBeDefined()
    })

    it('expect kebab to be set after set called', () => {
      helpers.setNewEmote({ id: 1 })

      expect(helpers.kebabId).toBe(1)
    })

    it('expect to get kebab without function', () => {
      const emoji = helpers.kebab

      expect(typeof emoji).toBe('string')
    })
  })
})
