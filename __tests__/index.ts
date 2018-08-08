/* eslint-env node, jest */
import expect from 'expect'
import Helpers from '../src/modules/helpers'

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

    it('expect to get the right medal for given position', () => {
      expect(helpers.getMedal(1)).toEqual(':first_place:')
      expect(helpers.getMedal(2)).toEqual(':second_place:')
      expect(helpers.getMedal(3)).toEqual(':third_place:')
      expect(helpers.getMedal(4)).toEqual(':medal:')
      expect(helpers.getMedal(10)).toEqual(':medal:')
      expect(helpers.getMedal(13982)).toEqual(':medal:')
    })
  })

  describe('Checks for emojis set', () => {
    it('expect to get kebab emoji when server has one', () => {
      const client = {
        emojis: {
          find() {
            return {
              id: 1
            }
          }
        }
      }

      expect(helpers.getMoneyEmoji(<any>client)).toBe(`<:kebab:1>`)
    })

    it("expect to not get kebab emoji when server donesn't have one", () => {
      const client = {
        emojis: {
          find() {
            return {
              id: undefined
            }
          }
        }
      }

      expect(helpers.getMoneyEmoji(<any>client)).toBe(':moneybag:')
    })
  })

  describe('normalizing rounded values', () => {
    it('expect to normalize floats', () => {
      expect(helpers.getRoundedValue('1.56')).toBe(2)
      expect(helpers.getRoundedValue('1.5')).toBe(2)
      expect(helpers.getRoundedValue('1.4')).toBe(1)
      expect(helpers.getRoundedValue('10.4')).toBe(10)
      expect(helpers.getRoundedValue('-10.412897427819')).toBe(-10)
      expect(helpers.getRoundedValue('foo')).toBe(NaN)
      expect(helpers.getRoundedValue('NaN')).toBe(NaN)
    })
  })

  describe('database check connection method', () => {
    it('expect method to exist', () => {
      expect(helpers.bootDatabase).toBeDefined()
    })

    it('expect to return a promise', () => {
      const promise = helpers.bootDatabase()
      expect(promise.then).toBeDefined()
    })
  })
})
