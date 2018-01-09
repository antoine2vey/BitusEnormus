const Client = require('../db/models/user');
const Bank = require('../db/models/bank');
const moment = require('moment');
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
    return this.withdrawUser(userId, guildId, amount);
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
  register(userId, guildId) {
    return new Promise(async (resolve, reject) => {
      try {
        const { client } = await this.get(userId, guildId);

        if (!client) {
          const newClient = new Client({ userId, guildId });
          newClient.save((err) => {
            if (err) {
              return reject('Server error');
            }

            return resolve(true);
          });
        }

        return resolve(true);
      } catch (e) {
        return reject('Server error');
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
        await this.widthdraw(initiator, guildId, -amount);

        // Everything went well
        return resolve(true);
      }

      // Not enough money
      return reject(false);
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

        return resolve(true);
      });
    });
  }

  /**
   * TODO REFRACTOR ALL METHODS BEHIND
   */

  async updateMoney(userId, guildId, username, amount) {
    setImmediate(async () => {
      const client = await Client.findOneAndUpdate(
        { userId, guildId },
        { $inc: { kebabs: amount }, $set: { username } },
        { new: true, upsert: true },
      ).populate('bank');

      if (!client.bank) {
        const newBank = new Bank({ belongsTo: client._id });

        return newBank.save(async (err) => {
          if (err) {
            return console.log(err);
          }

          return await Client.findOneAndUpdate(
            { userId, guildId },
            { bank: newBank._id, $set: { username } },
          );
        });
      }
    });
  }

  async controlMoneyInBank(userId, guildId, amount) {
    try {
      const client = await this.get(userId, guildId);

      if (amount > client.bank.amount) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  async updateBank(method, userId, guildId, amount, cb) {
    const client = await Client.findOne({ userId, guildId }).populate('bank');

    if (!client.bank) {
      const newBank = new Bank({
        belongsTo: client._id,
        lastSet: new Date(),
      });

      return newBank.save(async (err) => {
        if (err) {
          return console.log(err);
        }

        await Client.findOneAndUpdate(
          { userId: client.id, guildId },
          { bank: newBank._id, $inc: { kebabs: -amount } },
        );
        // eslint-disable-next-line
        const updatedBank = await Bank.findByIdAndUpdate(
          newBank.id,
          { $inc: { amount } },
          { new: true },
        );

        return cb(updatedBank);
      });
    }

    let query;
    if (method === 'get') {
      query = {
        $inc: { amount },
        lastGet: new Date(),
      };
    } else {
      query = {
        $inc: { amount },
        lastSet: new Date(),
      };
    }

    await Client.findOneAndUpdate({ userId, guildId }, { $inc: { kebabs: -amount } });
    const updatedBank = await Bank.findByIdAndUpdate(client.bank.id, query, {
      new: true,
    });

    return cb(updatedBank);
  }

  async allowedTo(method, userId, guildId, date) {
    const user = await this.get(userId, guildId);
    if (!user.bank) {
      return true;
    }

    if ((method === 'get' && !user.bank.lastGet) || !user.bank.lastSet) {
      return true;
    }

    const dayAfter = moment(method === 'push' ? user.bank.lastSet : user.bank.lastGet).add(
      1,
      'day',
    );
    const date_ = moment(date);

    return dayAfter.isBefore(date_);
  }
}

module.exports = new User();
