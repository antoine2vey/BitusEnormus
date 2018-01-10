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
  get(userId, guildId) {
    return new Promise((resolve, reject) => {
      Client.findOne({ userId, guildId })
        .populate('bank')
        .exec((err, client) => {
          if (err) {
            return reject('Server error');
          }

          if (!client) {
            return reject("Cet utilisateur n'existe pas");
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
   * Check if user has enough money
   * @param {*} userId
   * @param {*} guildId
   * @param {*} amount
   */
  controlMoney(userId, guildId, amount) {
    return this.canPay(userId, guildId, amount);
  }

  /**
   * Register a new user in database
   * @param {*} userId
   * @param {*} guildId
   */
  register(userId, guildId, username) {
    return new Promise(async (resolve, reject) => {
      try {
        const { client } = await this.get(userId, guildId);

        if (!client) {
          const newClient = await this.create(userId, guildId, username);
          return resolve({ client: newClient });
        }

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
    this.payAll();
  }

  /**
   * Give first money to a certain user
   * @param {*} userId
   * @param {*} guildId
   */
  didFirst(userId, guildId) {
    this.pay(userId, guildId, this.firstGive);
  }

  /**
   * Transfer money from a user to another
   * @param {*} initiator
   * @param {*} userId
   * @param {*} guildId
   * @param {*} amount
   */
  giveTo(initiator, userId, guildId, amount) {
    return new Promise(async (resolve, reject) => {
      const client = await Client.findOne({ userId: initiator, guildId });

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
  createBankForUser(userId, guildId, bankId, amount) {
    return new Promise((resolve, reject) => {
      Client.findOneAndUpdate(
        { userId, guildId },
        { bank: bank.id, $inc: { kebabs: -amount } },
      ).exec((err, newBank) => {
        if (err) {
          return reject('Server error');
        }

        return resolve({ newBank });
      });
    });
  }

  /**
   * Update an user bank, accepts two methods:
   * `push` to retrieve, `push` to add funds
   * @param {*} method (push|get)
   * @param {*} userId
   * @param {*} guildId
   * @param {*} amount
   */
  async updateBank(method, userId, guildId, amount) {
    if (method !== 'get' || method !== 'push') {
      throw new Error('Bank method must be either `push` or `get`');
    }

    const client = await this.get(userId, guildId);
    if (!client.bank) {
      bank
        .create(client)
        .then(async (newBank) => {
          // Create bank for user and withdraw him money
          await this.createBankForUser(client.id, guildId, newBank.id, -amount);
          // Update that created bank to add user's money
          await bank.update(newBank.id, { $inc: { amount } });
        })
        .catch(err => console.error(err));
    }

    const query = bank.getQuery(method, amount);

    await this.withdraw(userId, guildId, amount);
    await bank.update(client.bank.id, query);
  }

  /**
   * Checks if an user can withdraw money
   * @param {*} userId
   * @param {*} guildId
   * @param {*} amount
   */
  canWithdrawFromBank(userId, guildId, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        const canWithdraw = await bank.canWithdraw(userId, guildId, amount);

        return resolve(canWithdraw);
      } catch (e) {
        return reject(false);
      }
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
  allowedTo(method, userId, guildId, date) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.get(userId, guildId);
        const isAllowed = await bank.allow(method, date, user);

        if (!user.bank) {
          return resolve(true);
        }

        return resolve(isAllowed);
      } catch (e) {
        return reject(false);
      }
    });
  }
}

module.exports = new User();
