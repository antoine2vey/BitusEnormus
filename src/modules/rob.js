const Client = require('../db/models/user');
const number = require('./number');

class Rob {
  constructor() {
    this.time = process.env.NODE_ENV !== 'development' ? (1000 * 60 * 5) : 5000;
  }

  getMoneyToSteal(total) {
    if (!number.isValid(total)) {
      return false;
    }

    if (total < 10000) return total * 0.05;
    if (total < 30000) return total * 0.08;
    if (total < 50000) return total * 0.1;
    if (total < 100000) return total * 0.14;
    if (total < 130000) return total * 0.16;
    if (total < 170000) return total * 0.18;

    return total * 0.2;
  }

  async toggleRobStatus(userId, guildId) {
    const { isGettingRob } = await Client.findOne({ userId, guildId });
    return await Client
      .findOneAndUpdate(
        { userId, guildId },
        { isGettingRob: !isGettingRob },
        { new: true },
      );
  }

  async do(userId, guildId) {
    await this.toggleRobStatus(userId, guildId);

    setTimeout(async () => {
      await this.toggleRobStatus(userId, guildId);
    }, this.time);
  }
}

module.exports = new Rob();
