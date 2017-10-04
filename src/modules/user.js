const Client = require('../db/models/user');
const Bank = require('../db/models/bank');
const moment = require('moment');

class User {
  constructor() {
    this.ratio = 3;
    this.defaultGive = 500;
    this.firstGive = 10000;
  }

  async get(userId, guildId) {
    return await Client.findOne({ userId, guildId }).populate('bank');
  }

  users(guildId) {
    return Client.find({ guildId }).sort('-kebabs');
  }

  userQuery(userId, guildId, amount) {
    setImmediate(async () =>
      await Client.findOneAndUpdate(
        { userId, guildId },
        { $inc: { kebabs: amount } },
        { upsert: true },
      ),
    );
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
    const updatedBank = await Bank.findByIdAndUpdate(client.bank.id, query, { new: true });

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

  async controlMoney(userId, guildId, amount) {
    const client = await Client.findOne({ userId, guildId });

    if (client.kebabs >= amount) {
      return false;
    }

    return true;
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

  async register(userId, guildId) {
    try {
      const clientExists = await Client.findOne({ userId, guildId });

      if (!clientExists) {
        const client = new Client({ userId, guildId });
        client.save();
        return false;
      }

      return true;
    } catch (e) {
      return true;
    }
  }

  async giveDaily() {
    await Client.update({}, { $inc: { kebabs: this.defaultGive * 4 } }, { multi: true });
  }

  async didFirst(userId, guildId) {
    await this.userQuery(userId, guildId, this.firstGive);
  }

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

  async giveTo(initiator, userId, guildId, amount) {
    const client = await Client.findOne({ userId: initiator, guildId });

    if (client.kebabs >= amount) {
      await this.userQuery(userId, guildId, +amount);
      await this.userQuery(initiator, guildId, -amount);

      // Everything went well
      return true;
    }

    // Not enough money
    return false;
  }

  async create(userId, guildId, username) {
    const client = new Client({ userId, guildId, username });
    client.save();

    return await client;
  }
}

module.exports = new User();
