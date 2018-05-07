const Client = require('../db/models/user')

/**
 * creditUser and withdrawUser are the same methods,
 * but I want to keep it clear and define two separate methods
 * for more explicity
 */

class Payment {
  /**
   * Credit a certain user for money. Must be positive
   * @param {*} userId
   * @param {*} guildId
   * @param {*} amount
   */
  creditUser(userId, guildId, amount) {
    return new Promise((resolve, reject) => {
      // Just in case for dev environement
      if (amount < 0) {
        throw new Error(
          'creditUser method must have a positive integer. Check withdrawUser for negative',
        )
      }

      Client.findOneAndUpdate(
        { userId, guildId },
        { $inc: { kebabs: parseInt(amount, 10) } },
        { upsert: true, new: true },
      ).exec((err, client) => {
        if (err) {
          return reject('Server error')
        }

        return resolve({ client })
      })
    })
  }

  /**
   * Withdraw money from a give user
   * @param {*} userId
   * @param {*} guildId
   * @param {*} amount
   */
  withdrawUser(userId, guildId, amount) {
    return new Promise((resolve, reject) => {
      // Just in case for dev environement
      if (amount > 0) {
        throw new Error(
          'creditUser method must have a negative integer. Check creditUser for negative',
        )
      }

      Client.findOneAndUpdate(
        { userId, guildId },
        { $inc: { kebabs: parseInt(amount, 10) } },
        { upsert: true, new: true },
      ).exec((err, client) => {
        if (err) {
          return reject('Server error')
        }

        return resolve({ client })
      })
    })
  }

  /**
   * Pay all users existing in database
   */
  payAll() {
    const query = {
      $inc: {
        kebabs: this.defaultGive * 4,
      },
    }

    return new Promise((resolve, reject) => {
      Client.update({}, query, { multi: true })
        .then(() => {
          resolve(true)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  /**
   * Can this user pay for a given amount ?
   * Returns true if the user can pay
   * @param {*} userId
   * @param {*} guildId
   * @param {*} amount
   */
  canPay({ kebabs }, amount) {
    return new Promise((resolve) => {
      if (kebabs >= amount) {
        return resolve(true)
      }

      return resolve(false)
    })
  }
}

module.exports = Payment
