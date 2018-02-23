const Client = require('../db/models/user');
const { bank } = require('./Bank');
const Payment = require('./Payment');

class User extends Payment {
  constructor() {
    super();
    this.ratio = 3;
    this.defaultGive = 500;
    this.firstGive = 10000;
  }

  /**
   * Get a single user based on its id
   * @param {*} userId
   * @param {*} guildId
   */
  get(userId, guildId, username) {
    return new Promise((resolve, reject) => {
      Client.findOne({ userId, guildId })
        .populate('bank')
        .exec(async (err, client) => {
          if (err) {
            return reject('Server error');
          }

          if (!client) {
            const newClient = await this.create(userId, guildId, username);

            return resolve({ client: newClient.client });
          }

          return resolve({ client });
        });
    });
  }

  /**
   * Get all users that belongs to a guild
   * @param {*} guildId
   * @param {*} sorted
   */
  getAll(guildId, sorted = true) {
    return new Promise((resolve, reject) => {
      if (sorted) {
        return Client.find({ guildId })
          .sort('-kebabs')
          .exec((err, users) => {
            if (err) {
              return reject('Server error');
            }

            return resolve({ users });
          });
      }

      return Client.find({ guildId }).exec((err, users) => {
        if (err) {
          return reject('Server error');
        }

        return resolve({ users });
      });
    });
  }

  /**
   * Pay a user for a given amount
   * @param {*} userId
   * @param {*} guildId
   * @param {*} amount
   */
  pay(userId, guildId, amount) {
    return this.creditUser(userId, guildId, amount);
  }

  /**
   * Widthdraw an user for a given amount
   * @param {*} userId
   * @param {*} guildId
   * @param {*} amount
   */
  withdraw(userId, guildId, amount) {
    // TRANSFORM IT INTO NEGATIVE HERE!
    return this.withdrawUser(userId, guildId, -amount);
  }

  /**
   * Register a new user in database, returns the `fresh`
   * property if client is a created one
   * @param {*} userId
   * @param {*} guildId
   */
  register(userId, guildId, username) {
    return new Promise(async (resolve) => {
      try {
        const { client } = await this.get(userId, guildId, username);

        return resolve({ client });
      } catch (e) {
        const { client } = await this.create(userId, guildId, username);
        return resolve({ client, fresh: true });
      }
    });
  }

  /**
   * Give money to everyone
   */
  giveDaily() {
    return this.payAll();
  }

  /**
   * Give first money to a certain user
   * @param {*} userId
   * @param {*} guildId
   */
  didFirst(userId, guildId) {
    return this.pay(userId, guildId, this.firstGive);
  }

  /**
   * Transfer money from a user to another
   * @param {*} initiator
   * @param {*} userId
   * @param {*} guildId
   * @param {*} amount
   */
  giveTo(initiator, userId, guildId, amount) {
    return new Promise(async (resolve) => {
      const { client } = await this.get(initiator, guildId);

      if (client.kebabs >= amount) {
        await this.pay(userId, guildId, amount);
        await this.withdraw(initiator, guildId, amount);

        // Everything went well
        return resolve(true);
      }

      // Not enough money
      return resolve(false);
    });
  }

  /**
   * Create a new user in database
   * @param {*} userId
   * @param {*} guildId
   * @param {*} username
   */
  create(userId, guildId, username) {
    return new Promise((resolve, reject) => {
      const client = new Client({ userId, guildId, username });
      return client.save((err) => {
        if (err) {
          return reject('Server error');
        }

        return resolve({ client });
      });
    });
  }

  /**
   * Create bank for a given user
   * @param {*} userId
   * @param {*} guildId
   * @param {*} bankId
   * @param {*} amount
   */
  createBankForUser(userId, guildId, bankId, amount = 0) {
    return new Promise((resolve, reject) => {
      Client.findOneAndUpdate(
        { userId, guildId },
        { bank: bankId, $inc: { kebabs: -amount } },
      ).exec((err, user) => {
        if (err) {
          return reject('Server error');
        }

        return resolve({ user });
      });
    });
  }

  /**
   * Update an user bank, accepts two methods:
   * `push` to retrieve, `push` to add funds
   * @param {*} method (push|get)
   * @param {*} amount
   * @param {*} client
   */
  updateBank(method, amount, client) {
    if (method !== 'get' && method !== 'push') {
      throw new Error('Bank method must be either `push` or `get`');
    }

    return new Promise(async (resolve, reject) => {
      const query = bank.getQuery(method, amount);

      try {
        // If we push money, withdraw user, else give him that money
        if (method === 'push') {
          await this.withdraw(client.userId, client.guildId, amount);
        } else {
          await this.pay(client.userId, client.guildId, amount);
        }

        // Query handles method variation
        const updatedBank = await bank.update(client.bank.id, query);

        return resolve({ bank: updatedBank.bank });
      } catch (e) {
        return reject(false);
      }
    });
  }

  /**
   * Checks if an user can withdraw money
   * @param {*} userId
   * @param {*} guildId
   * @param {*} amount
   */
  canWithdrawFromBank(client, amount) {
    return new Promise(async (resolve) => {
      const canWithdraw = await bank.canWithdraw(client, amount);

      return resolve(canWithdraw);
    });
  }

  /**
   * Is user allowed to push money or get money from
   * his bank account (push or get method)
   * @param {*} method (push|get)
   * @param {*} userId
   * @param {*} guildId
   * @param {*} date
   */
  allowedTo(method, date, user) {
    return new Promise(async (resolve, reject) => {
      try {
        const isAllowed = await bank.allow(method, date, user);
        return resolve(isAllowed);
      } catch (e) {
        console.log(`Throwed because ${e}`);
        return reject(false);
      }
    });
  }
}

module.exports = new User();
