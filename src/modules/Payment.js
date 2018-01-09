const Client = require('../db/models/user');

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
        );
      }

      Client.findOneAndUpdate(
        { userId, guildId },
        { $inc: { kebabs: parseInt(amount, 10) } },
        { upsert: true, new: true },
      ).exec((err, user) => {
        if (err) {
          return reject('Server error');
        }

        return resolve({ user });
      });
    });
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
        );
      }

      Client.findOneAndUpdate(
        { userId, guildId },
        { $inc: { kebabs: parseInt(amount, 10) } },
        { upsert: true, new: true },
      ).exec((err, user) => {
        if (err) {
          return reject('Server error');
        }

        return resolve({ user });
      });
    });
  }

  /**
   * Pay all users existing in database
   */
  payAll() {
    const query = {
      $inc: {
        kebabs: this.defaultGive * 4,
      },
    };

    return new Promise((resolve, reject) => {
      Client.update({}, query, { multi: true }).exec((err) => {
        if (err) {
          return reject('Server error');
        }

        return resolve(true);
      });
    });
  }

  async canPay(userId, guildId, amount) {
    try {
      const client = await Client.findOne({ userId, guildId });

      return new Promise(async (resolve, reject) => {
        if (client.kebabs >= amount) {
          return reject(false);
        }

        return resolve(true);
      });
    } catch (e) {
      return false;
    }
  }
}

module.exports = Payment;
