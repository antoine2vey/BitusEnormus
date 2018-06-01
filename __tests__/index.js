/* eslint-env node, jest */
const expect = require('expect')
const { execSync } = require('child_process')
const Helpers = require('../src/modules/helpers')

const helpers = new Helpers()

const getTasks = () => {
  const stdout = execSync('crontab -l')
  const stdoutArray = stdout.toString().trim().split('\n')
  stdoutArray.splice(0, 7)

  return stdoutArray
}

describe('Checks for helpers', () => {
  describe('Checks for crontasks', () => {
    it('expect crontask to not be launched', () => {
      const tasks = getTasks()

      expect(tasks.length).toBe(0)
    })

    it('expect method to be defined', () => {
      expect(helpers.makeTask).toBeDefined()
    })

    it('expect crontask length to be 1 after init', (done) => {
      helpers.makeTask('0 0 * * *', done)

      const tasks = getTasks()
      expect(tasks.length).toBe(1)
    })
  })
})
