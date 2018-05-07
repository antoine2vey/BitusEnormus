const user = require('./User')
const number = require('./number')
const moment = require('moment')

class Rob {
  constructor() {
    this.guilds = new Map()
    this.user = user
    this.flashLight = 0
    this.time = process.env.NODE_ENV !== 'development' ? 1000 * 60 * 5 : 5000
  }

  getMoneyToSteal(total) {
    if (!number.isValid(total) || total < 5000) {
      return false
    }

    if (total < 10000) return total * 0.05
    if (total < 30000) return total * 0.08
    if (total < 50000) return total * 0.1
    if (total < 100000) return total * 0.14
    if (total < 130000) return total * 0.16
    if (total < 170000) return total * 0.18

    return total * 0.2
  }

  toggleRobStatus(userId, guildId, username) {
    return new Promise(async (resolve, reject) => {
      try {
        const { client } = await user.get(userId, guildId, username)
        const updatedClient = await user.update(userId, {
          isGettingRob: !client.isGettingRob,
        })

        resolve(updatedClient)
      } catch (e) {
        reject(e)
      }
    })
  }

  do(userId, guildId, targetId, targetName) {
    this.setWorker(guildId, userId, targetId)

    return new Promise(async (resolve, reject) => {
      try {
        await this.toggleRobStatus(targetId, guildId, targetName)

        setTimeout(async () => {
          this.cancelWorker(guildId, targetId)

          await Promise.all([
            this.toggleRobStatus(targetId, guildId, targetName),
            this.successfulRob(guildId, userId, targetId, targetName),
          ])
        }, this.time)

        resolve(true)
      } catch (e) {
        reject(e)
      }
    })
  }

  successfulRob(guildId, initiator, target, targetName) {
    return new Promise(async (resolve, reject) => {
      /**
       * Find target
       * Witdraw getMoneyToSteal from his acc
       * Add getMoneyToSteal to initiator's acc
       */
      try {
        const { client } = await user.get(guildId, target, targetName)

        if (!client.bank) {
          return reject("Cet utilisateur n'as pas de banque")
        }

        const { bank } = client
        const amount = this.getMoneyToSteal(bank.amount)

        if (!amount) {
          return reject(`${targetName} n'as pas assez d'argent pour être volé !`)
        }

        await Promise.all([
          user.withdraw(target, guildId, amount),
          user.pay(initiator, guildId, amount),
        ])

        return resolve(amount)
      } catch (e) {
        return reject(e)
      }
    })
  }

  /**
   * Set guild as robbed by initiator to target
   * @param {*} guildId
   * @param {*} initiator
   * @param {*} target
   */
  setWorker(guildId, initiator, target) {
    this.guilds.set(guildId, { initiator, target })
  }

  /**
   * Cancel current rob and destroy guild's current rob (1 worker/guild)
   * @param {*} guildId
   * @param {*} userGettingRobbed
   */
  cancelWorker(guildId, userGettingRobbed) {
    const currentRob = this.guilds.get(guildId)

    if (!currentRob) {
      return false
    }

    if (currentRob.target === userGettingRobbed) {
      this.guilds.delete(guildId)

      return true
    }

    return false
  }

  /**
   * Return true if a guild has an active worker
   * @param {*} guildId
   */
  isWorkerActive(guildId) {
    return this.guilds.has(guildId)
  }

  get flashlight() {
    return `:oncoming_police_car: ${
      this.flashLight % 2 === 0 ? ':large_blue_circle:' : ':red_circle:'
    } :oncoming_police_car:`
  }

  /**
   * Returns a percentage
   * @param {*} start
   * @param {*} end
   */
  getPercentage(start, end) {
    const now = moment()
    const totalMillisInRange = end.valueOf() - start.valueOf()
    const elapsedMillis = now.valueOf() - start.valueOf()
    // eslint-disable-next-line
    return (
      Math.round(Math.max(0, Math.min(100, 100 * (elapsedMillis / totalMillisInRange))) * 100) / 100
    )
  }
}

module.exports = new Rob()
